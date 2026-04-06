// ===== Types =====
export interface Ingredient {
  id: string;
  name: string;
  description: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  name: string;
  quantity: number;
  unit: string;
  order: number;
}

export interface PrepStep {
  step: number;
  description: string;
}

export interface CookingStep {
  step: number;
  description: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  source: 'manual' | 'web' | 'photo';
  sourceUrl?: string;
  servings: number;
  rating: number;
  prepTime: number;
  created: string;
  updated: string;
  labels: string[];
  ingredients: RecipeIngredient[];
  prep: PrepStep[];
  steps: CookingStep[];
}

export interface CookingSession {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  status: 'completed' | 'scheduled' | 'active';
  prepTime: number;
  cookTime: number;
  rating: number;
  notes: string;
}

// ===== Mock Ingredients =====
export const mockIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Chicken Breast', description: 'Boneless, skinless chicken breast' },
  { id: 'ing-2', name: 'Olive Oil', description: 'Extra virgin olive oil' },
  { id: 'ing-3', name: 'Garlic', description: 'Fresh garlic cloves' },
  { id: 'ing-4', name: 'Onion', description: 'Yellow onion' },
  { id: 'ing-5', name: 'Bell Pepper', description: 'Any color bell pepper' },
  { id: 'ing-6', name: 'Soy Sauce', description: 'Regular or low-sodium soy sauce' },
  { id: 'ing-7', name: 'Ginger', description: 'Fresh ginger root' },
  { id: 'ing-8', name: 'Rice', description: 'Long grain white rice' },
  { id: 'ing-9', name: 'Spaghetti', description: 'Dried spaghetti pasta' },
  { id: 'ing-10', name: 'Eggs', description: 'Large eggs' },
  { id: 'ing-11', name: 'Parmesan', description: 'Parmigiano-Reggiano cheese' },
  { id: 'ing-12', name: 'Pancetta', description: 'Italian cured pork belly' },
  { id: 'ing-13', name: 'Black Pepper', description: 'Freshly ground black pepper' },
  { id: 'ing-14', name: 'Salt', description: 'Kosher salt' },
  { id: 'ing-15', name: 'Butter', description: 'Unsalted butter' },
  { id: 'ing-16', name: 'All-Purpose Flour', description: 'Bleached or unbleached flour' },
  { id: 'ing-17', name: 'Sugar', description: 'Granulated white sugar' },
  { id: 'ing-18', name: 'Bananas', description: 'Ripe bananas' },
  { id: 'ing-19', name: 'Baking Soda', description: 'Sodium bicarbonate' },
  { id: 'ing-20', name: 'Vanilla Extract', description: 'Pure vanilla extract' },
  { id: 'ing-21', name: 'Broccoli', description: 'Fresh broccoli florets' },
  { id: 'ing-22', name: 'Carrots', description: 'Fresh whole carrots' },
  { id: 'ing-23', name: 'Paprika', description: 'Sweet or smoked paprika' },
  { id: 'ing-24', name: 'Cumin', description: 'Ground cumin' },
  { id: 'ing-25', name: 'Lemon', description: 'Fresh lemon' },
];

