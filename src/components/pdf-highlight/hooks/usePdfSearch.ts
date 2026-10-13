'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_ACTIVE_COLOR,
  DEFAULT_HIGHLIGHT_COLOR,
  HIGHLIGHT_GROUPS,
  isAbortError,
  type PageMatch,
} from '@/lib/pdf-highlight';
import { useHighlightEngine } from '../HighlightContext';
import { useSearchIndexContext } from '../SearchIndexProvider';
import { useScrollToPage } from './useScrollToPage';

export type SearchStatus = 'idle' | 'searching' | 'done';

export interface UsePdfSearchResult {
  query: string;
  matches: PageMatch[];
  activeIndex: number;
  activeMatch: PageMatch | null;
  status: SearchStatus;
  progress: { scanned: number; total: number };
  /**
   * Runs a document-wide search, superseding any search already running.
   * `fromPage` starts the sweep at the current view so the first hit found is
   * the next one below the reader.
   */
  search: (query: string, fromPage?: number) => void;
  next: () => void;
  previous: () => void;
  clear: () => void;
}

export interface UsePdfSearchOptions {
  /** Where to begin the sweep, so results start below the current view. */
  startPage?: number;
  /** Scroll each newly-activated match into view. Default `true`. */
  scrollToActive?: boolean;
}

/**
 * Deterministic per-match id.
 *
 * Progressive results mean the highlight group is rewritten after every chunk.
 * Deriving the id from the match's coordinates keeps it stable across those
 * rewrites, so already-measured matches stay in the renderer's cache instead of
 * being re-measured — and, visually, they stay put instead of blinking.
 */
function matchId(match: PageMatch): string {
  return match.annotationId
    ? `find-annotation-${match.pageNumber}-${match.annotationId}`
    : `find-${match.pageNumber}:${match.start}-${match.end}`;
}

/** Find-in-document: every occurrence, ordered by page, one of them active. */
export function usePdfSearch(options: UsePdfSearchOptions = {}): UsePdfSearchResult {
  const { startPage = 1, scrollToActive = true } = options;
  const { engine, numPages } = useSearchIndexContext();
  const { manager, renderer } = useHighlightEngine();
  const { scrollToHighlight } = useScrollToPage();

  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<PageMatch[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [progress, setProgress] = useState({ scanned: 0, total: 0 });

  const abortRef = useRef<AbortController | null>(null);
  const activatedRef = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    activatedRef.current = false;
    for (const highlight of manager.getGroup(HIGHLIGHT_GROUPS.find)) {
      renderer.invalidateHighlight(highlight.id);
    }
    manager.clearGroup(HIGHLIGHT_GROUPS.find);
    setQuery('');
    setMatches([]);
    setActiveIndex(-1);
    setStatus('idle');
    setProgress({ scanned: 0, total: 0 });
  }, [manager, renderer]);

  const search = useCallback(
    (nextQuery: string, fromPage?: number) => {
      abortRef.current?.abort();
      activatedRef.current = false;

      const trimmed = nextQuery.trim();
      setQuery(trimmed);
      setMatches([]);
      setActiveIndex(-1);
      setProgress({ scanned: 0, total: numPages });

      if (!engine || !trimmed) {
        manager.clearGroup(HIGHLIGHT_GROUPS.find);
        setStatus('idle');
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus('searching');

      const prepared = engine.prepare(trimmed, { literal: true });
      void engine
        .searchDocument(prepared, {
          literal: true,
          signal: controller.signal,
          startPage: fromPage ?? startPage,
          onProgress: (found, scanned, total) => {
            if (controller.signal.aborted) return;
            setMatches(found);
            setProgress({ scanned, total });
            if (!activatedRef.current && found.length > 0) {
              activatedRef.current = true;
              setActiveIndex(0);
            }
          },
        })
        .then((found) => {
          if (controller.signal.aborted) return;
          setMatches(found);
          setStatus('done');
          if (!activatedRef.current && found.length > 0) {
            activatedRef.current = true;
            setActiveIndex(0);
          }
        })
        .catch((error: unknown) => {
          if (isAbortError(error) || controller.signal.aborted) return;
          setStatus('done');
        })
        .finally(() => {
          if (abortRef.current === controller) abortRef.current = null;
        });
    },
    [engine, manager, numPages, startPage]
  );

  // Publish results to the highlight store. Every hit is drawn in the base
  // colour; the active one is re-drawn on top in the accent colour.
  useEffect(() => {
    if (matches.length === 0) {
      manager.clearGroup(HIGHLIGHT_GROUPS.find);
      return;
    }
    manager.setGroup(
      HIGHLIGHT_GROUPS.find,
      matches.map((match) => ({
        id: matchId(match),
        pageNumber: match.pageNumber,
        ranges: match.annotationId ? null : match.ranges,
        annotationId: match.annotationId,
        color: DEFAULT_HIGHLIGHT_COLOR,
        activeColor: DEFAULT_ACTIVE_COLOR,
        strategy: match.strategy,
        expandToLine: false,
        label: match.text,
      })),
      { activeIndex: activeIndex >= 0 ? activeIndex : undefined }
    );
  }, [manager, matches, activeIndex]);

  // Bring the active match into view whenever it changes.
  const activeMatch = activeIndex >= 0 ? (matches[activeIndex] ?? null) : null;
  const activeId = activeMatch ? matchId(activeMatch) : null;

  useEffect(() => {
    if (!activeId || !scrollToActive) return;
    void scrollToHighlight(activeId);
  }, [activeId, scrollToActive, scrollToHighlight]);

  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (matches.length === 0) return -1;
        const base = current < 0 ? 0 : current;
        return (base + delta + matches.length) % matches.length;
      });
    },
    [matches.length]
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  return useMemo(
    () => ({
      query,
      matches,
      activeIndex,
      activeMatch,
      status,
      progress,
      search,
      next,
      previous,
      clear,
    }),
    [query, matches, activeIndex, activeMatch, status, progress, search, next, previous, clear]
  );
}
