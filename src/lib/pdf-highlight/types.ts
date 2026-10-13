/**
 * Public type surface of the PDF highlight engine.
 *
 * Everything here is type-only, so this module is erased at build time and the
 * engine core carries **no runtime dependency on React or react-pdf**. The
 * pdf.js proxy types are derived structurally from `react-pdf`'s re-exported
 * `pdfjs` namespace rather than imported from `pdfjs-dist` — react-pdf is the
 * direct dependency, and deriving keeps us pinned to whatever pdf.js version it
 * ships without a second version to keep in sync.
 */
import type { pdfjs } from 'react-pdf';

// ─── pdf.js proxy types (derived, not imported) ────────────────────────────

export type PdfDocumentProxy = Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>;
export type PdfPageProxy = Awaited<ReturnType<PdfDocumentProxy['getPage']>>;
export type PdfTextContent = Awaited<ReturnType<PdfPageProxy['getTextContent']>>;
export type PdfTextContentEntry = PdfTextContent['items'][number];
export type PdfPageViewport = ReturnType<PdfPageProxy['getViewport']>;

/**
 * The shape of a pdf.js `TextItem`. `textContent.items` is a union of text
 * items and marked-content markers; only the former carry `str`.
 */
export interface PdfTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

// ─── Normalisation ─────────────────────────────────────────────────────────

export interface NormalizerOptions {
  /**
   * Fold compatibility forms and diacritics: `ﬁ → fi`, `é → e`, `²  → 2`.
   * Default `true`.
   */
  foldUnicode?: boolean;
  /** Emit the primary text stream lowercased. Default `true`. */
  lowercase?: boolean;
  /**
   * Replace runs of punctuation with a single space, so `"walls,"` and
   * `"walls"` compare equal. Default `true`.
   */
  stripPunctuation?: boolean;
  /**
   * Punctuation kept verbatim despite `stripPunctuation`. `%` is kept by
   * default: a bare `0` is indistinguishable from a page number, but `0%` is a
   * specific value worth matching. Default `'%'`.
   */
  keepSymbols?: string;
}

export interface ResolvedNormalizerOptions extends Required<NormalizerOptions> {
  /** `keepSymbols` exploded into a set for O(1) membership tests. */
  keepSet: ReadonlySet<string>;
}

/**
 * A normalised string plus the index mapping needed to project a match back
 * onto the original characters.
 */
export interface NormalizedChunk {
  /** Normalised text (lowercased when `lowercase` is enabled). */
  text: string;
  /** Same length as `text`, with the original letter case preserved. */
  cased: string;
  /** `map[i]` is the UTF-16 index in the source string that produced `text[i]`. */
  map: Int32Array;
}

// ─── Page index ────────────────────────────────────────────────────────────

/** A half-open character range `[start, end)` in a page's normalised text. */
export interface CharRange {
  start: number;
  end: number;
}

/**
 * One pdf.js text item, enriched with the geometry and offsets the engine
 * needs. The array position of an item inside {@link PageIndex.items} is
 * deliberately identical to its position in `TextLayer.textDivs`, which is what
 * lets a character range be mapped onto a real DOM span in O(1).
 */
export interface IndexedTextItem {
  /** Index into `PageIndex.items` — equals the index into `TextLayer.textDivs`. */
  divIndex: number;
  /** Index into the original `textContent.items` array. */
  itemIndex: number;
  /** The item's raw, unnormalised string. */
  str: string;
  /** Text direction reported by pdf.js (`ltr` / `rtl` / `ttb`). */
  dir: string;
  /** pdf.js transform `[a, b, c, d, e, f]` — `(e, f)` is the glyph baseline. */
  transform: readonly number[];
  /** Item width in PDF user space. */
  width: number;
  /** Item height in PDF user space. */
  height: number;
  /** Rendered font height in PDF user space (`hypot(c, d)`). */
  fontHeight: number;
  /** `true` when the item has no rotation/skew, so gap heuristics are valid. */
  axisAligned: boolean;
  /** pdf.js line-break flag. */
  hasEOL: boolean;
  /** Start offset of this item's characters in the page's normalised text. */
  start: number;
  /** End offset (exclusive). `start === end` means the item contributed nothing. */
  end: number;
  /** Index into {@link PageIndex.lines}, or `-1` when the item has no text. */
  line: number;
}

/** A group of text items sharing a baseline, in top-to-bottom reading order. */
export interface PageLine {
  index: number;
  /** Baseline Y in PDF user space (larger is higher up the page). */
  baselineY: number;
  /** `divIndex` of every item on this line. */
  itemIndices: number[];
  /** Char range spanned by the line in the page's normalised text. */
  start: number;
  end: number;
}

