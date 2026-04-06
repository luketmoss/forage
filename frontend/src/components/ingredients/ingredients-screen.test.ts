// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ingredients } from '../../state/store';
import type { IngredientWithRow } from '../../api/types';

const MOCK_INGREDIENTS: IngredientWithRow[] = [
  { id: 'ing-1', name: 'Chicken Breast', description: 'Boneless, skinless', sheetRow: 2 },
  { id: 'ing-2', name: 'Olive Oil', description: 'Extra virgin olive oil', sheetRow: 3 },
  { id: 'ing-3', name: 'Garlic', description: 'Fresh garlic cloves', sheetRow: 4 },
];

describe('ingredients store integration', () => {
  beforeEach(() => {
    ingredients.value = [...MOCK_INGREDIENTS];
  });

  it('ingredients signal holds all items', () => {
    expect(ingredients.value).toHaveLength(3);
    expect(ingredients.value[0].name).toBe('Chicken Breast');
  });

  it('adding an ingredient updates the signal', () => {
    const newIng: IngredientWithRow = {
      id: 'ing-4', name: 'Paprika', description: 'Sweet paprika', sheetRow: 5,
    };
    ingredients.value = [...ingredients.value, newIng];
    expect(ingredients.value).toHaveLength(4);
    expect(ingredients.value[3].name).toBe('Paprika');
  });

  it('editing an ingredient updates in place', () => {
    const updated = { ...ingredients.value[1], name: 'EVOO' };
    ingredients.value = ingredients.value.map(i => i.id === updated.id ? updated : i);
    expect(ingredients.value[1].name).toBe('EVOO');
    expect(ingredients.value).toHaveLength(3);
  });

  it('removing an ingredient shrinks the list', () => {
    ingredients.value = ingredients.value.filter(i => i.id !== 'ing-2');
    expect(ingredients.value).toHaveLength(2);
    expect(ingredients.value.find(i => i.id === 'ing-2')).toBeUndefined();
  });

  it('search filtering works on ingredient names', () => {
    const search = 'garlic';
    const filtered = ingredients.value.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Garlic');
  });
});
