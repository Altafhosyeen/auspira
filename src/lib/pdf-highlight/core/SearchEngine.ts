/**
 * Orchestrates matching across pages.
 *
 * The engine has two entry points because the two jobs have opposite shapes:
 *
 * - {@link SearchEngine.locate} — "the user clicked a JSON value that cites
 *   page 4". One page is almost certainly the answer, so it is searched first
 *   and the work stops there. Typical cost: one `getTextContent()` on the first
 *   click, zero on every click after that.
 *
 * - {@link SearchEngine.searchDocument} — "find every occurrence of this term".
 *   Streams through the document in cancellable chunks, yielding to the browser
 *   between them, and reports results progressively so the UI can show hits on
 *   page 3 while page 800 is still being read.
 */
import {
  ANNOTATION_FULL_SCORE,
  ANNOTATION_PARTIAL_SCORE,
  FRAGMENT_STRATEGIES,
  MIN_ANNOTATION_MATCH_LENGTH,
  NEIGHBOUR_PAGE_RADIUS,
  SEARCH_CHUNK_SIZE,
} from '../constants';
import type { PageIndex, PageMatch, PreparedQuery, RawMatch, SearchOptions } from '../types';
import { prepareQuery, searchPage } from '../utils/searchText';
import type { PDFSearchIndex } from './PDFSearchIndex';
import type { TextNormalizer } from './TextNormalizer';

export interface LocateOptions extends SearchOptions {
  /** The page the data claims the value is on. */
  page?: number | null;
  /**
   * Which occurrence to return when the value appears several times on the
   * winning page. Wraps around, so repeated clicks can walk the duplicates.
   */
  occurrence?: number;
  /** Search neighbouring pages when the cited page has no match. Default `true`. */
  searchNeighbours?: boolean;
  /** Fall back to a document-wide sweep. Default `true`. */
  searchDocument?: boolean;
  signal?: AbortSignal;
}

export interface DocumentSearchOptions extends SearchOptions {
  signal?: AbortSignal;
  /** Called after each chunk with everything found so far. */
  onProgress?: (matches: PageMatch[], scanned: number, total: number) => void;
  /** Stop early once this many matches exist. */
  maxMatches?: number;
  /** Page to start from, so a search can begin at the current view. */
  startPage?: number;
}

export class SearchEngine {
  constructor(
    private readonly index: PDFSearchIndex,
    private readonly normalizer: TextNormalizer = index.normalizer
  ) {}

  /** Normalises a query once, for reuse across every page of a search. */
  prepare(query: string, options: SearchOptions = {}): PreparedQuery {
    return prepareQuery(query, this.normalizer, options);
  }

  /** Every match on one page, ranked. */
  async searchPage(
    pageNumber: number,
    query: PreparedQuery,
    options: SearchOptions = {}
  ): Promise<PageMatch[]> {
    const pageIndex = await this.index.getPage(pageNumber);
    return this.searchPageIndex(pageIndex, query, options);
  }

  /** Synchronous variant for a page whose index is already cached. */
  searchPageIndex(
    pageIndex: PageIndex,
    query: PreparedQuery,
    options: SearchOptions = {}
  ): PageMatch[] {
    const textMatches = searchPage(pageIndex, query, options).map((match, occurrence) =>
      toPageMatch(pageIndex, match, occurrence)
    );

    // The page's form-field values are the text `page.getTextContent()` never
    // sees. A value that lives only in a fillable box (a date, an amount, an
    // email) never appears in `pageIndex.normalized`, so no content-stream
    // tier could ever have found it.
    const fieldMatches = this.searchAnnotationFields(pageIndex, query);
    if (fieldMatches.length === 0) return textMatches;
    if (textMatches.length === 0) return fieldMatches;

    // Both found something. A full-query text match (compact and above) is
    // glyph-precise, so it keeps priority over a field's whole-box highlight.
    // But a fragment-tier match only ever covers *part* of the value — it
    // must not pre-empt a field that carries the entire query, or a citation
    // whose value sits in a form field gets a sliver of coincidental body
    // text highlighted instead of the field itself.
    if (!FRAGMENT_STRATEGIES.has(textMatches[0].strategy)) return textMatches;
    const fullFields = fieldMatches.filter((match) => match.score >= ANNOTATION_FULL_SCORE);
    if (fullFields.length === 0) return textMatches;
    return [...fullFields, ...textMatches];
  }

