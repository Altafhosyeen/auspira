'use client';

import React, { createContext, use, useEffect, useState } from 'react';
import {
  PDFSearchIndex,
  SearchEngine,
  type PdfDocumentProxy,
  type TextNormalizer,
} from '@/lib/pdf-highlight';

/**
 * Binds one {@link PDFSearchIndex} (and its {@link SearchEngine}) to the
 * currently-open document.
 *
 * The index is the cache that makes the second click on a page free, so its
 * lifetime is exactly the document's: created when a `PDFDocumentProxy`
 * arrives, destroyed when it is replaced or the viewer unmounts. Keeping it in
 * state rather than a memo is what makes that destruction safe under
 * StrictMode — the effect's cleanup tears the old index down and the next run
 * builds a fresh one, instead of leaving the tree holding a destroyed object.
 */
export interface SearchIndexContextValue {
  index: PDFSearchIndex | null;
  engine: SearchEngine | null;
  numPages: number;
}

const EMPTY: SearchIndexContextValue = { index: null, engine: null, numPages: 0 };

const SearchIndexContext = createContext<SearchIndexContextValue>(EMPTY);

export interface SearchIndexProviderProps {
  /** The loaded document, or `null` while it loads. */
  pdf: PdfDocumentProxy | null;
  /** Override normalisation (case sensitivity, punctuation policy, …). */
  normalizer?: TextNormalizer;
  /**
   * Index the whole document in idle time as soon as it opens. Worth enabling
   * for documents users search heavily; leave off for very large files, where
   * on-demand indexing of the pages actually touched is far cheaper.
   */
  eagerIndex?: boolean;
  children: React.ReactNode;
}

export function SearchIndexProvider({
  pdf,
  normalizer,
  eagerIndex = false,
  children,
}: SearchIndexProviderProps) {
  const [value, setValue] = useState<SearchIndexContextValue>(EMPTY);

  useEffect(() => {
    if (!pdf) {
      // Not derived state: `value` holds imperative resources (index/engine)
      // that must be constructed/destroyed here, so this mirrors their
      // teardown rather than a prop that could be read during render.
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setValue(EMPTY);
      return;
    }

    const index = new PDFSearchIndex(pdf, { normalizer });
    const engine = new SearchEngine(index, normalizer ?? index.normalizer);
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setValue({ index, engine, numPages: pdf.numPages });

    return () => {
      index.destroy();
      setValue(EMPTY);
    };
  }, [pdf, normalizer]);

  const index = value.index;
  useEffect(() => {
    if (!eagerIndex || !index) return;
    const controller = new AbortController();
    void index.indexAll({ signal: controller.signal }).catch(() => {
      /* aborted or unreadable — on-demand indexing still covers every page */
    });
    return () => controller.abort();
  }, [eagerIndex, index]);

  return <SearchIndexContext value={value}>{children}</SearchIndexContext>;
}

export function useSearchIndexContext(): SearchIndexContextValue {
  return use(SearchIndexContext);
}
