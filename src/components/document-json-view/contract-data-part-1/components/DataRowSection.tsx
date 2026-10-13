import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import type { ContractDataRow } from '../types';
import { DataRow } from './DataRow';

interface DataRowSectionProps {
  number: string;
  title: string;
  rows: ContractDataRow[];
}

/** A row with no pills and no non-empty value carries nothing to show — skip it instead of rendering blank space. Spacer rows are always kept. */
const hasContent = (row: ContractDataRow) =>
  row.isSpacer || (row.pills && row.pills.length > 0) || !!row.value;

// --- SECTION OF STACKED METADATA ROWS ---
export const DataRowSection: React.FC<DataRowSectionProps> = ({ number, title, rows }) => {
  const visibleRows = rows.filter(hasContent);

  if (visibleRows.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number={number} title={title} />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {visibleRows.map((row, index) => (
          <DataRow key={`${row.label}-${index}`} {...row} />
        ))}
      </div>
    </section>
  );
};
