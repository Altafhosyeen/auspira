'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IndexProgress, PageIndex } from '@/lib/pdf-highlight';
import { useSearchIndexContext } from '../SearchIndexProvider';

export interface UsePdfIndexResult {
  index: PageIndex | null;
  loading: boolean;
  error: Error | null;
}

/**
 * The search index for one page.
 *
 * Resolves **synchronously** when the page has been indexed before — which is
 * the common case after the first visit, and is what lets a returning page
 * paint its highlights on the first frame instead of flashing empty for a tick
 * while a promise settles.
 */
export function usePdfIndex(
  pageNumber: number | null,
  options: { enabled?: boolean } = {}
): UsePdfIndexResult {
  const { enabled = true } = options;
  const { index: searchIndex } = useSearchIndexContext();

  // Read the cache during render so a cached page never renders as "loading".
  const cached =
    enabled && searchIndex && pageNumber ? (searchIndex.peekPage(pageNumber) ?? null) : null;

  // Only the async fetch result needs to live in state — everything else is
  // derivable from the current render's props, so it's computed below instead
  // of mirrored into state via an effect.
  const [fetched, setFetched] = useState<{
    pageNumber: number;
    index: PageIndex | null;
    error: Error | null;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !searchIndex || !pageNumber || searchIndex.peekPage(pageNumber)) return;

    let cancelled = false;

    searchIndex
      .getPage(pageNumber)
      .then((pageIndex) => {
        if (!cancelled) setFetched({ pageNumber, index: pageIndex, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFetched({
          pageNumber,
          index: null,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, pageNumber, searchIndex]);

  const fetchedForPage = fetched?.pageNumber === pageNumber ? fetched : null;

  return useMemo<UsePdfIndexResult>(() => {
    if (cached) return { index: cached, loading: false, error: null };
    if (fetchedForPage)
      return { index: fetchedForPage.index, loading: false, error: fetchedForPage.error };
    if (!enabled || !searchIndex || !pageNumber)
      return { index: null, loading: false, error: null };
    return { index: null, loading: true, error: null };
  }, [cached, fetchedForPage, enabled, searchIndex, pageNumber]);
}

/**
 * Pins the visible page range so a background sweep cannot evict the pages the
 * user is actually looking at, and warms the index for the pages just off
 * screen so scrolling into them is instant.
 */
export function usePinnedPages(first: number, last: number): void {
  const { index } = useSearchIndexContext();

  useEffect(() => {
    if (!index) return;
    const pages: number[] = [];
    for (let page = first; page <= last; page++) pages.push(page);
    index.pin(pages);
    index.prefetch(pages);
  }, [index, first, last]);
}

export interface UseDocumentIndexingResult {
  progress: IndexProgress | null;
  running: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Drives a document-wide background index.
 *
 * Worth starting when the find bar opens — the first search then reads entirely
 * from cache — and worth stopping when it closes, so a 1000-page sweep does not
 * keep burning idle time nobody asked for.
 */
export function useDocumentIndexing(): UseDocumentIndexingResult {
  const { index } = useSearchIndexContext();
  const controllerRef = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<IndexProgress | null>(null);
  const [running, setRunning] = useState(false);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (!index || controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunning(true);

    void index
      .indexAll({ signal: controller.signal, onProgress: setProgress })
      .catch(() => {
        /* aborted */
      })
      .finally(() => {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setRunning(false);
        }
      });
  }, [index]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return useMemo(() => ({ progress, running, start, stop }), [progress, running, start, stop]);
}
