'use client';

import React from 'react';
import { PageChip } from './PageChip';

interface SourcePagesBarProps {
  /** Comma-separated ("1,2,3") or range ("1-13") page string from JSON summary */
  sourcePages?: string | null;
}

/** Expands "1,2,5-8,10" → [1, 2, 5, 6, 7, 8, 10] — handles both formats. */
function parseSourcePages(raw: string): number[] {
  const pages = new Set<number>();
  for (const token of raw.split(',')) {
    const t = token.trim();
    const range = t.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start <= 200) {
        for (let p = start; p <= end; p++) pages.add(p);
      }
    } else {
      const n = Number(t);
      if (Number.isFinite(n) && n >= 1) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function SourcePagesBar({ sourcePages }: SourcePagesBarProps) {
  if (!sourcePages) return null;

  const pages = parseSourcePages(sourcePages);
  if (pages.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
      <span className="ds-micro! shrink-0 font-bold! tracking-wider text-slate-500 uppercase">
        Source pages
      </span>
      <div className="flex flex-wrap gap-1">
        {pages.map((page) => (
          <PageChip key={page} page={page} prefix="" />
        ))}
      </div>
    </div>
  );
}
