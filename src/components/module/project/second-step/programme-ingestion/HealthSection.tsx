import React from 'react';
import { SectionCard } from './SectionCard';
import { CitationTag } from './CitationTag';
import type { HealthAlert } from './types';

const SEVERITY_STYLES: Record<
  HealthAlert['severity'],
  { card: string; dot: string; title: string; badge: string; label: string }
> = {
  critical: {
    card: 'border-rose-100 bg-rose-50',
    dot: 'bg-rose-500',
    title: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    label: 'Critical',
  },
  warning: {
    card: 'border-amber-100 bg-amber-50',
    dot: 'bg-amber-500',
    title: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Warning',
  },
};

const HealthAlertCard: React.FC<{ alert: HealthAlert }> = ({ alert }) => {
  const styles = SEVERITY_STYLES[alert.severity];
  // References can be a comma-joined list — render each activity ID as its own tag.
  const references = alert.citation
    ? alert.citation
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  return (
    <div className={`rounded-lg border p-3.5 ${styles.card}`}>
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={`ds-body-strong! ${styles.title}`}>{alert.title}</p>
            <span
              className={`ds-micro! shrink-0 rounded-full px-2 py-0.5 font-extrabold! tracking-wider uppercase ${styles.badge}`}
            >
              {styles.label}
            </span>
          </div>
          <p className="ds-caption! mt-1 text-slate-600">{alert.description}</p>
          {references.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {references.map((ref) => (
                <CitationTag key={ref} text={ref} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HealthSection: React.FC<{ alerts: HealthAlert[] }> = ({ alerts }) => (
  <SectionCard
    number={4}
    title="Programme health & reconciliation"
    badge="Auto-raised · for onboarding review"
  >
    <div className="space-y-3">
      {alerts.map((alert) => (
        <HealthAlertCard key={alert.title} alert={alert} />
      ))}
    </div>
  </SectionCard>
);

HealthSection.displayName = 'HealthSection';
