import React from 'react';
import { useFoaData } from '../FormOfAgreementContext';
import { MetricCard } from './MetricCard';

export const MetricsRow: React.FC = () => {
  const { data } = useFoaData();

  const metrics = (data?.metrics ?? []).map((m) => ({ label: m.label, value: m.value }));

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </div>
  );
};
