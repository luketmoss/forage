import { isDemo } from '../api/demo-data';
import {
  DEMO_RECIPES,
  DEMO_INGREDIENTS,
  DEMO_SESSIONS,
  DEMO_LABELS,
} from '../api/demo-data';
import {
  fetchIngredients,
  createIngredient,
  updateIngredient as updateIngredientApi,
  deleteIngredient as deleteIngredientApi,
} from '../api/ingredients-api';
import type { IngredientWithRow } from '../api/types';
import { ReauthFailedError } from '../auth/reauth';
import {
  recipes,
  ingredients,
  sessions,
  labels,
  loading,
  showToast,
} from './store';

function isReauthFailure(err: unknown): boolean {
  return err instanceof ReauthFailedError;
}

/**
 * Load all data from Google Sheets (or demo data).
 * Called once by AuthenticatedApp on mount.
 */
export async function loadInitialData(token: string): Promise<void> {
  loading.value = true;

  try {
    if (isDemo()) {
      recipes.value = [...DEMO_RECIPES];
      ingredients.value = [...DEMO_INGREDIENTS];
      sessions.value = [...DEMO_SESSIONS];
      labels.value = [...DEMO_LABELS];
    } else {
      // Fetch ingredients from Sheets (others still use demo data for now)
      const [fetchedIngredients] = await Promise.all([
        fetchIngredients(token),
      ]);
      ingredients.value = fetchedIngredients;

      // TODO: Wire these to Sheets API as each feature is built
      recipes.value = [...DEMO_RECIPES];
      sessions.value = [...DEMO_SESSIONS];
      labels.value = [...DEMO_LABELS];
    }
  } catch (err) {
    console.error('Failed to load data:', err);
    showToast('Failed to load data', 'error');
  } finally {
    loading.value = false;
  }
}

// ── Ingredients ──────────────────────────────────────────────────────

export async function addIngredient(
  data: { name: string; description: string },
  token: string,
): Promise<IngredientWithRow> {
  try {
    const created = await createIngredient(data, token);
    const withRow: IngredientWithRow = {
      ...created,
      sheetRow: ingredients.value.length + 2, // approximate; re-fetch corrects
    };
    ingredients.value = [...ingredients.value, withRow];
    showToast('Ingredient created', 'success');
    return withRow;
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to create ingredient', 'error');
    throw err;
  }
}

export async function editIngredient(
  ingredient: IngredientWithRow,
  token: string,
): Promise<void> {
  try {
    await updateIngredientApi(ingredient.sheetRow, ingredient, token);
    ingredients.value = ingredients.value.map(i =>
      i.id === ingredient.id ? ingredient : i
    );
    showToast('Ingredient updated', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to update ingredient', 'error');
    throw err;
  }
}

export async function removeIngredient(
  ingredient: IngredientWithRow,
  token: string,
): Promise<void> {
  try {
    await deleteIngredientApi(ingredient.sheetRow, token);
    // Re-fetch to get correct sheetRow values after row shift
    const fresh = await fetchIngredients(token);
    ingredients.value = fresh;
    showToast('Ingredient deleted', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to delete ingredient', 'error');
    throw err;
  }
}
