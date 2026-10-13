/**
 * The document-wide index cache.
 *
 * One instance exists per open PDF, owned by a React provider so it **outlives
 * page mount/unmount**. That is the single most important property here: with
 * virtualisation a page is torn down the moment it scrolls out of view, and
 * without a cache that survives it, every click would re-run
 * `page.getTextContent()` and rebuild the index from scratch — which is exactly
 * the "search the DOM on every click" cost this engine exists to remove.
 *
 * Three behaviours make it safe on a 1000-page file:
 *
 * - **LRU eviction** keeps memory bounded no matter how far the user scrolls.
 * - **Pinning** protects the pages currently on screen from being evicted by a
 *   background sweep happening at the same time.
 * - **In-flight de-duplication** means ten components asking for page 400
 *   simultaneously produce one `getTextContent()` call, not ten.
 */
import {
  BACKGROUND_INDEX_BATCH,
  BACKGROUND_INDEX_BUDGET_MS,
  MAX_CACHED_PAGE_INDEXES,
} from '../constants';
import type { PageIndex, PdfDocumentProxy } from '../types';
import {
  buildPageIndex,
  extractAnnotationFields,
  type PdfFormFieldAnnotation,
} from '../utils/buildIndex';
import { TextNormalizer, defaultNormalizer } from './TextNormalizer';

export interface PDFSearchIndexOptions {
  normalizer?: TextNormalizer;
  /** Maximum resident page indexes before LRU eviction kicks in. */
  maxPages?: number;
}

export interface IndexProgress {
  indexed: number;
  total: number;
}

export interface PDFSearchIndexStats {
  cached: number;
  pending: number;
  pinned: number;
  /** Approximate retained bytes across all cached indexes. */
  bytes: number;
}

/** `requestIdleCallback` is still unavailable in Safari; degrade to a timeout. */
type IdleHandle = { cancel: () => void };

function scheduleIdle(callback: (deadline: { timeRemaining: () => number }) => void): IdleHandle {
  if (typeof window === 'undefined') {
    return { cancel: () => {} };
  }
  const ric = (window as unknown as { requestIdleCallback?: typeof requestIdleCallback })
    .requestIdleCallback;
  if (typeof ric === 'function') {
    const handle = ric(callback as IdleRequestCallback, { timeout: 500 });
    const cic = (window as unknown as { cancelIdleCallback?: typeof cancelIdleCallback })
      .cancelIdleCallback;
    return { cancel: () => cic?.(handle) };
  }
  const timeout = window.setTimeout(() => {
    const start = performance.now();
    callback({
      timeRemaining: () => Math.max(0, BACKGROUND_INDEX_BUDGET_MS - (performance.now() - start)),
    });
  }, 32);
  return { cancel: () => window.clearTimeout(timeout) };
}

export class PDFSearchIndex {
  readonly normalizer: TextNormalizer;

  private readonly pdf: PdfDocumentProxy;
  private readonly maxPages: number;

  /** Insertion order doubles as recency: re-reading a page re-inserts it. */
  private readonly cache = new Map<number, PageIndex>();
  private readonly pending = new Map<number, Promise<PageIndex>>();
  private readonly pinned = new Set<number>();

  private idle: IdleHandle | null = null;
  private destroyed = false;

  constructor(pdf: PdfDocumentProxy, options: PDFSearchIndexOptions = {}) {
    this.pdf = pdf;
    this.normalizer = options.normalizer ?? defaultNormalizer;
    this.maxPages = options.maxPages ?? MAX_CACHED_PAGE_INDEXES;
  }

  get numPages(): number {
    return this.pdf.numPages;
  }

  /** The index for a page, built on first request and cached thereafter. */
  async getPage(pageNumber: number): Promise<PageIndex> {
    if (this.destroyed) throw new Error('PDFSearchIndex has been destroyed');
    if (pageNumber < 1 || pageNumber > this.pdf.numPages) {
      throw new RangeError(`Page ${pageNumber} is out of range (1-${this.pdf.numPages})`);
    }

    const cached = this.cache.get(pageNumber);
    if (cached) {
      this.touch(pageNumber, cached);
      return cached;
    }

    const inFlight = this.pending.get(pageNumber);
    if (inFlight) return inFlight;

    const build = this.build(pageNumber).finally(() => this.pending.delete(pageNumber));
    this.pending.set(pageNumber, build);
    return build;
  }

  /** The index for a page **only if it is already built**. Never does work. */
  peekPage(pageNumber: number): PageIndex | undefined {
    const cached = this.cache.get(pageNumber);
    if (cached) this.touch(pageNumber, cached);
    return cached;
  }

  hasPage(pageNumber: number): boolean {
    return this.cache.has(pageNumber);
  }

  /**
   * Protects pages from eviction. Called with the mounted page range, so a
   * background sweep of page 900 can never evict the page under the cursor.
   */
  pin(pageNumbers: Iterable<number>): void {
    this.pinned.clear();
    for (const pageNumber of pageNumbers) this.pinned.add(pageNumber);
  }

