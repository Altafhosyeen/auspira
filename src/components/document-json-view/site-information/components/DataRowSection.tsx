import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import type { SiteInfoItem } from '../types';
import { DataRow } from './DataRow';

interface DataRowSectionProps {
  number: string;
  title: string;
  rows: SiteInfoItem[];
}

// --- SECTION OF STACKED METADATA ROWS ---
export const DataRowSection: React.FC<DataRowSectionProps> = ({ number, title, rows }) => {
  const visibleRows = rows.filter((row) => !!row.value);

  if (visibleRows.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number={number} title={title} />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {visibleRows.map((row) => (
          <DataRow key={row.label} {...row} />
        ))}
      </div>
    </section>
  );
};
