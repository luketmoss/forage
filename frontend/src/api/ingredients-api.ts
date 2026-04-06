// Ingredients domain API — wraps Sheets REST calls with demo-mode fallback.

import type { Ingredient, IngredientWithRow } from './types';
import { sheetsGet, sheetsAppend, sheetsUpdate, sheetsDeleteRow, getSheetId, withReauth, sanitizeCell } from './sheets';
import { isDemo, DEMO_INGREDIENTS } from './demo-data';

/**
 * Fetch all ingredients from the Ingredients sheet.
 * Sheet columns: A=id, B=Name, C=Description, D=Created
 */
export async function fetchIngredients(token: string): Promise<IngredientWithRow[]> {
  if (isDemo()) return [...DEMO_INGREDIENTS];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Ingredients!A2:D', t);
    return rows.map((row, i) => ({
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      sheetRow: i + 2,
    }));
  });
}

/**
 * Create a new ingredient. Returns the created Ingredient (without sheetRow).
 */
export async function createIngredient(
  data: { name: string; description: string },
  token: string,
): Promise<Ingredient> {
  const id = `ing_${crypto.randomUUID().slice(0, 8)}`;
  const created = new Date().toISOString();
  const ingredient: Ingredient = { id, name: data.name, description: data.description };

  if (isDemo()) return ingredient;

  await withReauth(token, (t) =>
    sheetsAppend('Ingredients!A:D', [[id, sanitizeCell(data.name), sanitizeCell(data.description), created]], t),
  );
  return ingredient;
}

/**
 * Update an existing ingredient at the given sheet row.
 */
export async function updateIngredient(
  sheetRow: number,
  ingredient: Ingredient,
  token: string,
): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, (t) =>
    sheetsUpdate(
      `Ingredients!A${sheetRow}:D${sheetRow}`,
      [[ingredient.id, sanitizeCell(ingredient.name), sanitizeCell(ingredient.description), '']],
      t,
    ),
  );
}

/**
 * Delete an ingredient by its sheet row.
 */
export async function deleteIngredient(sheetRow: number, token: string): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, async (t) => {
    const sheetId = await getSheetId('Ingredients', t);
    await sheetsDeleteRow(sheetId, sheetRow, t);
  });
}
