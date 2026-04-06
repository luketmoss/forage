import { isDemo } from '../api/demo-data';
import {
  DEMO_RECIPES,
  DEMO_INGREDIENTS,
  DEMO_SESSIONS,
  DEMO_LABELS,
} from '../api/demo-data';
import {
  recipes,
  ingredients,
  sessions,
  labels,
  loading,
  showToast,
} from './store';

/**
 * Load all data from Google Sheets (or demo data).
 * Called once by AuthenticatedApp on mount.
 */
export async function loadInitialData(token: string): Promise<void> {
  loading.value = true;

  try {
    if (isDemo()) {
      // Demo mode: use static mock data
      recipes.value = [...DEMO_RECIPES];
      ingredients.value = [...DEMO_INGREDIENTS];
      sessions.value = [...DEMO_SESSIONS];
      labels.value = [...DEMO_LABELS];
    } else {
      // Real mode: fetch from Google Sheets
      // TODO: Implement Sheets API calls for each entity
      // For now, fall back to demo data so the app is functional
      recipes.value = [...DEMO_RECIPES];
      ingredients.value = [...DEMO_INGREDIENTS];
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
