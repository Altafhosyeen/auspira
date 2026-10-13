'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { DocumentMeta, ViewMode } from './types';
import { DashboardHeader } from './DashboardHeader';
import { DocumentPageProvider } from './DocumentPageContext';
import { ThumbnailStrip } from './ThumbnailStrip';
import { DocumentViewer, isRemoteFileUrl } from './DocumentViewer';

export interface DocumentReviewLayoutProps {
  /** Document metadata driving the header, cover page & info sheet */
  meta: DocumentMeta;
  /** The document-type-specific metadata/spec panel rendered in the left pane */
  children: React.ReactNode;
  /** Supporting (child) documents have no type-specific metadata panel — show the file full-width only */
  hideMetadataPanel?: boolean;
}

/**
 * Measures the real viewport space available below this element's top edge
 * (e.g. the app header + breadcrumb above it) and returns it as a pixel
 * height. This sidesteps relying on the ancestor chain (antd Layout/Content
 * flex sizing) ever resolving to a definite height — without a concrete
 * height here, the metadata panel and document viewer can't scroll
 * independently and the whole page scrolls as one block instead.
 */
function useAvailableHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const recalculate = () => {
      const top = ref.current?.getBoundingClientRect().top ?? 0;
      setHeight(window.innerHeight - top);
    };

    recalculate();
    window.addEventListener('resize', recalculate);
    return () => window.removeEventListener('resize', recalculate);
  }, []);

  return { ref, height };
}

// ==========================================
// REUSABLE DOCUMENT REVIEW LAYOUT
// Header + Metadata Panel (children) + Thumbnails + Document Viewer
// ==========================================
export function DocumentReviewLayout({
  meta,
  children,
  hideMetadataPanel = false,
}: DocumentReviewLayoutProps) {
  const searchParams = useSearchParams();
  // Open in raw "original" mode when there's no metadata panel, or when the caller asked for it
  // via `?view=original` (e.g. viewing a document whose AI extraction hasn't produced jsonData yet).
  const [viewMode, setViewMode] = useState<ViewMode>(
    hideMetadataPanel || searchParams?.get('view') === 'original' ? 'original' : 'side-by-side'
  );
  const [activePage, setActivePage] = useState<number>(1);
  const [highlightText, setHighlightText] = useState('');
  const [highlightPage, setHighlightPage] = useState<number | null>(null);
  const [highlightContextHints, setHighlightContextHints] = useState<string[] | undefined>(
    undefined
  );
  // Bumped on every chip click — lets the viewer re-navigate and re-centre even
  // when the target page/text are identical to the last click (e.g. the user
  // scrolled away and clicked the same reference again).
  const [highlightNonce, setHighlightNonce] = useState(0);
  const { ref, height } = useAvailableHeight<HTMLDivElement>();

  const showMetadataPanel = !hideMetadataPanel && viewMode === 'side-by-side';

  const pageContextValue = useMemo(
    () => ({
      goToPage: (page: number, searchText?: string, contextHints?: string[]) => {
        if (!Number.isFinite(page) || page < 1) return;
        setViewMode('side-by-side');
        setActivePage(page);
        setHighlightText(searchText ?? '');
        setHighlightPage(searchText ? page : null);
        setHighlightContextHints(contextHints);
        setHighlightNonce((n) => n + 1);
      },
    }),
    []
  );

  // Deep-link support: when another screen navigates here with `?page=` (and an
  // optional `?highlight=` clause text), jump straight to that page and
  // highlight the text — same behaviour as an in-panel citation click. Runs
  // once on mount; the PDF viewer applies the jump as soon as the file loads.
  const didDeepLinkRef = useRef(false);
  useEffect(() => {
    if (didDeepLinkRef.current) return;
    const page = Number(searchParams?.get('page'));
    if (!Number.isFinite(page) || page < 1) return;
    didDeepLinkRef.current = true;
    pageContextValue.goToPage(page, searchParams?.get('highlight') ?? undefined);
  }, [searchParams, pageContextValue]);

  return (
    <div
      ref={ref}
      style={height != null ? { height } : undefined}
      className="document-json-review-root flex min-h-0 flex-col overflow-hidden bg-slate-100 font-sans text-slate-900"
    >
      {/* 1. Main Header */}
      <DashboardHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        meta={meta}
        hideViewModeToggle={hideMetadataPanel}
      />

      {/* Main Dashboard Layout Area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* 2. Left Metadata Spec Panel (document-type specific) */}
        {showMetadataPanel && (
          <aside className="flex min-h-0 w-full flex-col overflow-y-auto border-b border-slate-200 bg-white lg:w-[58%] lg:border-r lg:border-b-0 xl:w-[60%]">
            <DocumentPageProvider value={pageContextValue}>{children}</DocumentPageProvider>
          </aside>
        )}

        {/* 3. Middle Thumbnail Navigation (mock pages only — real PDFs navigate inside the viewer) */}
        {showMetadataPanel && !isRemoteFileUrl(meta.fileUrl) && (
          <aside className="flex w-full shrink-0 flex-row items-center justify-center space-x-3 overflow-x-auto border-b border-slate-200 bg-slate-100 p-3 lg:w-24 lg:flex-col lg:space-y-3 lg:space-x-0 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:py-4">
            <ThumbnailStrip activePage={activePage} setActivePage={setActivePage} />
          </aside>
        )}

        {/* 4. Right Interactive Document View Frame */}
        <section className="relative flex min-h-0 flex-1 flex-col overflow-auto bg-slate-300">
          <DocumentViewer
            activePage={activePage}
            setActivePage={setActivePage}
            meta={meta}
            searchText={highlightText}
            searchPage={highlightPage}
            highlightNonce={highlightNonce}
            contextHints={highlightContextHints}
            onClearHighlight={() => {
              setHighlightText('');
              setHighlightPage(null);
              setHighlightContextHints(undefined);
            }}
          />
        </section>
      </div>
    </div>
  );
}
