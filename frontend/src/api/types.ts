// ===== User =====
export interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

// ===== Labels =====
export interface Label {
  id: string;
  name: string;
  colorKey: string;
}

export interface LabelWithRow extends Label {
  sheetRow: number;
}

// ===== Ingredients =====
export interface Ingredient {
  id: string;
  name: string;
  description: string;
}

export interface IngredientWithRow extends Ingredient {
  sheetRow: number;
}

// ===== Recipes =====
export type RecipeSource = 'manual' | 'web' | 'photo';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  source: RecipeSource;
  sourceUrl: string;
  servings: number;
  rating: number;
  prepTime: number;
  labels: string;
  created: string;
  updated: string;
  notes: string;
}

export interface RecipeWithRow extends Recipe {
  sheetRow: number;
}

// ===== Recipe Ingredients (join table) =====
export interface RecipeIngredient {
  recipe_id: string;
  ingredient_id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  order: number;
}

export interface RecipeIngredientWithRow extends RecipeIngredient {
  sheetRow: number;
}

// ===== Recipe Steps (prep + cooking) =====
export type StepType = 'prep' | 'cooking';

export interface RecipeStep {
  recipe_id: string;
  stepType: StepType;
  stepNumber: number;
  description: string;
}

export interface RecipeStepWithRow extends RecipeStep {
  sheetRow: number;
}

// ===== Cooking Sessions =====
export type SessionStatus = 'completed' | 'scheduled' | 'active';

export interface CookingSession {
  id: string;
  recipe_id: string;
  recipeName: string;
  date: string;
  status: SessionStatus;
  prepTime: number;
  cookTime: number;
  rating: number;
  notes: string;
}

export interface SessionWithRow extends CookingSession {
  sheetRow: number;
}
