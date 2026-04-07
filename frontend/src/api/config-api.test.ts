// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('./demo-data', () => ({
  isDemo: vi.fn(() => true),
}));

import { getConfigValue, setConfigValue } from './config-api';

describe('config-api (demo mode)', () => {
  it('returns undefined for unset key', async () => {
    const result = await getConfigValue('nonexistent', 'demo');
    expect(result).toBeUndefined();
  });

  it('stores and retrieves a value', async () => {
    await setConfigValue('import_prompt', 'test prompt', 'demo');
    const result = await getConfigValue('import_prompt', 'demo');
    expect(result).toBe('test prompt');
  });

  it('overwrites existing value', async () => {
    await setConfigValue('import_prompt', 'first', 'demo');
    await setConfigValue('import_prompt', 'second', 'demo');
    const result = await getConfigValue('import_prompt', 'demo');
    expect(result).toBe('second');
  });
});
