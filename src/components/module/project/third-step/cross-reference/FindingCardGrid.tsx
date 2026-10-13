'use client';

import type React from 'react';
import { FindingCard } from './FindingCard';
import { CheckCircleIcon, ErrorCircleIcon, WarningTriangleIcon } from './icons';
import type { Finding } from './types';

interface FindingCardGridProps {
  groups: readonly (readonly [string, Finding[]])[];
  selectedId: string | null;
  resolvedValues: Record<string, string | undefined>;
  emptyText?: React.ReactNode;
  contractRoutes?: Record<string, boolean | undefined>;
  /** Wired up only by the Contract Registry screen — see `FindingCard`. */
  onEmail?: (findingId: string) => void;
  onViewThread?: (findingId: string) => void;
  onViewPmi?: (projectManagerInstructionId: string) => void;
  onView: (findingId: string) => void;
}

export const GROUP_ICON: Record<string, React.FC<{ className?: string }>> = {
  Error: ErrorCircleIcon,
  Errors: ErrorCircleIcon,
  Warning: WarningTriangleIcon,
  Warnings: WarningTriangleIcon,
  Passed: CheckCircleIcon,
  Resolved: CheckCircleIcon,
};

export const GROUP_COLOR: Record<string, string> = {
  Error: 'text-red-600',
  Errors: 'text-red-600',
  Warning: 'text-amber-600',
  Warnings: 'text-amber-600',
  Passed: 'text-emerald-600',
  Resolved: 'text-emerald-600',
};

/** Pluralises a known status label ("Error" -> "Errors"); leaves category labels untouched. */

export const FindingCardGrid: React.FC<FindingCardGridProps> = ({
  groups,
  selectedId,
  resolvedValues,
  emptyText = 'No findings match your filters.',
  contractRoutes,
  onEmail,
  onViewThread,
  onViewPmi,
  onView,
}) => {
  const isEmpty = groups.every(([, items]) => items.length === 0);

  if (isEmpty) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([groupLabel, groupItems]) => {
        if (!groupItems.length) return null;

        return (
          <div key={groupLabel} className="space-y-3">
            {/* <div className={`flex items-center gap-2 font-semibold ${color}`}>
              {Icon ? <Icon className="h-5 w-5" /> : null}
              <span className="ds-body-strong!">{pluralise(groupLabel)}</span>
              <span className="ds-caption! text-slate-500">({groupItems.length})</span>
            </div> */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groupItems.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  resolved={!!(resolvedValues[finding.id] ?? finding.resolvedValue)}
                  selected={finding.id === selectedId}
                  isContractRoute={contractRoutes?.[finding.id] ?? !!finding.isContractRoute}
                  onEmail={onEmail}
                  onViewThread={onViewThread}
                  onViewPmi={onViewPmi}
                  onView={onView}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

FindingCardGrid.displayName = 'FindingCardGrid';
