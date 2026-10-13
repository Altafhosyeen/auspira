/**
 * Builds the immutable {@link PageIndex} for a single page.
 *
 * This runs **once per page per document** and everything downstream — every
 * click, every find, every re-render at a new zoom — reads from its output.
 * Nothing here touches the DOM, so an index can be built for a page that is not
 * mounted (or never will be), which is what makes a document-wide search across
 * a 1000-page file possible without rendering 1000 pages.
 *
 * The two non-obvious pieces:
 *
 * 1. **Item ↔ span alignment.** `PageIndex.items[i]` is deliberately the same
 *    `i` as `TextLayer.textDivs[i]`. pdf.js pushes one entry into `textDivs`
 *    for every `textContent.items` entry that carries a `str` (including empty
 *    ones) and skips marked-content markers — so mirroring that filter exactly
 *    gives an O(1) map from a text item to its rendered span, with no DOM
 *    querying at all.
 *
 * 2. **Gap-aware joining.** pdf.js splits a run of text on every style change,
 *    frequently mid-word (`"Contrac"` + `"tor"` when part of a word is bold).
 *    Blindly joining items with a space would corrupt the page text. Instead
 *    the real horizontal gap between two items is measured in PDF user space
 *    and a space is inserted only when the gap is wide enough to be a word
 *    break.
 */
import { SAME_LINE_TOLERANCE, WORD_GAP_RATIO } from '../constants';
import type {
  AnnotationField,
  IndexedTextItem,
  NormalizedChunk,
  PageIndex,
  PageLine,
  PageWord,
  PdfTextContent,
  PdfTextContentEntry,
  PdfTextItem,
} from '../types';
import { compactText, isWordStart, trimChunk } from './normalizeText';

/** The slice of {@link TextNormalizer} this builder needs. */
export interface ChunkNormalizer {
  normalizeChunk(source: string): NormalizedChunk;
}

/** A form field's raw value + box, already narrowed to what the index needs. */
export interface RawAnnotationField {
  id: string;
  /** `[x0, y0, x1, y1]` in PDF user space — same space as `PageIndex.viewBox`. */
  rect: readonly number[];
  value: string;
}

/**
 * Minimal structural shape of a pdf.js `page.getAnnotations()` entry — only
 * the widget/text-field properties this engine reads, in the same spirit as
 * the other pdf.js proxy types in `types.ts` (derived, not imported, so this
 * module carries no direct dependency on `pdfjs-dist`'s own annotation types).
 */
export interface PdfFormFieldAnnotation {
  id?: string;
  subtype?: string;
  fieldType?: string;
  fieldValue?: string | string[] | null;
  /**
   * Plain-text `/Contents` of the annotation. Populated for every annotation
   * type (base `Annotation` reads it unconditionally), but only meaningful as
   * a searchable value for markup annotations — see {@link SEARCHABLE_MARKUP_SUBTYPES}.
   */
  contents?: string | null;
  rect?: number[];
}

/** Field types that can carry a searchable text value. Buttons/signatures cannot. */
const SEARCHABLE_FIELD_TYPES = new Set(['Tx', 'Ch']);

/**
 * Markup annotation subtypes used to "fill in" a value on a PDF that has no
 * real AcroForm field for it — a free-standing text box dropped on top of the
 * page (common when a contract template's blanks were completed with an
 * annotation tool rather than a fillable form). Their value lives in
 * `contents`, not `fieldValue`.
 */
const SEARCHABLE_MARKUP_SUBTYPES = new Set(['FreeText']);

/**
 * Narrows a page's raw annotations to the text-bearing fields worth indexing
 * — the values `page.getTextContent()` never sees (see {@link AnnotationField}):
 * real AcroForm text/choice fields, and free-text markup boxes standing in
 * for one.
 */
export function extractAnnotationFields(
  rawAnnotations: readonly PdfFormFieldAnnotation[]
): RawAnnotationField[] {
  const fields: RawAnnotationField[] = [];
  rawAnnotations.forEach((annotation, index) => {
    if (!Array.isArray(annotation.rect) || annotation.rect.length !== 4) return;

    let raw: string | string[] | null | undefined;
    if (annotation.subtype === 'Widget') {
      if (!annotation.fieldType || !SEARCHABLE_FIELD_TYPES.has(annotation.fieldType)) return;
      raw = annotation.fieldValue;
    } else if (annotation.subtype && SEARCHABLE_MARKUP_SUBTYPES.has(annotation.subtype)) {
      raw = annotation.contents;
    } else {
      return;
    }

    const value = Array.isArray(raw) ? raw.filter(Boolean).join(' ') : raw;
    if (!value || !value.trim()) return;

    fields.push({
      id: annotation.id ?? `annotation-${index}`,
      rect: annotation.rect,
      value: value.trim(),
    });
  });
  return fields;
}

