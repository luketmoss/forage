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
import {
  fetchLabels,
  createLabel,
  updateLabel as updateLabelApi,
  deleteLabel as deleteLabelApi,
} from '../api/labels-api';
import type { IngredientWithRow, LabelWithRow } from '../api/types';
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
      // Fetch from Sheets (others still use demo data for now)
      const [fetchedIngredients, fetchedLabels] = await Promise.all([
        fetchIngredients(token),
        fetchLabels(token),
      ]);
      ingredients.value = fetchedIngredients;
      labels.value = fetchedLabels;

      // TODO: Wire these to Sheets API as each feature is built
      recipes.value = [...DEMO_RECIPES];
      sessions.value = [...DEMO_SESSIONS];
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

// ── Labels ───────────────────────────────────────────────────────────

export async function addLabel(
  data: { name: string; colorKey: string },
  token: string,
): Promise<LabelWithRow> {
  try {
    const created = await createLabel(data, token);
    const withRow: LabelWithRow = {
      ...created,
      sheetRow: labels.value.length + 2,
    };
    labels.value = [...labels.value, withRow];
    showToast('Label created', 'success');
    return withRow;
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to create label', 'error');
    throw err;
  }
}

export async function editLabel(
  label: LabelWithRow,
  oldName: string,
  token: string,
): Promise<void> {
  try {
    await updateLabelApi(label.sheetRow, label, token);
    labels.value = labels.value.map(l => l.id === label.id ? label : l);

    // Cascade name change to recipes (labels stored as comma-separated string)
    if (oldName !== label.name) {
      recipes.value = recipes.value.map(r => {
        const recipeLabels = r.labels.split(',').filter(Boolean);
        if (recipeLabels.includes(oldName)) {
          const updated = recipeLabels.map(l => l === oldName ? label.name : l);
          return { ...r, labels: updated.join(',') };
        }
        return r;
      });
    }

    showToast('Label updated', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to update label', 'error');
    throw err;
  }
}

export async function removeLabel(
  label: LabelWithRow,
  token: string,
): Promise<void> {
  try {
    await deleteLabelApi(label.sheetRow, token);

    // Re-fetch for correct sheetRows
    const fresh = await fetchLabels(token);
    labels.value = fresh;

    // Cascade remove from recipes
    recipes.value = recipes.value.map(r => {
      const recipeLabels = r.labels.split(',').filter(Boolean);
      if (recipeLabels.includes(label.name)) {
        const updated = recipeLabels.filter(l => l !== label.name);
        return { ...r, labels: updated.join(',') };
      }
      return r;
    });

    showToast('Label deleted', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to delete label', 'error');
    throw err;
  }
}
