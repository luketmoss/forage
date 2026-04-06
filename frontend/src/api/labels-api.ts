// Labels domain API — wraps Sheets REST calls with demo-mode fallback.

import type { Label, LabelWithRow } from './types';
import { sheetsGet, sheetsAppend, sheetsUpdate, sheetsDeleteRow, getSheetId, withReauth, sanitizeCell } from './sheets';
import { isDemo, DEMO_LABELS } from './demo-data';

/**
 * Fetch all labels from the Labels sheet.
 * Sheet columns: A=id, B=Name, C=ColorKey, D=Created
 */
export async function fetchLabels(token: string): Promise<LabelWithRow[]> {
  if (isDemo()) return [...DEMO_LABELS];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Labels!A2:D', t);
    return rows.map((row, i) => ({
      id: row[0] || '',
      name: row[1] || '',
      colorKey: row[2] || 'gray',
      sheetRow: i + 2,
    }));
  });
}

/**
 * Create a new label. Returns the created Label (without sheetRow).
 */
export async function createLabel(
  data: { name: string; colorKey: string },
  token: string,
): Promise<Label> {
  const id = `lbl_${crypto.randomUUID().slice(0, 8)}`;
  const created = new Date().toISOString();
  const label: Label = { id, name: data.name, colorKey: data.colorKey };

  if (isDemo()) return label;

  await withReauth(token, (t) =>
    sheetsAppend('Labels!A:D', [[id, sanitizeCell(data.name), data.colorKey, created]], t),
  );
  return label;
}

/**
 * Update an existing label at the given sheet row.
 */
export async function updateLabel(
  sheetRow: number,
  label: Label,
  token: string,
): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, (t) =>
    sheetsUpdate(
      `Labels!A${sheetRow}:D${sheetRow}`,
      [[label.id, sanitizeCell(label.name), label.colorKey, '']],
      t,
    ),
  );
}

/**
 * Delete a label by its sheet row.
 */
export async function deleteLabel(sheetRow: number, token: string): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, async (t) => {
    const sheetId = await getSheetId('Labels', t);
    await sheetsDeleteRow(sheetId, sheetRow, t);
  });
}
