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

/** Classification-only prompt: parses ingredients, generates prep steps, and rewrites cooking steps with inline measurements. */
const DEFAULT_CLASSIFICATION_PROMPT = `You are a recipe prep assistant. Given raw ingredients and recipe steps, do three things:

1. PARSE INGREDIENTS into clean structured format:
- "name": core ingredient, capitalized (e.g. "Great Northern Beans", "Oregano")
- "quantity": numeric decimal (1/2 = 0.5, 1 1/2 = 1.5)
- "unit": one of: whole, cups, tbsp, tsp, oz, lbs, cloves, slices, pieces, cans, pinch, dash
- "descriptor": modifier (e.g. "dried", "fresh", "15 oz can", "diced - 4 oz can"). Omit parenthetical alternatives.

2. GENERATE PREP STEPS — actionable tasks to complete BEFORE cooking begins:
- Slicing/dicing/chopping: "Dice 1 yellow onion" or "Mince 2 cloves garlic"
- Group dry spices that are added together: "Mix dry spices: 1.5 tsp cumin, 0.25 tsp cayenne, 0.5 tsp oregano, 0.5 tsp paprika"
- Group wet ingredients that are combined: "Combine wet: 0.5 lime juice, 1 cup sour cream"
- Drain/rinse: "Drain and rinse 2 cans great northern beans"
- Preheat: "Preheat oven to 400°F"
- Include quantities in every prep step so the user never has to check the ingredient list
- Only generate prep steps for things that actually need doing — don't create a step for every ingredient

3. REWRITE COOKING STEPS with inline measurements:
- Include quantities when ingredients are added: "Add 2.5 cups chicken broth and 2 cans diced green chilies to the pot" NOT "Add chicken broth and green chilies"
- Reference pre-mixed groups from prep: "Add dry spice mixture" or "Stir in wet mixture"
- Keep the cooking sequence faithful to the original recipe steps

Return ONLY valid JSON:
{
  "ingredients": [
    { "name": "Ingredient Name", "quantity": 1.5, "unit": "cups", "descriptor": "dried" }
  ],
  "prepSteps": ["Dice 1 yellow onion", "Mix dry spices: 1.5 tsp cumin, ...", ...],
  "cookingSteps": ["Heat 1 tbsp olive oil in a large pot over medium-high heat", ...]
}

Rules:
- Include quantities in BOTH prep and cooking steps — the user should never need to look up amounts
- Keep ingredient JSON fields separate (name, quantity, unit, descriptor)
- If no quantity found, use 1 and "whole"
- If no descriptor applies, omit the descriptor field
- Do not include any text outside the JSON`;

/** Full extraction prompt: extracts entire recipe from raw page text. */
const DEFAULT_FULL_EXTRACTION_PROMPT = `You are a recipe extraction assistant. Given the text content of a recipe webpage, extract the recipe into structured JSON.

1. INGREDIENTS: Parse each into { name, quantity, unit, descriptor }.
2. PREP STEPS: Generate actionable prep tasks with quantities — slicing/dicing, grouping dry spices, grouping wet ingredients, draining/rinsing, preheating. Include measurements so the user never checks the ingredient list.
3. COOKING STEPS: Rewrite with inline measurements — "Add 2.5 cups chicken broth" not "Add chicken broth". Reference pre-mixed groups from prep.

Return ONLY valid JSON:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "servings": 4,
  "ingredients": [
    { "name": "Ingredient Name", "quantity": 1.5, "unit": "cups", "descriptor": "dried" }
  ],
  "prepSteps": ["Dice 1 yellow onion", "Mix dry spices: 1.5 tsp cumin, ..."],
  "cookingSteps": ["Heat 1 tbsp olive oil in a large pot over medium-high heat", ...]
}

Rules:
- For "unit", use one of: whole, cups, tbsp, tsp, oz, lbs, cloves, slices, pieces, cans, pinch, dash
- Fractions to decimal (1/2 = 0.5)
- If no quantity, use 1 and "whole"
- Include quantities in BOTH prep and cooking steps
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
