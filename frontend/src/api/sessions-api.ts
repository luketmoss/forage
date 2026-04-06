// Sessions domain API — wraps Sheets REST calls with demo-mode fallback.

import type { CookingSession, SessionWithRow } from './types';
import { sheetsGet, sheetsAppend, sheetsUpdate, sheetsDeleteRow, getSheetId, withReauth, sanitizeCell } from './sheets';
import { isDemo, DEMO_SESSIONS } from './demo-data';

/**
 * Fetch all sessions from the Sessions sheet.
 * Sheet columns: A=id, B=recipe_id, C=RecipeName, D=Date, E=Status,
 *   F=PrepTime, G=CookTime, H=Rating, I=Notes
 */
export async function fetchSessions(token: string): Promise<SessionWithRow[]> {
  if (isDemo()) return [...DEMO_SESSIONS];

  return withReauth(token, async (t) => {
    const rows = await sheetsGet('Sessions!A2:I', t);
    return rows.map((row, i) => ({
      id: row[0] || '',
      recipe_id: row[1] || '',
      recipeName: row[2] || '',
      date: row[3] || '',
      status: (row[4] || 'completed') as CookingSession['status'],
      prepTime: Number(row[5]) || 0,
      cookTime: Number(row[6]) || 0,
      rating: Number(row[7]) || 0,
      notes: row[8] || '',
      sheetRow: i + 2,
    }));
  });
}

export async function createSession(
  data: Omit<CookingSession, 'id'>,
  token: string,
): Promise<CookingSession> {
  const id = `ses_${crypto.randomUUID().slice(0, 8)}`;
  const session: CookingSession = { id, ...data };

  if (isDemo()) return session;

  await withReauth(token, (t) =>
    sheetsAppend('Sessions!A:I', [[
      id,
      data.recipe_id,
      sanitizeCell(data.recipeName),
      data.date,
      data.status,
      data.prepTime,
      data.cookTime,
      data.rating,
      sanitizeCell(data.notes),
    ]], t),
  );
  return session;
}

export async function updateSession(
  sheetRow: number,
  session: CookingSession,
  token: string,
): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, (t) =>
    sheetsUpdate(
      `Sessions!A${sheetRow}:I${sheetRow}`,
      [[
        session.id,
        session.recipe_id,
        sanitizeCell(session.recipeName),
        session.date,
        session.status,
        session.prepTime,
        session.cookTime,
        session.rating,
        sanitizeCell(session.notes),
      ]],
      t,
    ),
  );
}

export async function deleteSession(sheetRow: number, token: string): Promise<void> {
  if (isDemo()) return;

  await withReauth(token, async (t) => {
    const sheetId = await getSheetId('Sessions', t);
    await sheetsDeleteRow(sheetId, sheetRow, t);
  });
}
