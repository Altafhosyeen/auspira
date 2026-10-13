'use client';

import React from 'react';
import { useRouter } from 'nextjs-toploader/app';
import type { DashboardState, DocumentMeta } from './types';

interface DashboardHeaderProps extends Pick<DashboardState, 'viewMode' | 'setViewMode'> {
  meta: Pick<DocumentMeta, 'title' | 'subtitle' | 'revision' | 'date'>;
  /** Supporting documents have no metadata panel to toggle — hide the Original/Side by Side switch */
  hideViewModeToggle?: boolean;
}

// ==========================================
// SUB-COMPONENT: DASHBOARD HEADER
// ==========================================
export function DashboardHeader({
  viewMode,
  setViewMode,
  meta,
  hideViewModeToggle = false,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-white px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:py-2.5">
      <div className="flex min-w-0 items-center space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          title="Back"
          className="mr-3! shrink-0 rounded border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div className="shrink-0 rounded border border-blue-200 bg-blue-50 p-1.5">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h1
            className="truncate text-base leading-tight! font-bold! text-slate-900"
            title={meta.title}
          >
            {meta.title}
          </h1>
          <p className="ds-caption! truncate font-bold! tracking-wider text-slate-600 uppercase">
            {meta.subtitle}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:gap-0 sm:space-x-6">
        {/* Toggle Controls */}
        {!hideViewModeToggle && (
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-100 p-1 text-xs font-semibold!">
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`rounded px-3 py-1 transition-colors ${
                viewMode === 'original'
                  ? 'bg-theme-primary cursor-pointer text-white! shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`rounded px-3 py-1 transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-theme-primary cursor-pointer text-white! shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side by Side
            </button>
          </div>
        )}

        <div className="flex items-center rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1">
          <span className="mr-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500"></span>
          <span className="ds-caption! font-bold! tracking-wide text-emerald-700 uppercase">
            Current
          </span>
        </div>

        <div className="xs:block hidden border-l border-slate-200 pl-4 text-left">
          <div className="text-xs font-bold! text-slate-900">{meta.revision}</div>
          <div className="ds-micro! text-slate-500">{meta.date}</div>
        </div>
      </div>
    </header>
  );
}