export interface BuildPageIndexParams {
  pageNumber: number;
  textContent: PdfTextContent;
  normalizer: ChunkNormalizer;
  /** Text-bearing form fields on this page, already extracted. */
  annotations?: readonly RawAnnotationField[];
  /** The page's `view` box; defaults to A4 when unavailable. */
  viewBox?: readonly number[];
  /** The page's intrinsic `/Rotate`. */
  rotate?: number;
}

/** Narrows a `textContent.items` entry to a real text item. */
export function isTextItem(entry: PdfTextContentEntry): entry is PdfTextContentEntry & PdfTextItem {
  return (
    typeof entry === 'object' && entry !== null && typeof (entry as PdfTextItem).str === 'string'
  );
}

const DEFAULT_VIEW_BOX: readonly number[] = [0, 0, 595.28, 841.89];

export function buildPageIndex({
  pageNumber,
  textContent,
  normalizer,
  annotations = [],
  viewBox = DEFAULT_VIEW_BOX,
  rotate = 0,
}: BuildPageIndexParams): PageIndex {
  const entries = textContent.items;
  const items: IndexedTextItem[] = [];

  let text = '';
  let cased = '';
  const itemOf: number[] = [];
  const offsetOf: number[] = [];

  /**
   * Appends one character, collapsing space runs and refusing a leading space.
   * A space that came from *inside* an item keeps that item's coordinates, so a
   * range spanning it still produces one continuous DOM selection rather than
   * two rects with a hole between the words.
   */
  const push = (ch: string, casedCh: string, divIndex: number, offset: number): void => {
    if (ch === ' ' && (text.length === 0 || text.endsWith(' '))) return;
    text += ch;
    cased += casedCh;
    itemOf.push(divIndex);
    offsetOf.push(offset);
  };

  // Geometry of the previous text-bearing item, for the gap heuristic.
  let prev: {
    endX: number;
    baselineY: number;
    fontHeight: number;
    hasEOL: boolean;
    axisAligned: boolean;
  } | null = null;

  for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
    const entry = entries[entryIndex];
    if (!isTextItem(entry)) continue; // marked-content marker — produces no span

    const transform = Array.isArray(entry.transform) ? entry.transform : [1, 0, 0, 1, 0, 0];
    const fontHeight =
      Math.hypot(transform[2] ?? 0, transform[3] ?? 0) || Math.abs(transform[3]) || 1;
    const axisAligned = Math.abs(transform[1] ?? 0) < 1e-6 && Math.abs(transform[2] ?? 0) < 1e-6;

    const item: IndexedTextItem = {
      divIndex: items.length,
      itemIndex: entryIndex,
      str: entry.str,
      dir: entry.dir ?? 'ltr',
      transform,
      width: entry.width ?? 0,
      height: entry.height ?? fontHeight,
      fontHeight,
      axisAligned,
      hasEOL: entry.hasEOL === true,
      start: text.length,
      end: text.length,
      line: -1,
    };
    items.push(item);

    const geometry = {
      endX: (transform[4] ?? 0) + (entry.width ?? 0),
      baselineY: transform[5] ?? 0,
      fontHeight,
      hasEOL: item.hasEOL,
      axisAligned,
    };

    const chunk = entry.str ? normalizer.normalizeChunk(entry.str) : null;
    if (!chunk || !chunk.text) {
      // An empty or all-punctuation item still occupies a `textDivs` slot and
      // still breaks the flow of text, so its geometry is carried forward.
      item.start = text.length;
      item.end = text.length;
      prev = geometry;
      continue;
    }

    if (needsSeparator(prev, transform, fontHeight, axisAligned, text, chunk.text)) {
      push(' ', ' ', -1, -1);
    }

    const startOffset = text.length;
    for (let k = 0; k < chunk.text.length; k++) {
      push(chunk.text[k], chunk.cased[k], item.divIndex, chunk.map[k]);
    }
    item.start = startOffset;
    item.end = text.length;
    prev = geometry;
  }

  // A trailing separator would offset every "is this the end of a word" test.
  if (text.endsWith(' ')) {
    text = text.slice(0, -1);
    cased = cased.slice(0, -1);
    itemOf.pop();
    offsetOf.pop();
    for (const item of items) {
      if (item.end > text.length) item.end = text.length;
      if (item.start > text.length) item.start = text.length;
    }
  }

  const lines = buildLines(items);
  const words = buildWords(text);
  const { compact, map: compactMap } = compactText(text);

  const compactWordStart = new Uint8Array(compact.length);
  for (let i = 0; i < compact.length; i++) {
    compactWordStart[i] = isWordStart(text, compactMap[i]) ? 1 : 0;
  }

  const annotationFields = buildAnnotationFields(annotations, normalizer);

  const weight =
    text.length * 2 + // text + cased (UTF-16, roughly)
    itemOf.length * 4 +
    offsetOf.length * 4 +
    compactMap.length * 4 +
    compact.length * 2 +
    items.length * 120 +
    words.length * 40 +
    annotationFields.length * 80;

  return {
    pageNumber,
    normalized: text,
    cased,
    compact,
    compactMap,
    compactWordStart,
    itemOf: Int32Array.from(itemOf),
    offsetOf: Int32Array.from(offsetOf),
    items,
    words,
    lines,
    annotations: annotationFields,
    viewBox,
    rotate,
    weight,
    builtAt: Date.now(),
  };
}

