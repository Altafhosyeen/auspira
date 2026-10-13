/**
 * Projects a character range in a page's normalised text back onto the original
 * pdf.js text items — the step that makes exact, sub-word highlighting possible.
 *
 * A match is found in normalised space (`"john smith"`), but the thing that has
 * to be lit up is a slice of one or more real DOM spans, whose text is the
 * *raw* string (`"JOHN"`, `" SMITH,"`). `PageIndex.itemOf` / `PageIndex.offsetOf`
 * were recorded during indexing precisely so this projection is a linear walk
 * with no searching, no guessing, and no DOM access:
 *
 * ```
 * normalized :  j  o  h  n  ␣  s  m  i  t  h
 * itemOf     :  0  0  0  0 -1  1  1  1  1  1     -1 = injected word break
 * offsetOf   :  0  1  2  3 -1  1  2  3  4  5     offset inside items[n].str
 *                                    ▲
 *              range [5,10) → slice { item 1, chars 1‥6 } → Range over span #1
 * ```
 *
 * The result is a list of {@link ItemSlice}s: one per text item the range
 * touches, each carrying the exact character offsets within that item's raw
 * string. Those offsets go straight into a DOM `Range`, and the browser reports
 * the true glyph geometry — including proportional font advances, which is why
 * highlighting half a word lands on exactly half the word.
 */
import type { CharRange, PageIndex } from '../types';

/** A contiguous run of characters inside one text item / text-layer span. */
export interface ItemSlice {
  /** Index into `PageIndex.items` — also the index into `TextLayer.textDivs`. */
  divIndex: number;
  /** First character offset inside the item's raw `str`. */
  startOffset: number;
  /** One past the last character offset inside the item's raw `str`. */
  endOffset: number;
}

/**
 * Splits a normalised character range into per-item slices.
 *
 * Injected word breaks (`itemOf === -1`) belong to no item and are skipped, so
 * a range that spans a break yields one slice per side. Offsets are tracked as
 * a min/max rather than assumed contiguous, because a folded character can
 * expand (`ﬁ` produces two normalised characters from one source character) —
 * both are credited to the same source offset, and taking the maximum plus one
 * keeps the whole ligature glyph inside the slice.
 */
export function sliceRangeToItems(index: PageIndex, range: CharRange): ItemSlice[] {
  const start = Math.max(0, range.start);
  const end = Math.min(index.normalized.length, range.end);
  if (end <= start) return [];

  const slices: ItemSlice[] = [];
  let current: ItemSlice | null = null;

  for (let i = start; i < end; i++) {
    const divIndex = index.itemOf[i];
    const offset = index.offsetOf[i];
    if (divIndex < 0 || offset < 0) {
      current = null; // injected separator — closes the run
      continue;
    }
    if (current && current.divIndex === divIndex) {
      if (offset < current.startOffset) current.startOffset = offset;
      if (offset + 1 > current.endOffset) current.endOffset = offset + 1;
      continue;
    }
    current = { divIndex, startOffset: offset, endOffset: offset + 1 };
    slices.push(current);
  }

  return mergeAdjacentSlices(slices);
}

/**
 * Merges slices that refer to the same item and are separated only by an
 * injected break, so `"john"` + break + `"smith"` inside a single span becomes
 * one DOM range covering the space between the words too.
 */
function mergeAdjacentSlices(slices: ItemSlice[]): ItemSlice[] {
  if (slices.length < 2) return slices;
  const merged: ItemSlice[] = [slices[0]];
  for (let i = 1; i < slices.length; i++) {
    const previous = merged[merged.length - 1];
    const slice = slices[i];
    if (previous.divIndex === slice.divIndex && slice.startOffset >= previous.startOffset) {
      previous.endOffset = Math.max(previous.endOffset, slice.endOffset);
      continue;
    }
    merged.push(slice);
  }
  return merged;
}

/**
 * Widens a range to cover every line it touches, end to end.
 *
 * A two-character clause number is far too small to notice on a dense page, so
 * a `short-code` or `clause` match lights up its whole heading line instead.
 * Deliberately capped at the touched lines rather than the paragraph: widening
 * further swallows entire sections of form-heavy pages.
 */
export function expandRangeToLines(index: PageIndex, range: CharRange): CharRange {
  if (index.lines.length === 0) return range;

  let first = -1;
  let last = -1;
  for (const line of index.lines) {
    if (line.end <= range.start || line.start >= range.end) continue;
    if (first === -1) first = line.index;
    last = line.index;
  }
  if (first === -1) return range;

  let start = range.start;
  let end = range.end;
  for (let i = first; i <= last; i++) {
    const line = index.lines[i];
    if (!line) continue;
    if (line.start < start) start = line.start;
    if (line.end > end) end = line.end;
  }
  return { start, end };
}

/**
 * Splits a range at line boundaries.
 *
 * Measuring per line keeps a multi-line phrase from producing one giant
 * rectangle that swallows the text between the first line's start and the last
 * line's end. Each sub-range is measured independently and rendered as its own
 * bar, which is how a wrapped sentence highlights the way it reads.
 */
export function splitRangeByLines(index: PageIndex, range: CharRange): CharRange[] {
  if (index.lines.length === 0) return [range];

  const parts: CharRange[] = [];
  for (const line of index.lines) {
    if (line.end <= range.start || line.start >= range.end) continue;
    const start = Math.max(line.start, range.start);
    const end = Math.min(line.end, range.end);
    if (end > start) parts.push({ start, end });
  }
  return parts.length > 0 ? parts : [range];
}

/** Maps a range in the compact (space-free) stream back to normalised space. */
export function compactRangeToNormalized(index: PageIndex, start: number, end: number): CharRange {
  const first = index.compactMap[start];
  const last = index.compactMap[Math.min(end, index.compact.length) - 1];
  return { start: first, end: last + 1 };
}

/** Reads the matched text back out of the page's normalised stream. */
export function readRange(index: PageIndex, range: CharRange): string {
  return index.normalized.slice(range.start, range.end);
}
