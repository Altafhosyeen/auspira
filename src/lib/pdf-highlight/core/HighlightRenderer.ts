/**
 * Measurement cache and geometry pipeline for highlights.
 *
 * The rule this class enforces is the one that keeps the viewer smooth:
 *
 * > **Measure once per (highlight, rotation). Never re-measure for zoom.**
 *
 * Rectangles are stored as fractions of the page box, so a zoom change needs no
 * new measurement at all — the same percentages are still correct, and the
 * browser re-lays them out for free. Rotation genuinely changes the geometry,
 * so it is part of the cache key. A page being virtualised away and coming back
 * changes neither, so a returning page paints its highlights on the very first
 * frame with no measurement and no flash.
 *
 * Everything is keyed by highlight id, so removing one highlight never
 * invalidates the others.
 */
import { MAX_CACHED_MEASUREMENTS } from '../constants';
import type { Highlight, NormalizedRect, PageIndex } from '../types';
import { boundingRect, mergeRects } from '../utils/highlightSpans';
import type { MeasurementSource, SpanMapper } from './SpanMapper';

export interface RenderedHighlight {
  highlightId: string;
  pageNumber: number;
  rects: NormalizedRect[];
  /** Bounding box of `rects` — what navigation scrolls to. */
  bounds: NormalizedRect | null;
  source: MeasurementSource;
  rotation: number;
}

export type RenderListener = (rendered: RenderedHighlight) => void;

export class HighlightRenderer {
  /** `${highlightId}|${rotation}` → measurement. Insertion-ordered for LRU. */
  private readonly cache = new Map<string, RenderedHighlight>();
  private readonly listeners = new Set<RenderListener>();

  constructor(private readonly spanMapper: SpanMapper) {}

  /**
   * Returns the highlight's rectangles, measuring only if they are not already
   * known. `null` means "not measurable yet" — the page is not mounted, or its
   * text layer has not rendered — and the caller should simply try again when
   * the page reports a new render.
   */
  measure(
    highlight: Highlight,
    pageIndex: PageIndex | undefined,
    rotation: number
  ): RenderedHighlight | null {
    // User-drawn highlights arrive pre-measured; there is nothing to look up.
    if (highlight.rects && highlight.rects.length > 0) {
      return {
        highlightId: highlight.id,
        pageNumber: highlight.pageNumber,
        rects: highlight.rects,
        bounds: boundingRect(highlight.rects),
        source: 'dom',
        rotation,
      };
    }

    const key = cacheKey(highlight.id, rotation);
    const cached = this.cache.get(key);
    if (cached) {
      this.touch(key, cached);
      return cached;
    }

    // A form-field match has no character range to measure — its box is read
    // straight from the annotation's own PDF-space rect instead, via the
    // mounted page's current viewport (which already bakes in scale and
    // rotation). The result is still expressed as page-box fractions, so it
    // is exactly as cacheable-by-rotation, zoom-free as every other rect here.
    if (highlight.annotationId) {
      return this.measureAnnotation(highlight, pageIndex, rotation, key);
    }

    if (!pageIndex || !highlight.ranges || highlight.ranges.length === 0) return null;

    const measurement = this.spanMapper.measureRanges(pageIndex, highlight.ranges, {
      expandToLine: highlight.expandToLine,
    });
    if (!measurement || measurement.rects.length === 0) return null;

    const rects = mergeRects(measurement.rects);
    const rendered: RenderedHighlight = {
      highlightId: highlight.id,
      pageNumber: highlight.pageNumber,
      rects,
      bounds: boundingRect(rects),
      source: measurement.source,
      rotation,
    };

    // A geometry-derived measurement is a stopgap: it is cached so the
    // highlight appears immediately, but it is *not* pinned, so the next
    // invalidation replaces it with the exact DOM measurement.
    this.store(key, rendered);
    this.emit(rendered);
    return rendered;
  }

  /** Projects a form-field's PDF-space rect through the mounted page's current viewport. */
  private measureAnnotation(
    highlight: Highlight,
    pageIndex: PageIndex | undefined,
    rotation: number,
    key: string
  ): RenderedHighlight | null {
    if (!pageIndex) return null;
    const field = pageIndex.annotations.find(
      (candidate) => candidate.id === highlight.annotationId
    );
    if (!field) return null;

    const handle = this.spanMapper.getHandle(highlight.pageNumber);
    if (!handle?.viewport) return null;

    const [ax, ay, bx, by] = handle.viewport.convertToViewportRectangle(field.rect as number[]);
    const { width, height } = handle.viewport;
    if (!width || !height) return null;

    const rect: NormalizedRect = {
      x: Math.min(ax, bx) / width,
      y: Math.min(ay, by) / height,
      w: Math.abs(bx - ax) / width,
      h: Math.abs(by - ay) / height,
    };

    const rendered: RenderedHighlight = {
      highlightId: highlight.id,
      pageNumber: highlight.pageNumber,
      rects: [rect],
      bounds: rect,
      source: 'geometry',
      rotation,
    };
    this.store(key, rendered);
    this.emit(rendered);
    return rendered;
  }

  /** The measurement for a highlight if it is already known. Never measures. */
  peek(highlightId: string, rotation: number): RenderedHighlight | undefined {
    return this.cache.get(cacheKey(highlightId, rotation));
  }

  /** Drops one highlight's measurements at every rotation. */
  invalidateHighlight(highlightId: string): void {
    const prefix = `${highlightId}|`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }

  /** Drops every measurement for a page — used when its text layer is rebuilt. */
  invalidatePage(pageNumber: number): void {
    for (const [key, rendered] of this.cache) {
      if (rendered.pageNumber === pageNumber) this.cache.delete(key);
    }
  }

  /** Drops measurements that were only approximated, so they can be redone. */
  invalidateApproximate(pageNumber?: number): void {
    for (const [key, rendered] of this.cache) {
      if (rendered.source !== 'geometry') continue;
      if (pageNumber !== undefined && rendered.pageNumber !== pageNumber) continue;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  /** Fires whenever a highlight gains (or refreshes) its geometry. */
  subscribe(listener: RenderListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private store(key: string, rendered: RenderedHighlight): void {
    this.cache.set(key, rendered);
    while (this.cache.size > MAX_CACHED_MEASUREMENTS) {
      const oldest = this.cache.keys().next();
      if (oldest.done) break;
      this.cache.delete(oldest.value);
    }
  }

  private touch(key: string, rendered: RenderedHighlight): void {
    this.cache.delete(key);
    this.cache.set(key, rendered);
  }

  private emit(rendered: RenderedHighlight): void {
    for (const listener of this.listeners) listener(rendered);
  }
}

function cacheKey(highlightId: string, rotation: number): string {
  return `${highlightId}|${((rotation % 360) + 360) % 360}`;
}
