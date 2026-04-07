/**
 * Sheet initialization — auto-creates Forage tabs and headers on first run.
 * Idempotent: only creates tabs that don't already exist.
 */

import { withReauth } from './sheets';
import { isDemo } from './demo-data';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/** Tab definitions: name → header row columns */
const FORAGE_TABS: Record<string, string[]> = {
  Recipes: ['id', 'Name', 'Description', 'Source', 'SourceURL', 'Servings', 'Rating', 'PrepTime', 'Labels', 'Created', 'Updated', 'Notes'],
  Ingredients: ['id', 'Name', 'Description', 'Created'],
  Recipe_Ingredients: ['recipe_id', 'ingredient_id', 'IngredientName', 'Quantity', 'Unit', 'Order'],
  Recipe_Steps: ['recipe_id', 'StepType', 'StepNumber', 'Description'],
  Sessions: ['id', 'recipe_id', 'RecipeName', 'Date', 'Status', 'PrepTime', 'CookTime', 'Rating', 'Notes'],
  Labels: ['id', 'Name', 'ColorKey', 'Created'],
  Config: ['Key', 'Value'],
};

/** Column letter for a 0-based index (supports up to 26 columns). */
function colLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/**
 * Get the list of existing tab names in the spreadsheet.
 */
async function getExistingTabs(token: string): Promise<string[]> {
  const url = `${BASE}/${SPREADSHEET_ID}?fields=sheets.properties.title`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to read spreadsheet: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return (data.sheets || []).map((s: any) => s.properties.title as string);
}

/**
 * Create missing tabs via batchUpdate.
 */
async function createTabs(tabNames: string[], token: string): Promise<void> {
  if (tabNames.length === 0) return;

  const requests = tabNames.map(title => ({
    addSheet: { properties: { title } },
  }));

  const url = `${BASE}/${SPREADSHEET_ID}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create tabs: ${res.status} ${await res.text()}`);
  }
}

/**
 * Write header row to a tab.
 */
async function writeHeaders(tabName: string, headers: string[], token: string): Promise<void> {
  const lastCol = colLetter(headers.length - 1);
  const range = `${tabName}!A1:${lastCol}1`;
  const url = `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [headers] }),
  });
  if (!res.ok) {
    console.error(`Failed to write headers for ${tabName}: ${res.status}`);
  }
}

/**
 * Ensure all Forage tabs exist with headers.
 * Called at the start of loadInitialData (skipped in demo mode).
 *
 * - Checks which tabs already exist
 * - Creates any missing tabs
 * - Writes header row (Row 1) to newly created tabs
 */
export async function ensureSheetTabs(token: string): Promise<void> {
  // Skip in demo mode
  if (isDemo()) return;

  // Validate spreadsheet ID
  if (!SPREADSHEET_ID) {
    throw new Error('VITE_SPREADSHEET_ID is not configured. Add it to your .env file.');
  }

  await withReauth(token, async (t) => {
    // Get existing tabs
    const existing = await getExistingTabs(t);
    const existingSet = new Set(existing);

    // Find missing tabs
    const requiredTabs = Object.keys(FORAGE_TABS);
    const missing = requiredTabs.filter(tab => !existingSet.has(tab));

    if (missing.length === 0) return; // All tabs exist

    console.log(`Creating ${missing.length} Forage sheet tab(s):`, missing.join(', '));

    // Create missing tabs
    await createTabs(missing, t);

    // Write headers to newly created tabs
    await Promise.all(
      missing.map(tab => writeHeaders(tab, FORAGE_TABS[tab], t))
    );

    console.log('Sheet initialization complete.');
  });
}