// ===== Mock Recipes =====
export const mockRecipes: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Chicken Stir Fry',
    description: 'Quick and easy weeknight stir fry with vegetables and a savory sauce.',
    source: 'manual',
    servings: 4,
    rating: 4,
    prepTime: 15,
    created: '2026-03-10',
    updated: '2026-03-28',
    labels: ['Quick', 'Dinner', 'Weeknight', 'Healthy'],
    ingredients: [
      { ingredient_id: 'ing-1', name: 'Chicken Breast', quantity: 1.5, unit: 'lbs', order: 1 },
      { ingredient_id: 'ing-2', name: 'Olive Oil', quantity: 2, unit: 'tbsp', order: 2 },
      { ingredient_id: 'ing-3', name: 'Garlic', quantity: 3, unit: 'cloves', order: 3 },
      { ingredient_id: 'ing-7', name: 'Ginger', quantity: 1, unit: 'tbsp', order: 4 },
      { ingredient_id: 'ing-5', name: 'Bell Pepper', quantity: 2, unit: 'whole', order: 5 },
      { ingredient_id: 'ing-21', name: 'Broccoli', quantity: 2, unit: 'cups', order: 6 },
      { ingredient_id: 'ing-22', name: 'Carrots', quantity: 2, unit: 'whole', order: 7 },
      { ingredient_id: 'ing-6', name: 'Soy Sauce', quantity: 3, unit: 'tbsp', order: 8 },
      { ingredient_id: 'ing-8', name: 'Rice', quantity: 2, unit: 'cups', order: 9 },
    ],
    prep: [
      { step: 1, description: 'Cut chicken breast into 1-inch cubes and pat dry with paper towels.' },
      { step: 2, description: 'Dice bell peppers into strips. Peel and slice carrots into thin rounds.' },
      { step: 3, description: 'Cut broccoli into bite-sized florets.' },
      { step: 4, description: 'Mince garlic and grate ginger. Combine in a small bowl.' },
      { step: 5, description: 'Measure soy sauce into a small bowl. Set aside.' },
      { step: 6, description: 'Start rice in rice cooker or pot according to package directions.' },
    ],
    steps: [
      { step: 1, description: 'Heat olive oil in a large wok or skillet over high heat until shimmering.' },
      { step: 2, description: 'Add chicken cubes in a single layer. Cook 3-4 minutes without moving until golden on one side. Flip and cook another 2-3 minutes. Remove to a plate.' },
      { step: 3, description: 'Add carrots to the wok. Stir fry for 2 minutes until slightly softened.' },
      { step: 4, description: 'Add bell peppers and broccoli. Stir fry for 3 minutes until crisp-tender.' },
      { step: 5, description: 'Push vegetables to the side. Add garlic and ginger to the center. Cook 30 seconds until fragrant.' },
      { step: 6, description: 'Return chicken to the wok. Pour soy sauce over everything. Toss to combine and cook 1-2 minutes until sauce coats evenly.' },
      { step: 7, description: 'Serve immediately over rice.' },
    ],
  },
  {
    id: 'rec-2',
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta with eggs, cheese, and pancetta. Creamy without cream.',
    source: 'web',
    sourceUrl: 'https://example.com/carbonara',
    servings: 2,
    rating: 5,
    prepTime: 10,
    created: '2026-02-15',
    updated: '2026-03-25',
    labels: ['Dinner', 'Comfort'],
    ingredients: [
      { ingredient_id: 'ing-9', name: 'Spaghetti', quantity: 8, unit: 'oz', order: 1 },
      { ingredient_id: 'ing-12', name: 'Pancetta', quantity: 4, unit: 'oz', order: 2 },
      { ingredient_id: 'ing-10', name: 'Eggs', quantity: 2, unit: 'whole', order: 3 },
      { ingredient_id: 'ing-11', name: 'Parmesan', quantity: 0.75, unit: 'cup', order: 4 },
      { ingredient_id: 'ing-13', name: 'Black Pepper', quantity: 1, unit: 'tsp', order: 5 },
      { ingredient_id: 'ing-14', name: 'Salt', quantity: 1, unit: 'tbsp', order: 6 },
    ],
    prep: [
      { step: 1, description: 'Dice pancetta into small cubes (about 1/4 inch).' },
      { step: 2, description: 'Finely grate Parmesan cheese.' },
      { step: 3, description: 'In a bowl, whisk together eggs and most of the Parmesan (reserve 2 tbsp for garnish). Add black pepper.' },
      { step: 4, description: 'Bring a large pot of generously salted water to a rolling boil.' },
    ],
    steps: [
      { step: 1, description: 'Cook spaghetti in boiling salted water according to package directions until al dente. Reserve 1 cup pasta water before draining.' },
      { step: 2, description: 'While pasta cooks, add pancetta to a cold skillet. Cook over medium heat until fat renders and edges are crispy, about 5-7 minutes.' },
      { step: 3, description: 'Remove skillet from heat. Let it cool for 1 minute (this prevents scrambling the eggs).' },
      { step: 4, description: 'Add drained hot pasta to the skillet. Toss to coat in pancetta fat.' },
      { step: 5, description: 'Pour egg and cheese mixture over pasta. Toss vigorously, adding pasta water a splash at a time until you get a creamy, silky sauce.' },
      { step: 6, description: 'Serve immediately, topped with reserved Parmesan and extra black pepper.' },
    ],
  },
  {
    id: 'rec-3',
    name: 'Banana Bread',
    description: 'Moist, perfectly sweet banana bread. Great for using up overripe bananas.',
    source: 'photo',
    servings: 8,
    rating: 4,
    prepTime: 10,
    created: '2026-01-20',
    updated: '2026-03-15',
    labels: ['Baking', 'Comfort'],
    ingredients: [
      { ingredient_id: 'ing-18', name: 'Bananas', quantity: 3, unit: 'whole', order: 1 },
      { ingredient_id: 'ing-15', name: 'Butter', quantity: 0.33, unit: 'cup', order: 2 },
      { ingredient_id: 'ing-17', name: 'Sugar', quantity: 0.75, unit: 'cup', order: 3 },
      { ingredient_id: 'ing-10', name: 'Eggs', quantity: 1, unit: 'whole', order: 4 },
      { ingredient_id: 'ing-20', name: 'Vanilla Extract', quantity: 1, unit: 'tsp', order: 5 },
      { ingredient_id: 'ing-19', name: 'Baking Soda', quantity: 1, unit: 'tsp', order: 6 },
      { ingredient_id: 'ing-14', name: 'Salt', quantity: 0.25, unit: 'tsp', order: 7 },
      { ingredient_id: 'ing-16', name: 'All-Purpose Flour', quantity: 1.5, unit: 'cups', order: 8 },
    ],
    prep: [
      { step: 1, description: 'Preheat oven to 350°F (175°C). Grease a 9x5 loaf pan.' },
      { step: 2, description: 'Melt butter and let it cool slightly.' },
      { step: 3, description: 'Mash bananas in a large bowl until mostly smooth (some chunks are ok).' },
      { step: 4, description: 'Measure out flour, baking soda, and salt into a separate bowl. Whisk to combine.' },
    ],
    steps: [
      { step: 1, description: 'Mix melted butter into the mashed bananas.' },
      { step: 2, description: 'Stir in sugar, beaten egg, and vanilla extract.' },
      { step: 3, description: 'Add the flour mixture to the wet ingredients. Fold gently until just combined — do not overmix.' },
      { step: 4, description: 'Pour batter into the prepared loaf pan. Smooth the top.' },
      { step: 5, description: 'Bake for 55-65 minutes until a toothpick inserted in the center comes out clean.' },
      { step: 6, description: 'Let cool in pan for 10 minutes, then turn out onto a wire rack.' },
    ],
  },
  {
    id: 'rec-4',
    name: 'Garlic Butter Salmon',
    description: 'Pan-seared salmon with garlic butter sauce. Ready in 20 minutes.',
    source: 'web',
    sourceUrl: 'https://example.com/salmon',
    servings: 2,
    rating: 5,
    prepTime: 5,
    created: '2026-03-01',
    updated: '2026-04-01',
    labels: ['Quick', 'Dinner', 'Healthy', 'Weeknight'],
    ingredients: [
      { ingredient_id: 'ing-14', name: 'Salt', quantity: 0.5, unit: 'tsp', order: 1 },
      { ingredient_id: 'ing-13', name: 'Black Pepper', quantity: 0.25, unit: 'tsp', order: 2 },
      { ingredient_id: 'ing-23', name: 'Paprika', quantity: 0.5, unit: 'tsp', order: 3 },
      { ingredient_id: 'ing-2', name: 'Olive Oil', quantity: 1, unit: 'tbsp', order: 4 },
      { ingredient_id: 'ing-15', name: 'Butter', quantity: 2, unit: 'tbsp', order: 5 },
      { ingredient_id: 'ing-3', name: 'Garlic', quantity: 4, unit: 'cloves', order: 6 },
      { ingredient_id: 'ing-25', name: 'Lemon', quantity: 1, unit: 'whole', order: 7 },
    ],
    prep: [
      { step: 1, description: 'Pat salmon fillets dry with paper towels.' },
      { step: 2, description: 'Mix salt, pepper, and paprika in a small bowl.' },
      { step: 3, description: 'Mince garlic cloves. Slice lemon into wedges.' },
      { step: 4, description: 'Season both sides of salmon with the spice mixture.' },
    ],
    steps: [
      { step: 1, description: 'Heat olive oil in a skillet over medium-high heat.' },
      { step: 2, description: 'Place salmon skin-side up. Sear for 4 minutes until golden crust forms.' },
      { step: 3, description: 'Flip salmon. Cook 3 minutes more.' },
      { step: 4, description: 'Reduce heat to medium-low. Add butter and garlic to the pan.' },
      { step: 5, description: 'When butter melts and garlic is fragrant (about 1 minute), spoon the garlic butter over the salmon repeatedly for 1-2 minutes.' },
      { step: 6, description: 'Squeeze lemon over salmon. Serve with the pan sauce.' },
    ],
  },
  {
    id: 'rec-5',
    name: 'Black Bean Tacos',
    description: 'Quick vegetarian tacos with spiced black beans, fresh toppings, and lime.',
    source: 'manual',
    servings: 4,
    rating: 3,
    prepTime: 10,
    created: '2026-02-28',
    updated: '2026-03-20',
    labels: ['Quick', 'Healthy', 'Weeknight'],
    ingredients: [
      { ingredient_id: 'ing-2', name: 'Olive Oil', quantity: 1, unit: 'tbsp', order: 1 },
      { ingredient_id: 'ing-4', name: 'Onion', quantity: 1, unit: 'whole', order: 2 },
      { ingredient_id: 'ing-3', name: 'Garlic', quantity: 2, unit: 'cloves', order: 3 },
      { ingredient_id: 'ing-24', name: 'Cumin', quantity: 1, unit: 'tsp', order: 4 },
      { ingredient_id: 'ing-23', name: 'Paprika', quantity: 0.5, unit: 'tsp', order: 5 },
      { ingredient_id: 'ing-14', name: 'Salt', quantity: 0.5, unit: 'tsp', order: 6 },
      { ingredient_id: 'ing-25', name: 'Lemon', quantity: 1, unit: 'whole', order: 7 },
    ],
    prep: [
      { step: 1, description: 'Dice onion finely. Mince garlic.' },
      { step: 2, description: 'Drain and rinse two cans of black beans.' },
      { step: 3, description: 'Measure cumin, paprika, and salt into a small bowl.' },
      { step: 4, description: 'Prepare toppings: shred lettuce, dice tomatoes, slice avocado.' },
    ],
    steps: [
      { step: 1, description: 'Heat olive oil over medium heat. Sauté onion for 3-4 minutes until softened.' },
      { step: 2, description: 'Add garlic and spice mix. Cook 30 seconds until fragrant.' },
      { step: 3, description: 'Add black beans and 1/4 cup water. Cook 5-7 minutes, mashing some beans with a fork for texture.' },
      { step: 4, description: 'Warm tortillas in a dry skillet or microwave.' },
      { step: 5, description: 'Assemble tacos: beans, toppings, and a squeeze of lime.' },
    ],
  },
  {
    id: 'rec-6',
    name: 'Lemon Herb Chicken Thighs',
    description: 'Crispy-skinned chicken thighs with lemon, garlic, and herbs. One-pan meal.',
    source: 'web',
    sourceUrl: 'https://example.com/chicken-thighs',
    servings: 4,
    rating: 0,
    prepTime: 10,
    created: '2026-03-25',
    updated: '2026-03-25',
    labels: ['Dinner', 'Comfort'],
    ingredients: [
      { ingredient_id: 'ing-1', name: 'Chicken Breast', quantity: 2, unit: 'lbs', order: 1 },
      { ingredient_id: 'ing-2', name: 'Olive Oil', quantity: 2, unit: 'tbsp', order: 2 },
      { ingredient_id: 'ing-3', name: 'Garlic', quantity: 4, unit: 'cloves', order: 3 },
      { ingredient_id: 'ing-25', name: 'Lemon', quantity: 1, unit: 'whole', order: 4 },
      { ingredient_id: 'ing-14', name: 'Salt', quantity: 1, unit: 'tsp', order: 5 },
      { ingredient_id: 'ing-13', name: 'Black Pepper', quantity: 0.5, unit: 'tsp', order: 6 },
    ],
    prep: [
      { step: 1, description: 'Pat chicken thighs dry with paper towels. Season generously with salt and pepper.' },
      { step: 2, description: 'Mince garlic. Zest and juice the lemon into separate bowls.' },
      { step: 3, description: 'Mix olive oil, garlic, lemon zest, and half the lemon juice in a bowl.' },
    ],
    steps: [
      { step: 1, description: 'Preheat oven to 425°F. Place a cast iron skillet over medium-high heat.' },
      { step: 2, description: 'Place chicken skin-side down in the hot skillet. Cook 5-6 minutes until skin is deeply golden and crispy.' },
      { step: 3, description: 'Flip chicken. Pour the garlic-lemon mixture over the top.' },
      { step: 4, description: 'Transfer skillet to oven. Roast 20-25 minutes until chicken reaches 165°F internal temp.' },
      { step: 5, description: 'Rest 5 minutes. Drizzle with remaining lemon juice before serving.' },
    ],
  },
  {
    id: 'rec-7',
    name: 'Simple Fried Rice',
    description: 'Use day-old rice for the best texture. Great for leftover veggies.',
    source: 'manual',
    servings: 3,
    rating: 4,
    prepTime: 10,
    created: '2026-03-05',
    updated: '2026-03-30',
    labels: ['Quick', 'Weeknight'],
    ingredients: [
      { ingredient_id: 'ing-8', name: 'Rice', quantity: 3, unit: 'cups', order: 1 },
      { ingredient_id: 'ing-10', name: 'Eggs', quantity: 2, unit: 'whole', order: 2 },
      { ingredient_id: 'ing-6', name: 'Soy Sauce', quantity: 2, unit: 'tbsp', order: 3 },
      { ingredient_id: 'ing-2', name: 'Olive Oil', quantity: 2, unit: 'tbsp', order: 4 },
      { ingredient_id: 'ing-3', name: 'Garlic', quantity: 2, unit: 'cloves', order: 5 },
      { ingredient_id: 'ing-22', name: 'Carrots', quantity: 1, unit: 'whole', order: 6 },
      { ingredient_id: 'ing-4', name: 'Onion', quantity: 0.5, unit: 'whole', order: 7 },
    ],
    prep: [
      { step: 1, description: 'If using fresh rice, cook it and spread on a sheet pan to cool and dry out (or use day-old rice from the fridge).' },
      { step: 2, description: 'Dice carrots and onion into small cubes.' },
      { step: 3, description: 'Mince garlic.' },
      { step: 4, description: 'Beat eggs in a small bowl.' },
      { step: 5, description: 'Measure soy sauce and set aside.' },
    ],
    steps: [
      { step: 1, description: 'Heat oil in a large wok or skillet over high heat.' },
      { step: 2, description: 'Scramble eggs quickly, breaking into small pieces. Remove to a plate.' },
      { step: 3, description: 'Add more oil if needed. Stir fry carrots and onion for 2-3 minutes.' },
      { step: 4, description: 'Add garlic, cook 30 seconds.' },
      { step: 5, description: 'Add rice, breaking up any clumps. Cook 3-4 minutes, pressing rice against the wok for crispy bits.' },
      { step: 6, description: 'Add soy sauce and scrambled eggs. Toss everything together. Serve hot.' },
    ],
  },
  {
    id: 'rec-8',
    name: 'Overnight Oats',
    description: 'No-cook breakfast prep. Make the night before, grab and go in the morning.',
    source: 'manual',
    servings: 1,
    rating: 3,
    prepTime: 5,
    created: '2026-03-15',
    updated: '2026-03-15',
    labels: ['Quick', 'Healthy'],
    ingredients: [
      { ingredient_id: 'ing-20', name: 'Vanilla Extract', quantity: 0.5, unit: 'tsp', order: 1 },
      { ingredient_id: 'ing-17', name: 'Sugar', quantity: 1, unit: 'tbsp', order: 2 },
    ],
    prep: [
      { step: 1, description: 'Combine oats, milk, yogurt, vanilla, and sweetener in a mason jar or container.' },
      { step: 2, description: 'Stir well, seal, and refrigerate overnight (at least 6 hours).' },
    ],
    steps: [
      { step: 1, description: 'Remove from fridge. Stir well.' },
      { step: 2, description: 'Add your favorite toppings: fresh berries, banana slices, nuts, honey, or nut butter.' },
      { step: 3, description: 'Eat cold or microwave for 1-2 minutes if you prefer warm oats.' },
    ],
  },
];

