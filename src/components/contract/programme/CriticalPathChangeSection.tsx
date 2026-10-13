import React from 'react';
import { SectionCard } from '../../shared/SectionCard';
import { CitationTag } from './CitationTag';
import type { CriticalPathChangeCount, CriticalPathChangeCounts } from './types';

const CriticalPathChangeRow: React.FC<{ label: string; data: CriticalPathChangeCount }> = ({
  label,
  data,
}) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <span className="ds-body! text-slate-600">{label}</span>
    <div className="flex shrink-0 items-center gap-2">
      <span className="ds-body! text-text font-semibold!">
        {data.count} {data.note}
      </span>
      <CitationTag text={data.citation} />
    </div>
  </div>
);

export const CriticalPathChangeSection: React.FC<{ counts: CriticalPathChangeCounts }> = ({
  counts,
}) => (
  <SectionCard number={3} title="Critical path change" badge="6 → 43 driving-path activities">
    <div className="divide-y divide-slate-100">
      <CriticalPathChangeRow label="Newly critical" data={counts.newlyCritical} />
      <CriticalPathChangeRow label="Still critical" data={counts.stillCritical} />
      <CriticalPathChangeRow label="No longer critical" data={counts.noLongerCritical} />
    </div>
  </SectionCard>
);

CriticalPathChangeSection.displayName = 'CriticalPathChangeSection';
