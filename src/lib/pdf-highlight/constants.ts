/**
 * Every tunable in the highlight engine, in one place.
 *
 * These are deliberately not options on a dozen different call sites: they are
 * behavioural constants that were arrived at against real contract PDFs, and
 * keeping them together makes them reviewable as a set.
 */
import type { MatchStrategy } from './types';

// ─── Index cache ───────────────────────────────────────────────────────────

/**
 * How many page indexes stay resident. A dense A4 page costs roughly 30–60 KB
 * of index, so 250 pages caps the cache near 15 MB — enough that scrolling a
 * 1000-page document never re-indexes the same page twice in a session, while
 * staying far below anything that would pressure a browser tab.
 */
export const MAX_CACHED_PAGE_INDEXES = 250;

/** Pages indexed per idle slice during a background sweep. */
export const BACKGROUND_INDEX_BATCH = 4;

/** Milliseconds of an idle callback the background indexer will consume. */
export const BACKGROUND_INDEX_BUDGET_MS = 12;

// ─── Index construction ────────────────────────────────────────────────────

/**
 * Two items are on the same line when their baselines differ by less than this
 * multiple of the larger font height.
 */
export const SAME_LINE_TOLERANCE = 0.35;

/**
 * Horizontal gap (as a multiple of font height) above which a word break is
 * inserted between two adjacent items. pdf.js splits items on every style
 * change, frequently mid-word — measuring the real gap instead of blindly
 * joining with a space is what keeps `normalized` readable.
 */
export const WORD_GAP_RATIO = 0.2;

// ─── Matching ──────────────────────────────────────────────────────────────

/** A short ALL-CAPS letter code, e.g. an NEC main/secondary option letter. */
export const SHORT_CODE_PATTERN = /^[A-Z]{1,3}$/;

/** A clause reference: a letter run followed by digit groups (`Z62.2` → `z62 2`). */
export const CLAUSE_NUMBER_PATTERN = /^[a-z]+(?: ?\d+)+$/;

/**
 * One NEC-style option/clause code: one or two letters then digits, with an
 * optional sub-clause suffix (`x2`, `w2`, `x16`, `z3.1`). Used to detect a
 * *list* of such codes (`X2 X7 X11 X15 X16 X18`) — a citation shape that is
 * structurally different from a phrase, since the codes are printed as
 * separate table cells rather than adjacent words.
 */
export const CODE_TOKEN_PATTERN = /^[a-z]{1,2}\d{1,3}(?:\.\d+)?$/;

/** A code-list query must have at least this many words, each matching
 *  {@link CODE_TOKEN_PATTERN}, to use the `code-list` tier. */
export const MIN_CODE_LIST_WORDS = 2;

/**
 * Shortest substring considered distinctive enough to highlight alone. A
 * letters-only run is precise even at three characters because it must land on
 * a word boundary; anything containing a digit needs four, since a bare number
 * recurs across a page as page numbers, years, and clause references.
 */
export const MIN_DISTINCTIVE_LENGTH = 4;
export const MIN_DISTINCTIVE_ALPHA_LENGTH = 3;

/** Below this length an unbounded substring match is too noisy to trust. */
export const MIN_UNBOUNDED_LENGTH = 5;

/** Below this length a space-insensitive (compact) match is too noisy to trust. */
export const MIN_COMPACT_LENGTH = 6;

/**
 * Below this length, a form-field value and the query it's compared against
 * (whichever is shorter) are too short for plain containment to trust — a
 * lone digit or a checkbox "X" would match almost anything.
 */
export const MIN_ANNOTATION_MATCH_LENGTH = 3;

/** Extra page words tolerated between two consecutive needle words. */
export const MAX_PAGE_GAP = 2;

/** Consecutive needle words the page may lack before an alignment is cut off. */
export const MAX_NEEDLE_MISS = 2;

/** A fuzzy alignment must cover this fraction of the needle to be accepted. */
export const MIN_FUZZY_COVERAGE = 0.5;

/** Hard ceiling on matches returned for a single page. */
export const DEFAULT_MATCH_LIMIT = 50;

/**
 * Base score per strategy. Ranking is `tier + matched characters + context
 * bonus`, so a weaker strategy can never outrank a stronger one no matter how
 * long its match is.
 */
