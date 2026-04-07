/**
 * Client for the Forage Import Worker (Cloudflare Worker proxy).
 * Sends a recipe URL + optional prompt, receives extracted recipe JSON.
 */

import type { ImportedRecipe } from './types';
import { isDemo } from './demo-data';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://forage-import.luketmoss.workers.dev';

/** Demo response for testing without a real Worker. */
const DEMO_IMPORTED_RECIPE: ImportedRecipe = {
  name: 'Classic Chicken Parmesan',
  description: 'Crispy breaded chicken topped with marinara sauce and melted mozzarella cheese.',
  servings: 4,
  ingredients: [
    { name: 'chicken breasts', quantity: 4, unit: 'whole' },
    { name: 'breadcrumbs', quantity: 1, unit: 'cups' },
    { name: 'parmesan cheese', quantity: 0.5, unit: 'cups' },
    { name: 'eggs', quantity: 2, unit: 'whole' },
    { name: 'marinara sauce', quantity: 2, unit: 'cups' },
    { name: 'mozzarella cheese', quantity: 1.5, unit: 'cups' },
    { name: 'olive oil', quantity: 3, unit: 'tbsp' },
    { name: 'garlic', quantity: 3, unit: 'cloves' },
    { name: 'salt', quantity: 1, unit: 'tsp' },
    { name: 'black pepper', quantity: 0.5, unit: 'tsp' },
  ],
  prepSteps: [
    'Pound chicken breasts to even 1/2-inch thickness.',
    'Set up breading station: flour in one dish, beaten eggs in another, breadcrumbs mixed with parmesan in a third.',
    'Bread each chicken breast: flour, then egg, then breadcrumb mixture.',
    'Preheat oven to 400°F (200°C).',
  ],
  cookingSteps: [
    'Heat olive oil in a large oven-safe skillet over medium-high heat.',
    'Cook breaded chicken 3-4 minutes per side until golden brown.',
    'Spoon marinara sauce over each chicken breast.',
    'Top with shredded mozzarella cheese.',
    'Transfer skillet to oven and bake 15-20 minutes until cheese is melted and bubbly.',
    'Let rest 5 minutes before serving.',
  ],
};

export class ImportError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ImportError';
  }
}

/**
 * Call the import Worker to extract a recipe from a URL.
 * @param url The recipe page URL
 * @param prompt Optional custom extraction prompt (from Config sheet)
 */
export async function importRecipeFromUrl(
  url: string,
  prompt?: string,
): Promise<ImportedRecipe> {
  if (isDemo()) {
    // Simulate network delay in demo mode
    await new Promise(r => setTimeout(r, 2000));
    return { ...DEMO_IMPORTED_RECIPE };
  }

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, prompt: prompt || undefined }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new ImportError(
      body.error || `Import failed (${res.status})`,
      res.status,
    );
  }

  const data = await res.json() as ImportedRecipe;

  // Basic validation
  if (!data.name || !Array.isArray(data.ingredients)) {
    throw new ImportError('AI returned incomplete recipe data');
  }

  return data;
}
