import type { PdfTextContent, PdfTextItem } from '@/lib/pdf-highlight';

export interface FakeItemOptions {
  /** Left edge in PDF user space. */
  x?: number;
  /** Baseline Y in PDF user space (grows upwards). */
  y?: number;
  /** Font size — becomes the transform's scale and the item's font height. */
  size?: number;
  /** Advance width. Defaults to a plausible 0.5em per character. */
  width?: number;
  hasEOL?: boolean;
}

/**
 * Builds a pdf.js-shaped text item.
 *
 * Geometry matters in these tests: the index builder decides whether to insert
 * a word break by measuring the real gap between items, so `x` and `width` are
 * what separate "two words" from "one word split across two style runs".
 */
export function item(str: string, options: FakeItemOptions = {}): PdfTextItem {
  const { x = 0, y = 700, size = 10, width = str.length * 5, hasEOL = false } = options;
  return {
    str,
    dir: 'ltr',
    width,
    height: size,
    transform: [size, 0, 0, size, x, y],
    fontName: 'g_d0_f1',
    hasEOL,
  };
}

/**
 * Lays out items left to right on one line, with an explicit gap between each.
 * A gap of 0 means the items are touching, which is how pdf.js emits a single
 * word that changes style halfway through.
 */
export function line(
  parts: Array<{ str: string; gap?: number; hasEOL?: boolean }>,
  options: { y?: number; size?: number } = {}
): PdfTextItem[] {
  const { y = 700, size = 10 } = options;
  let x = 0;
  return parts.map((part) => {
    const width = part.str.length * 5;
    const current = item(part.str, { x, y, size, width, hasEOL: part.hasEOL });
    x += width + (part.gap ?? 0);
    return current;
  });
}

/** Wraps items in the `TextContent` shape `getTextContent()` returns. */
export function textContent(items: PdfTextItem[]): PdfTextContent {
  return { items, styles: {}, lang: null } as unknown as PdfTextContent;
}
