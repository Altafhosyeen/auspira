import React from 'react';
import { SectionCard } from './SectionCard';
import { CitationTag } from './CitationTag';
import type { KeyDateRow } from './types';

const KeyDateLine: React.FC<{ row: KeyDateRow }> = ({ row }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <span className="ds-body! text-slate-600">{row.label}</span>
    <div className="flex shrink-0 items-center gap-2">
      <span className="ds-body! text-text font-semibold!">{row.value}</span>
      <CitationTag text={row.citation} />
    </div>
  </div>
);

export const KeyDatesSection: React.FC<{ rows: KeyDateRow[] }> = ({ rows }) => (
  <SectionCard number={1} title="Key dates & milestones" badge="Value rows · cited to activity ID">
    <div className="divide-y divide-slate-100">
      {rows.map((row) => (
        // Labels repeat ("Engineer Approval" etc.); the citation is the unique activity ID.
        <KeyDateLine key={`${row.citation}-${row.label}`} row={row} />
      ))}
    </div>
  </SectionCard>
);

KeyDatesSection.displayName = 'KeyDatesSection';
