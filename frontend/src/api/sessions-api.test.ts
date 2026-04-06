// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('./demo-data', () => ({
  isDemo: vi.fn(() => true),
  DEMO_SESSIONS: [
    { id: 'ses-1', recipe_id: 'rec-2', recipeName: 'Spaghetti Carbonara', date: '2026-04-05', status: 'completed', prepTime: 12, cookTime: 18, rating: 5, notes: 'Great!', sheetRow: 2 },
    { id: 'ses-2', recipe_id: 'rec-1', recipeName: 'Chicken Stir Fry', date: '2026-04-04', status: 'completed', prepTime: 15, cookTime: 12, rating: 4, notes: '', sheetRow: 3 },
  ],
}));

import { fetchSessions, createSession } from './sessions-api';

describe('sessions-api (demo mode)', () => {
  it('fetchSessions returns demo data', async () => {
    const result = await fetchSessions('demo');
    expect(result).toHaveLength(2);
    expect(result[0].recipeName).toBe('Spaghetti Carbonara');
    expect(result[0].status).toBe('completed');
  });

  it('fetchSessions returns a copy', async () => {
    const a = await fetchSessions('demo');
    const b = await fetchSessions('demo');
    expect(a).not.toBe(b);
  });

  it('createSession returns session with generated ID', async () => {
    const result = await createSession({
      recipe_id: 'rec-1',
      recipeName: 'Chicken Stir Fry',
      date: '2026-04-06',
      status: 'scheduled',
      prepTime: 0,
      cookTime: 0,
      rating: 0,
      notes: '',
    }, 'demo');
    expect(result.recipeName).toBe('Chicken Stir Fry');
    expect(result.id).toMatch(/^ses_/);
    expect(result.status).toBe('scheduled');
  });
});
