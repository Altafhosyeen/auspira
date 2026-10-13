/**
 * Index-preserving text normalisation.
 *
 * Naive normalisation (`s.toLowerCase().replace(...)`) destroys the link
 * between a normalised character and the character it came from, which is
 * exactly the link needed to turn a match back into a DOM selection. Every
 * function here therefore emits a `map` alongside the text: `map[i]` is the
 * UTF-16 index in the source string that produced `text[i]`.
 *
 * The rules applied, in order:
 *
 * | Input                    | Output  | Why                                     |
 * | ------------------------ | ------- | --------------------------------------- |
 * | `A`–`Z`                  | `a`–`z` | case-insensitive matching               |
 * | `é` `ü` `ñ`              | `e u n` | compatibility decomposition + mark strip |
 * | `ﬁ` `ﬂ` `½` `²`          | `fi fl 1/2 2` | ligatures and compatibility forms |
 * | `’ ‘ ‛ ′`                | `'`     | the PDF's curly quotes vs the JSON's     |
 * | `– — ‐ ‑ −`              | `-`     | five dash code points render alike       |
 * | NBSP, thin/en/em spaces  | ` `     | invisible-but-different whitespace       |
 * | soft hyphen, ZWSP, BOM   | removed | invisible, and they break substrings     |
 * | tabs, newlines, runs     | ` `     | collapse to one space                    |
 * | other punctuation        | ` `     | `"walls,"` must equal `"walls"`          |
 *
 * The one deliberate exception is `%`: stripping it made every percentage field
 * indistinguishable from a bare number, so it is kept by default.
 */
import type { NormalizedChunk, NormalizerOptions, ResolvedNormalizerOptions } from '../types';

/** Combining marks left behind by a compatibility decomposition. */
const COMBINING_MARKS = /\p{M}+/gu;

/** Letters and numbers in any script — kept as-is when punctuation is stripped. */
const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

/** Invisible code points that must vanish rather than become a space. */
const ZERO_WIDTH = new Set([
  0x00ad, // soft hyphen — a *rendering* hint, never part of the word
  0x200b, // zero-width space
  0x200c, // zero-width non-joiner
  0x200d, // zero-width joiner
  0x2060, // word joiner
  0xfeff, // BOM / zero-width no-break space
]);

/** Code points that render as whitespace but are not U+0020. */
const SPACE_LIKE = new Set([
  0x00a0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009,
  0x200a, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000,
]);

/** Every dash-like code point a PDF might use for a hyphen or a range. */
const DASH_LIKE = new Set([
  0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212, 0xfe58, 0xfe63, 0xff0d,
]);

const SINGLE_QUOTE_LIKE = new Set([0x2018, 0x2019, 0x201a, 0x201b, 0x2032, 0x02bc, 0x00b4, 0x2035]);
const DOUBLE_QUOTE_LIKE = new Set([0x201c, 0x201d, 0x201e, 0x201f, 0x2033, 0x00ab, 0x00bb]);

export const DEFAULT_NORMALIZER_OPTIONS: Readonly<Required<NormalizerOptions>> = Object.freeze({
  foldUnicode: true,
  lowercase: true,
  stripPunctuation: true,
  keepSymbols: '%',
});

export function resolveNormalizerOptions(
  options: NormalizerOptions = {}
): ResolvedNormalizerOptions {
  const merged = { ...DEFAULT_NORMALIZER_OPTIONS, ...options };
  return { ...merged, keepSet: new Set(merged.keepSymbols) };
}

/**
 * Fold a single code point to its normalised replacement.
 *
 * Returns `''` (drop the character), `' '` (a separator), or one-or-more
 * characters. A multi-character result is what makes ligature expansion safe:
 * every output character is credited to the *same* source index, so the map
 * stays valid.
 */
export function foldCodePoint(
  ch: string,
  options: ResolvedNormalizerOptions,
  cache?: Map<string, string>
): string {
  const cached = cache?.get(ch);
  if (cached !== undefined) return cached;

  const folded = computeFold(ch, options);
  cache?.set(ch, folded);
  return folded;
}

