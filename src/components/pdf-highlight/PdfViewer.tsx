'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eraser,
  ExternalLink,
  Highlighter,
  Loader2,
  Minus,
  Plus,
  RotateCw,
  Search,
  X,
} from 'lucide-react';
import { HIGHLIGHT_GROUPS, type NormalizedRect, type PdfDocumentProxy } from '@/lib/pdf-highlight';
import { HighlightProvider, useHighlightEngine } from './HighlightContext';
import { SearchIndexProvider } from './SearchIndexProvider';
import { PdfPage, PdfPagePlaceholder } from './PdfPage';
import { useCitationHighlight, useHighlightActions } from './hooks/useHighlight';
import { usePdfSearch } from './hooks/usePdfSearch';
import { useDocumentIndexing, usePinnedPages } from './hooks/usePdfIndex';
import { useScrollToPage } from './hooks/useScrollToPage';

// Serve the pdf.js worker from /public (see scripts/copy-pdf-worker + postinstall).
// A local worker avoids CDN/version-mismatch failures in the standalone build.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.15;

/** Pages kept rendered beyond the viewport so scrolling reveals a drawn page. */
const OVERSCAN = 2;

export interface PdfViewerProps {
  /** Remote (SAS) URL of the PDF file. */
  fileUrl: string;
  /** Page to display / jump to (1-based). */
  activePage: number;
  /** File title, used for the download name and tooltips. */
  title: string;
  /** Open the file in a new browser tab. */
  onOpenInNewTab: () => void;
  /** Value to locate and highlight (set when a metadata-panel chip is clicked). */
  searchText?: string;
  /** Page the value is cited on. The engine widens the search if it isn't there. */
  searchPage?: number | null;
  /** Bumped on every chip click so a repeat click re-navigates and re-centres. */
  highlightNonce?: number;
  /** Called when the user navigates manually, so the parent can clear highlight state. */
  onClearHighlight?: () => void;
  /** Tailwind background class for the scrollable page area. */
  pageAreaClassName?: string;
  /** Reports whether `searchText` was found, to drive a "not found" note. */
  onHighlightResult?: (found: boolean) => void;
  /** Sibling values from the same record, used to disambiguate duplicates. */
  contextHints?: string[];
}

/**
 * PDF viewer with a light, UI-matching toolbar and Acrobat-grade highlighting.
 *
 * Loads the document, then hands it to the two providers that own the engine's
 * lifetime: {@link HighlightProvider} (highlight store, span mapper,
 * measurement cache, scroll controller) and {@link SearchIndexProvider} (the
 * per-document page-index cache).
 */
