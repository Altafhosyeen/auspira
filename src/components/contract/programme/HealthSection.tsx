import React from 'react';
import { SectionCard } from '../../shared/SectionCard';
import { CitationTag } from './CitationTag';
import type { HealthAlert, HealthSeverity } from './types';

const HEALTH_SEVERITY_STYLES: Record<HealthSeverity, { card: string; dot: string; title: string }> =
  {
    critical: { card: 'border-rose-100 bg-rose-50', dot: 'bg-rose-500', title: 'text-rose-700' },
    warning: { card: 'border-amber-100 bg-amber-50', dot: 'bg-amber-500', title: 'text-amber-700' },
  };

const HealthAlertCard: React.FC<{ alert: HealthAlert }> = ({ alert }) => {
  const styles = HEALTH_SEVERITY_STYLES[alert.severity];
  return (
    <div className={`rounded-lg border p-3.5 ${styles.card}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={`ds-body-strong! ${styles.title}`}>{alert.title}</p>
            <CitationTag text={alert.citation} />
          </div>
          <p className="ds-caption! mt-1 text-slate-600">{alert.description}</p>
        </div>
      </div>
    </div>
  );
};

export interface HealthSectionProps {
  alerts: HealthAlert[];
  badge?: string;
}

export const HealthSection: React.FC<HealthSectionProps> = ({
  alerts,
  badge = 'Auto-raised · for onboarding review',
}) => (
  <SectionCard number={4} title="Programme health & reconciliation" badge={badge}>
    <div className="space-y-3">
      {alerts.map((alert) => (
        <HealthAlertCard key={alert.title} alert={alert} />
      ))}
    </div>
  </SectionCard>
);

HealthSection.displayName = 'HealthSection';
