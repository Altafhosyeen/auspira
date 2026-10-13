import React from 'react';
import { SectionCard } from './SectionCard';
import type { ComparisonSummary } from './types';

/** Signed delta with red/green tint — positive slips are bad, negative (earlier/fewer) are good. */
const DeltaTile: React.FC<{ label: string; value: number; unit?: string }> = ({
  label,
  value,
  unit,
}) => {
  const tone = value > 0 ? 'text-rose-600' : value < 0 ? 'text-emerald-600' : 'text-text';
  const sign = value > 0 ? '+' : '';
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <p className="ds-caption! m-0 font-semibold! tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className={`ds-heading-2! mt-1 mb-0 ${tone}`}>
        {sign}
        {value}
        {unit ? ` ${unit}` : ''}
      </p>
    </div>
  );
};

export const ComparisonSection: React.FC<{ comparison: ComparisonSummary | null }> = ({
  comparison,
}) => {
  if (!comparison) return null;

  return (
    <SectionCard number={6} title="Baseline comparison" badge="Change summary">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <DeltaTile label="Completion" value={comparison.completionDeltaDays} unit="d" />
        <DeltaTile label="Critical Path" value={comparison.criticalPathDelta} unit="d" />
        <DeltaTile label="Added" value={comparison.activitiesAdded} />
        <DeltaTile label="Removed" value={comparison.activitiesRemoved} />
        <DeltaTile label="Moved" value={comparison.activitiesMoved} />
      </div>
    </SectionCard>
  );
};

ComparisonSection.displayName = 'ComparisonSection';
