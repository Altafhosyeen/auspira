import { describe, expect, it } from 'vitest';
import {
  TextNormalizer,
  buildPageIndex,
  expandRangeToLines,
  extractAnnotationFields,
  sliceRangeToItems,
  splitRangeByLines,
} from '@/lib/pdf-highlight';
import { item, line, textContent } from './helpers';

const normalizer = new TextNormalizer();

function build(items: ReturnType<typeof item>[]) {
  return buildPageIndex({ pageNumber: 1, textContent: textContent(items), normalizer });
}

describe('buildPageIndex — gap-aware joining', () => {
  it('inserts a word break where the items are really separated', () => {
    const index = build(line([{ str: 'John', gap: 5 }, { str: 'Smith' }]));
    expect(index.normalized).toBe('john smith');
  });

  it('does NOT break a word that pdf.js split on a style change', () => {
    // "Joh" + "n Smith" touching — one word rendered in two runs.
    const index = build(line([{ str: 'Joh', gap: 0 }, { str: 'n Smith' }]));
    expect(index.normalized).toBe('john smith');
  });

  it('breaks across a line ending', () => {
    const index = build([
      item('John', { x: 0, y: 700, width: 20, hasEOL: true }),
      item('Smith', { x: 0, y: 688, width: 25 }),
    ]);
    expect(index.normalized).toBe('john smith');
  });

  it('collapses a hyphenated line break into two words', () => {
    const index = build([
      item('insur-', { x: 0, y: 700, width: 30, hasEOL: true }),
      item('ance', { x: 0, y: 688, width: 20 }),
    ]);
    expect(index.normalized).toBe('insur ance');
    // …which the compact stream reunites, so the whole word is still findable.
    expect(index.compact).toBe('insurance');
  });

  it('skips marked-content markers without disturbing span alignment', () => {
    const items = [
      { type: 'beginMarkedContent' },
      item('Total', { x: 0, width: 25 }),
      { type: 'endMarkedContent' },
      item('cost', { x: 30, width: 20 }),
    ];
    const index = buildPageIndex({
      pageNumber: 1,
      textContent: textContent(items as never),
      normalizer,
    });
    expect(index.normalized).toBe('total cost');
    // Two text-bearing items → two entries, matching `TextLayer.textDivs`.
    expect(index.items).toHaveLength(2);
    expect(index.items[0].divIndex).toBe(0);
    expect(index.items[1].divIndex).toBe(1);
  });

  it('keeps an empty item in the item list so div indices stay aligned', () => {
    const index = build([
      item('Alpha', { x: 0, width: 25 }),
      item('', { x: 30, width: 0 }),
      item('Beta', { x: 35, width: 20 }),
    ]);
    expect(index.normalized).toBe('alpha beta');
    expect(index.items).toHaveLength(3);
    expect(index.items[1].start).toBe(index.items[1].end);
  });

  it('groups items into lines top-down', () => {
    const index = build([
      item('First line', { x: 0, y: 700, width: 50 }),
      item('Second line', { x: 0, y: 680, width: 55 }),
    ]);
    expect(index.lines).toHaveLength(2);
    expect(index.normalized.slice(index.lines[0].start, index.lines[0].end)).toBe('first line');
    expect(index.normalized.slice(index.lines[1].start, index.lines[1].end)).toBe('second line');
  });
});

