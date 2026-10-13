/**
 * Best-effort page-number extraction from free-text reference strings that
 * have no separate numeric page field, e.g. "HRA §5 · p32" → 32,
 * "GI §3 · p5" → 5. Returns null when no "p<digits>" pattern is found.
 */
export function extractPageNumber(text?: string | number | null): number | null {
  if (text === null || text === undefined || text === '') return null;
  // Backend data is not always a string — a numeric page comes through as a
  // number, which has no .match(). Coerce so callers never crash.
  // A bare number (or numeric string) is the page itself.
  if (typeof text === 'number') {
    return Number.isFinite(text) ? text : null;
  }

  const str = String(text);
  const match = str.match(/p\.?\s*(\d+)/i);
  if (!match) return null;
  const page = Number(match[1]);
  return Number.isFinite(page) ? page : null;
}
