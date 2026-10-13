import React from 'react';
import { useCd2Data } from '../ContractDataPart2Context';
import { MetricCard } from './MetricCard';

// --- TOP SUMMARY METRICS ---
export const MetricsRow: React.FC = () => {
  const { data } = useCd2Data();
  const metrics = (data?.metrics ?? []).filter((m) => !!m.label && !!String(m.value ?? ''));

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={String(metric.value)} />
      ))}
    </div>
  );
};
