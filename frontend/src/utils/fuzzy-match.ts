/**
 * Fuzzy string matching for ingredient name matching.
 * Uses token overlap + normalized edit similarity for robust matching.
 */

/** Normalize a string for comparison: lowercase, trim, remove punctuation. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

/** Split into tokens (words). */
function tokenize(s: string): string[] {
  return normalize(s).split(/\s+/).filter(Boolean);
}

/**
 * Token overlap score: what fraction of query tokens appear in the target.
 * Returns 0-1.
 */
function tokenOverlap(query: string, target: string): number {
  const qTokens = tokenize(query);
  const tTokens = tokenize(target);
  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  let matches = 0;
  for (const qt of qTokens) {
    if (tTokens.some(tt => tt.includes(qt) || qt.includes(tt))) {
      matches++;
    }
  }
  return matches / Math.max(qTokens.length, tTokens.length);
}

/**
 * Simple Levenshtein distance (for short strings only).
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Use single-row optimization
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insertion
        prev[j] + 1,            // deletion
        prev[j - 1] + cost,     // substitution
      );
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Normalized edit similarity: 1 - (levenshtein / max_length).
 * Returns 0-1.
 */
function editSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(na, nb) / maxLen;
}

/**
 * Combined similarity score: weighted average of token overlap and edit similarity.
 * Returns 0-1 (higher = more similar).
 */
export function similarity(query: string, target: string): number {
  const tokenScore = tokenOverlap(query, target);
  const editScore = editSimilarity(query, target);
  // Weight token overlap higher — handles plurals and word-order differences better
  return tokenScore * 0.6 + editScore * 0.4;
}

export type MatchTier = 'auto' | 'suggest' | 'new';

export interface MatchResult {
  /** The ingredient ID from the library, or null if no match */
  ingredientId: string | null;
  /** The matched ingredient name from the library, or null */
  ingredientName: string | null;
  /** Match tier based on thresholds */
  tier: MatchTier;
  /** Similarity score 0-1 */
  score: number;
}

/**
 * Find the best match for an ingredient name against a library.
 * Thresholds: >0.8 = auto-match, 0.5-0.8 = suggest, <0.5 = new.
 */
export function findBestMatch(
  name: string,
  library: Array<{ id: string; name: string }>,
): MatchResult {
  if (library.length === 0) {
    return { ingredientId: null, ingredientName: null, tier: 'new', score: 0 };
  }

  let bestScore = 0;
  let bestId: string | null = null;
  let bestName: string | null = null;

  for (const item of library) {
    const score = similarity(name, item.name);
    if (score > bestScore) {
      bestScore = score;
      bestId = item.id;
      bestName = item.name;
    }
  }

  let tier: MatchTier;
  if (bestScore > 0.8) {
    tier = 'auto';
  } else if (bestScore >= 0.5) {
    tier = 'suggest';
  } else {
    tier = 'new';
  }

  return {
    ingredientId: tier === 'new' ? null : bestId,
    ingredientName: tier === 'new' ? null : bestName,
    tier,
    score: bestScore,
  };
}
