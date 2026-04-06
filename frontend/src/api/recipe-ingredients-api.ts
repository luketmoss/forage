// Recipe Ingredients join-table API.

import type { RecipeIngredient, RecipeIngredientWithRow } from './types';
import { sheetsGet, sheetsAppend, sheetsUpdate, sheetsDeleteRow, getSheetId, withReauth, sanitizeCell } from './sheets';
import { isDemo } from './demo-data';

// Demo data is loaded separately via DEMO_RECIPE_INGREDIENTS

/**
 * Fetch all recipe ingredients.
 * Sheet columns: A=recipe_id, B=ingredient_id, C=IngredientName, D=Quantity, E=Unit, F=Order
 */
export async function fetchRecipeIngredients(token: string, demoData: RecipeIngredientWithRow[] = []): Promise<RecipeIngredientWithRow[]> {
  if (isDemo()) return [...demoData];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Recipe_Ingredients!A2:F', t);
    return rows.map((row, i) => ({
      recipe_id: row[0] || '',
      ingredient_id: row[1] || '',
      ingredientName: row[2] || '',
      quantity: Number(row[3]) || 0,
      unit: row[4] || '',
      order: Number(row[5]) || 0,
      sheetRow: i + 2,
    }));
  });
}

export async function appendRecipeIngredient(
  data: RecipeIngredient,
  token: string,
): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, (t) =>
    sheetsAppend('Recipe_Ingredients!A:F', [[
      data.recipe_id,
      data.ingredient_id,
      sanitizeCell(data.ingredientName),
      data.quantity,
      data.unit,
      data.order,
    ]], t),
  );
}

export async function deleteRecipeIngredient(sheetRow: number, token: string): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, async (t) => {
    const sheetId = await getSheetId('Recipe_Ingredients', t);
    await sheetsDeleteRow(sheetId, sheetRow, t);
  });
}
