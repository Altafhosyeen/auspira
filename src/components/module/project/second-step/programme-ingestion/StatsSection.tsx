import React from 'react';
import { SectionCard } from './SectionCard';
import type { StatRow } from './types';

const StatTile: React.FC<{ stat: StatRow }> = ({ stat }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
    <p className="ds-caption! m-0 font-semibold! tracking-wide text-slate-500 uppercase">
      {stat.label}
    </p>
    <p className="ds-heading-2! text-text mt-1 mb-0">{stat.value}</p>
    {stat.note && (
      <p
        className={`ds-caption! mt-1 mb-0 ${stat.noteAccent ? 'font-semibold! text-rose-600' : 'text-slate-500'}`}
      >
        {stat.note}
      </p>
    )}
  </div>
);

export const StatsSection: React.FC<{ stats?: StatRow[] }> = ({ stats }) => {
  if (!stats?.length) return null;

  return (
    <SectionCard title="Programme overview" badge="Summary stats">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} stat={stat} />
        ))}
      </div>
    </SectionCard>
  );
};

StatsSection.displayName = 'StatsSection';