export const STRATEGY_TIER: Record<MatchStrategy, number> = {
  'short-code': 7_000_000,
  clause: 6_000_000,
  bounded: 5_000_000,
  exact: 4_000_000,
  compact: 3_000_000,
  'code-list': 2_500_000,
  fuzzy: 2_000_000,
  token: 1_000_000,
  // Scored separately — see ANNOTATION_FULL_SCORE / ANNOTATION_PARTIAL_SCORE
  // and SearchEngine.searchPageIndex, which ranks field matches against the
  // content-stream tiers by rule rather than through this table. This entry
  // exists purely so `Record<MatchStrategy, number>` stays exhaustive.
  annotation: 500_000,
};

/**
 * Tiers whose matches only ever cover *fragments* of the query — fuzzy peels
 * off the longest runs it can find, token lands on a single word. A form
 * field that carries the whole query is a more complete answer than either,
 * which is what `SearchEngine.searchPageIndex` uses this set to decide.
 */
export const FRAGMENT_STRATEGIES: ReadonlySet<MatchStrategy> = new Set(['fuzzy', 'token']);

/**
 * Score base for a form-field match whose value carries the entire query
 * (equal, or query-within-field). Deliberately below `compact` — a full-query
 * text match is glyph-precise and should keep priority over a field's whole
 * box — but ranked ahead of fragment-tier text matches by rule in
 * `SearchEngine.searchPageIndex`.
 */
export const ANNOTATION_FULL_SCORE = 2_500_000;

/** Score base when the field's value is only *part* of the query. */
export const ANNOTATION_PARTIAL_SCORE = 800_000;

/** Order in which strategies are attempted. The first to produce hits wins. */
export const STRATEGY_ORDER: readonly MatchStrategy[] = [
  'short-code',
  'clause',
  'bounded',
  'exact',
  'compact',
  'code-list',
  'fuzzy',
  'token',
];

/**
 * Strategies allowed for a literal find-in-document query: verbatim first,
 * then space-insensitive — the same rescue a non-literal query gets from its
 * `compact` rung, applied to Ctrl+F too. A literal query is still the user's
 * exact words; what it must tolerate is pdf.js occasionally gluing two of the
 * page's own words together with no measurable gap (tight kerning, narrow
 * form-field boxes), which has nothing to do with what the user typed.
 */
export const LITERAL_STRATEGY_ORDER: readonly MatchStrategy[] = ['exact', 'compact'];

/**
 * A short code and a clause number are exact identifiers, so they get a ladder
 * of exactly one rung.
 *
 * Falling through to a looser tier is actively harmful here: `Z44.4` would
 * match as a prefix of `Z44.44` — a *different clause* — and the option letter
 * `A` would match the article "a" in the first sentence of body text.
 * Highlighting nothing is the correct answer when the identifier is not on the
 * page, because the near-miss is never the thing the user asked for.
 */
export const SHORT_CODE_STRATEGY_ORDER: readonly MatchStrategy[] = ['short-code'];
export const CLAUSE_STRATEGY_ORDER: readonly MatchStrategy[] = ['clause'];

// ─── Occurrence disambiguation ─────────────────────────────────────────────
//
// When a value appears on a page more than once, `searchPage` breaks the tie
// with four independent signals, each capped well under the ~1,000,000 gap
// between strategy tiers so none of them can ever outrank a stronger match —
// they only ever decide *which occurrence of an equally-good match* is right:
//
// - context   proximity, in characters, to every sibling field's own value,
//             summed across all of them rather than just the nearest one.
// - line      proximity in the page's baseline-clustered `PageLine` index — a
//             cheap, coarse "same row" signal.
// - neighbour vocabulary overlap between the words immediately surrounding a
//             candidate and the words of the sibling values themselves.
// - geometry  proximity in actual x/y page coordinates, read straight from
//             pdf.js's text-item transforms. This is the one signal that
//             stays reliable when a PDF's text serialization order doesn't
//             match its visual layout (rotated scans, multi-column text,
//             table cells that stream out of visual row order) — it never
//             relies on character offsets or the line index, so it holds up
//             even where those two are misled.

/** Hint occurrences collected per hint, capped so a hint that repeats a lot
 *  (a column header, a common word) can't make disambiguation expensive. */
export const MAX_HINT_OCCURRENCES = 20;

