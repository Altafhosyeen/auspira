/**
 * Turns item slices into drawable rectangles.
 *
 * Two independent measurement paths, both producing rectangles expressed as
 * **fractions of the page box** (0–1):
 *
 * 1. `measureSlicesFromDom` — the primary path. Builds a DOM `Range` over the
 *    real text-layer spans and asks the browser for the geometry. Because the
 *    browser measures the actual laid-out glyphs, a partial match lands on
 *    exactly the matched characters even in a proportional font, and text that
 *    pdf.js horizontally squeezed to fit (`transform: scaleX(…)`) is measured
 *    post-transform. This is what "highlight the real spans, not invented
 *    rectangles" means in practice.
 *
 * 2. `measureSlicesFromGeometry` — the fallback, used when the text layer has
 *    not rendered yet or pdf.js refused to build spans for a very dense page
 *    (it caps at 100 000 text divs). Projects the item's own transform through
 *    the page viewport. Character positions inside an item are interpolated
 *    from the advance width, so it is approximate — but it is never wrong about
 *    which line the text is on, and it lets a highlight appear before the text
 *    layer exists.
 *
 * Fractions are the whole trick behind surviving zoom: the page element scales
 * uniformly, so `left: 43.1%` stays correct at 50% and at 300% with nothing
 * re-measured and no layout thrash.
 */
import {
  LINE_MERGE_OVERLAP,
  MIN_RECT_SIZE,
  RECT_MERGE_GAP,
  RECT_VERTICAL_PADDING,
} from '../constants';
import type { NormalizedRect, PageIndex, PdfPageViewport } from '../types';
import type { ItemSlice } from './mapCharacterOffsets';

/** Reused across every measurement — creating a Range per slice is pure waste. */
let sharedRange: Range | null = null;

function getSharedRange(): Range | null {
  if (typeof document === 'undefined') return null;
  sharedRange ??= document.createRange();
  return sharedRange;
}

export interface DomMeasurement {
  rects: NormalizedRect[];
  /** How many slices could not be resolved to a span — drives the fallback. */
  missing: number;
}

/**
 * Measures slices against the live text layer.
 *
 * `textDivs` comes straight from `TextLayer.textDivs` and is index-aligned with
 * `PageIndex.items`, so resolving a slice to its span is an array lookup — no
 * `querySelectorAll`, no DOM walk, no per-click scan of the document.
 */
export function measureSlicesFromDom(
  slices: readonly ItemSlice[],
  textDivs: readonly HTMLElement[],
  pageRect: DOMRect
): DomMeasurement {
  const range = getSharedRange();
  const rects: NormalizedRect[] = [];
  let missing = 0;

  if (!range || pageRect.width <= 0 || pageRect.height <= 0) {
    return { rects, missing: slices.length };
  }

  for (const slice of slices) {
    const div = textDivs[slice.divIndex];
    if (!div || !div.isConnected) {
      missing++;
      continue;
    }

    const textNode = div.firstChild;
    let clientRects: DOMRectList | DOMRect[];

    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const length = textNode.textContent?.length ?? 0;
      const start = clamp(slice.startOffset, 0, length);
      const end = clamp(slice.endOffset, start, length);
      if (end === start) {
        missing++;
        continue;
      }
      try {
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        clientRects = range.getClientRects();
      } catch {
        // A concurrent text-layer rebuild can detach the node mid-measure.
        missing++;
        continue;
      }
    } else {
      // No text node (an empty span) — fall back to the element's own box.
      clientRects = [div.getBoundingClientRect()];
    }

    let added = 0;
    for (const clientRect of clientRects) {
      const normalized = toNormalizedRect(clientRect, pageRect);
      if (normalized) {
        rects.push(normalized);
        added++;
      }
    }
    if (added === 0) missing++;
  }

  return { rects, missing };
}

/**
 * Measures slices from the PDF's own text geometry, projected through the
 * current viewport (which already carries scale *and* rotation).
 */
