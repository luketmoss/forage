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

// ===== Demo Recipe Ingredients =====
let _riRow = 2;
export const DEMO_RECIPE_INGREDIENTS: RecipeIngredientWithRow[] = [
  // Chicken Stir Fry (rec-1)
  { recipe_id: 'rec-1', ingredient_id: 'ing-1', ingredientName: 'Chicken Breast', quantity: 1.5, unit: 'lbs', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-2', ingredientName: 'Olive Oil', quantity: 2, unit: 'tbsp', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-3', ingredientName: 'Garlic', quantity: 3, unit: 'cloves', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-7', ingredientName: 'Ginger', quantity: 1, unit: 'tbsp', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-5', ingredientName: 'Bell Pepper', quantity: 2, unit: 'whole', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-21', ingredientName: 'Broccoli', quantity: 2, unit: 'cups', order: 6, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-22', ingredientName: 'Carrots', quantity: 2, unit: 'whole', order: 7, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-6', ingredientName: 'Soy Sauce', quantity: 3, unit: 'tbsp', order: 8, sheetRow: _riRow++ },
  { recipe_id: 'rec-1', ingredient_id: 'ing-8', ingredientName: 'Rice', quantity: 2, unit: 'cups', order: 9, sheetRow: _riRow++ },
  // Spaghetti Carbonara (rec-2)
  { recipe_id: 'rec-2', ingredient_id: 'ing-9', ingredientName: 'Spaghetti', quantity: 8, unit: 'oz', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-2', ingredient_id: 'ing-12', ingredientName: 'Pancetta', quantity: 4, unit: 'oz', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-2', ingredient_id: 'ing-10', ingredientName: 'Eggs', quantity: 2, unit: 'whole', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-2', ingredient_id: 'ing-11', ingredientName: 'Parmesan', quantity: 0.75, unit: 'cup', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-2', ingredient_id: 'ing-13', ingredientName: 'Black Pepper', quantity: 1, unit: 'tsp', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-2', ingredient_id: 'ing-14', ingredientName: 'Salt', quantity: 1, unit: 'tbsp', order: 6, sheetRow: _riRow++ },
  // Banana Bread (rec-3)
  { recipe_id: 'rec-3', ingredient_id: 'ing-18', ingredientName: 'Bananas', quantity: 3, unit: 'whole', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-15', ingredientName: 'Butter', quantity: 0.33, unit: 'cup', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-17', ingredientName: 'Sugar', quantity: 0.75, unit: 'cup', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-10', ingredientName: 'Eggs', quantity: 1, unit: 'whole', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-20', ingredientName: 'Vanilla Extract', quantity: 1, unit: 'tsp', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-19', ingredientName: 'Baking Soda', quantity: 1, unit: 'tsp', order: 6, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-14', ingredientName: 'Salt', quantity: 0.25, unit: 'tsp', order: 7, sheetRow: _riRow++ },
  { recipe_id: 'rec-3', ingredient_id: 'ing-16', ingredientName: 'All-Purpose Flour', quantity: 1.5, unit: 'cups', order: 8, sheetRow: _riRow++ },
  // Garlic Butter Salmon (rec-4)
  { recipe_id: 'rec-4', ingredient_id: 'ing-14', ingredientName: 'Salt', quantity: 0.5, unit: 'tsp', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-4', ingredient_id: 'ing-13', ingredientName: 'Black Pepper', quantity: 0.25, unit: 'tsp', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-4', ingredient_id: 'ing-23', ingredientName: 'Paprika', quantity: 0.5, unit: 'tsp', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-4', ingredient_id: 'ing-2', ingredientName: 'Olive Oil', quantity: 1, unit: 'tbsp', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-4', ingredient_id: 'ing-15', ingredientName: 'Butter', quantity: 2, unit: 'tbsp', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-4', ingredient_id: 'ing-3', ingredientName: 'Garlic', quantity: 4, unit: 'cloves', order: 6, sheetRow: _riRow++ },
  { recipe_id: 'rec-4', ingredient_id: 'ing-25', ingredientName: 'Lemon', quantity: 1, unit: 'whole', order: 7, sheetRow: _riRow++ },
  // Black Bean Tacos (rec-5)
  { recipe_id: 'rec-5', ingredient_id: 'ing-2', ingredientName: 'Olive Oil', quantity: 1, unit: 'tbsp', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-5', ingredient_id: 'ing-4', ingredientName: 'Onion', quantity: 1, unit: 'whole', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-5', ingredient_id: 'ing-3', ingredientName: 'Garlic', quantity: 2, unit: 'cloves', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-5', ingredient_id: 'ing-24', ingredientName: 'Cumin', quantity: 1, unit: 'tsp', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-5', ingredient_id: 'ing-23', ingredientName: 'Paprika', quantity: 0.5, unit: 'tsp', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-5', ingredient_id: 'ing-14', ingredientName: 'Salt', quantity: 0.5, unit: 'tsp', order: 6, sheetRow: _riRow++ },
  { recipe_id: 'rec-5', ingredient_id: 'ing-25', ingredientName: 'Lemon', quantity: 1, unit: 'whole', order: 7, sheetRow: _riRow++ },
  // Lemon Herb Chicken (rec-6)
  { recipe_id: 'rec-6', ingredient_id: 'ing-1', ingredientName: 'Chicken Breast', quantity: 2, unit: 'lbs', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-6', ingredient_id: 'ing-2', ingredientName: 'Olive Oil', quantity: 2, unit: 'tbsp', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-6', ingredient_id: 'ing-3', ingredientName: 'Garlic', quantity: 4, unit: 'cloves', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-6', ingredient_id: 'ing-25', ingredientName: 'Lemon', quantity: 1, unit: 'whole', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-6', ingredient_id: 'ing-14', ingredientName: 'Salt', quantity: 1, unit: 'tsp', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-6', ingredient_id: 'ing-13', ingredientName: 'Black Pepper', quantity: 0.5, unit: 'tsp', order: 6, sheetRow: _riRow++ },
  // Simple Fried Rice (rec-7)
  { recipe_id: 'rec-7', ingredient_id: 'ing-8', ingredientName: 'Rice', quantity: 3, unit: 'cups', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-7', ingredient_id: 'ing-10', ingredientName: 'Eggs', quantity: 2, unit: 'whole', order: 2, sheetRow: _riRow++ },
  { recipe_id: 'rec-7', ingredient_id: 'ing-6', ingredientName: 'Soy Sauce', quantity: 2, unit: 'tbsp', order: 3, sheetRow: _riRow++ },
  { recipe_id: 'rec-7', ingredient_id: 'ing-2', ingredientName: 'Olive Oil', quantity: 2, unit: 'tbsp', order: 4, sheetRow: _riRow++ },
  { recipe_id: 'rec-7', ingredient_id: 'ing-3', ingredientName: 'Garlic', quantity: 2, unit: 'cloves', order: 5, sheetRow: _riRow++ },
  { recipe_id: 'rec-7', ingredient_id: 'ing-22', ingredientName: 'Carrots', quantity: 1, unit: 'whole', order: 6, sheetRow: _riRow++ },
  { recipe_id: 'rec-7', ingredient_id: 'ing-4', ingredientName: 'Onion', quantity: 0.5, unit: 'whole', order: 7, sheetRow: _riRow++ },
  // Overnight Oats (rec-8)
  { recipe_id: 'rec-8', ingredient_id: 'ing-20', ingredientName: 'Vanilla Extract', quantity: 0.5, unit: 'tsp', order: 1, sheetRow: _riRow++ },
  { recipe_id: 'rec-8', ingredient_id: 'ing-17', ingredientName: 'Sugar', quantity: 1, unit: 'tbsp', order: 2, sheetRow: _riRow++ },
];

// ===== Demo Recipe Steps (prep + cooking combined) =====
let _rsRow = 2;
export const DEMO_RECIPE_STEPS: RecipeStepWithRow[] = [
  // Chicken Stir Fry (rec-1) — Prep
  { recipe_id: 'rec-1', stepType: 'prep', stepNumber: 1, description: 'Cut chicken breast into 1-inch cubes and pat dry with paper towels.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'prep', stepNumber: 2, description: 'Dice bell peppers into strips. Peel and slice carrots into thin rounds.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'prep', stepNumber: 3, description: 'Cut broccoli into bite-sized florets.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'prep', stepNumber: 4, description: 'Mince garlic and grate ginger. Combine in a small bowl.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'prep', stepNumber: 5, description: 'Measure soy sauce into a small bowl. Set aside.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'prep', stepNumber: 6, description: 'Start rice in rice cooker or pot according to package directions.', sheetRow: _rsRow++ },
  // Chicken Stir Fry (rec-1) — Cooking
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 1, description: 'Heat olive oil in a large wok or skillet over high heat until shimmering.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 2, description: 'Add chicken cubes in a single layer. Cook 3-4 minutes without moving until golden on one side. Flip and cook another 2-3 minutes. Remove to a plate.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 3, description: 'Add carrots to the wok. Stir fry for 2 minutes until slightly softened.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 4, description: 'Add bell peppers and broccoli. Stir fry for 3 minutes until crisp-tender.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 5, description: 'Push vegetables to the side. Add garlic and ginger to the center. Cook 30 seconds until fragrant.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 6, description: 'Return chicken to the wok. Pour soy sauce over everything. Toss to combine and cook 1-2 minutes until sauce coats evenly.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-1', stepType: 'cooking', stepNumber: 7, description: 'Serve immediately over rice.', sheetRow: _rsRow++ },
  // Spaghetti Carbonara (rec-2) — Prep
  { recipe_id: 'rec-2', stepType: 'prep', stepNumber: 1, description: 'Dice pancetta into small cubes (about 1/4 inch).', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'prep', stepNumber: 2, description: 'Finely grate Parmesan cheese.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'prep', stepNumber: 3, description: 'In a bowl, whisk together eggs and most of the Parmesan (reserve 2 tbsp for garnish). Add black pepper.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'prep', stepNumber: 4, description: 'Bring a large pot of generously salted water to a rolling boil.', sheetRow: _rsRow++ },
  // Spaghetti Carbonara (rec-2) — Cooking
  { recipe_id: 'rec-2', stepType: 'cooking', stepNumber: 1, description: 'Cook spaghetti in boiling salted water according to package directions until al dente. Reserve 1 cup pasta water before draining.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'cooking', stepNumber: 2, description: 'While pasta cooks, add pancetta to a cold skillet. Cook over medium heat until fat renders and edges are crispy, about 5-7 minutes.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'cooking', stepNumber: 3, description: 'Remove skillet from heat. Let it cool for 1 minute (this prevents scrambling the eggs).', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'cooking', stepNumber: 4, description: 'Add drained hot pasta to the skillet. Toss to coat in pancetta fat.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'cooking', stepNumber: 5, description: 'Pour egg and cheese mixture over pasta. Toss vigorously, adding pasta water a splash at a time until you get a creamy, silky sauce.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-2', stepType: 'cooking', stepNumber: 6, description: 'Serve immediately, topped with reserved Parmesan and extra black pepper.', sheetRow: _rsRow++ },
  // Garlic Butter Salmon (rec-4) — Prep
  { recipe_id: 'rec-4', stepType: 'prep', stepNumber: 1, description: 'Pat salmon fillets dry with paper towels.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'prep', stepNumber: 2, description: 'Mix salt, pepper, and paprika in a small bowl.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'prep', stepNumber: 3, description: 'Mince garlic cloves. Slice lemon into wedges.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'prep', stepNumber: 4, description: 'Season both sides of salmon with the spice mixture.', sheetRow: _rsRow++ },
  // Garlic Butter Salmon (rec-4) — Cooking
  { recipe_id: 'rec-4', stepType: 'cooking', stepNumber: 1, description: 'Heat olive oil in a skillet over medium-high heat.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'cooking', stepNumber: 2, description: 'Place salmon skin-side up. Sear for 4 minutes until golden crust forms.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'cooking', stepNumber: 3, description: 'Flip salmon. Cook 3 minutes more.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'cooking', stepNumber: 4, description: 'Reduce heat to medium-low. Add butter and garlic to the pan.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'cooking', stepNumber: 5, description: 'When butter melts and garlic is fragrant (about 1 minute), spoon the garlic butter over the salmon repeatedly for 1-2 minutes.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-4', stepType: 'cooking', stepNumber: 6, description: 'Squeeze lemon over salmon. Serve with the pan sauce.', sheetRow: _rsRow++ },
  // Simple Fried Rice (rec-7) — Prep
  { recipe_id: 'rec-7', stepType: 'prep', stepNumber: 1, description: 'If using fresh rice, cook it and spread on a sheet pan to cool and dry out (or use day-old rice from the fridge).', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'prep', stepNumber: 2, description: 'Dice carrots and onion into small cubes.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'prep', stepNumber: 3, description: 'Mince garlic.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'prep', stepNumber: 4, description: 'Beat eggs in a small bowl.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'prep', stepNumber: 5, description: 'Measure soy sauce and set aside.', sheetRow: _rsRow++ },
  // Simple Fried Rice (rec-7) — Cooking
  { recipe_id: 'rec-7', stepType: 'cooking', stepNumber: 1, description: 'Heat oil in a large wok or skillet over high heat.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'cooking', stepNumber: 2, description: 'Scramble eggs quickly, breaking into small pieces. Remove to a plate.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'cooking', stepNumber: 3, description: 'Add more oil if needed. Stir fry carrots and onion for 2-3 minutes.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'cooking', stepNumber: 4, description: 'Add garlic, cook 30 seconds.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'cooking', stepNumber: 5, description: 'Add rice, breaking up any clumps. Cook 3-4 minutes, pressing rice against the wok for crispy bits.', sheetRow: _rsRow++ },
  { recipe_id: 'rec-7', stepType: 'cooking', stepNumber: 6, description: 'Add soy sauce and scrambled eggs. Toss everything together. Serve hot.', sheetRow: _rsRow++ },
];
