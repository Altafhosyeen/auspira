import React, { useState } from 'react';
import { SectionCard } from '../../shared/SectionCard';
import type { MovedActivityRow } from './types';

export interface MovedActivitiesSectionProps {
  rows: MovedActivityRow[];
  total: number;
  baselineTotal: number;
}

const PREVIEW_COUNT = 4;

export const MovedActivitiesSection: React.FC<MovedActivitiesSectionProps> = ({
  rows,
  total,
  baselineTotal,
}) => {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, PREVIEW_COUNT);
  const hasMore = rows.length > PREVIEW_COUNT;

  return (
    <SectionCard
      number={1}
      title="Moved activities"
      badge={`ranked by finish shift · ${total} of ${baselineTotal}`}
    >
      <table className="ds-body! w-full">
        <thead>
          <tr className="ds-micro! text-left font-semibold! tracking-wider text-slate-700 uppercase">
            <th className="pb-2 font-semibold">Activity</th>
            <th className="pb-2 font-semibold">Name</th>
            <th className="pb-2 text-right font-semibold">Accepted</th>
            <th className="pb-2 text-right font-semibold">Revised</th>
            <th className="pb-2 text-right font-semibold">Shift</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleRows.map((row) => (
            <tr key={row.activityId}>
              <td className="ds-caption! py-2.5 font-mono text-slate-500">{row.activityId}</td>
              <td className="py-2.5 text-slate-700">{row.name}</td>
              <td className="py-2.5 text-right text-slate-500">{row.accepted}</td>
              <td className="py-2.5 text-right text-slate-700">{row.revised}</td>
              <td className="py-2.5 text-right font-semibold! text-rose-500">{row.shift}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          onClick={() => setExpanded((value) => !value)}
          className="ds-caption! mt-3 font-semibold! text-indigo-600 hover:text-indigo-700"
        >
          {expanded ? ' Show less moved activities…' : `Show all ${total} moved activities…`}
        </button>
      )}
    </SectionCard>
  );
};

MovedActivitiesSection.displayName = 'MovedActivitiesSection';
