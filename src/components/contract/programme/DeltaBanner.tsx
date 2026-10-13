import React from 'react';
import type { DeltaMetric } from './types';

const DELTA_ACCENT_STYLES: Record<NonNullable<DeltaMetric['accent']>, string> = {
  rose: 'text-rose-300',
  amber: 'text-amber-300',
};

const DeltaMetricItem: React.FC<{ metric: DeltaMetric }> = ({ metric }) => (
  <div>
    <p className="ds-micro! font-semibold! tracking-wider text-slate-700 uppercase">
      {metric.label}
    </p>
    <p
      className={`ds-heading-2! mt-1 ${metric.accent ? DELTA_ACCENT_STYLES[metric.accent] : 'text-white'}`}
    >
      {metric.value}
    </p>
    <p className="ds-micro! mt-0.5 text-slate-700">{metric.note}</p>
  </div>
);

export interface DeltaBannerProps {
  fromRevision: string;
  toRevision: string;
  metrics: DeltaMetric[];
}

export const DeltaBanner: React.FC<DeltaBannerProps> = ({ fromRevision, toRevision, metrics }) => (
  <div className="bg-surface-dark! rounded-xl p-5">
    <p className="ds-micro! font-semibold! tracking-wider text-slate-700 uppercase">
      Changes against the accepted programme · {fromRevision} → {toRevision}
    </p>
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <DeltaMetricItem key={metric.label} metric={metric} />
      ))}
    </div>
  </div>
);

DeltaBanner.displayName = 'DeltaBanner';