/** Normalises each form field's raw value the same way page text is normalised. */
function buildAnnotationFields(
  fields: readonly RawAnnotationField[],
  normalizer: ChunkNormalizer
): AnnotationField[] {
  return fields.map((field) => {
    const chunk = trimChunk(normalizer.normalizeChunk(field.value));
    return {
      id: field.id,
      rect: field.rect,
      raw: field.value,
      normalized: chunk.text,
      cased: chunk.cased,
    };
  });
}

/**
 * Decides whether a word break belongs between the previous item and this one.
 *
 * Returning `false` is what lets `"Contrac"` + `"tor"` read back as
 * `"contractor"`; returning `true` on a real gap is what stops two adjacent
 * table cells from being glued into one nonsense word.
 */
function needsSeparator(
  prev: {
    endX: number;
    baselineY: number;
    fontHeight: number;
    hasEOL: boolean;
    axisAligned: boolean;
  } | null,
  transform: readonly number[],
  fontHeight: number,
  axisAligned: boolean,
  accumulated: string,
  chunkText: string
): boolean {
  if (accumulated.length === 0) return false;
  // Whitespace on either side of the join already implies the break.
  if (accumulated.endsWith(' ') || chunkText.startsWith(' ')) return true;
  if (!prev) return true;
  if (prev.hasEOL) return true;
  // Rotated or skewed text makes the horizontal gap meaningless — assume a break.
  if (!prev.axisAligned || !axisAligned) return true;

  const scale = Math.max(prev.fontHeight, fontHeight) || 1;
  if (Math.abs(prev.baselineY - (transform[5] ?? 0)) > SAME_LINE_TOLERANCE * scale) return true;

  const gap = (transform[4] ?? 0) - prev.endX;
  return gap > WORD_GAP_RATIO * scale;
}

/**
 * Groups items into lines by baseline proximity, top of the page first.
 *
 * Lines matter for two things: widening a tiny match (a clause number) to
 * something visible, and merging measured rectangles into one continuous bar
 * per line rather than one per style run.
 */
function buildLines(items: IndexedTextItem[]): PageLine[] {
  const withText = items.filter((item) => item.end > item.start);
  if (withText.length === 0) return [];

  const heights = withText.map((item) => item.fontHeight).sort((a, b) => a - b);
  const medianHeight = heights[heights.length >> 1] || 1;

  // Descending baseline Y — PDF user space grows upwards, so this is reading
  // order. Deliberately a *pure* baseline sort, with no x-tiebreak folded in:
  // whether two items share a line is a fuzzy, pairwise decision (the next
  // loop makes it), and Array.sort requires a comparator that is consistent
  // across every pair, not just adjacent ones. Mixing an x-tiebreak into the
  // comparator itself made it non-transitive — on a page with many short,
  // similarly-spaced rows (a clause table), that can scramble `lines[]` out
  // of visual order, and `expandRangeToLines` (which walks `lines[]` by
  // array index between the first and last line a match touches) then widens
  // a single clause's highlight across every row in between.
  const ordered = [...withText].sort((a, b) => (b.transform[5] ?? 0) - (a.transform[5] ?? 0));

  const lines: PageLine[] = [];
  for (const item of ordered) {
    const baselineY = item.transform[5] ?? 0;
    const current = lines[lines.length - 1];
    if (current && Math.abs(current.baselineY - baselineY) <= SAME_LINE_TOLERANCE * medianHeight) {
      current.itemIndices.push(item.divIndex);
      current.start = Math.min(current.start, item.start);
      current.end = Math.max(current.end, item.end);
      item.line = current.index;
      continue;
    }
    const line: PageLine = {
      index: lines.length,
      baselineY,
      itemIndices: [item.divIndex],
      start: item.start,
      end: item.end,
    };
    lines.push(line);
    item.line = line.index;
  }

  return lines;
}

/** Tokenises the normalised page text, remembering each token's char offsets. */
function buildWords(text: string): PageWord[] {
  const words: PageWord[] = [];
  let start = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text.charCodeAt(i) === 32) {
      if (i > start) words.push({ text: text.slice(start, i), start, end: i });
      start = i + 1;
    }
  }
  return words;
}