  /** Warms the cache without awaiting — used for the pages around the viewport. */
  prefetch(pageNumbers: Iterable<number>): void {
    for (const pageNumber of pageNumbers) {
      if (pageNumber < 1 || pageNumber > this.pdf.numPages) continue;
      if (this.cache.has(pageNumber) || this.pending.has(pageNumber)) continue;
      void this.getPage(pageNumber).catch(() => {
        /* prefetch is best-effort */
      });
    }
  }

  /**
   * Indexes the whole document during idle time.
   *
   * Chunked and budget-aware so it never blocks a frame; aborting is immediate.
   * Worth starting when a find bar opens, so the first search is instant, and
   * worth *not* starting otherwise on a huge document.
   */
  indexAll(
    options: { signal?: AbortSignal; onProgress?: (progress: IndexProgress) => void } = {}
  ): Promise<void> {
    const { signal, onProgress } = options;
    const total = this.pdf.numPages;

    return new Promise((resolve, reject) => {
      let next = 1;
      let cancelled = false;

      const stop = (error?: unknown) => {
        if (cancelled) return;
        cancelled = true;
        this.idle?.cancel();
        this.idle = null;
        signal?.removeEventListener('abort', onAbort);
        if (error) reject(error);
        else resolve();
      };

      const onAbort = () => stop(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
      signal?.addEventListener('abort', onAbort, { once: true });
      if (signal?.aborted) return onAbort();

      const step = (deadline: { timeRemaining: () => number }) => {
        if (cancelled || this.destroyed) return stop();

        const run = async () => {
          let processed = 0;
          while (
            next <= total &&
            processed < BACKGROUND_INDEX_BATCH &&
            deadline.timeRemaining() > 1
          ) {
            const pageNumber = next++;
            processed++;
            if (this.cache.has(pageNumber)) continue;
            try {
              await this.getPage(pageNumber);
            } catch {
              // A single unreadable page must not abort the sweep.
            }
            if (cancelled) return;
          }

          onProgress?.({ indexed: Math.min(next - 1, total), total });
          if (next > total) return stop();
          this.idle = scheduleIdle(step);
        };

        void run().catch(stop);
      };

      this.idle = scheduleIdle(step);
    });
  }

  get stats(): PDFSearchIndexStats {
    let bytes = 0;
    for (const index of this.cache.values()) bytes += index.weight;
    return {
      cached: this.cache.size,
      pending: this.pending.size,
      pinned: this.pinned.size,
      bytes,
    };
  }

  clear(): void {
    this.cache.clear();
  }

  destroy(): void {
    this.destroyed = true;
    this.idle?.cancel();
    this.idle = null;
    this.cache.clear();
    this.pending.clear();
    this.pinned.clear();
  }

  // ─── internals ───────────────────────────────────────────────────────────

  private async build(pageNumber: number): Promise<PageIndex> {
    const page = await this.pdf.getPage(pageNumber);
    const [textContent, rawAnnotations] = await Promise.all([
      page.getTextContent(),
      // Best-effort: a page whose annotations fail to load still indexes its
      // real text fine, it just can't fall back to form-field values.
      (page.getAnnotations() as Promise<readonly PdfFormFieldAnnotation[]>).catch(() => []),
    ]);
    const annotations = extractAnnotationFields(rawAnnotations);
    if (process.env.NODE_ENV !== 'production') {
      // Temporary diagnostic for the form-field indexing rollout — safe to
      // remove once annotation-backed citations are confirmed working across
      // real documents. `removeConsole` strips this in production builds.
      console.debug(
        `[pdf-highlight] page ${pageNumber}: ${rawAnnotations.length} raw annotation(s), ` +
          `${annotations.length} searchable field(s)`,
        rawAnnotations.map((a) => ({
          subtype: a.subtype,
          fieldType: a.fieldType,
          fieldValue: a.fieldValue,
          contents: a.contents,
        })),
        annotations
      );
    }
    const index = buildPageIndex({
      pageNumber,
      textContent,
      annotations,
      normalizer: this.normalizer,
      viewBox: page.view,
      rotate: page.rotate,
    });

    if (!this.destroyed) {
      this.cache.set(pageNumber, index);
      this.evict();
    }
    return index;
  }

  /** Re-insert to move the entry to the back of the recency order. */
  private touch(pageNumber: number, index: PageIndex): void {
    this.cache.delete(pageNumber);
    this.cache.set(pageNumber, index);
  }

  private evict(): void {
    if (this.cache.size <= this.maxPages) return;
    for (const pageNumber of this.cache.keys()) {
      if (this.cache.size <= this.maxPages) break;
      if (this.pinned.has(pageNumber)) continue;
      this.cache.delete(pageNumber);
    }
  }
}