function computeFold(ch: string, options: ResolvedNormalizerOptions): string {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return '';

  // Fast path: plain ASCII covers the overwhelming majority of contract text.
  if (cp < 0x80) {
    if ((cp >= 0x61 && cp <= 0x7a) || (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x30 && cp <= 0x39)) {
      return ch;
    }
    if (cp === 0x20 || (cp >= 0x09 && cp <= 0x0d)) return ' ';
    // Remaining ASCII is punctuation.
    if (!options.stripPunctuation || options.keepSet.has(ch)) return ch;
    return ' ';
  }

  if (ZERO_WIDTH.has(cp)) return '';
  if (SPACE_LIKE.has(cp)) return ' ';
  if (DASH_LIKE.has(cp)) {
    if (!options.stripPunctuation || options.keepSet.has('-')) return '-';
    return ' ';
  }
  if (SINGLE_QUOTE_LIKE.has(cp)) {
    if (!options.stripPunctuation || options.keepSet.has("'")) return "'";
    return ' ';
  }
  if (DOUBLE_QUOTE_LIKE.has(cp)) {
    if (!options.stripPunctuation || options.keepSet.has('"')) return '"';
    return ' ';
  }

  if (!options.foldUnicode) {
    if (LETTER_OR_NUMBER.test(ch)) return ch;
    if (!options.stripPunctuation || options.keepSet.has(ch)) return ch;
    return ' ';
  }

  // Compatibility-decompose, then drop the combining marks it exposed. This is
  // what turns `é → e`, `ﬁ → fi`, `²  → 2` and `Ⅻ → XII`.
  const decomposed = ch.normalize('NFKD').replace(COMBINING_MARKS, '');
  if (!decomposed) return '';

  if (decomposed === ch) {
    // Not decomposable — classify it directly. Recursing here would not
    // terminate, which is precisely why this branch exists.
    if (LETTER_OR_NUMBER.test(ch)) return ch;
    if (!options.stripPunctuation || options.keepSet.has(ch)) return ch;
    return ' ';
  }

  // The decomposition can itself contain punctuation (`½ → 1⁄2`), so fold it.
  let out = '';
  for (const part of decomposed) out += computeFold(part, options);
  return out;
}

/**
 * Lowercase a single character without ever changing its length.
 *
 * `'İ'.toLowerCase()` is two code points, and `'ß'.toUpperCase()` is `'SS'`.
 * Either would desynchronise `text` from `cased`, so a length-changing fold is
 * refused and the original character is kept — by which point the NFKD pass
 * above has usually already reduced the character to something safe.
 */
function safeLower(ch: string): string {
  const lower = ch.toLowerCase();
  return lower.length === ch.length ? lower : ch;
}

/**
 * Normalise a string, producing the lowercased stream, a case-preserved
 * parallel of identical length, and the source-index map.
 *
 * Whitespace runs collapse to a single space, and a leading space is never
 * emitted — but a *trailing* space is preserved, because the index builder uses
 * it to decide whether the next text item needs a separator.
 */
export function normalizeChunk(
  source: string,
  options: ResolvedNormalizerOptions,
  cache?: Map<string, string>
): NormalizedChunk {
  if (!source) return { text: '', cased: '', map: new Int32Array(0) };

  let text = '';
  let cased = '';
  const map: number[] = [];

  let srcIndex = 0;
  for (const ch of source) {
    const replacement = foldCodePoint(ch, options, cache);
    for (const out of replacement) {
      if (out === ' ') {
        // Collapse runs, and never start the chunk with a space.
        if (text.length === 0 || text.endsWith(' ')) continue;
        text += ' ';
        cased += ' ';
        map.push(srcIndex);
        continue;
      }
      cased += out;
      text += options.lowercase ? safeLower(out) : out;
      map.push(srcIndex);
    }
    srcIndex += ch.length;
  }

  return { text, cased, map: Int32Array.from(map) };
}

/** Drop leading and trailing spaces from a chunk, keeping the map aligned. */
export function trimChunk(chunk: NormalizedChunk): NormalizedChunk {
  let start = 0;
  let end = chunk.text.length;
  while (start < end && chunk.text[start] === ' ') start++;
  while (end > start && chunk.text[end - 1] === ' ') end--;
  if (start === 0 && end === chunk.text.length) return chunk;
  return {
    text: chunk.text.slice(start, end),
    cased: chunk.cased.slice(start, end),
    map: chunk.map.slice(start, end),
  };
}

/** Convenience wrapper for callers that only need the normalised string. */
export function normalizeText(source: string, options?: NormalizerOptions): string {
  return trimChunk(normalizeChunk(source, resolveNormalizerOptions(options))).text;
}

/** Remove every space from `text`, returning the compacted form and its map. */
export function compactText(text: string): { compact: string; map: Int32Array } {
  const map = new Int32Array(text.length);
  let compact = '';
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') continue;
    compact += text[i];
    map[n++] = i;
  }
  return { compact, map: map.slice(0, n) };
}

/**
 * `true` when position `i` in `text` begins a word — i.e. it is the start of
 * the string or is preceded by a space. Used to keep substring and compact
 * matches from landing in the middle of an unrelated word.
 */
export function isWordStart(text: string, i: number): boolean {
  return i === 0 || text.charCodeAt(i - 1) === 32;
}

/** `true` when position `i` is one past the last character of a word. */
export function isWordEnd(text: string, i: number): boolean {
  return i >= text.length || text.charCodeAt(i) === 32;
}
