import React from 'react';
import { SectionCard } from '../../shared/SectionCard';
import { CitationTag } from './CitationTag';
import type { ProgressRow } from './types';

const ProgressLine: React.FC<{ row: ProgressRow }> = ({ row }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <span className="ds-body! text-slate-600">{row.label}</span>
    <div className="flex shrink-0 items-center gap-2">
      <span className="ds-body! text-text font-semibold!">{row.value}</span>
      {row.valueAccent && (
        <span className="ds-micro! rounded bg-emerald-50 px-1.5 py-0.5 font-bold! text-emerald-600">
          {row.valueAccent}
        </span>
      )}
      <CitationTag text={row.citation} />
    </div>
  </div>
);

export const ProgressSection: React.FC<{ rows: ProgressRow[] }> = ({ rows }) => (
  <SectionCard number={3} title="Progress & resources" badge="Value rows">
    <div className="divide-y divide-slate-100">
      {rows.map((row) => (
        <ProgressLine key={row.label} row={row} />
      ))}
    </div>
  </SectionCard>
);

ProgressSection.displayName = 'ProgressSection';
