/**
 * Config API — read/write key-value pairs from the Config sheet.
 * Used for storing user preferences like the import prompt.
 */

import { sheetsGet, sheetsAppend, sheetsUpdate, withReauth, sanitizeCell } from './sheets';
import { isDemo } from './demo-data';

/** In-memory config cache for demo mode. */
const demoConfig: Record<string, string> = {};

/**
 * Get a config value by key. Returns undefined if not found.
 * Sheet columns: A=Key, B=Value
 */
export async function getConfigValue(key: string, token: string): Promise<string | undefined> {
  if (isDemo()) return demoConfig[key];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Config!A2:B', t);
    const row = rows.find(r => r[0] === key);
    return row ? (row[1] || '') : undefined;
  });
}

/**
 * Set a config value. Creates a new row if the key doesn't exist, or updates the existing row.
 */
export async function setConfigValue(key: string, value: string, token: string): Promise<void> {
  if (isDemo()) {
    demoConfig[key] = value;
    return;
  }

  await withReauth(token, async (t) => {
    // Find existing row
    const rows = await sheetsGet('Config!A2:B', t);
    const rowIndex = rows.findIndex(r => r[0] === key);

    if (rowIndex >= 0) {
      // Update existing row
      const sheetRow = rowIndex + 2;
      await sheetsUpdate(`Config!A${sheetRow}:B${sheetRow}`, [[key, sanitizeCell(value)]], t);
    } else {
      // Append new row
      await sheetsAppend('Config!A:B', [[key, sanitizeCell(value)]], t);
    }
  });
}
