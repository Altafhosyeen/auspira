'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  HIGHLIGHT_GROUPS,
  isAbortError,
  type Highlight,
  type HighlightInput,
  type NormalizedRect,
  type PageMatch,
} from '@/lib/pdf-highlight';
import { useHighlightEngine } from '../HighlightContext';
import { useSearchIndexContext } from '../SearchIndexProvider';
import { useScrollToPage } from './useScrollToPage';

/**
 * The highlights on one page.
 *
 * Backed by `useSyncExternalStore`, so a page only re-renders when *its own*
 * highlights change. Adding a find result on page 700 does not touch page 12.
 */
export function usePageHighlights(pageNumber: number): readonly Highlight[] {
  const { manager } = useHighlightEngine();
  const getSnapshot = useCallback(
    () => manager.getPageHighlights(pageNumber),
    [manager, pageNumber]
  );
  return useSyncExternalStore(manager.subscribe, getSnapshot, getSnapshot);
}

/** The id of the currently-active highlight, or `null`. */
export function useActiveHighlightId(): string | null {
  const { manager } = useHighlightEngine();
  const getSnapshot = useCallback(() => manager.getSnapshot().activeId, [manager]);
  return useSyncExternalStore(manager.subscribe, getSnapshot, getSnapshot);
}

export interface HighlightActions {
  add: (input: HighlightInput, options?: { activate?: boolean }) => Highlight;
  /** Persists user-drawn rectangles (already in page fractions). */
  addManual: (pageNumber: number, rects: NormalizedRect[], color?: string) => Highlight;
  remove: (id: string) => void;
  clearGroup: (group: string) => void;
  clearAll: () => void;
  setActive: (id: string | null) => void;
}

export function useHighlightActions(): HighlightActions {
  const { manager, renderer } = useHighlightEngine();

  // The engine objects are stable for the viewer's lifetime, so this whole
  // object is created once — callers can safely depend on it.
  return useMemo<HighlightActions>(
    () => ({
      add: (input, options) => manager.add(input, options),

      addManual: (pageNumber, rects, color) =>
        manager.add({ pageNumber, rects, color, group: HIGHLIGHT_GROUPS.manual }),

      remove: (id) => {
        manager.remove(id);
        renderer.invalidateHighlight(id);
      },

      clearGroup: (group) => {
        for (const highlight of manager.getGroup(group)) renderer.invalidateHighlight(highlight.id);
        manager.clearGroup(group);
      },

      clearAll: () => {
        manager.clear();
        renderer.clear();
      },

      setActive: (id) => manager.setActive(id),
    }),
    [manager, renderer]
  );
}

// ─── Citation highlighting ─────────────────────────────────────────────────

export interface CitationRequest {
  /** The value the user clicked, exactly as it appears in the JSON. */
  value: string;
  /** The page the JSON claims it is on. */
  page?: number | null;
  /**
   * Sibling values from the same record. Used to pick the right occurrence when
   * the value appears more than once on the page.
   */
  contextHints?: string[];
  /**
   * Advance to the next occurrence when the same value is clicked again — the
   * behaviour users expect from a citation that matches several rows.
   * Default `true`.
   */
  cycleDuplicates?: boolean;
  /** Scroll the match into view. Default `true`. */
  scroll?: boolean;
}

export type CitationStatus = 'idle' | 'searching' | 'found' | 'not-found';

export interface UseCitationHighlightResult {
  highlight: (request: CitationRequest) => Promise<PageMatch | null>;
  clear: () => void;
  status: CitationStatus;
  match: PageMatch | null;
}

/**
 * The left-panel click handler: resolve a JSON value to a place in the PDF,
 * highlight exactly that place, and bring it into view.
 *
 * Two details worth knowing:
 *
 * - The highlight's id is derived from `page:start-end`, so clicking the same
 *   value twice reuses the cached measurement instead of re-measuring.
 * - Each request supersedes the last through an `AbortController`, so
 *   impatiently clicking five citations in a row leaves you on the fifth, not
 *   on whichever search happened to finish last.
 */
export function useCitationHighlight(): UseCitationHighlightResult {
  const { manager, renderer } = useHighlightEngine();
  const { engine } = useSearchIndexContext();
  const { scrollToHighlight, scrollToPage } = useScrollToPage();

  const [status, setStatus] = useState<CitationStatus>('idle');
  const [match, setMatch] = useState<PageMatch | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  /** Remembers the last request so a repeat click can walk to the next duplicate. */
  const cycleRef = useRef<{ key: string; occurrence: number }>({ key: '', occurrence: 0 });

  useEffect(() => () => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    for (const highlight of manager.getGroup(HIGHLIGHT_GROUPS.citation)) {
      renderer.invalidateHighlight(highlight.id);
    }
    manager.clearGroup(HIGHLIGHT_GROUPS.citation);
    cycleRef.current = { key: '', occurrence: 0 };
    setStatus('idle');
    setMatch(null);
  }, [manager, renderer]);

  const highlight = useCallback(
    async (request: CitationRequest): Promise<PageMatch | null> => {
      const { value, page = null, contextHints, cycleDuplicates = true, scroll = true } = request;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const trimmed = value?.trim() ?? '';
      if (!trimmed) {
        clear();
        return null;
      }

      // A repeat click on the same citation steps to its next occurrence.
      const key = `${page ?? '-'}::${trimmed}`;
      const occurrence =
        cycleDuplicates && cycleRef.current.key === key ? cycleRef.current.occurrence + 1 : 0;
      cycleRef.current = { key, occurrence };

      setStatus('searching');

      // Move to the cited page immediately: the user asked to go there, and
      // waiting for the text search first makes the click feel unresponsive.
      if (scroll && page) void scrollToPage(page, { align: 'start' });

      if (!engine) {
        setStatus('not-found');
        setMatch(null);
        return null;
      }

      try {
        const found = await engine.locate(trimmed, {
          page,
          occurrence,
          contextHints,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return null;

        if (process.env.NODE_ENV !== 'production') {
          // Which rung of the ladder resolved this citation — the first thing
          // to check when a highlight lands on the wrong text.
          console.debug(`[pdf-highlight] citation "${trimmed}" (cited p.${page ?? '?'}) →`, {
            strategy: found?.strategy ?? 'not-found',
            page: found?.pageNumber,
            matchedText: found?.text,
            annotationId: found?.annotationId,
          });
        }

        if (!found) {
          manager.clearGroup(HIGHLIGHT_GROUPS.citation);
          setStatus('not-found');
          setMatch(null);
          return null;
        }

        const id = found.annotationId
          ? `citation-annotation-${found.pageNumber}-${found.annotationId}`
          : `citation-${found.pageNumber}:${found.start}-${found.end}`;
        manager.setGroup(
          HIGHLIGHT_GROUPS.citation,
          [
            {
              id,
              pageNumber: found.pageNumber,
              ranges: found.annotationId ? null : found.ranges,
              annotationId: found.annotationId,
              label: trimmed,
              strategy: found.strategy,
              expandToLine: found.expandToLine,
            },
          ],
          { activateFirst: true }
        );

        setStatus('found');
        setMatch(found);
        if (scroll) void scrollToHighlight(id);
        return found;
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return null;
        setStatus('not-found');
        setMatch(null);
        return null;
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [clear, engine, manager, scrollToHighlight, scrollToPage]
  );

  return useMemo(() => ({ highlight, clear, status, match }), [highlight, clear, status, match]);
}