export function PdfViewer(props: PdfViewerProps) {
  const [pdf, setPdf] = useState<PdfDocumentProxy | null>(null);
  const [error, setError] = useState(false);
  const [baseSize, setBaseSize] = useState<{ w: number; h: number }>({ w: 595, h: 842 });

  // Fetch through a same-origin proxy: the Azure blob does not send CORS headers.
  const proxiedUrl = useMemo(
    () => `/api/file-proxy?url=${encodeURIComponent(props.fileUrl)}`,
    [props.fileUrl]
  );

  useEffect(() => {
    let cancelled = false;
    setPdf(null);
    setError(false);

    const task = pdfjs.getDocument(proxiedUrl);
    task.promise
      .then(async (doc) => {
        if (cancelled) {
          void doc.destroy();
          return;
        }
        setPdf(doc);
        try {
          const first = await doc.getPage(1);
          const viewport = first.getViewport({ scale: 1 });
          if (!cancelled) setBaseSize({ w: viewport.width, h: viewport.height });
        } catch {
          /* keep the A4 default */
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      // Destroying the loading task cancels loading and tears down the document.
      void task.destroy();
    };
  }, [proxiedUrl]);

  return (
    <HighlightProvider>
      <SearchIndexProvider pdf={pdf}>
        <PdfViewerShell {...props} pdf={pdf} error={error} baseSize={baseSize} />
      </SearchIndexProvider>
    </HighlightProvider>
  );
}

interface PdfViewerShellProps extends PdfViewerProps {
  pdf: PdfDocumentProxy | null;
  error: boolean;
  baseSize: { w: number; h: number };
}

function PdfViewerShell({
  pdf,
  error,
  baseSize,
  fileUrl,
  activePage,
  title,
  onOpenInNewTab,
  searchText,
  searchPage,
  highlightNonce,
  onClearHighlight,
  onHighlightResult,
  contextHints,
  pageAreaClassName = 'bg-slate-50',
}: PdfViewerShellProps) {
  const { spanMapper } = useHighlightEngine();
  const numPages = pdf?.numPages ?? 0;

  const [pageNumber, setPageNumber] = useState(activePage || 1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [range, setRange] = useState<{ first: number; last: number }>({ first: 1, last: 3 });

  const [highlighterOn, setHighlighterOn] = useState(false);
  const [hasManualMarks, setHasManualMarks] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [findInput, setFindInput] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageNodesRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  const navigation = useScrollToPage();
  const citation = useCitationHighlight();
  const find = usePdfSearch({ scrollToActive: true });
  const highlightActions = useHighlightActions();
  const indexing = useDocumentIndexing();

  usePinnedPages(range.first, range.last);

  // ─── Layout ──────────────────────────────────────────────────────────────

  const rotated = rotation === 90 || rotation === 270;
  const dims = useMemo(
    () => ({
      width: (rotated ? baseSize.h : baseSize.w) * scale,
      height: (rotated ? baseSize.w : baseSize.h) * scale,
    }),
    [baseSize, scale, rotated]
  );

  const setContainer = navigation.setContainer;
  const attachContainer = useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element;
      setContainer(element);
    },
    [setContainer]
  );

  const registerNavPage = navigation.registerPage;
  const registerPage = useCallback(
    (page: number) => (element: HTMLDivElement | null) => {
      if (element) pageNodesRef.current.set(page, element);
      else pageNodesRef.current.delete(page);
      registerNavPage(page, element);
    },
    [registerNavPage]
  );

  /** Which pages should be drawn, from the current scroll position. */
  const recomputeRange = useCallback(() => {
    const container = scrollRef.current;
    if (!container || numPages === 0) return;

    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    let first = 0;
    let last = 0;
    let current = 0;
    let bestOverlap = -1;

    for (let page = 1; page <= numPages; page++) {
      const element = pageNodesRef.current.get(page);
      if (!element) continue;
      const top = element.offsetTop;
      const bottom = top + element.offsetHeight;
      if (bottom < viewTop || top > viewBottom) continue;

      if (first === 0) first = page;
      last = page;
      const overlap = Math.min(bottom, viewBottom) - Math.max(top, viewTop);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        current = page;
      }
    }

    if (first === 0) return; // nothing measured yet — keep the seeded range

    const next = {
      first: Math.max(1, first - OVERSCAN),
      last: Math.min(numPages, last + OVERSCAN),
    };
    setRange((previous) =>
      previous.first === next.first && previous.last === next.last ? previous : next
    );
    if (current) setPageNumber((previous) => (previous === current ? previous : current));
  }, [numPages]);

  const onScroll = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recomputeRange();
    });
  }, [recomputeRange]);

  useEffect(() => {
    recomputeRange();
  }, [numPages, scale, rotation, recomputeRange]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // Seed the drawn window as soon as the document reports its page count.
  useEffect(() => {
    if (numPages === 0) return;
    setRange({ first: 1, last: Math.min(numPages, 1 + OVERSCAN) });
  }, [numPages]);

  /** Mounts the pages around a target and scrolls to it. */
  const goToPage = useCallback(
    (page: number) => {
      if (numPages === 0) return;
      const clamped = Math.min(Math.max(1, page), numPages);
      setPageNumber(clamped);
      setRange({
        first: Math.max(1, clamped - OVERSCAN),
        last: Math.min(numPages, clamped + OVERSCAN),
      });
      void navigation.scrollToPage(clamped, { align: 'start' });
    },
    [navigation, numPages]
  );

  // ─── External navigation (page chips / deep links) ────────────────────────

  // A single authority for externally-driven navigation. Keeping the citation
  // jump and the plain page jump in one effect is what stops them racing: a chip
  // click changes `activePage` *and* the nonce, and two independent effects
  // would issue two scrolls, the second undoing the first.
  const citationRef = useRef(citation);
  citationRef.current = citation;

  // The Find bar mirrors every citation click: opened, populated, and run
  // automatically, so a chip click reads the same as a manually-typed search.
  const findRef = useRef(find);
  findRef.current = find;

  const lastNavRef = useRef<{ nonce: number; page: number }>({ nonce: -1, page: -1 });

  useEffect(() => {
    if (numPages === 0) return;
    const nonce = highlightNonce ?? 0;
    const previous = lastNavRef.current;

    if (nonce !== previous.nonce && searchText && searchPage) {
      lastNavRef.current = { nonce, page: searchPage };
      setPageNumber(searchPage);
      setRange({
        first: Math.max(1, searchPage - OVERSCAN),
        last: Math.min(numPages, searchPage + OVERSCAN),
      });
      void citationRef.current.highlight({
        value: searchText,
        page: searchPage,
        contextHints,
      });
      // Populate + open the Find bar so the query is visible, but don't run
      // a document-wide search here — that would highlight every occurrence
      // of the value instead of just the one exact citation match.
      setFindOpen(true);
      setFindInput(searchText);
      return;
    }

    if (activePage && activePage !== previous.page) {
      lastNavRef.current = { nonce, page: activePage };
      goToPage(activePage);
    }
  }, [activePage, contextHints, goToPage, highlightNonce, numPages, searchPage, searchText]);

  // Report the outcome so the parent can show a "not found on this page" note.
  const citationStatus = citation.status;
  useEffect(() => {
    if (citationStatus === 'found') {
      onHighlightResult?.(true);
    } else if (citationStatus === 'not-found') {
      onHighlightResult?.(false);
      // The precise, disambiguated citation match failed — fall back to the
      // Find bar's plain literal search automatically, rather than leaving the
      // query sitting there populated but unrun until the user clicks Search.
      if (searchText) findRef.current.search(searchText, searchPage ?? undefined);
    }
  }, [citationStatus, onHighlightResult, searchText, searchPage]);

  // The fallback search above resolves asynchronously — if it turns up a match
  // after the citation was reported "not found", correct that signal instead of
  // leaving the parent's "couldn't find" banner up despite a visible highlight.
  const findMatchCount = find.matches.length;
  useEffect(() => {
    if (citationStatus === 'not-found' && findMatchCount > 0) onHighlightResult?.(true);
  }, [citationStatus, findMatchCount, onHighlightResult]);

  // Clearing the citation from the parent must clear the drawn highlight and
  // the mirrored Find bar too.
  const citationClear = citation.clear;
  useEffect(() => {
    if (!searchText) {
      citationClear();
      findRef.current.clear();
      setFindOpen(false);
      setFindInput('');
    }
  }, [searchText, citationClear]);

  // ─── Toolbar actions ─────────────────────────────────────────────────────

  const manualNav = useCallback(
    (page: number) => {
      goToPage(page);
      onClearHighlight?.();
    },
    [goToPage, onClearHighlight]
  );

  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  const download = () => {
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = title || 'document.pdf';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.click();
  };

  /**
   * Turns the current text selection into persistent marks.
   *
   * Selection rectangles are converted to page fractions against the page
   * element that contains them, so a user-drawn highlight survives zoom and
   * rotation on exactly the same terms as a search highlight.
   */
  const captureSelectionHighlight = useCallback(() => {
    if (!highlighterOn) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const byPage = new Map<number, NormalizedRect[]>();

    for (let index = 0; index < selection.rangeCount; index++) {
      for (const rect of selection.getRangeAt(index).getClientRects()) {
        if (rect.width < 1 || rect.height < 1) continue;
        const centreX = rect.left + rect.width / 2;
        const centreY = rect.top + rect.height / 2;

        for (const handle of spanMapper.getHandles()) {
          const bounds = handle.pageElement.getBoundingClientRect();
          if (centreX < bounds.left || centreX > bounds.right) continue;
          if (centreY < bounds.top || centreY > bounds.bottom) continue;

          const list = byPage.get(handle.pageNumber) ?? [];
          list.push({
            x: (rect.left - bounds.left) / bounds.width,
            y: (rect.top - bounds.top) / bounds.height,
            w: rect.width / bounds.width,
            h: rect.height / bounds.height,
          });
          byPage.set(handle.pageNumber, list);
          break;
        }
      }
    }

    if (byPage.size === 0) return;
    for (const [page, rects] of byPage) highlightActions.addManual(page, rects);
    setHasManualMarks(true);
    selection.removeAllRanges();
  }, [highlightActions, highlighterOn, spanMapper]);

  const clearManualMarks = useCallback(() => {
    highlightActions.clearGroup(HIGHLIGHT_GROUPS.manual);
    setHasManualMarks(false);
  }, [highlightActions]);

  // ─── Find in document ────────────────────────────────────────────────────

  const findClear = find.clear;
  const indexingStart = indexing.start;
  const indexingStop = indexing.stop;

  const toggleFind = useCallback(() => {
    setFindOpen((open) => {
      if (open) {
        findClear();
        setFindInput('');
        indexingStop();
      } else {
        // Warm the whole document in idle time so the first search is instant.
        indexingStart();
      }
      return !open;
    });
  }, [findClear, indexingStart, indexingStop]);

  const submitFind = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = findInput.trim();
    if (!trimmed) return;
    // Enter on an unchanged query steps to the next hit, like every other viewer.
    if (find.query === trimmed && find.matches.length > 0) find.next();
    else find.search(trimmed, pageNumber);
  };

  const findCount =
    find.status === 'searching' && find.matches.length === 0
      ? 'Searching…'
      : find.query
        ? find.matches.length > 0
          ? `${find.activeIndex + 1} / ${find.matches.length}`
          : find.status === 'done'
            ? 'No results'
            : 'Searching…'
        : '';

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-1.5 shadow-sm">
        {/* Page navigation */}
        <div className="flex shrink-0 items-center gap-1 text-slate-600">
          <button
            type="button"
            onClick={() => manualNav(pageNumber - 1)}
            disabled={pageNumber <= 1}
            title="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 text-xs font-medium!">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value)) manualNav(value);
              }}
              className="h-7 w-10 rounded border border-slate-200 bg-slate-50 text-center text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
            />
            <span className="whitespace-nowrap text-slate-500">/ {numPages || '—'}</span>
          </div>
          <button
            type="button"
            onClick={() => manualNav(pageNumber + 1)}
            disabled={numPages > 0 && pageNumber >= numPages}
            title="Next page"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom + rotate + highlighter */}
        <div className="flex shrink-0 items-center gap-1 text-slate-600">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            title="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="ds-caption! w-11 text-center font-mono text-slate-600">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            title="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={rotate}
            title="Rotate"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-100"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setHighlighterOn((on) => !on)}
            title={highlighterOn ? 'Highlighter on — drag to mark text' : 'Highlighter'}
            aria-pressed={highlighterOn}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              highlighterOn ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Highlighter className="h-4 w-4" />
          </button>
          {hasManualMarks && (
            <button
              type="button"
              onClick={clearManualMarks}
              title="Clear my highlights"
              className="flex h-7 w-7 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 text-slate-600">
          <button
            type="button"
            onClick={toggleFind}
            title="Find in document"
            aria-pressed={findOpen}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              findOpen ? 'bg-slate-200 text-slate-800!' : 'hover:bg-slate-100'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={download}
            title="Download"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-100"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpenInNewTab}
            className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold! whitespace-nowrap text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">OPEN IN NEW TAB</span>
          </button>
        </div>
      </div>

      {/* Find bar */}
      {findOpen && (
        <form
          onSubmit={submitFind}
          className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5"
        >
          <div className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={findInput}
              onChange={(event) => setFindInput(event.target.value)}
              placeholder="Find in document…"
              className="w-48 text-xs text-slate-700 outline-none sm:w-64"
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold! whitespace-nowrap text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            Search
          </button>

          <span className="ds-caption! min-w-14 text-slate-500">{findCount}</span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={find.previous}
              disabled={find.matches.length === 0}
              title="Previous match"
              className="flex h-7 w-7 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={find.next}
              disabled={find.matches.length === 0}
              title="Next match"
              className="flex h-7 w-7 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFind}
            title="Close"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Continuous, vertically-scrollable page stack */}
      <div
        ref={attachContainer}
        onScroll={onScroll}
        onMouseUp={captureSelectionHighlight}
        className={`relative flex flex-1 flex-col items-center overflow-auto p-4 ${pageAreaClassName} ${
          highlighterOn ? 'pdf-highlighting cursor-text' : ''
        }`}
      >
        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold! text-slate-700">Unable to display this PDF.</p>
            <button
              type="button"
              onClick={onOpenInNewTab}
              className="rounded border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold! text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
            >
              Open in new tab
            </button>
          </div>
        ) : !pdf || numPages === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <div
              key={page}
              ref={registerPage(page)}
              data-page-number={page}
              className="mb-4 flex justify-center last:mb-0"
              // Reserve the footprint even while the page draws, so a
              // newly-drawn page cannot collapse the layout and shift a scroll
              // target out from under a jump.
              style={{ minHeight: dims.height }}
            >
              {page >= range.first && page <= range.last ? (
                <PdfPage pdf={pdf} pageNumber={page} scale={scale} rotation={rotation} />
              ) : (
                <PdfPagePlaceholder width={dims.width} height={dims.height}>
                  <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                </PdfPagePlaceholder>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
