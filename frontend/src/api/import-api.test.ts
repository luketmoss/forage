// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('./demo-data', () => ({
  isDemo: vi.fn(() => true),
}));

import { importRecipeFromUrl } from './import-api';

describe('importRecipeFromUrl (demo mode)', () => {
  it('returns a demo recipe with expected structure', async () => {
    const result = await importRecipeFromUrl('https://example.com/recipe');

    expect(result.name).toBe('Classic Chicken Parmesan');
    expect(result.servings).toBe(4);
    expect(result.ingredients).toBeInstanceOf(Array);
    expect(result.ingredients.length).toBeGreaterThan(0);
    expect(result.prepSteps).toBeInstanceOf(Array);
    expect(result.prepSteps.length).toBeGreaterThan(0);
    expect(result.cookingSteps).toBeInstanceOf(Array);
    expect(result.cookingSteps.length).toBeGreaterThan(0);
  });

  it('each ingredient has name, quantity, and unit', async () => {
    const result = await importRecipeFromUrl('https://example.com/recipe');
    for (const ing of result.ingredients) {
      expect(ing).toHaveProperty('name');
      expect(ing).toHaveProperty('quantity');
      expect(ing).toHaveProperty('unit');
      expect(typeof ing.name).toBe('string');
      expect(typeof ing.quantity).toBe('number');
      expect(typeof ing.unit).toBe('string');
    }
  });

  it('separates prep and cooking steps', async () => {
    const result = await importRecipeFromUrl('https://example.com/recipe');
    // Prep steps should include non-heat tasks
    expect(result.prepSteps.some(s => s.toLowerCase().includes('pound') || s.toLowerCase().includes('preheat'))).toBe(true);
    // Cooking steps should include heat tasks
    expect(result.cookingSteps.some(s => s.toLowerCase().includes('cook') || s.toLowerCase().includes('heat') || s.toLowerCase().includes('bake'))).toBe(true);
  });
});