// ===== Mock Cooking Sessions =====
export const mockSessions: CookingSession[] = [
  {
    id: 'ses-1',
    recipeId: 'rec-2',
    recipeName: 'Spaghetti Carbonara',
    date: '2026-04-05',
    status: 'completed',
    prepTime: 12,
    cookTime: 18,
    rating: 5,
    notes: 'Used guanciale instead of pancetta. Even better!',
  },
  {
    id: 'ses-2',
    recipeId: 'rec-1',
    recipeName: 'Chicken Stir Fry',
    date: '2026-04-04',
    status: 'completed',
    prepTime: 15,
    cookTime: 12,
    rating: 4,
    notes: 'Added snap peas. Good addition.',
  },
  {
    id: 'ses-3',
    recipeId: 'rec-4',
    recipeName: 'Garlic Butter Salmon',
    date: '2026-04-02',
    status: 'completed',
    prepTime: 5,
    cookTime: 14,
    rating: 5,
    notes: '',
  },
  {
    id: 'ses-4',
    recipeId: 'rec-3',
    recipeName: 'Banana Bread',
    date: '2026-03-30',
    status: 'completed',
    prepTime: 12,
    cookTime: 60,
    rating: 4,
    notes: 'Added chocolate chips. Kids loved it.',
  },
  {
    id: 'ses-5',
    recipeId: 'rec-7',
    recipeName: 'Simple Fried Rice',
    date: '2026-03-28',
    status: 'completed',
    prepTime: 10,
    cookTime: 10,
    rating: 4,
    notes: '',
  },
  // Active session (in progress)
  {
    id: 'ses-8',
    recipeId: 'rec-7',
    recipeName: 'Simple Fried Rice',
    date: '2026-04-05',
    status: 'active',
    prepTime: 8,
    cookTime: 0,
    rating: 0,
    notes: '',
  },
  // Scheduled sessions (future)
  {
    id: 'ses-6',
    recipeId: 'rec-6',
    recipeName: 'Lemon Herb Chicken Thighs',
    date: '2026-04-07',
    status: 'scheduled',
    prepTime: 0,
    cookTime: 0,
    rating: 0,
    notes: '',
  },
  {
    id: 'ses-7',
    recipeId: 'rec-5',
    recipeName: 'Black Bean Tacos',
    date: '2026-04-09',
    status: 'scheduled',
    prepTime: 0,
    cookTime: 0,
    rating: 0,
    notes: '',
  },
];

