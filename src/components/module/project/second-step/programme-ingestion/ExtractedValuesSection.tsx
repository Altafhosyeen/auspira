import React from 'react';
import { SectionCard } from './SectionCard';
import { CitationTag } from './CitationTag';
import type { ExtractedValueRow } from './types';

const ExtractedValueTile: React.FC<{ row: ExtractedValueRow }> = ({ row }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
    <p className="ds-caption! m-0 font-semibold! tracking-wide text-slate-500 uppercase">
      {row.label}
    </p>
    <p className="ds-body-strong! text-text mt-1 mb-0 break-words">{row.value}</p>
    {(row.page != null || row.reference) && (
      <div className="mt-2 flex items-center gap-1.5">
        {row.page != null && (
          <span className="ds-micro! rounded bg-white px-1.5 py-0.5 font-bold! text-slate-500 shadow-2xs">
            P{row.page}
          </span>
        )}
        {row.reference && <CitationTag text={row.reference} />}
      </div>
    )}
  </div>
);

export const ExtractedValuesSection: React.FC<{ rows: ExtractedValueRow[] }> = ({ rows }) => {
  if (!rows.length) return null;

  return (
    <SectionCard number={5} title="Extracted contract values" badge="Data points found">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <ExtractedValueTile key={row.label} row={row} />
        ))}
      </div>
    </SectionCard>
  );
};

ExtractedValuesSection.displayName = 'ExtractedValuesSection';
