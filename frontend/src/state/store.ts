import { signal, computed } from '@preact/signals';
import type {
  RecipeWithRow,
  IngredientWithRow,
  SessionWithRow,
  LabelWithRow,
  RecipeIngredientWithRow,
  RecipeStepWithRow,
} from '../api/types';

// ===== Core Data Signals =====
export const recipes = signal<RecipeWithRow[]>([]);
export const ingredients = signal<IngredientWithRow[]>([]);
export const recipeIngredients = signal<RecipeIngredientWithRow[]>([]);
export const recipeSteps = signal<RecipeStepWithRow[]>([]);
export const sessions = signal<SessionWithRow[]>([]);
export const labels = signal<LabelWithRow[]>([]);

// ===== Loading =====
export const loading = signal(true);

// ===== UI State =====
export const filterLabels = signal<string[]>([]);

// ===== Computed: Session Groups =====
export const activeSessions = computed(() =>
  sessions.value.filter(s => s.status === 'active')
);

export const scheduledSessions = computed(() =>
  sessions.value.filter(s => s.status === 'scheduled')
);

export const completedSessions = computed(() =>
  sessions.value.filter(s => s.status === 'completed')
);

export const filteredCompletedSessions = computed(() => {
  const fl = filterLabels.value;
  if (fl.length === 0) return completedSessions.value;
  return completedSessions.value.filter(s => {
    const recipe = recipes.value.find(r => r.id === s.recipe_id);
    if (!recipe) return false;
    const recipeLabels = recipe.labels.split(',').filter(Boolean);
    return fl.some(f => recipeLabels.includes(f));
  });
});

// ===== Computed: Labels =====
export const allLabelNames = computed(() =>
  labels.value.map(l => l.name).sort()
);

// ===== Utility Functions =====
export function getLabelByName(name: string): LabelWithRow | undefined {
  return labels.value.find(l => l.name === name);
}

export function labelUsageCount(labelName: string): number {
  return recipes.value.filter(r =>
    r.labels.split(',').filter(Boolean).includes(labelName)
  ).length;
}

// ===== Toast System =====
export const toastMessage = signal('');
export const toastType = signal<'info' | 'error' | 'success'>('info');

let _toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(text: string, type: 'info' | 'error' | 'success' = 'info') {
  if (_toastTimer) clearTimeout(_toastTimer);
  toastMessage.value = text;
  toastType.value = type;
  _toastTimer = setTimeout(() => {
    toastMessage.value = '';
    _toastTimer = null;
  }, 4000);
}
