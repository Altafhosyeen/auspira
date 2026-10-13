/**
 * Defensively fixes UTF-8 double-encoding artefacts that can appear when
 * backend JSON strings are serialised/transmitted with incorrect charset
 * assumptions, e.g. "Â£940" → "£940", "â€™" → "'".
 *
 * Applied after JSON.parse() in each document context so every downstream
 * component receives already-clean strings.
 */
export function fixEncoding(str: string): string {
  return str
    .replace(/Â£/g, '£')
    .replace(/Â /g, ' ')
    .replace(/â€™/g, "'")
    .replace(/â€"/g, '—')
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Ã©/g, 'é')
    .replace(/Ã /g, 'à')
    .replace(/Ã¨/g, 'è');
}

/** Recursively walks any parsed JSON value and applies fixEncoding to every string. */
export function fixJsonEncoding<T>(value: T): T {
  if (typeof value === 'string') return fixEncoding(value) as T;
  if (Array.isArray(value)) return value.map(fixJsonEncoding) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, fixJsonEncoding(v)])
    ) as T;
  }
  return value;
}
