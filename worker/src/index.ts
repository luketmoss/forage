/**
 * Forage Import Worker — Cloudflare Worker that proxies recipe URL fetching
 * and OpenAI API extraction. Keeps API keys server-side.
 */

interface Env {
  OPENAI_API_KEY: string;
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

const DEFAULT_PROMPT = `You are a recipe extraction assistant. Given the text content of a recipe webpage, extract the recipe into a structured JSON format.

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
      const pageText = stripHtml(html);

      if (pageText.length < 50) {
        return new Response(JSON.stringify({
          error: 'Page content too short — may be behind a paywall or require JavaScript',
        }), {
          status: 422,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Call OpenAI API
      const systemPrompt = (prompt && typeof prompt === 'string' && prompt.trim())
        ? prompt.trim()
        : DEFAULT_PROMPT;

      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Extract the recipe from this webpage content:\n\n${pageText}` },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error('OpenAI error:', errText);
        return new Response(JSON.stringify({
          error: 'AI extraction failed — please try again',
        }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const openaiData = await openaiRes.json() as {
        choices: Array<{ message: { content: string } }>;
      };

      const content = openaiData.choices?.[0]?.message?.content;
      if (!content) {
        return new Response(JSON.stringify({
          error: 'AI returned empty response',
        }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Parse and validate the AI response
      let recipe: unknown;
      try {
        recipe = JSON.parse(content);
      } catch {
        return new Response(JSON.stringify({
          error: 'AI returned invalid JSON — try editing the prompt',
        }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Return the extracted recipe
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
