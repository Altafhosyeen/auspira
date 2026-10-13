/**
 * Normalises a raw JSON value into a plain-text string suitable for PDF search /
 * highlight. Backend citation values are not always strings — a value can arrive
 * as an object (e.g. `{ value, page }`) or a list (e.g. an array of amendments).
 * PDF search only works on plain text, so we pull out the first meaningful string
 * and cap its length so the query stays matchable.
 *
 * - string            → trimmed (collapsed whitespace)
 * - number / boolean  → stringified
 * - array             → every element joined with a space (the PDF highlighter
 *                       trims this to the longest run it actually finds, so a
 *                       full list highlights the whole phrase when present and
 *                       still falls back to a single token otherwise)
 * - object            → a preferred text-bearing key, else first string value
 * - null / empty      → undefined (nothing to search for)
 */
const PREFERRED_KEYS = ['text', 'title', 'name', 'label', 'value', 'description'];

function extractText(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);

  if (Array.isArray(raw)) {
    return raw
      .map((item) => extractText(item))
      .filter((t) => t.trim())
      .join(' ');
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // Prefer well-known text-bearing keys so we search on the label a user can see.
    for (const key of PREFERRED_KEYS) {
      const v = obj[key];
      if (typeof v === 'string' && v.trim()) return v;
    }
    // Otherwise fall back to the first meaningful value anywhere in the object.
    for (const v of Object.values(obj)) {
      const t = extractText(v);
      if (t.trim()) return t;
    }
    return '';
  }

  return '';
}

export function toSearchText(raw: unknown, maxLen = 120): string | undefined {
  const trimmed = extractText(raw).replace(/\s+/g, ' ').trim();
  if (!trimmed) return undefined;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen).trim() : trimmed;
}
