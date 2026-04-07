import { isDemo } from '../api/demo-data';
import { ensureSheetTabs } from '../api/sheet-init';
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
import {
  fetchRecipes,
  createRecipe,
  updateRecipe as updateRecipeApi,
  deleteRecipe as deleteRecipeApi,
} from '../api/recipes-api';
import { fetchRecipeIngredients, appendRecipeIngredient } from '../api/recipe-ingredients-api';
import { fetchRecipeSteps, appendRecipeStep } from '../api/recipe-steps-api';
import {
  fetchSessions,
  createSession,
  updateSession as updateSessionApi,
  deleteSession as deleteSessionApi,
} from '../api/sessions-api';
import type { IngredientWithRow, LabelWithRow, RecipeWithRow, SessionWithRow, ImportedIngredient, RecipeIngredient, RecipeStep } from '../api/types';
import { ReauthFailedError } from '../auth/reauth';
import { DEMO_RECIPE_INGREDIENTS, DEMO_RECIPE_STEPS } from '../api/demo-data';
import type { MatchResult } from '../utils/fuzzy-match';
import {
  recipes,
  ingredients,
  recipeIngredients,
  recipeSteps,
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
    // Ensure sheet tabs exist (creates missing tabs on first run; skipped in demo)
    await ensureSheetTabs(token);

    if (isDemo()) {
      recipes.value = [...DEMO_RECIPES];
      ingredients.value = [...DEMO_INGREDIENTS];
      recipeIngredients.value = [...DEMO_RECIPE_INGREDIENTS];
      recipeSteps.value = [...DEMO_RECIPE_STEPS];
      sessions.value = [...DEMO_SESSIONS];
      labels.value = [...DEMO_LABELS];
    } else {
      const [fetchedRecipes, fetchedIngredients, fetchedLabels, fetchedRI, fetchedRS, fetchedSessions] = await Promise.all([
        fetchRecipes(token),
        fetchIngredients(token),
        fetchLabels(token),
        fetchRecipeIngredients(token),
        fetchRecipeSteps(token),
        fetchSessions(token),
      ]);
      recipes.value = fetchedRecipes;
      ingredients.value = fetchedIngredients;
      labels.value = fetchedLabels;
      recipeIngredients.value = fetchedRI;
      recipeSteps.value = fetchedRS;
      sessions.value = fetchedSessions;
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

// ── Recipes ──────────────────────────────────────────────────────────

export async function addRecipe(
  data: { name: string; description: string; source: string; sourceUrl: string; servings: number; labels: string; notes: string },
  token: string,
): Promise<RecipeWithRow> {
  try {
    const created = await createRecipe({
      ...data,
      source: data.source as 'manual' | 'web' | 'photo',
      rating: 0,
      prepTime: 0,
      created: '',
      updated: '',
    }, token);
    const withRow: RecipeWithRow = {
      ...created,
      sheetRow: recipes.value.length + 2,
    };
    recipes.value = [...recipes.value, withRow];
    showToast('Recipe created', 'success');
    return withRow;
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to create recipe', 'error');
    throw err;
  }
}

export async function editRecipe(
  recipe: RecipeWithRow,
  token: string,
): Promise<void> {
  try {
    await updateRecipeApi(recipe.sheetRow, recipe, token);
    recipes.value = recipes.value.map(r => r.id === recipe.id ? recipe : r);
    showToast('Recipe updated', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to update recipe', 'error');
    throw err;
  }
}

export async function removeRecipe(
  recipe: RecipeWithRow,
  token: string,
): Promise<void> {
  try {
    await deleteRecipeApi(recipe.sheetRow, token);
    // Re-fetch for correct sheetRows
    const fresh = await fetchRecipes(token);
    recipes.value = fresh;
    // Remove associated ingredients + steps from signals
    recipeIngredients.value = recipeIngredients.value.filter(ri => ri.recipe_id !== recipe.id);
    recipeSteps.value = recipeSteps.value.filter(rs => rs.recipe_id !== recipe.id);
    showToast('Recipe deleted', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to delete recipe', 'error');
    throw err;
  }
}

// ── Sessions (Cooks) ─────────────────────────────────────────────────

export async function addSession(
  data: { recipe_id: string; recipeName: string; date: string; status: string },
  token: string,
): Promise<SessionWithRow> {
  try {
    const created = await createSession({
      recipe_id: data.recipe_id,
      recipeName: data.recipeName,
      date: data.date,
      status: data.status as 'completed' | 'scheduled' | 'active',
      prepTime: 0,
      cookTime: 0,
      rating: 0,
      notes: '',
    }, token);
    const withRow: SessionWithRow = {
      ...created,
      sheetRow: sessions.value.length + 2,
    };
    sessions.value = [...sessions.value, withRow];
    showToast('Cook created', 'success');
    return withRow;
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to create cook', 'error');
    throw err;
  }
}

export async function editSession(
  session: SessionWithRow,
  token: string,
): Promise<void> {
  try {
    await updateSessionApi(session.sheetRow, session, token);
    sessions.value = sessions.value.map(s => s.id === session.id ? session : s);
    showToast('Cook updated', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to update cook', 'error');
    throw err;
  }
}

export async function removeSession(
  session: SessionWithRow,
  token: string,
): Promise<void> {
  try {
    await deleteSessionApi(session.sheetRow, token);
    const fresh = await fetchSessions(token);
    sessions.value = fresh;
    showToast('Cook deleted', 'success');
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to delete cook', 'error');
    throw err;
  }
}

// ── Import Recipe (composite) ───────────────────────────────────────

export interface ImportSaveData {
  name: string;
  description: string;
  servings: number;
  sourceUrl: string;
  labels: string;
  ingredients: Array<{
    /** Existing ingredient ID if matched, or null for new */
    ingredientId: string | null;
    name: string;
    quantity: number;
    unit: string;
    matchResult: MatchResult;
  }>;
  prepSteps: string[];
  cookingSteps: string[];
}

/**
 * Save an imported recipe: creates the recipe, any new ingredients,
 * recipe-ingredient links, and all steps in sequence.
 */
export async function saveImportedRecipe(
  data: ImportSaveData,
  token: string,
): Promise<RecipeWithRow> {
  try {
    // 1. Create the recipe
    const created = await createRecipe({
      name: data.name,
      description: data.description,
      source: 'web',
      sourceUrl: data.sourceUrl,
      servings: data.servings,
      rating: 0,
      prepTime: 0,
      labels: data.labels,
      created: '',
      updated: '',
      notes: '',
    }, token);

    const recipeWithRow: RecipeWithRow = {
      ...created,
      sheetRow: recipes.value.length + 2,
    };
    recipes.value = [...recipes.value, recipeWithRow];

    // 2. Create new ingredients and build recipe-ingredient links
    for (let i = 0; i < data.ingredients.length; i++) {
      const ing = data.ingredients[i];
      let ingredientId = ing.ingredientId;
      let ingredientName = ing.name;

      // Create new ingredient if not matched to library
      if (!ingredientId) {
        const newIng = await createIngredient({ name: ing.name, description: '' }, token);
        ingredientId = newIng.id;
        ingredientName = newIng.name;
        const withRow: IngredientWithRow = {
          ...newIng,
          sheetRow: ingredients.value.length + 2,
        };
        ingredients.value = [...ingredients.value, withRow];
      }

      // Create recipe-ingredient link
      const ri: RecipeIngredient = {
        recipe_id: created.id,
        ingredient_id: ingredientId,
        ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
        order: i + 1,
      };
      await appendRecipeIngredient(ri, token);
      recipeIngredients.value = [...recipeIngredients.value, { ...ri, sheetRow: recipeIngredients.value.length + 2 }];
    }

    // 3. Create prep steps
    for (let i = 0; i < data.prepSteps.length; i++) {
      const step: RecipeStep = {
        recipe_id: created.id,
        stepType: 'prep',
        stepNumber: i + 1,
        description: data.prepSteps[i],
      };
      await appendRecipeStep(step, token);
      recipeSteps.value = [...recipeSteps.value, { ...step, sheetRow: recipeSteps.value.length + 2 }];
    }

    // 4. Create cooking steps
    for (let i = 0; i < data.cookingSteps.length; i++) {
      const step: RecipeStep = {
        recipe_id: created.id,
        stepType: 'cooking',
        stepNumber: i + 1,
        description: data.cookingSteps[i],
      };
      await appendRecipeStep(step, token);
      recipeSteps.value = [...recipeSteps.value, { ...step, sheetRow: recipeSteps.value.length + 2 }];
    }

    showToast('Recipe imported successfully', 'success');
    return recipeWithRow;
  } catch (err) {
    if (isReauthFailure(err)) throw err;
    showToast('Failed to save imported recipe', 'error');
    throw err;
  }
}
