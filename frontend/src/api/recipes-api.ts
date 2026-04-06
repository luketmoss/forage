// Recipes domain API — wraps Sheets REST calls with demo-mode fallback.

import type { Recipe, RecipeWithRow } from './types';
import { sheetsGet, sheetsAppend, sheetsUpdate, sheetsDeleteRow, getSheetId, withReauth, sanitizeCell } from './sheets';
import { isDemo, DEMO_RECIPES } from './demo-data';

/**
 * Fetch all recipes from the Recipes sheet.
 * Sheet columns: A=id, B=Name, C=Description, D=Source, E=SourceURL, F=Servings,
 *   G=Rating, H=PrepTime, I=Labels, J=Created, K=Updated, L=Notes
 */
export async function fetchRecipes(token: string): Promise<RecipeWithRow[]> {
  if (isDemo()) return [...DEMO_RECIPES];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Recipes!A2:L', t);
    return rows.map((row, i) => ({
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      source: (row[3] || 'manual') as Recipe['source'],
      sourceUrl: row[4] || '',
      servings: Number(row[5]) || 4,
      rating: Number(row[6]) || 0,
      prepTime: Number(row[7]) || 0,
      labels: row[8] || '',
      created: row[9] || '',
      updated: row[10] || '',
      notes: row[11] || '',
      sheetRow: i + 2,
    }));
  });
}

export async function createRecipe(
  data: Omit<Recipe, 'id'>,
  token: string,
): Promise<Recipe> {
  const id = `rec_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const recipe: Recipe = { id, ...data, created: now, updated: now };

  if (isDemo()) return recipe;

  await withReauth(token, (t) =>
    sheetsAppend('Recipes!A:L', [[
      id,
      sanitizeCell(data.name),
      sanitizeCell(data.description),
      data.source,
      data.sourceUrl,
      data.servings,
      data.rating,
      data.prepTime,
      data.labels,
      now,
      now,
      sanitizeCell(data.notes),
    ]], t),
  );
  return recipe;
}

export async function updateRecipe(
  sheetRow: number,
  recipe: Recipe,
  token: string,
): Promise<void> {
  if (isDemo()) return;

  const now = new Date().toISOString();
  await withReauth(token, (t) =>
    sheetsUpdate(
      `Recipes!A${sheetRow}:L${sheetRow}`,
      [[
        recipe.id,
        sanitizeCell(recipe.name),
        sanitizeCell(recipe.description),
        recipe.source,
        recipe.sourceUrl,
        recipe.servings,
        recipe.rating,
        recipe.prepTime,
        recipe.labels,
        recipe.created,
        now,
        sanitizeCell(recipe.notes),
      ]],
      t,
    ),
  );
}

export async function deleteRecipe(sheetRow: number, token: string): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, async (t) => {
    const sheetId = await getSheetId('Recipes', t);
    await sheetsDeleteRow(sheetId, sheetRow, t);
  });
}
