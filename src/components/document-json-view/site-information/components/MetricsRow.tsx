import React from 'react';
import type { SiteInfoMetric } from '../types';
import { MetricCard } from './MetricCard';

// --- TOP SUMMARY METRICS ---
export const MetricsRow: React.FC<{ metrics: SiteInfoMetric[] }> = ({ metrics }) => {
  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </div>
  );
};
