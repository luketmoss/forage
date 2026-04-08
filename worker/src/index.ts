/**
 * Forage Import Worker — Cloudflare Worker that proxies recipe URL fetching.
 * Uses a hybrid approach:
 *   1. JSON-LD structured data extraction (free, instant) for ~90% of recipe sites
 *   2. Gemini LLM for prep/cooking step classification (small focused prompt)
 *   3. Full LLM fallback for pages without structured data
 */

import { extractJsonLdRecipe } from './parsing';

interface Env {
  GEMINI_API_KEY: string;
}

const ALLOWED_ORIGINS = [
  'https://luketmoss.github.io',
  'http://localhost:5175',
];

function corsHeaders(origin: string): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/** Strip HTML to meaningful text content for the AI prompt. */
function stripHtml(html: string): string {
  // Remove script, style, nav, footer, header tags and their content
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Replace block elements with newlines
  text = text.replace(/<\/?(div|p|br|li|ol|ul|h[1-6]|tr|td|th|section|article)[^>]*>/gi, '\n');

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&frac12;/g, '1/2')
    .replace(/&frac14;/g, '1/4')
    .replace(/&frac34;/g, '3/4');

  // Collapse whitespace
  text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();

  // Truncate to ~15k chars to stay within token limits
  return text.slice(0, 15000);
}

/** Classification-only prompt: parses ingredients and splits steps into prep vs cooking. */
const DEFAULT_CLASSIFICATION_PROMPT = `You are a recipe assistant. Given raw ingredients and steps from a recipe, clean up the ingredients and classify the steps.

For ingredients, parse each raw string into a clean structured format:
- "name": the core ingredient, capitalized properly (e.g. "Great Northern Beans", "Oregano", "Cilantro")
- "quantity": numeric amount as a decimal (fractions converted: 1/2 = 0.5, 1 1/2 = 1.5)
- "unit": one of: whole, cups, tbsp, tsp, oz, lbs, cloves, slices, pieces, cans, pinch, dash
- "descriptor": any modifier separated by dashes — size, state, brand, container (e.g. "dried", "fresh", "15 oz can", "diced - 4 oz can", "small - chopped"). Omit parenthetical alternatives like "(or plain Greek yogurt)".

For steps, classify each as "prep" or "cooking":
- Prep: measuring, cutting, chopping, dicing, mincing, mixing, seasoning, marinating, preheating, breading, whisking — no heat applied
- Cooking: sauteing, frying, baking, boiling, simmering, roasting, grilling, broiling, steaming — heat applied or final assembly

Return ONLY valid JSON with this exact structure:
{
  "ingredients": [
    { "name": "Ingredient Name", "quantity": 1.5, "unit": "cups", "descriptor": "dried" }
  ],
  "prepSteps": ["Step description", ...],
  "cookingSteps": ["Step description", ...]
}

Rules:
- Every input step must appear in exactly one of the two arrays
- Preserve the original step text exactly
- Do not add or remove steps
- Format ingredient names as "Name - descriptor" is NOT needed in JSON; keep name and descriptor as separate fields
- If no quantity is found, use 1 and unit "whole"
- If no descriptor applies, omit the descriptor field
- Do not include any text outside the JSON`;

/** Full extraction prompt: extracts entire recipe from raw page text. */
const DEFAULT_FULL_EXTRACTION_PROMPT = `You are a recipe extraction assistant. Given the text content of a recipe webpage, extract the recipe into a structured JSON format.

Separate steps into "prep" (measuring, cutting, preheating, mixing dry ingredients) and "cooking" (applying heat, assembling, baking, frying, boiling).

Return ONLY valid JSON with this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "servings": 4,
  "ingredients": [
    { "name": "ingredient name", "quantity": 1.5, "unit": "cups" }
  ],
  "prepSteps": [
    "Step description"
  ],
  "cookingSteps": [
    "Step description"
  ]
}

Rules:
- For "unit", use one of: whole, cups, tbsp, tsp, oz, lbs, cloves, slices, pieces
- If a quantity is a fraction like "1/2", convert to decimal (0.5)
- If no quantity is specified, use 1 and unit "whole"
- Separate prep steps (no heat: measuring, cutting, mixing, preheating) from cooking steps (heat/assembly: sauteing, baking, boiling)
- Do not include any text outside the JSON`;

