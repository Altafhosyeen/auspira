import React from 'react';
import type { HsqeDetail } from '../types';
import { DataRow } from './DataRow';

interface DataRowSectionProps {
  rows: HsqeDetail[];
  /** Extra spacing wrapper + optional content rendered after the rows card (e.g. a callout). */
  footer?: React.ReactNode;
}

// --- SECTION OF STACKED METADATA ROWS ---
export const DataRowSection: React.FC<DataRowSectionProps> = ({ rows, footer }) => {
  const visibleRows = rows.filter((row) => !!row.key);

  if (visibleRows.length === 0) return null;

  return (
    <div className={`mt-3 ${footer ? 'space-y-3' : ''}`}>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {visibleRows.map((row) => (
          <DataRow key={row.label} row={row} />
        ))}
      </div>
      {footer}
    </div>
  );
};
