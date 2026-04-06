// Recipe Steps API — covers both prep and cooking steps in one sheet.

import type { RecipeStep, RecipeStepWithRow } from './types';
import { sheetsGet, sheetsAppend, sheetsDeleteRow, getSheetId, withReauth, sanitizeCell } from './sheets';
import { isDemo } from './demo-data';

/**
 * Fetch all recipe steps (prep + cooking).
 * Sheet columns: A=recipe_id, B=StepType, C=StepNumber, D=Description
 */
export async function fetchRecipeSteps(token: string, demoData: RecipeStepWithRow[] = []): Promise<RecipeStepWithRow[]> {
  if (isDemo()) return [...demoData];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Recipe_Steps!A2:D', t);
    return rows.map((row, i) => ({
      recipe_id: row[0] || '',
      stepType: (row[1] || 'cooking') as RecipeStep['stepType'],
      stepNumber: Number(row[2]) || 0,
      description: row[3] || '',
      sheetRow: i + 2,
    }));
  });
}

export async function appendRecipeStep(
  data: RecipeStep,
  token: string,
): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, (t) =>
    sheetsAppend('Recipe_Steps!A:D', [[
      data.recipe_id,
      data.stepType,
      data.stepNumber,
      sanitizeCell(data.description),
    ]], t),
  );
}

export async function deleteRecipeStep(sheetRow: number, token: string): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, async (t) => {
    const sheetId = await getSheetId('Recipe_Steps', t);
    await sheetsDeleteRow(sheetId, sheetRow, t);
  });
}
