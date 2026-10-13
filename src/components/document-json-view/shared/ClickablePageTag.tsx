'use client';

import React from 'react';
import { useDocumentPage } from './DocumentPageContext';

interface ClickablePageTagProps {
  /** Page number to jump to when clicked. Renders as plain (non-interactive) content when omitted/invalid. */
  page?: number | null;
  children: React.ReactNode;
  className?: string;
  /** Text to highlight in the PDF after jumping to the page. */
  searchText?: string;
  /**
   * Sibling values from the same record (a row label, an adjacent field) that
   * disambiguate `searchText` when it appears more than once on the page —
   * forwarded straight to the PDF highlighter's ranking.
   */
  contextHints?: string[];
}

/**
 * Wraps an existing ref-tag's visual content so it becomes a clickable
 * button that jumps the document viewer to `page`, without changing how
 * any individual document type's tag looks. Renders a plain <span> wrapper
 * (no button semantics) when no valid page is available.
 */
export function ClickablePageTag({
  page,
  children,
  className,
  searchText,
  contextHints,
}: ClickablePageTagProps) {
  const { goToPage } = useDocumentPage();
  const isClickable = typeof page === 'number' && Number.isFinite(page) && page >= 1;

  if (!isClickable) {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => goToPage(page, searchText, contextHints)}
      title={`Go to page ${page}`}
      className={`cursor-pointer transition-opacity hover:opacity-75 ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
