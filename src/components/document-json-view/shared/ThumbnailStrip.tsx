import React from 'react';
import type { DashboardState } from './types';

// ==========================================
// SUB-COMPONENT: THUMBNAIL NAVIGATION STRIP
// ==========================================
export function ThumbnailStrip({
  activePage,
  setActivePage,
}: Pick<DashboardState, 'activePage' | 'setActivePage'>) {
  return (
    <>
      {/* Page 1 Thumb */}
      <button
        type="button"
        onClick={() => setActivePage(1)}
        className={`w-16 shrink-0 rounded bg-white p-1 text-left shadow-sm transition-all ${
          activePage === 1 ? 'border-transparent ring-2 ring-blue-500' : 'border border-slate-200'
        }`}
      >
        <div className="relative flex aspect-[3/4] flex-col overflow-hidden bg-slate-50">
          <div className="h-6 w-full bg-sky-700"></div>
          <div className="space-y-1 p-1">
            <div className="h-1 w-full bg-slate-200"></div>
            <div className="h-1 w-2/3 bg-slate-200"></div>
          </div>
          <span className="ds-micro! absolute right-1 bottom-1 font-bold! text-slate-500">1</span>
        </div>
      </button>

      {/* Page 2 Thumb */}
      <button
        type="button"
        onClick={() => setActivePage(2)}
        className={`w-16 shrink-0 rounded bg-white p-1 text-left shadow-sm transition-all ${
          activePage === 2 ? 'border-transparent ring-2 ring-blue-500' : 'border border-slate-200'
        }`}
      >
        <div className="relative flex aspect-[3/4] flex-col justify-between overflow-hidden bg-slate-50 p-1">
          <div className="flex items-center justify-between">
            <div className="h-2 w-2 rounded-full bg-sky-700"></div>
            <div className="h-1.5 w-6 bg-slate-300"></div>
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full bg-slate-200"></div>
            <div className="h-1 w-1/2 bg-slate-200"></div>
          </div>
          <span className="ds-micro! absolute right-1 bottom-1 font-bold! text-slate-500">2</span>
        </div>
      </button>

      {/* Dummy Thumbs */}
      {[3, 4, 5].map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => setActivePage(page)}
          className={`w-16 shrink-0 rounded bg-white p-1 text-left opacity-60 shadow-sm transition-all hover:opacity-100 ${
            activePage === page ? 'ring-2 ring-blue-500' : 'border border-slate-200'
          }`}
        >
          <div className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-slate-50 p-1">
            <span className="ds-micro! absolute right-1 bottom-1 font-bold! text-slate-500">
              {page}
            </span>
          </div>
        </button>
      ))}
    </>
  );
}
