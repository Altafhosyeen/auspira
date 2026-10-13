import React, { useState } from 'react';
import { SectionCard } from '../../shared/SectionCard';
import type { AddedActivityRow } from './types';

const ADDED_TYPE_STYLES: Record<NonNullable<AddedActivityRow['typeAccent']>, string> = {
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-500',
};

export interface AddedActivitiesSectionProps {
  rows: AddedActivityRow[];
  total: number;
  summary: string;
}

const PREVIEW_COUNT = 6;

export const AddedActivitiesSection: React.FC<AddedActivitiesSectionProps> = ({
  rows,
  total,
  summary,
}) => {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, PREVIEW_COUNT);
  const hasMore = rows.length > PREVIEW_COUNT;

  return (
    <SectionCard
      number={2}
      title="Added activities"
      badge={`${total} added · split by contractual reason`}
    >
      <table className="ds-body! w-full">
        <thead>
          <tr className="ds-micro! text-left font-semibold! tracking-wider text-slate-700 uppercase">
            <th className="pb-2 font-semibold">Activity</th>
            <th className="pb-2 font-semibold">Name</th>
            <th className="pb-2 text-right font-semibold">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleRows.map((row) => (
            <tr key={row.activityId}>
              <td className="ds-caption! py-2.5 font-mono text-slate-500">{row.activityId}</td>
              <td className="py-2.5 text-slate-700">{row.name}</td>
              <td className="py-2.5 text-right">
                <span
                  className={`ds-micro! rounded px-1.5 py-0.5 font-bold! tracking-wide ${
                    row.typeAccent
                      ? ADDED_TYPE_STYLES[row.typeAccent]
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {row.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          onClick={() => setExpanded((value) => !value)}
          className="ds-caption! mt-3 font-semibold! text-indigo-600 hover:text-indigo-700"
        >
          {expanded ? ' Show less added activities…' : `Show all ${total} added — ${summary}…`}
        </button>
      )}
    </SectionCard>
  );
};

AddedActivitiesSection.displayName = 'AddedActivitiesSection';
