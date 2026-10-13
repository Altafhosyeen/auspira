import React from 'react';
import type { BadgeProps } from './types';

// ==========================================
// REUSABLE BADGE COMPONENT
// ==========================================
export function RefBadge({ type, label, page }: BadgeProps) {
  let bgClass = '';
  let dotColor = '';

  switch (type) {
    case 'perf':
      bgClass = 'bg-amber-100 text-amber-800 border border-amber-200';
      dotColor = 'text-amber-500';
      break;
    case 'wi':
      bgClass = 'bg-blue-50 text-blue-700 border border-blue-200';
      dotColor = 'text-blue-500';
      break;
    case 'override':
      bgClass = 'bg-amber-500 text-white font-bold!';
      dotColor = 'text-white';
      break;
    case 'status-queued':
      bgClass = 'bg-blue-50 text-blue-600 border border-blue-200 font-bold!';
      break;
    case 'status-ingested':
      bgClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold!';
      break;
  }

  return (
    <div className="inline-flex shrink-0 items-center gap-1.5">
      <span
        className={`ds-micro! inline-flex items-center gap-1 rounded px-1.5 py-0.5 tracking-wider uppercase ${bgClass}`}
      >
        {dotColor && <span className={`ds-caption! leading-none! ${dotColor}`}>✦</span>}
        {label}
      </span>
      {page && <span className="ds-micro! font-bold! text-slate-500 uppercase">{page}</span>}
    </div>
  );
}
