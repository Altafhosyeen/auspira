'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { NormalizedRect, ScrollOptions } from '@/lib/pdf-highlight';
import { useHighlightEngine } from '../HighlightContext';

export interface UseScrollToPageResult {
  /** Attach to the scrollable page container. */
  setContainer: (element: HTMLElement | null) => void;
  /** Attach to each page wrapper so navigation can find it. */
  registerPage: (pageNumber: number, element: HTMLElement | null) => void;
  scrollToPage: (pageNumber: number, options?: ScrollOptions) => Promise<boolean>;
  scrollToRect: (
    pageNumber: number,
    rect: NormalizedRect,
    options?: ScrollOptions
  ) => Promise<boolean>;
  /**
   * Scrolls to a highlight, waiting for its geometry if the page has not
   * finished rendering yet.
   */
  scrollToHighlight: (highlightId: string, options?: ScrollOptions) => Promise<boolean>;
  /** The page occupying most of the viewport right now. */
  getMostVisiblePage: () => number | null;
  cancel: () => void;
}

/** How long to wait for a target page to render and report its geometry. */
const GEOMETRY_TIMEOUT_MS = 2500;

export function useScrollToPage(): UseScrollToPageResult {
  const { navigation, renderer, manager } = useHighlightEngine();

  useEffect(() => () => navigation.cancel(), [navigation]);

  const setContainer = useCallback(
    (element: HTMLElement | null) => navigation.setContainer(element),
    [navigation]
  );

  const registerPage = useCallback(
    (pageNumber: number, element: HTMLElement | null) =>
      navigation.registerPage(pageNumber, element),
    [navigation]
  );

  const scrollToPage = useCallback(
    (pageNumber: number, options?: ScrollOptions) => navigation.scrollToPage(pageNumber, options),
    [navigation]
  );

  const scrollToRect = useCallback(
    (pageNumber: number, rect: NormalizedRect, options?: ScrollOptions) =>
      navigation.scrollToRect(pageNumber, rect, options),
    [navigation]
  );

  /**
   * Two-phase navigation, which is what keeps a jump from looking like a glitch.
   *
   * Phase one moves to the page — the target may not even be mounted yet, so
   * there is nothing more precise to aim at. Phase two waits for the highlight
   * to be measured, then makes a short, smooth correction that puts the matched
   * text at a comfortable reading position. Doing it in one phase would either
   * scroll to a stale position or sit still until rendering finished.
   */
  const scrollToHighlight = useCallback(
    async (highlightId: string, options?: ScrollOptions): Promise<boolean> => {
      const highlight = manager.getById(highlightId);
      if (!highlight) return false;

      await navigation.scrollToPage(highlight.pageNumber, {
        align: 'start',
        ...options,
        behavior: options?.behavior,
      });

      const bounds = await waitForGeometry(renderer, highlightId);
      if (!bounds) return false;

      return navigation.scrollToRect(highlight.pageNumber, bounds, {
        align: 'reading',
        behavior: 'smooth',
        ...options,
      });
    },
    [manager, navigation, renderer]
  );

  const getMostVisiblePage = useCallback(() => navigation.getMostVisiblePage(), [navigation]);
  const cancel = useCallback(() => navigation.cancel(), [navigation]);

  // Memoised so the returned object is referentially stable. Callers put these
  // in `useCallback`/`useEffect` dependency lists, and a fresh object literal
  // every render would invalidate every one of them on every render.
  return useMemo(
    () => ({
      setContainer,
      registerPage,
      scrollToPage,
      scrollToRect,
      scrollToHighlight,
      getMostVisiblePage,
      cancel,
    }),
    [
      cancel,
      getMostVisiblePage,
      registerPage,
      scrollToHighlight,
      scrollToPage,
      scrollToRect,
      setContainer,
    ]
  );
}

/**
 * Resolves with a highlight's bounding box once it has been measured.
 *
 * Checks the cache at every rotation first (a returning page is usually already
 * measured), then falls back to listening for the renderer's next emission.
 */
function waitForGeometry(
  renderer: ReturnType<typeof useHighlightEngine>['renderer'],
  highlightId: string
): Promise<NormalizedRect | null> {
  for (const rotation of [0, 90, 180, 270]) {
    const cached = renderer.peek(highlightId, rotation);
    if (cached?.bounds) return Promise.resolve(cached.bounds);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (bounds: NormalizedRect | null) => {
      if (settled) return;
      settled = true;
      unsubscribe();
      clearTimeout(timer);
      resolve(bounds);
    };

    const unsubscribe = renderer.subscribe((rendered) => {
      if (rendered.highlightId === highlightId) finish(rendered.bounds);
    });

    const timer = setTimeout(() => finish(null), GEOMETRY_TIMEOUT_MS);
  });
}