/** A whitespace-delimited token of the normalised page text. */
export interface PageWord {
  text: string;
  start: number;
  end: number;
}

/**
 * A text-bearing form-field (AcroForm widget) value, indexed separately from
 * the page's content-stream text.
 *
 * `page.getTextContent()` never includes what a user (or the document author)
 * typed into a fillable field — that value lives in the annotation, not the
 * content stream, and is rendered onto the canvas as part of the page's normal
 * paint rather than as selectable text. A citation whose value lives in one of
 * these boxes therefore cannot be found by any tier of the text ladder, no
 * matter how fuzzy — which is why it gets its own field and its own fallback
 * match path (see `SearchEngine.searchAnnotationFields`) instead of being
 * folded into `PageIndex.normalized`.
 */
export interface AnnotationField {
  /** Stable per-page id (the annotation's own id, or a positional fallback). */
  id: string;
  /** The field's box in PDF user space `[x0, y0, x1, y1]` — the same space as `viewBox`. */
  rect: readonly number[];
  /** The field's raw value, trimmed. */
  raw: string;
  /** Normalised (folded, lowercased) value, comparable with a prepared query. */
  normalized: string;
  /** Case-preserved parallel of `normalized`. */
  cased: string;
}

/**
 * The immutable, cacheable search index for a single page. Built once per page
 * per document and reused for every subsequent click, search, and re-render.
 */
export interface PageIndex {
  pageNumber: number;
  /** Full page text, normalised and single-spaced, in reading order. */
  normalized: string;
  /** Character-for-character parallel of `normalized` with case preserved. */
  cased: string;
  /** `normalized` with every space removed — the split-tolerant haystack. */
  compact: string;
  /** `compactMap[i]` is the index in `normalized` of `compact[i]`. */
  compactMap: Int32Array;
  /** `1` when `compact[i]` begins a word in `normalized`, else `0`. */
  compactWordStart: Uint8Array;
  /** `itemOf[i]` is the `divIndex` that produced `normalized[i]`, or `-1`. */
  itemOf: Int32Array;
  /** `offsetOf[i]` is the offset inside that item's `str`, or `-1`. */
  offsetOf: Int32Array;
  items: IndexedTextItem[];
  words: PageWord[];
  lines: PageLine[];
  /** Text-bearing form-field values on this page — see {@link AnnotationField}. */
  annotations: readonly AnnotationField[];
  /** The page's `view` box `[x0, y0, x1, y1]` in PDF user space. */
  viewBox: readonly number[];
  /** The page's intrinsic `/Rotate` value. */
  rotate: number;
  /** Approximate retained size in bytes, used by the cache's eviction policy. */
  weight: number;
  builtAt: number;
}

// ─── Search ────────────────────────────────────────────────────────────────

/**
 * How a match was found, in descending order of confidence. Used both for
 * ranking and for deciding whether to widen a highlight to its whole line.
 */
export type MatchStrategy =
  | 'short-code'
  | 'clause'
  | 'bounded'
  | 'exact'
  | 'compact'
  | 'code-list'
  | 'fuzzy'
  | 'token'
  | 'annotation';

export interface RawMatch extends CharRange {
  /**
   * The pieces to actually light up. Usually one range; several when the value
   * is scattered across the page and only its fragments are present, so the
   * highlight follows the real text instead of swallowing everything between
   * the first and last fragment. Empty when `annotationId` is set — a form
   * field has no character range, only its own box.
   */
  ranges: CharRange[];
  score: number;
  strategy: MatchStrategy;
  /** Widen the highlight to the full line(s) — set for targets too small to see. */
  expandToLine: boolean;
  /**
   * `true` when the runner-up scored within `AMBIGUITY_SCORE_EPSILON` of this
   * match — none of the disambiguation signals (context, line, neighbouring
   * tokens, geometry) could confidently tell the two occurrences apart. Set
   * once, after every candidate on the page has been scored and sorted; unset
   * (`undefined`) on a match that hasn't gone through that ranking pass.
   */
  ambiguous?: boolean;
  /**
   * Set when this match is a form-field value rather than content-stream text
   * — the id of the {@link AnnotationField} it came from. `start`/`end`/`ranges`
   * are meaningless in this case; the highlight is measured from the field's
   * own box instead (see `HighlightRenderer.measure`).
   */
  annotationId?: string;
}

