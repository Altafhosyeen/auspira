import React from 'react';
import { SectionCard } from './SectionCard';
import type { CriticalPathRow } from './types';

export const CriticalPathSection: React.FC<{ rows: CriticalPathRow[] }> = ({ rows }) => (
  <SectionCard number={2} title="Critical path" badge="Repeating table · driving path">
    <table className="ds-body! w-full">
      <thead>
        <tr className="ds-micro! text-left font-semibold! tracking-wider text-slate-700 uppercase">
          <th className="pb-2 font-semibold">Activity</th>
          <th className="pb-2 font-semibold">Name</th>
          <th className="pb-2 text-right font-semibold">Finish</th>
          <th className="pb-2 text-right font-semibold">Total Float</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr key={row.activityId}>
            <td className="ds-caption! py-2.5 font-mono text-slate-500">{row.activityId}</td>
            <td className="py-2.5 text-slate-700">{row.name}</td>
            <td className="py-2.5 text-right text-slate-600">{row.finish}</td>
            <td className="text-text py-2.5 text-right font-semibold!">{row.totalFloat}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </SectionCard>
);

CriticalPathSection.displayName = 'CriticalPathSection';
