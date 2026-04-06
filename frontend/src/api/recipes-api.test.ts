// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('./demo-data', () => ({
  isDemo: vi.fn(() => true),
  DEMO_RECIPES: [
    { id: 'rec-1', name: 'Chicken Stir Fry', description: 'Quick stir fry', source: 'manual', sourceUrl: '', servings: 4, rating: 4, prepTime: 15, labels: 'Quick,Dinner', created: '2026-03-10', updated: '2026-03-28', notes: '', sheetRow: 2 },
    { id: 'rec-2', name: 'Spaghetti Carbonara', description: 'Classic pasta', source: 'web', sourceUrl: 'https://example.com', servings: 2, rating: 5, prepTime: 10, labels: 'Dinner,Comfort', created: '2026-02-15', updated: '2026-03-25', notes: '', sheetRow: 3 },
  ],
}));

import { fetchRecipes, createRecipe } from './recipes-api';

describe('recipes-api (demo mode)', () => {
  it('fetchRecipes returns demo data', async () => {
    const result = await fetchRecipes('demo');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Chicken Stir Fry');
    expect(result[0].labels).toBe('Quick,Dinner');
  });

  it('fetchRecipes returns a copy', async () => {
    const a = await fetchRecipes('demo');
    const b = await fetchRecipes('demo');
    expect(a).not.toBe(b);
  });

  it('createRecipe returns recipe with generated ID', async () => {
    const result = await createRecipe({
      name: 'Test Recipe',
      description: 'A test',
      source: 'manual',
      sourceUrl: '',
      servings: 4,
      rating: 0,
      prepTime: 0,
      labels: 'Quick',
      created: '',
      updated: '',
      notes: '',
    }, 'demo');
    expect(result.name).toBe('Test Recipe');
    expect(result.id).toMatch(/^rec_/);
  });
});