// ===== Helper Functions =====
export function getRecipeById(id: string): Recipe | undefined {
  return mockRecipes.find(r => r.id === id);
}

export function getSessionsForRecipe(recipeId: string): CookingSession[] {
  return mockSessions.filter(s => s.recipeId === recipeId && s.status === 'completed');
}

export function getLastSession(recipeId: string): CookingSession | undefined {
  const sessions = getSessionsForRecipe(recipeId);
  return sessions.sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimerDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function toLocalDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

export interface GroupedSessions {
  label: string;
  sessions: CookingSession[];
}

/** Group sessions into "This Week", "Last Week", "Earlier" — matching Thrive's grouping */
export function groupSessionsByWeek(sessions: CookingSession[], todayStr: string): GroupedSessions[] {
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay(); // 0=Sun
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const thisMondayStr = toLocalDateStr(thisMonday);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastMondayStr = toLocalDateStr(lastMonday);

  const thisWeek: CookingSession[] = [];
  const lastWeek: CookingSession[] = [];
  const earlier: CookingSession[] = [];

  for (const s of sessions) {
    if (s.date >= thisMondayStr) thisWeek.push(s);
    else if (s.date >= lastMondayStr) lastWeek.push(s);
    else earlier.push(s);
  }

  const groups: GroupedSessions[] = [];
  if (thisWeek.length > 0) groups.push({ label: 'This Week', sessions: thisWeek });
  if (lastWeek.length > 0) groups.push({ label: 'Last Week', sessions: lastWeek });
  if (earlier.length > 0) groups.push({ label: 'Earlier', sessions: earlier });
  return groups;
}

/** Get labels used by recipes in a set of sessions */
export function getSessionLabels(sessions: CookingSession[]): string[] {
  const labelSet = new Set<string>();
  for (const s of sessions) {
    const recipe = mockRecipes.find(r => r.id === s.recipeId);
    if (recipe) recipe.labels.forEach(l => labelSet.add(l));
  }
  return Array.from(labelSet).sort();
}

export function getWeekDays(sessions: CookingSession[], todayStr: string): { date: string; label: string; hasCompleted: boolean; hasScheduled: boolean; isToday: boolean }[] {
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toLocalDateStr(d);
    days.push({
      date: dateStr,
      label: dayLabels[i],
      hasCompleted: sessions.some(s => s.date === dateStr && s.status === 'completed'),
      hasScheduled: sessions.some(s => s.date === dateStr && s.status === 'scheduled'),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function getWeekStats(sessions: CookingSession[], todayStr: string) {
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const mondayStr = toLocalDateStr(monday);

  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);
  const lastMondayStr = toLocalDateStr(lastMonday);

  const monthStart = todayStr.substring(0, 8) + '01';

  const completed = sessions.filter(s => s.status === 'completed');

  const thisWeek = completed.filter(s => s.date >= mondayStr && s.date <= todayStr);
  const lastWeek = completed.filter(s => s.date >= lastMondayStr && s.date < mondayStr);
  const thisMonth = completed.filter(s => s.date >= monthStart && s.date <= todayStr);

  const totalTime = (list: CookingSession[]) => list.reduce((sum, s) => sum + s.prepTime + s.cookTime, 0);

  return {
    thisWeekCount: thisWeek.length,
    thisWeekMinutes: totalTime(thisWeek),
    lastWeekCount: lastWeek.length,
    lastWeekMinutes: totalTime(lastWeek),
    thisMonthCount: thisMonth.length,
    thisMonthMinutes: totalTime(thisMonth),
  };
}
