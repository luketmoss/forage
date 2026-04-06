// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('./demo-data', () => ({
  isDemo: vi.fn(() => true),
  DEMO_LABELS: [
    { id: 'lbl-1', name: 'Quick', colorKey: 'green', sheetRow: 2 },
    { id: 'lbl-2', name: 'Dinner', colorKey: 'blue', sheetRow: 3 },
  ],
}));

import { fetchLabels, createLabel } from './labels-api';

describe('labels-api (demo mode)', () => {
  it('fetchLabels returns demo data', async () => {
    const result = await fetchLabels('demo');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Quick');
    expect(result[0].colorKey).toBe('green');
    expect(result[0].sheetRow).toBe(2);
  });

  it('fetchLabels returns a copy', async () => {
    const a = await fetchLabels('demo');
    const b = await fetchLabels('demo');
    expect(a).not.toBe(b);
  });

  it('createLabel returns label with generated ID', async () => {
    const result = await createLabel({ name: 'Breakfast', colorKey: 'amber' }, 'demo');
    expect(result.name).toBe('Breakfast');
    expect(result.colorKey).toBe('amber');
    expect(result.id).toMatch(/^lbl_/);
  });
});
