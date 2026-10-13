import React from 'react';
import { PageChip } from '../shared/PageChip';
import type { JsonCitation } from './types';

const typeStyles = {
  perf: 'bg-amber-100 text-amber-800 border border-amber-200',
  wi: 'bg-blue-50 text-blue-700 border border-blue-200',
};
const dotStyles = {
  perf: 'text-amber-500',
  wi: 'text-blue-500',
};

export function CitationBadge({
  citation,
  searchText,
}: {
  citation: JsonCitation;
  searchText?: string;
}) {
  const type = citation.document === 'perf' ? 'perf' : 'wi';
  const page = Number.isFinite(Number(citation.page)) ? Number(citation.page) : null;

  return (
    <div className="inline-flex shrink-0 items-center gap-1.5">
      <span
        className={`ds-micro! inline-flex items-center gap-1 rounded px-1.5 py-0.5 tracking-wider uppercase ${typeStyles[type]}`}
      >
        <span className={`ds-caption! leading-none! ${dotStyles[type]}`}>✦</span>
        {citation.reference}
      </span>
      <PageChip page={page} searchText={searchText} />
    </div>
  );
}
