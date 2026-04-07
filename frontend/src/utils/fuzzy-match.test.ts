// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { similarity, findBestMatch, type MatchResult } from './fuzzy-match';

describe('similarity', () => {
  it('returns 1 for identical strings', () => {
    expect(similarity('chicken', 'chicken')).toBeCloseTo(1, 1);
  });

  it('returns high score for close matches', () => {
    expect(similarity('chicken breast', 'chicken breasts')).toBeGreaterThan(0.8);
  });

  it('returns moderate score for partial matches', () => {
    const score = similarity('parmesan', 'parmesan cheese');
    expect(score).toBeGreaterThan(0.4);
    expect(score).toBeLessThan(0.9);
  });

  it('returns low score for unrelated strings', () => {
    expect(similarity('chicken', 'cinnamon')).toBeLessThan(0.5);
  });

  it('is case-insensitive', () => {
    expect(similarity('Olive Oil', 'olive oil')).toBeCloseTo(1, 1);
  });

  it('handles empty strings', () => {
    // Two empty strings: edit similarity = 1 but token overlap = 0
    // Weighted result: 0 * 0.6 + 1 * 0.4 = 0.4
    expect(similarity('', '')).toBeCloseTo(0.4, 1);
    expect(similarity('chicken', '')).toBe(0);
  });
});

describe('findBestMatch', () => {
  const library = [
    { id: 'ing-1', name: 'chicken breast' },
    { id: 'ing-2', name: 'olive oil' },
    { id: 'ing-3', name: 'garlic' },
    { id: 'ing-4', name: 'salt' },
    { id: 'ing-5', name: 'black pepper' },
  ];

  it('auto-matches exact ingredients (>80%)', () => {
    const result = findBestMatch('chicken breast', library);
    expect(result.tier).toBe('auto');
    expect(result.ingredientId).toBe('ing-1');
    expect(result.ingredientName).toBe('chicken breast');
    expect(result.score).toBeGreaterThan(0.8);
  });

  it('auto-matches close variations', () => {
    const result = findBestMatch('chicken breasts', library);
    expect(result.tier).toBe('auto');
    expect(result.ingredientId).toBe('ing-1');
  });

  it('flags unmatched ingredients as new (<50%)', () => {
    const result = findBestMatch('mozzarella cheese', library);
    expect(result.tier).toBe('new');
    expect(result.ingredientId).toBeNull();
    expect(result.ingredientName).toBeNull();
  });

  it('returns new for empty library', () => {
    const result = findBestMatch('chicken', []);
    expect(result.tier).toBe('new');
    expect(result.ingredientId).toBeNull();
  });

  it('auto-matches case-insensitive', () => {
    const result = findBestMatch('OLIVE OIL', library);
    expect(result.tier).toBe('auto');
    expect(result.ingredientId).toBe('ing-2');
  });
});
