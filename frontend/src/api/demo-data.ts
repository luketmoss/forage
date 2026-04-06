import type {
  LabelWithRow,
  IngredientWithRow,
  RecipeWithRow,
  RecipeIngredientWithRow,
  RecipeStepWithRow,
  SessionWithRow,
} from './types';

/**
 * Check if the app is running in demo mode.
 * Demo mode skips Google OAuth and uses mock data.
 */
export function isDemo(): boolean {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return true;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.has('demo');
  }
  return false;
}

// ===== Demo Labels =====
export const DEMO_LABELS: LabelWithRow[] = [
  { id: 'lbl-1', name: 'Quick', colorKey: 'green', sheetRow: 2 },
  { id: 'lbl-2', name: 'Dinner', colorKey: 'blue', sheetRow: 3 },
  { id: 'lbl-3', name: 'Baking', colorKey: 'amber', sheetRow: 4 },
  { id: 'lbl-4', name: 'Healthy', colorKey: 'teal', sheetRow: 5 },
  { id: 'lbl-5', name: 'Comfort', colorKey: 'orange', sheetRow: 6 },
  { id: 'lbl-6', name: 'Weeknight', colorKey: 'purple', sheetRow: 7 },
];

// ===== Demo Ingredients =====
export const DEMO_INGREDIENTS: IngredientWithRow[] = [
  { id: 'ing-1', name: 'Chicken Breast', description: 'Boneless, skinless chicken breast', sheetRow: 2 },
  { id: 'ing-2', name: 'Olive Oil', description: 'Extra virgin olive oil', sheetRow: 3 },
  { id: 'ing-3', name: 'Garlic', description: 'Fresh garlic cloves', sheetRow: 4 },
  { id: 'ing-4', name: 'Onion', description: 'Yellow onion', sheetRow: 5 },
  { id: 'ing-5', name: 'Bell Pepper', description: 'Any color bell pepper', sheetRow: 6 },
  { id: 'ing-6', name: 'Soy Sauce', description: 'Regular or low-sodium soy sauce', sheetRow: 7 },
  { id: 'ing-7', name: 'Ginger', description: 'Fresh ginger root', sheetRow: 8 },
  { id: 'ing-8', name: 'Rice', description: 'Long grain white rice', sheetRow: 9 },
  { id: 'ing-9', name: 'Spaghetti', description: 'Dried spaghetti pasta', sheetRow: 10 },
  { id: 'ing-10', name: 'Eggs', description: 'Large eggs', sheetRow: 11 },
  { id: 'ing-11', name: 'Parmesan', description: 'Parmigiano-Reggiano cheese', sheetRow: 12 },
  { id: 'ing-12', name: 'Pancetta', description: 'Italian cured pork belly', sheetRow: 13 },
  { id: 'ing-13', name: 'Black Pepper', description: 'Freshly ground black pepper', sheetRow: 14 },
  { id: 'ing-14', name: 'Salt', description: 'Kosher salt', sheetRow: 15 },
  { id: 'ing-15', name: 'Butter', description: 'Unsalted butter', sheetRow: 16 },
  { id: 'ing-16', name: 'All-Purpose Flour', description: 'Bleached or unbleached flour', sheetRow: 17 },
  { id: 'ing-17', name: 'Sugar', description: 'Granulated white sugar', sheetRow: 18 },
  { id: 'ing-18', name: 'Bananas', description: 'Ripe bananas', sheetRow: 19 },
  { id: 'ing-19', name: 'Baking Soda', description: 'Sodium bicarbonate', sheetRow: 20 },
  { id: 'ing-20', name: 'Vanilla Extract', description: 'Pure vanilla extract', sheetRow: 21 },
  { id: 'ing-21', name: 'Broccoli', description: 'Fresh broccoli florets', sheetRow: 22 },
  { id: 'ing-22', name: 'Carrots', description: 'Fresh whole carrots', sheetRow: 23 },
  { id: 'ing-23', name: 'Paprika', description: 'Sweet or smoked paprika', sheetRow: 24 },
  { id: 'ing-24', name: 'Cumin', description: 'Ground cumin', sheetRow: 25 },
  { id: 'ing-25', name: 'Lemon', description: 'Fresh lemon', sheetRow: 26 },
];