/** Call Gemini API with a prompt and user content, expecting JSON response. */
async function callGemini(
  env: Env,
  systemPrompt: string,
  userContent: string,
): Promise<string> {
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error('Gemini error:', errText);
    throw new Error('AI extraction failed');
  }

  const geminiData = await geminiRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('AI returned empty response');
  }

  return text;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Validate origin
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json() as { url?: string; prompt?: string };
      const { url, prompt } = body;

      if (!url || typeof url !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing or invalid "url" field' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Validate URL format
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Fetch the recipe page
      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ForageBot/1.0)',
          'Accept': 'text/html',
        },
        redirect: 'follow',
      });

      if (!pageRes.ok) {
        return new Response(JSON.stringify({
          error: `Failed to fetch page: ${pageRes.status} ${pageRes.statusText}`,
        }), {
          status: 422,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const html = await pageRes.text();

      // === Layer 1: Try JSON-LD extraction ===
      const jsonLdRecipe = extractJsonLdRecipe(html);

      if (jsonLdRecipe && jsonLdRecipe.ingredients.length > 0 && jsonLdRecipe.rawSteps.length > 0) {
        // === Layer 2: Use LLM only for prep/cooking classification ===
        const classificationPrompt = (prompt && typeof prompt === 'string' && prompt.trim())
          ? prompt.trim()
          : DEFAULT_CLASSIFICATION_PROMPT;

        const ingredientsText = jsonLdRecipe.rawIngredients
          .map((ing, i) => `${i + 1}. ${ing}`)
          .join('\n');

        const stepsText = jsonLdRecipe.rawSteps
          .map((step, i) => `${i + 1}. ${step}`)
          .join('\n');

        try {
          const aiText = await callGemini(
            env,
            classificationPrompt,
            `Parse these ingredients and classify the steps:\n\nINGREDIENTS:\n${ingredientsText}\n\nSTEPS:\n${stepsText}`,
          );

          const classified = JSON.parse(aiText) as {
            ingredients?: Array<{ name: string; quantity: number; unit: string; descriptor?: string }>;
            prepSteps?: string[];
            cookingSteps?: string[];
          };

          // Format ingredients: merge name + descriptor with " - " separator
          const formattedIngredients = (classified.ingredients || jsonLdRecipe.ingredients).map(ing => {
            const desc = 'descriptor' in ing && ing.descriptor ? ` - ${ing.descriptor}` : '';
            return {
              name: `${ing.name}${desc}`,
              quantity: ing.quantity,
              unit: ing.unit,
            };
          });

          return new Response(JSON.stringify({
            name: jsonLdRecipe.name,
            description: jsonLdRecipe.description,
            servings: jsonLdRecipe.servings,
            ingredients: formattedIngredients,
            prepSteps: classified.prepSteps || [],
            cookingSteps: classified.cookingSteps || [],
            source: 'jsonld',
          }), {
            status: 200,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('Classification failed, falling back to full extraction:', err);
          // Fall through to full LLM extraction
        }
      }

      // === Layer 3: Full LLM fallback ===
      const pageText = stripHtml(html);

      if (pageText.length < 50) {
        return new Response(JSON.stringify({
          error: 'Page content too short — may be behind a paywall or require JavaScript',
        }), {
          status: 422,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const fullPrompt = (prompt && typeof prompt === 'string' && prompt.trim())
        ? prompt.trim()
        : DEFAULT_FULL_EXTRACTION_PROMPT;

      let aiText: string;
      try {
        aiText = await callGemini(
          env,
          fullPrompt,
          `Extract the recipe from this webpage content:\n\n${pageText}`,
        );
      } catch {
        return new Response(JSON.stringify({
          error: 'AI extraction failed — please try again',
        }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Parse and validate the AI response
      let recipe: Record<string, unknown>;
      try {
        recipe = JSON.parse(aiText);
      } catch {
        return new Response(JSON.stringify({
          error: 'AI returned invalid JSON — try editing the prompt',
        }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Add source indicator
      recipe.source = 'llm';

      return new Response(JSON.stringify(recipe), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({
        error: 'Internal server error',
      }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