export function measureSlicesFromGeometry(
  slices: readonly ItemSlice[],
  index: PageIndex,
  viewport: PdfPageViewport
): NormalizedRect[] {
  const width = viewport.width;
  const height = viewport.height;
  if (!width || !height) return [];

  const transform = viewport.transform as readonly number[];
  const project = (x: number, y: number): [number, number] => [
    transform[0] * x + transform[2] * y + transform[4],
    transform[1] * x + transform[3] * y + transform[5],
  ];

  const rects: NormalizedRect[] = [];
  for (const slice of slices) {
    const item = index.items[slice.divIndex];
    if (!item || !item.str) continue;

    const length = item.str.length || 1;
    const from = clamp(slice.startOffset, 0, length) / length;
    const to = clamp(slice.endOffset, 0, length) / length;
    if (to <= from) continue;

    const originX = item.transform[4] ?? 0;
    const originY = item.transform[5] ?? 0;
    const x0 = originX + item.width * from;
    const x1 = originX + item.width * to;
    // The baseline sits at `originY`; descenders hang below it.
    const y0 = originY - item.fontHeight * 0.22;
    const y1 = originY + item.fontHeight;

    const corners = [project(x0, y0), project(x1, y0), project(x0, y1), project(x1, y1)];
    const xs = corners.map((corner) => corner[0]);
    const ys = corners.map((corner) => corner[1]);

    const rect: NormalizedRect = {
      x: Math.min(...xs) / width,
      y: Math.min(...ys) / height,
      w: (Math.max(...xs) - Math.min(...xs)) / width,
      h: (Math.max(...ys) - Math.min(...ys)) / height,
    };
    if (rect.w >= MIN_RECT_SIZE && rect.h >= MIN_RECT_SIZE) rects.push(rect);
  }

  return rects;
}

function toNormalizedRect(clientRect: DOMRect, pageRect: DOMRect): NormalizedRect | null {
  const w = clientRect.width / pageRect.width;
  const h = clientRect.height / pageRect.height;
  if (w < MIN_RECT_SIZE || h < MIN_RECT_SIZE) return null;
  return {
    x: (clientRect.left - pageRect.left) / pageRect.width,
    y: (clientRect.top - pageRect.top) / pageRect.height,
    w,
    h,
  };
}

/**
 * Merges raw rectangles into one continuous bar per line of text.
 *
 * pdf.js emits a separate span every time the font, size, or weight changes, so
 * a single highlighted sentence can arrive as a dozen touching rectangles. Left
 * alone they render with hairline seams between them at some zoom levels and
 * look like a broken highlight; merged, they read as one stroke of a marker
 * pen, which is what Acrobat and Apryse both do.
 */
export function mergeRects(
  rects: readonly NormalizedRect[],
  padding = RECT_VERTICAL_PADDING
): NormalizedRect[] {
  if (rects.length === 0) return [];

  const sorted = [...rects].sort((a, b) => a.y - b.y || a.x - b.x);

  // Group by vertical overlap — same line when they share most of their height.
  const lines: NormalizedRect[][] = [];
  for (const rect of sorted) {
    const line = lines[lines.length - 1];
    if (line && sharesLine(line[line.length - 1], rect)) {
      line.push(rect);
      continue;
    }
    lines.push([rect]);
  }

  const merged: NormalizedRect[] = [];
  for (const line of lines) {
    line.sort((a, b) => a.x - b.x);
    let current: NormalizedRect | null = null;

    for (const rect of line) {
      if (!current) {
        current = { ...rect };
        continue;
      }
      const gap = rect.x - (current.x + current.w);
      if (gap <= RECT_MERGE_GAP) {
        const right = Math.max(current.x + current.w, rect.x + rect.w);
        const top = Math.min(current.y, rect.y);
        const bottom = Math.max(current.y + current.h, rect.y + rect.h);
        current.x = Math.min(current.x, rect.x);
        current.y = top;
        current.w = right - current.x;
        current.h = bottom - top;
        continue;
      }
      merged.push(current);
      current = { ...rect };
    }
    if (current) merged.push(current);
  }

  return merged.map((rect) => pad(rect, padding));
}

function sharesLine(a: NormalizedRect, b: NormalizedRect): boolean {
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  const overlap = bottom - top;
  if (overlap <= 0) return false;
  return overlap >= Math.min(a.h, b.h) * LINE_MERGE_OVERLAP;
}

/** Grows a rect vertically so descenders (g, y, j, p) sit inside the highlight. */
function pad(rect: NormalizedRect, ratio: number): NormalizedRect {
  if (ratio <= 0) return rect;
  const grow = rect.h * ratio;
  const y = Math.max(0, rect.y - grow);
  const h = Math.min(1 - y, rect.h + grow * 2);
  return { x: rect.x, y, w: rect.w, h };
}

/** The bounding box of a set of rects — used to scroll a match into view. */
export function boundingRect(rects: readonly NormalizedRect[]): NormalizedRect | null {
  if (rects.length === 0) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const rect of rects) {
    if (rect.x < x0) x0 = rect.x;
    if (rect.y < y0) y0 = rect.y;
    if (rect.x + rect.w > x1) x1 = rect.x + rect.w;
    if (rect.y + rect.h > y1) y1 = rect.y + rect.h;
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