  /**
   * Matches against the page's form-field values (see {@link AnnotationField}).
   * Deliberately simple — a plain normalised containment check either
   * direction, since field values are short and exact, unlike the free-form
   * prose the content-stream tiers are tuned for. Scored so that a field
   * carrying the whole query outranks one that is only a piece of it, and so
   * `searchPageIndex` can rank fields against fragment-tier text matches.
   */
  private searchAnnotationFields(pageIndex: PageIndex, query: PreparedQuery): PageMatch[] {
    if (!query.normalized || pageIndex.annotations.length === 0) return [];
    const needle = query.normalized;

    if (process.env.NODE_ENV !== 'production') {
      // Temporary diagnostic for the form-field indexing rollout.
      console.debug(
        `[pdf-highlight] annotation fields on page ${pageIndex.pageNumber}, query "${needle}" against`,
        pageIndex.annotations.map((f) => f.normalized)
      );
    }

    const matches: PageMatch[] = [];
    pageIndex.annotations.forEach((field, occurrence) => {
      if (!field.normalized) return;
      // Guards against a stray short field value (a lone digit, a checkbox
      // "X") matching an unrelated short query by pure containment.
      if (Math.min(field.normalized.length, needle.length) < MIN_ANNOTATION_MATCH_LENGTH) return;
      const carriesWholeQuery =
        field.normalized === needle || field.normalized.includes(needle);
      if (!carriesWholeQuery && !needle.includes(field.normalized)) return;

      matches.push({
        start: -1,
        end: -1,
        ranges: [],
        score:
          (carriesWholeQuery ? ANNOTATION_FULL_SCORE : ANNOTATION_PARTIAL_SCORE) +
          Math.min(field.normalized.length, needle.length),
        strategy: 'annotation',
        expandToLine: false,
        pageNumber: pageIndex.pageNumber,
        occurrence,
        text: field.raw,
        annotationId: field.id,
      });
    });
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Resolves a cited value to a concrete match.
   *
   * The widening search is deliberate: extracted page numbers are usually right
   * but occasionally off by one where a document's printed numbering differs
   * from its physical order, and a citation that silently highlights nothing is
   * worse than one that highlights the right text one page over.
   */
  async locate(value: string, options: LocateOptions = {}): Promise<PageMatch | null> {
    const query = this.prepare(value, options);
    if (!query.normalized) return null;

    const {
      page = null,
      occurrence = 0,
      searchNeighbours = true,
      searchDocument = true,
      signal,
    } = options;

    const pick = (matches: PageMatch[]): PageMatch | null => {
      if (matches.length === 0) return null;
      const wrapped = ((occurrence % matches.length) + matches.length) % matches.length;
      return matches[wrapped];
    };

    if (page && page >= 1 && page <= this.index.numPages) {
      const onPage = await this.searchPage(page, query, options);
      throwIfAborted(signal);
      const hit = pick(onPage);
      if (hit) return hit;
    }

    if (searchNeighbours && page) {
      for (let radius = 1; radius <= NEIGHBOUR_PAGE_RADIUS; radius++) {
        for (const candidate of [page - radius, page + radius]) {
          if (candidate < 1 || candidate > this.index.numPages) continue;
          const matches = await this.searchPage(candidate, query, options);
          throwIfAborted(signal);
          const hit = pick(matches);
          if (hit) return hit;
        }
      }
    }

    if (searchDocument) {
      const matches = await this.searchDocument(query, {
        ...options,
        signal,
        maxMatches: 1,
        startPage: page ?? 1,
      });
      return matches[0] ?? null;
    }

    return null;
  }

  /**
   * Sweeps the document, chunked and cancellable.
   *
   * Results are ordered by page so "next match" walks the document top to
   * bottom, matching what a reader expects from Ctrl+F, rather than by score.
   */
  async searchDocument(
    query: PreparedQuery,
    options: DocumentSearchOptions = {}
  ): Promise<PageMatch[]> {
    const { signal, onProgress, maxMatches = Infinity, startPage = 1 } = options;
    const total = this.index.numPages;
    if (!query.normalized || total === 0) return [];

    const order = pageSweepOrder(total, startPage);
    const found: PageMatch[] = [];

    for (let cursor = 0; cursor < order.length; cursor += SEARCH_CHUNK_SIZE) {
      throwIfAborted(signal);
      const chunk = order.slice(cursor, cursor + SEARCH_CHUNK_SIZE);

      for (const pageNumber of chunk) {
        try {
          const pageIndex = await this.index.getPage(pageNumber);
          throwIfAborted(signal);
          found.push(...this.searchPageIndex(pageIndex, query, options));
        } catch (error) {
          if (isAbortError(error)) throw error;
          // An unreadable page must not sink the whole search.
        }
      }

      found.sort((a, b) => a.pageNumber - b.pageNumber || a.start - b.start);
      onProgress?.([...found], Math.min(cursor + chunk.length, order.length), total);
      if (found.length >= maxMatches) break;

      // Hand the main thread back so scrolling and typing stay responsive.
      await yieldToMain();
    }

    return found.sort((a, b) => a.pageNumber - b.pageNumber || a.start - b.start);
  }
}

function toPageMatch(pageIndex: PageIndex, match: RawMatch, occurrence: number): PageMatch {
  return {
    ...match,
    pageNumber: pageIndex.pageNumber,
    occurrence,
    text: pageIndex.normalized.slice(match.start, match.end),
  };
}

/**
 * Sweep order: from `startPage` to the end, then wrap to the beginning. A user
 * searching from page 400 sees the next hit below them first.
 */
function pageSweepOrder(total: number, startPage: number): number[] {
  const start = Math.min(Math.max(1, startPage), total);
  const order: number[] = [];
  for (let page = start; page <= total; page++) order.push(page);
  for (let page = 1; page < start; page++) order.push(page);
  return order;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    // A macrotask, not a microtask — a microtask would not let the browser paint.
    window.setTimeout(resolve, 0);
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw signal.reason instanceof Error
      ? signal.reason
      : new DOMException('Search aborted', 'AbortError');
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