// ===== Demo Recipes =====
export const DEMO_RECIPES: RecipeWithRow[] = [
  { id: 'rec-1', name: 'Chicken Stir Fry', description: 'Quick and easy weeknight stir fry with vegetables and a savory sauce.', source: 'manual', sourceUrl: '', servings: 4, rating: 4, prepTime: 15, labels: 'Quick,Dinner,Weeknight,Healthy', created: '2026-03-10', updated: '2026-03-28', notes: '', sheetRow: 2 },
  { id: 'rec-2', name: 'Spaghetti Carbonara', description: 'Classic Italian pasta with eggs, cheese, and pancetta. Creamy without cream.', source: 'web', sourceUrl: 'https://example.com/carbonara', servings: 2, rating: 5, prepTime: 10, labels: 'Dinner,Comfort', created: '2026-02-15', updated: '2026-03-25', notes: '', sheetRow: 3 },
  { id: 'rec-3', name: 'Banana Bread', description: 'Moist, perfectly sweet banana bread. Great for using up overripe bananas.', source: 'photo', sourceUrl: '', servings: 8, rating: 4, prepTime: 10, labels: 'Baking,Comfort', created: '2026-01-20', updated: '2026-03-15', notes: '', sheetRow: 4 },
  { id: 'rec-4', name: 'Garlic Butter Salmon', description: 'Pan-seared salmon with garlic butter sauce. Ready in 20 minutes.', source: 'web', sourceUrl: 'https://example.com/salmon', servings: 2, rating: 5, prepTime: 5, labels: 'Quick,Dinner,Healthy,Weeknight', created: '2026-03-01', updated: '2026-04-01', notes: '', sheetRow: 5 },
  { id: 'rec-5', name: 'Black Bean Tacos', description: 'Quick vegetarian tacos with spiced black beans, fresh toppings, and lime.', source: 'manual', sourceUrl: '', servings: 4, rating: 3, prepTime: 10, labels: 'Quick,Healthy,Weeknight', created: '2026-02-28', updated: '2026-03-20', notes: '', sheetRow: 6 },
  { id: 'rec-6', name: 'Lemon Herb Chicken Thighs', description: 'Crispy-skinned chicken thighs with lemon, garlic, and herbs. One-pan meal.', source: 'web', sourceUrl: 'https://example.com/chicken-thighs', servings: 4, rating: 0, prepTime: 10, labels: 'Dinner,Comfort', created: '2026-03-25', updated: '2026-03-25', notes: '', sheetRow: 7 },
  { id: 'rec-7', name: 'Simple Fried Rice', description: 'Use day-old rice for the best texture. Great for leftover veggies.', source: 'manual', sourceUrl: '', servings: 3, rating: 4, prepTime: 10, labels: 'Quick,Weeknight', created: '2026-03-05', updated: '2026-03-30', notes: '', sheetRow: 8 },
  { id: 'rec-8', name: 'Overnight Oats', description: 'No-cook breakfast prep. Make the night before, grab and go in the morning.', source: 'manual', sourceUrl: '', servings: 1, rating: 3, prepTime: 5, labels: 'Quick,Healthy', created: '2026-03-15', updated: '2026-03-15', notes: '', sheetRow: 9 },
];

// ===== Demo Sessions =====
export const DEMO_SESSIONS: SessionWithRow[] = [
  { id: 'ses-1', recipe_id: 'rec-2', recipeName: 'Spaghetti Carbonara', date: '2026-04-05', status: 'completed', prepTime: 12, cookTime: 18, rating: 5, notes: 'Used guanciale instead of pancetta. Even better!', sheetRow: 2 },
  { id: 'ses-2', recipe_id: 'rec-1', recipeName: 'Chicken Stir Fry', date: '2026-04-04', status: 'completed', prepTime: 15, cookTime: 12, rating: 4, notes: 'Added snap peas. Good addition.', sheetRow: 3 },
  { id: 'ses-3', recipe_id: 'rec-4', recipeName: 'Garlic Butter Salmon', date: '2026-04-02', status: 'completed', prepTime: 5, cookTime: 14, rating: 5, notes: '', sheetRow: 4 },
  { id: 'ses-4', recipe_id: 'rec-3', recipeName: 'Banana Bread', date: '2026-03-30', status: 'completed', prepTime: 12, cookTime: 60, rating: 4, notes: 'Added chocolate chips. Kids loved it.', sheetRow: 5 },
  { id: 'ses-5', recipe_id: 'rec-7', recipeName: 'Simple Fried Rice', date: '2026-03-28', status: 'completed', prepTime: 10, cookTime: 10, rating: 4, notes: '', sheetRow: 6 },
  { id: 'ses-8', recipe_id: 'rec-7', recipeName: 'Simple Fried Rice', date: '2026-04-05', status: 'active', prepTime: 8, cookTime: 0, rating: 0, notes: '', sheetRow: 7 },
  { id: 'ses-6', recipe_id: 'rec-6', recipeName: 'Lemon Herb Chicken Thighs', date: '2026-04-07', status: 'scheduled', prepTime: 0, cookTime: 0, rating: 0, notes: '', sheetRow: 8 },
  { id: 'ses-7', recipe_id: 'rec-5', recipeName: 'Black Bean Tacos', date: '2026-04-09', status: 'scheduled', prepTime: 0, cookTime: 0, rating: 0, notes: '', sheetRow: 9 },
];
