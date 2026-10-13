'use client';

import React from 'react';
import { CheckCircle2, GitBranch, History, Mail, PencilLine } from 'lucide-react';
import { parseBackendDate } from '@/lib/utils';
import type { AuditTrailEntry } from './types';

interface AuditTrailTimelineProps {
  entries: AuditTrailEntry[];
  loading?: boolean;
}

/** Turns "VerificationEmailSent" into "Verification Email Sent" — the API sends no display label. */
const humanizeActionType = (actionType: string): string =>
  actionType.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

/** Formats an ISO timestamp as `24 Jun 2026 - 10:31 AM`. */
const formatTimestamp = (iso: string) => {
  const date = parseBackendDate(iso);
  if (!date) return '';
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    date
  );
  return `${datePart} - ${timePart}`;
};

/** Icon + tone per action-type keyword, first match wins; falls back to a neutral history glyph. */
const ACTION_META: { match: RegExp; icon: typeof Mail; bg: string; fg: string }[] = [
  { match: /email/i, icon: Mail, bg: 'bg-violet-50', fg: 'text-violet-600' },
  { match: /resolve/i, icon: CheckCircle2, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  { match: /route/i, icon: GitBranch, bg: 'bg-amber-50', fg: 'text-amber-600' },
  { match: /value/i, icon: PencilLine, bg: 'bg-blue-50', fg: 'text-blue-600' },
];
const DEFAULT_ACTION_META = { icon: History, bg: 'bg-slate-100', fg: 'text-slate-500' };

const getActionMeta = (actionType: string) =>
  ACTION_META.find((meta) => meta.match.test(actionType)) ?? DEFAULT_ACTION_META;

/** Loading placeholder — mirrors the shape of two timeline rows. */
const AuditTrailSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[0, 1].map((i) => (
      <div key={i} className="flex animate-pulse gap-3">
        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-3 w-1/3 rounded bg-slate-100" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Vertical activity timeline for a cross-reference's audit trail. The connecting
 * rail is a flex-grown column (icon + `flex-1` line) rather than an absolutely
 * positioned line with a hardcoded height, so it always matches each row's real
 * rendered height regardless of how much detail text a given entry has.
 */
export const AuditTrailTimeline: React.FC<AuditTrailTimelineProps> = ({
  entries,
  loading = false,
}) => {
  if (loading) return <AuditTrailSkeleton />;

  if (entries.length === 0) {
    return <p className="ds-caption! mb-0! text-slate-400">No activity recorded yet.</p>;
  }

  return (
    <div>
      {entries.map((entry, i) => {
        const meta = getActionMeta(entry.actionType);
        const Icon = meta.icon;
        const isLast = i === entries.length - 1;
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.fg}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {!isLast && <span className="mt-1 w-px flex-1 bg-slate-200" />}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-4'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p className="ds-caption! mb-0! font-bold! text-slate-800">
                  {humanizeActionType(entry.actionType)}
                </p>
                <p className="ds-micro! mb-0! shrink-0 font-medium! text-slate-400">
                  {formatTimestamp(entry.createdOn)}
                </p>
              </div>

              <p className="ds-micro! mt-0.5 mb-0! font-semibold! text-slate-500">
                {entry.performedByUserFullName}
              </p>

              {entry.details && (
                <p className="ds-caption! mt-1 mb-0! font-medium! whitespace-pre-line text-slate-600">
                  {entry.details}
                </p>
              )}

              {(entry.previousValue || entry.newValue) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {entry.previousValue && (
                    <span className="ds-micro! rounded-md bg-slate-100 px-2 py-0.5 font-semibold! text-slate-500 line-through">
                      {entry.previousValue}
                    </span>
                  )}
                  {entry.newValue && (
                    <span className="ds-micro! rounded-md bg-emerald-50 px-2 py-0.5 font-semibold! text-emerald-700">
                      {entry.newValue}
                    </span>
                  )}
                </div>
              )}

              {entry.recipientEmail && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1">
                  <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="ds-micro! font-semibold! text-slate-600">
                    {entry.recipientEmail}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

AuditTrailTimeline.displayName = 'AuditTrailTimeline';
