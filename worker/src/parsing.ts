/**
 * JSON-LD extraction and ingredient string parsing utilities.
 * Extracted for testability.
 */

export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface JsonLdRecipe {
  name: string;
  description: string;
  servings: number;
  ingredients: ParsedIngredient[];
  rawSteps: string[];
}

const KNOWN_UNITS: Record<string, string> = {
  cup: 'cups',
  cups: 'cups',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tbsp: 'tbsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tsp: 'tsp',
  ounce: 'oz',
  ounces: 'oz',
  oz: 'oz',
  pound: 'lbs',
  pounds: 'lbs',
  lb: 'lbs',
  lbs: 'lbs',
  clove: 'cloves',
  cloves: 'cloves',
  slice: 'slices',
  slices: 'slices',
  piece: 'pieces',
  pieces: 'pieces',
  can: 'can',
  cans: 'cans',
  pinch: 'pinch',
  dash: 'dash',
  quart: 'quart',
  quarts: 'quart',
  pint: 'pint',
  pints: 'pint',
  gallon: 'gallon',
  gallons: 'gallon',
  liter: 'liter',
  liters: 'liter',
  ml: 'ml',
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  whole: 'whole',
  large: 'whole',
  medium: 'whole',
  small: 'whole',
};

/**
 * Parse a fraction string like "1/2" into a number (0.5).
 */
export function parseFraction(s: string): number | null {
  const match = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const den = parseInt(match[2], 10);
  if (den === 0) return null;
  return num / den;
}

/**
 * Parse a quantity string that may contain whole numbers, fractions, or mixed numbers.
 * Examples: "2", "1/2", "1 1/2", "1½"
 * Returns [quantity, remainingString] or null if no quantity found.
 */
export function parseQuantity(s: string): [number, string] | null {
  let str = s.trim();

  // Replace unicode fractions
  const unicodeFractions: Record<string, string> = {
    '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4',
    '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5',
    '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8',
  };
  for (const [char, frac] of Object.entries(unicodeFractions)) {
    str = str.replace(char, ` ${frac}`);
  }
  str = str.trim();

  // Try mixed number: "1 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+\s*\/\s*\d+)\s*(.*)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const frac = parseFraction(mixedMatch[2]);
    if (frac !== null) {
      return [whole + frac, mixedMatch[3].trim()];
    }
  }

  // Try fraction: "1/2"
  const fracMatch = str.match(/^(\d+\s*\/\s*\d+)\s*(.*)/);
  if (fracMatch) {
    const frac = parseFraction(fracMatch[1]);
    if (frac !== null) {
      return [frac, fracMatch[2].trim()];
    }
  }

  // Try decimal or whole number: "2.5" or "2"
  const numMatch = str.match(/^(\d+(?:\.\d+)?)\s*(.*)/);
  if (numMatch) {
    return [parseFloat(numMatch[1]), numMatch[2].trim()];
  }

  return null;
}

/**
 * Parse an ingredient string like "1 1/2 cups all-purpose flour" into structured data.
 */
export function parseIngredientString(input: string): ParsedIngredient {
  const str = input.trim();
  if (!str) return { name: input, quantity: 1, unit: 'whole' };

  const quantityResult = parseQuantity(str);
  if (!quantityResult) {
    return { name: str, quantity: 1, unit: 'whole' };
  }

  let [quantity, remainder] = quantityResult;

  // Try to match a unit from the remainder
  // Handle parenthesized amounts like "(15 oz)" - skip them
  remainder = remainder.replace(/^\([\d.\/\s]+(?:oz|ounce|ounces|ml|g|gram|grams)\)\s*/i, '');

  const words = remainder.split(/\s+/);
  if (words.length > 0) {
    const firstWord = words[0].toLowerCase().replace(/[.,;]$/, '');
    if (KNOWN_UNITS[firstWord]) {
      const unit = KNOWN_UNITS[firstWord];
      const name = words.slice(1).join(' ')
        .replace(/^of\s+/i, '') // remove leading "of"
        .replace(/,\s*.*$/, '') // remove trailing notes after comma
        .trim();
      if (name) {
        return { name, quantity, unit };
      }
    }
  }

  // No unit matched - treat whole remainder as name
  const name = remainder
    .replace(/,\s*.*$/, '') // remove trailing notes
    .trim();
  return { name: name || input, quantity, unit: 'whole' };
}

/**
 * Find a Recipe object in a JSON-LD block.
 * Handles top-level @type: "Recipe", @graph arrays, and arrays of objects.
 */
export function findRecipeInJsonLd(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Check @type
  const type = obj['@type'];
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
    return obj;
  }

  // Check @graph array
  if (Array.isArray(obj['@graph'])) {
    for (const node of obj['@graph'] as unknown[]) {
      const found = findRecipeInJsonLd(node);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Extract all JSON-LD blocks from HTML and find a Recipe.
 */
export function extractJsonLdRecipe(html: string): JsonLdRecipe | null {
  const regex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const recipe = findRecipeInJsonLd(data);
      if (recipe) {
        return mapJsonLdToRecipe(recipe);
      }
    } catch {
      // Invalid JSON in this block, skip
      continue;
    }
  }

  return null;
}

function mapJsonLdToRecipe(recipe: Record<string, unknown>): JsonLdRecipe {
  const name = String(recipe.name || 'Untitled Recipe');
  const description = String(recipe.description || '');

  // Parse servings - can be string like "4 servings" or number
  let servings = 4;
  if (recipe.recipeYield) {
    const yieldVal = Array.isArray(recipe.recipeYield) ? recipe.recipeYield[0] : recipe.recipeYield;
    const parsed = parseInt(String(yieldVal), 10);
    if (!isNaN(parsed) && parsed > 0) servings = parsed;
  }

  // Parse ingredients
  const ingredients: ParsedIngredient[] = [];
  if (Array.isArray(recipe.recipeIngredient)) {
    for (const item of recipe.recipeIngredient) {
      ingredients.push(parseIngredientString(String(item)));
    }
  }

  // Parse instructions
  const rawSteps: string[] = [];
  if (Array.isArray(recipe.recipeInstructions)) {
    for (const step of recipe.recipeInstructions) {
      if (typeof step === 'string') {
        const trimmed = step.trim();
        if (trimmed) rawSteps.push(trimmed);
      } else if (step && typeof step === 'object') {
        const obj = step as Record<string, unknown>;
        // HowToStep or HowToSection
        if (obj.text) {
          rawSteps.push(String(obj.text).trim());
        } else if (obj.itemListElement && Array.isArray(obj.itemListElement)) {
          for (const sub of obj.itemListElement) {
            if (typeof sub === 'string') {
              rawSteps.push(sub.trim());
            } else if (sub && typeof sub === 'object' && (sub as Record<string, unknown>).text) {
              rawSteps.push(String((sub as Record<string, unknown>).text).trim());
            }
          }
        }
      }
    }
  }

  return { name, description, servings, ingredients, rawSteps };
}