export interface PageMatch extends RawMatch {
  pageNumber: number;
  /** 0-based position of this match among the matches on its own page. */
  occurrence: number;
  /** The matched text, read back from the page's normalised stream. */
  text: string;
}

export interface SearchOptions {
  /** Restrict which strategies may run. Defaults to all, tried in order. */
  strategies?: readonly MatchStrategy[];
  /** Maximum matches to return per page. Default `50`. */
  limit?: number;
  /**
   * Other values from the same record (e.g. sibling JSON fields). Matches that
   * sit near one of these on the page are ranked higher, which is what
   * disambiguates a value that occurs several times.
   */
  contextHints?: readonly string[];
  /** Treat the query as a literal find-in-document term (skips fuzzy tiers). */
  literal?: boolean;
}

export interface PreparedQuery {
  raw: string;
  normalized: string;
  cased: string;
  compact: string;
  words: string[];
  /** A short ALL-CAPS code such as an NEC option letter — matched case-sensitively. */
  isShortCode: boolean;
  /** A clause reference such as `Z62.2` — matched with optional separators. */
  isClauseNumber: boolean;
  clausePattern: RegExp | null;
  /**
   * A space-separated list of NEC-style codes (`X2 X7 X11 X15 X16 X18`) rather
   * than a phrase — every word looks like its own identifier. Such a list
   * almost never appears on the page as one contiguous run (each code sits in
   * its own table cell/row), so it gets its own tier instead of relying on the
   * phrase-shaped tiers above it or the single-arbitrary-word `token` fallback.
   */
  isCodeList: boolean;
  literal: boolean;
  contextHints: string[];
}

// ─── Geometry & highlights ─────────────────────────────────────────────────

/**
 * A rectangle expressed as fractions (0–1) of the rendered page box.
 *
 * Fractions are the reason a highlight survives zoom for free: the page element
 * scales uniformly, so the same percentages stay pixel-correct at any scale and
 * nothing has to be re-measured.
 */
export interface NormalizedRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HighlightInput {
  pageNumber: number;
  /** Logical bucket. Replacing a group is how the previous highlight is removed. */
  group?: string;
  /** Character ranges to measure lazily against the page's text layer. */
  ranges?: CharRange[] | null;
  /** Pre-measured rectangles — used for user-drawn highlights. */
  rects?: NormalizedRect[];
  color?: string;
  activeColor?: string;
  label?: string;
  strategy?: MatchStrategy;
  expandToLine?: boolean;
  /**
   * Set when this highlight is a form-field value — the id of the page's
   * {@link AnnotationField} to measure against, in place of `ranges`.
   */
  annotationId?: string;
  /** Stable id. Generated when omitted. */
  id?: string;
}

export interface Highlight extends Required<Omit<HighlightInput, 'rects' | 'ranges' | 'id'>> {
  id: string;
  ranges: CharRange[] | null;
  rects?: NormalizedRect[];
  createdAt: number;
}

export interface HighlightState {
  highlights: readonly Highlight[];
  activeId: string | null;
  /** Bumped on every mutation — lets consumers cheaply detect a change. */
  version: number;
}

// ─── DOM handles ───────────────────────────────────────────────────────────

/**
 * Everything the engine needs to know about one mounted page in order to
 * measure a character range against it. Registered by the page component and
 * dropped when the page is virtualised away.
 */
export interface PageDomHandle {
  pageNumber: number;
  /** The element whose box defines the page's coordinate space (the canvas footprint). */
  pageElement: HTMLElement;
  /** The pdf.js text-layer container. */
  textLayerElement: HTMLElement | null;
  /** `TextLayer.textDivs` — index-aligned with `PageIndex.items`. */
  textDivs: HTMLElement[] | null;
  /** Current viewport, used by the geometry fallback when no text layer exists. */
  viewport: PdfPageViewport | null;
  /** Applied rotation in degrees; part of the measurement cache key. */
  rotation: number;
  /** Bumped whenever the text layer is rebuilt, invalidating DOM lookups. */
  renderKey: number;
}

// ─── Navigation ────────────────────────────────────────────────────────────

export type ScrollAlignment = 'start' | 'center' | 'reading';

export interface ScrollOptions {
  behavior?: ScrollBehavior;
  /**
   * `reading` places the target ~30% down the viewport — comfortable to read
   * and leaves the surrounding context visible. Default `reading`.
   */
  align?: ScrollAlignment;
  /** Extra pixels of padding above the target. Default `8`. */
  offset?: number;
}
