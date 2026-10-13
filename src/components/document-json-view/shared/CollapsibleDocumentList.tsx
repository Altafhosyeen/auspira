'use client';

import React, { useState } from 'react';

interface CollapsibleDocumentListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Rows shown before the "See more" toggle appears. */
  initialCount?: number;
  /** Wrapper class for the rendered rows (the bordered/divided list container). */
  listClassName?: string;
}

/**
 * Caps a document/plan row list to `initialCount` rows with a "See more (N)" /
 * "See less" toggle once there are more — used by the document-json-view
 * "referenced documents/plans" sections so a long list doesn't dump every row
 * on screen at once.
 */
export function CollapsibleDocumentList<T>({
  items,
  renderItem,
  initialCount = 3,
  listClassName = 'divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
}: CollapsibleDocumentListProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > initialCount;
  const visibleItems = expanded ? items : items.slice(0, initialCount);

  return (
    <div className={listClassName}>
      {visibleItems.map(renderItem)}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ds-micro! block w-full px-4 py-2.5 text-center font-semibold! text-blue-500! transition hover:bg-slate-50/30 hover:underline"
        >
          {expanded ? 'See less' : `See more (${items.length - initialCount})`}
        </button>
      )}
    </div>
  );
}

CollapsibleDocumentList.displayName = 'CollapsibleDocumentList';
