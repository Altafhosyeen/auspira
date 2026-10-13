/**
 * PDF highlight engine — public surface.
 *
 * Framework-agnostic by construction: nothing under `lib/pdf-highlight` imports
 * React, and the only reference to `react-pdf` is a type-only one that is
 * erased at build time. The React bindings live in `components/pdf-highlight`.
 *
 * ```ts
 * const index  = new PDFSearchIndex(pdf);
 * const engine = new SearchEngine(index);
 * const match  = await engine.locate('John Smith', { page: 4 });
 * ```
 */
export * from './types';
export * from './constants';

export { TextNormalizer, defaultNormalizer } from './core/TextNormalizer';
export { PDFSearchIndex } from './core/PDFSearchIndex';
export type {
  IndexProgress,
  PDFSearchIndexOptions,
  PDFSearchIndexStats,
} from './core/PDFSearchIndex';
export { SearchEngine, isAbortError } from './core/SearchEngine';
export type { DocumentSearchOptions, LocateOptions } from './core/SearchEngine';
export { SpanMapper } from './core/SpanMapper';
export type { Measurement, MeasurementSource, MeasureRangesOptions } from './core/SpanMapper';
export { HighlightManager, HIGHLIGHT_GROUPS } from './core/HighlightManager';
export { HighlightRenderer } from './core/HighlightRenderer';
export type { RenderedHighlight, RenderListener } from './core/HighlightRenderer';
export { NavigationManager } from './core/NavigationManager';

export {
  DEFAULT_NORMALIZER_OPTIONS,
  compactText,
  isWordEnd,
  isWordStart,
  normalizeChunk,
  normalizeText,
  resolveNormalizerOptions,
  trimChunk,
} from './utils/normalizeText';
export { buildPageIndex, extractAnnotationFields, isTextItem } from './utils/buildIndex';
export type {
  BuildPageIndexParams,
  ChunkNormalizer,
  PdfFormFieldAnnotation,
  RawAnnotationField,
} from './utils/buildIndex';
export {
  compactRangeToNormalized,
  expandRangeToLines,
  readRange,
  sliceRangeToItems,
  splitRangeByLines,
} from './utils/mapCharacterOffsets';
export type { ItemSlice } from './utils/mapCharacterOffsets';
export {
  alignPhrase,
  findBounded,
  flexiblePattern,
  isDistinctive,
  prepareQuery,
  searchPage,
} from './utils/searchText';
export {
  boundingRect,
  measureSlicesFromDom,
  measureSlicesFromGeometry,
  mergeRects,
} from './utils/highlightSpans';
export type { DomMeasurement } from './utils/highlightSpans';