describe('character offset mapping', () => {
  it('maps a normalised range back to the exact characters of each item', () => {
    const index = build(line([{ str: 'John', gap: 5 }, { str: 'Smith' }]));
    const start = index.normalized.indexOf('smith');
    const slices = sliceRangeToItems(index, { start, end: start + 5 });

    expect(slices).toEqual([{ divIndex: 1, startOffset: 0, endOffset: 5 }]);
  });

  it('splits a range that spans two items into one slice per item', () => {
    const index = build(line([{ str: 'John', gap: 5 }, { str: 'Smith' }]));
    const slices = sliceRangeToItems(index, { start: 0, end: index.normalized.length });

    expect(slices).toHaveLength(2);
    expect(slices[0]).toEqual({ divIndex: 0, startOffset: 0, endOffset: 4 });
    expect(slices[1]).toEqual({ divIndex: 1, startOffset: 0, endOffset: 5 });
  });

  it('maps a partial word to a partial slice — the basis of sub-word highlighting', () => {
    const index = build([item('Contractor', { x: 0, width: 50 })]);
    const start = index.normalized.indexOf('tractor');
    const slices = sliceRangeToItems(index, { start, end: start + 7 });

    expect(slices).toEqual([{ divIndex: 0, startOffset: 3, endOffset: 10 }]);
  });

  it('accounts for punctuation the raw string carries but the index drops', () => {
    // "walls," normalises to "walls"; highlighting it must still land on the
    // raw characters 0‥5, not 0‥5 of some re-derived string.
    const index = build([item('walls, floors', { x: 0, width: 60 })]);
    const slices = sliceRangeToItems(index, { start: 0, end: 5 });
    expect(slices).toEqual([{ divIndex: 0, startOffset: 0, endOffset: 5 }]);
  });

  it('splits a multi-line range at the line boundary', () => {
    const index = build([
      item('the contractor', { x: 0, y: 700, width: 70, hasEOL: true }),
      item('shall design', { x: 0, y: 688, width: 60 }),
    ]);
    const parts = splitRangeByLines(index, { start: 0, end: index.normalized.length });
    expect(parts).toHaveLength(2);
    expect(index.normalized.slice(parts[0].start, parts[0].end)).toBe('the contractor');
    expect(index.normalized.slice(parts[1].start, parts[1].end)).toBe('shall design');
  });

  it('expands a tiny match to its whole line', () => {
    const index = build([
      item('Z63 Termination of the contract', { x: 0, y: 700, width: 150 }),
      item('Body text below', { x: 0, y: 680, width: 70 }),
    ]);
    const expanded = expandRangeToLines(index, { start: 0, end: 3 });
    expect(index.normalized.slice(expanded.start, expanded.end)).toBe(
      'z63 termination of the contract'
    );
  });
});

describe('extractAnnotationFields', () => {
  it('reads a real AcroForm text field from fieldValue', () => {
    const fields = extractAnnotationFields([
      { id: 'a1', subtype: 'Widget', fieldType: 'Tx', fieldValue: 'GBP', rect: [0, 0, 10, 10] },
    ]);
    expect(fields).toEqual([{ id: 'a1', rect: [0, 0, 10, 10], value: 'GBP' }]);
  });

  it('reads a filled-in blank rendered as a FreeText markup box from contents', () => {
    // Common on flat (non-fillable) templates where a value is typed into a box
    // added on top of the page rather than into a real form field — the text
    // lives in `/Contents`, not `fieldValue`, and getTextContent() never sees it.
    const fields = extractAnnotationFields([
      { id: 'ft1', subtype: 'FreeText', contents: 'British Pound Sterling', rect: [0, 0, 40, 12] },
    ]);
    expect(fields).toEqual([{ id: 'ft1', rect: [0, 0, 40, 12], value: 'British Pound Sterling' }]);
  });

  it('ignores a FreeText annotation used as a plain comment, if empty', () => {
    const fields = extractAnnotationFields([
      { id: 'ft2', subtype: 'FreeText', contents: '   ', rect: [0, 0, 40, 12] },
    ]);
    expect(fields).toEqual([]);
  });

  it('ignores non-text form fields and unrelated annotation subtypes', () => {
    const fields = extractAnnotationFields([
      { id: 'btn', subtype: 'Widget', fieldType: 'Btn', fieldValue: 'Yes', rect: [0, 0, 10, 10] },
      { id: 'link', subtype: 'Link', rect: [0, 0, 10, 10] },
      { id: 'note', subtype: 'Text', contents: 'reviewer comment', rect: [0, 0, 10, 10] },
    ]);
    expect(fields).toEqual([]);
  });

  it('skips an annotation with no usable rect', () => {
    const fields = extractAnnotationFields([{ id: 'ft3', subtype: 'FreeText', contents: 'GBP' }]);
    expect(fields).toEqual([]);
  });
});
