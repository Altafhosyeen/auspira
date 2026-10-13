import React from 'react';
import type { DashboardState, DocumentMeta } from './types';

type DocumentFallbackPageProps = Pick<DashboardState, 'activePage'> &
  Pick<DocumentMeta, 'totalPages'>;

// ==========================================
// SUB-COMPONENT: FALLBACK INNER DOCUMENT PAGE (PAGES > 2)
// ==========================================
export function DocumentFallbackPage({ activePage, totalPages }: DocumentFallbackPageProps) {
  return (
    <div className="flex aspect-[1/1.414] w-full flex-col justify-between rounded bg-white p-6 shadow-xl sm:p-12">
      <div className="flex flex-1 flex-col items-center justify-center text-slate-700">
        <svg
          className="mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-xs font-semibold! text-slate-500 sm:text-sm">
          Page {activePage} content template mockup
        </p>
      </div>
      <div className="ds-micro! sm:ds-micro! border-t border-slate-100 pt-3 text-right text-slate-500 sm:pt-4">
        <span>
          Page {activePage} of {totalPages}
        </span>
      </div>
    </div>
  );
}
