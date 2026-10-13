/**
 * The bridge between "a character range" and "pixels on screen".
 *
 * Mounted pages register a {@link PageDomHandle} here; virtualised pages
 * deregister. Everything else in the engine can then ask "measure this range on
 * page 412" without knowing, or caring, whether page 412 currently exists in
 * the DOM — it gets rectangles when the page is mounted, geometry-derived
 * rectangles when only a viewport is known, and `null` when neither is
 * available, at which point the caller simply waits for the page to render.
 *
 * Nothing here queries the DOM by selector. A range resolves to text items by
 * arithmetic on the page index, and a text item resolves to its span by array
 * index into `TextLayer.textDivs`.
 */
import type { CharRange, NormalizedRect, PageDomHandle, PageIndex } from '../types';
import {
  expandRangeToLines,
  sliceRangeToItems,
  splitRangeByLines,
  type ItemSlice,
} from '../utils/mapCharacterOffsets';
import { measureSlicesFromDom, measureSlicesFromGeometry } from '../utils/highlightSpans';

export type MeasurementSource = 'dom' | 'geometry' | 'none';

export interface Measurement {
  rects: NormalizedRect[];
  source: MeasurementSource;
  /** The handle's `renderKey` at measurement time — part of the cache identity. */
  renderKey: number;
  rotation: number;
}

export interface MeasureRangesOptions {
  /** Widen each range to cover its whole line before measuring. */
  expandToLine?: boolean;
}

export class SpanMapper {
  private readonly handles = new Map<number, PageDomHandle>();
  private readonly listeners = new Set<(pageNumber: number) => void>();

  /** Registers (or updates) a mounted page. Notifies listeners so they re-measure. */
  registerPage(handle: PageDomHandle): void {
    this.handles.set(handle.pageNumber, handle);
    this.emit(handle.pageNumber);
  }

  unregisterPage(pageNumber: number): void {
    if (this.handles.delete(pageNumber)) this.emit(pageNumber);
  }

  getHandle(pageNumber: number): PageDomHandle | undefined {
    return this.handles.get(pageNumber);
  }

  /** Every currently-mounted page, for callers that must hit-test the viewport. */
  getHandles(): IterableIterator<PageDomHandle> {
    return this.handles.values();
  }

  hasTextLayer(pageNumber: number): boolean {
    const handle = this.handles.get(pageNumber);
    return !!handle?.textDivs && handle.textDivs.length > 0;
  }

  /** Notified whenever a page's DOM handle appears, changes, or goes away. */
  subscribe(listener: (pageNumber: number) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    this.handles.clear();
  }

  /**
   * Measures character ranges against a page.
   *
   * Each range is split at line boundaries first, so a phrase wrapping across
   * three lines produces three bars that follow the text rather than one block
   * covering everything between the start of line one and the end of line three.
   */
  measureRanges(
    pageIndex: PageIndex,
    ranges: readonly CharRange[],
    options: MeasureRangesOptions = {}
  ): Measurement | null {
    const handle = this.handles.get(pageIndex.pageNumber);
    if (!handle) return null;

    const slices = this.resolveSlices(pageIndex, ranges, options.expandToLine === true);
    if (slices.length === 0) {
      return { rects: [], source: 'none', renderKey: handle.renderKey, rotation: handle.rotation };
    }

    const textDivs = handle.textDivs;
    if (textDivs && textDivs.length > 0 && handle.pageElement.isConnected) {
      const pageRect = handle.pageElement.getBoundingClientRect();
      const measured = measureSlicesFromDom(slices, textDivs, pageRect);
      // Partial results are still good results — a couple of unresolvable spans
      // out of thirty is not a reason to throw away an accurate measurement.
      if (measured.rects.length > 0 && measured.missing <= slices.length / 2) {
        return {
          rects: measured.rects,
          source: 'dom',
          renderKey: handle.renderKey,
          rotation: handle.rotation,
        };
      }
    }

    if (handle.viewport) {
      const rects = measureSlicesFromGeometry(slices, pageIndex, handle.viewport);
      if (rects.length > 0) {
        return {
          rects,
          source: 'geometry',
          renderKey: handle.renderKey,
          rotation: handle.rotation,
        };
      }
    }

    return null;
  }

  /** Turns ranges into the per-item slices that can be measured. */
  private resolveSlices(
    pageIndex: PageIndex,
    ranges: readonly CharRange[],
    expandToLine: boolean
  ): ItemSlice[] {
    const slices: ItemSlice[] = [];
    for (const range of ranges) {
      const effective = expandToLine ? expandRangeToLines(pageIndex, range) : range;
      for (const line of splitRangeByLines(pageIndex, effective)) {
        slices.push(...sliceRangeToItems(pageIndex, line));
      }
    }
    return slices;
  }

  private emit(pageNumber: number): void {
    for (const listener of this.listeners) listener(pageNumber);
  }
}