/**
 * Per-hint ceiling for the character-proximity contribution. Scores sum
 * across every hint instead of taking the single closest one, so this is
 * deliberately smaller than a single-hint ceiling would be.
 */
export const MAX_CONTEXT_BONUS_PER_HINT = 60_000;

/** Character distance at which a context hint's bonus has decayed by half. */
export const CONTEXT_DECAY_CHARS = 400;

/** Bonus for sharing the exact `PageLine` index with a hint occurrence. */
export const SAME_LINE_BONUS = 120_000;
/** Lines away from a hint that still earn a shrinking bonus. */
export const NEAR_LINE_RADIUS = 3;
export const NEAR_LINE_BONUS = 40_000;

/** Words examined on each side of a candidate for vocabulary overlap. */
export const NEIGHBOR_WINDOW_WORDS = 6;
export const MAX_NEIGHBOR_BONUS = 50_000;

/**
 * Row alignment: bonus for sharing a hint's y-coordinate (as a fraction of
 * page height), independent of the `PageLine` index above — so it still
 * works if a page's baseline clustering is thrown off by rotation or scan
 * skew. This is the strongest "same table row" signal available, because it
 * never depends on where the cells happen to fall in the text stream.
 */
export const MAX_ROW_ALIGNMENT_BONUS = 150_000;
export const ROW_ALIGNMENT_DECAY = 0.01;

/** General x/y proximity, as a fraction of the page diagonal — catches a
 *  label sitting beside or above its value even when they are not row-aligned. */
export const MAX_GEOMETRY_PROXIMITY_BONUS = 60_000;
export const GEOMETRY_PROXIMITY_DECAY = 0.15;

/**
 * Hard ceiling on the combined disambiguation bonus (context + line +
 * neighbour + geometry, summed across every hint). Without this, a record
 * with many corroborating sibling fields could in theory push the combined
 * bonus past the 1,000,000 gap between strategy tiers — this keeps the
 * "a weaker strategy can never outrank a stronger match" invariant safe
 * regardless of how many hints are supplied.
 */
export const MAX_TOTAL_DISAMBIGUATION_BONUS = 900_000;

/** Top two candidates scoring within this gap are flagged `ambiguous` — none
 *  of the signals above actually told them apart. */
export const AMBIGUITY_SCORE_EPSILON = 15_000;

// ─── Search scope ──────────────────────────────────────────────────────────

/**
 * Pages either side of the cited page searched before falling back to a
 * document-wide sweep. Extracted page numbers are occasionally off by one
 * where a document's printed numbering differs from its physical page order.
 */
export const NEIGHBOUR_PAGE_RADIUS = 2;

/** Pages scanned per chunk during a document-wide search before yielding. */
export const SEARCH_CHUNK_SIZE = 8;

// ─── Rendering ─────────────────────────────────────────────────────────────

/** Fraction of a rect's height by which two rects must overlap to share a line. */
export const LINE_MERGE_OVERLAP = 0.5;

/** Horizontal gap (as a fraction of page width) bridged when merging rects. */
export const RECT_MERGE_GAP = 0.004;

/** Vertical padding added to each highlight, as a fraction of its own height. */
export const RECT_VERTICAL_PADDING = 0.18;

/** Rects thinner/shorter than this fraction of the page are measurement noise. */
export const MIN_RECT_SIZE = 0.0004;

/** Measured-rect cache capacity, keyed by highlight + rotation. */
export const MAX_CACHED_MEASUREMENTS = 600;

export const DEFAULT_HIGHLIGHT_COLOR = 'rgba(255, 213, 0, 0.45)';
export const DEFAULT_ACTIVE_COLOR = 'rgba(255, 140, 0, 0.55)';

// ─── Navigation ────────────────────────────────────────────────────────────

/** Where a `reading`-aligned target is placed, as a fraction of viewport height. */
export const READING_ALIGN_RATIO = 0.3;

/** How long navigation waits for a virtualised target page to be laid out. */
export const NAVIGATION_SETTLE_TIMEOUT_MS = 1500;

/**
 * Distance (in viewport heights) beyond which a jump is instant rather than
 * smooth. Smooth-scrolling across 900 pages is a long, useless animation.
 */
export const SMOOTH_SCROLL_MAX_DISTANCE = 3;
