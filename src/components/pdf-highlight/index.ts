/**
 * React bindings for the PDF highlight engine.
 *
 * Composition, outermost first:
 *
 * ```
 * <HighlightProvider>          highlight store, span mapper, measure cache, scroll
 *   <SearchIndexProvider>      per-document page-index cache + SearchEngine
 *     <PdfViewer>              toolbar, virtualisation, find bar
 *       <PdfPage>              canvas + text layer + handle registration
 *         <HighlightLayer>     percentage-positioned rectangles
 * ```
 *
 * `<PdfViewer>` sets up both providers itself, so the common case is a single
 * import. Drop to the individual pieces when you need the engine around a
 * different renderer — a react-pdf `<Document>`/`<Page>` tree, a thumbnail
 * strip, or a printing view.
 */
export { PdfViewer } from './PdfViewer';
export type { PdfViewerProps } from './PdfViewer';

export type { PdfPageProps } from './PdfPage';

export { HighlightLayer } from './HighlightLayer';
export type { HighlightLayerProps } from './HighlightLayer';

export { HighlightProvider, useHighlightEngine } from './HighlightContext';
export type { HighlightContextValue } from './HighlightContext';

export { SearchIndexProvider, useSearchIndexContext } from './SearchIndexProvider';
export type { SearchIndexContextValue, SearchIndexProviderProps } from './SearchIndexProvider';

export {
  useActiveHighlightId,
  useCitationHighlight,
  useHighlightActions,
  usePageHighlights,
} from './hooks/useHighlight';
export type {
  CitationRequest,
  CitationStatus,
  HighlightActions,
  UseCitationHighlightResult,
} from './hooks/useHighlight';

export { useDocumentIndexing, usePdfIndex, usePinnedPages } from './hooks/usePdfIndex';
export type { UseDocumentIndexingResult, UsePdfIndexResult } from './hooks/usePdfIndex';

export { usePdfSearch } from './hooks/usePdfSearch';
export type { SearchStatus, UsePdfSearchOptions, UsePdfSearchResult } from './hooks/usePdfSearch';

export { useScrollToPage } from './hooks/useScrollToPage';
export type { UseScrollToPageResult } from './hooks/useScrollToPage';
