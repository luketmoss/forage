// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock demo-data before importing
vi.mock('./demo-data', () => ({
  isDemo: vi.fn(() => true),
  DEMO_INGREDIENTS: [
    { id: 'ing-1', name: 'Chicken Breast', description: 'Boneless, skinless', sheetRow: 2 },
    { id: 'ing-2', name: 'Olive Oil', description: 'Extra virgin', sheetRow: 3 },
  ],
}));

import { fetchIngredients, createIngredient } from './ingredients-api';

describe('ingredients-api (demo mode)', () => {
  it('fetchIngredients returns demo data', async () => {
    const result = await fetchIngredients('demo');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Chicken Breast');
    expect(result[0].sheetRow).toBe(2);
  });

  it('fetchIngredients returns a copy (not same reference)', async () => {
    const a = await fetchIngredients('demo');
    const b = await fetchIngredients('demo');
    expect(a).not.toBe(b);
  });

  it('createIngredient returns ingredient with generated ID', async () => {
    const result = await createIngredient({ name: 'Paprika', description: 'Sweet paprika' }, 'demo');
    expect(result.name).toBe('Paprika');
    expect(result.description).toBe('Sweet paprika');
    expect(result.id).toMatch(/^ing_/);
  });
});
