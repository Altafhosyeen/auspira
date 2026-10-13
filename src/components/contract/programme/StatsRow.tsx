import React from 'react';
import type { StatCard } from './types';

const StatCardItem: React.FC<{ stat: StatCard }> = ({ stat }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="ds-micro! font-semibold! tracking-wider text-slate-700 uppercase">{stat.label}</p>
    <p className="ds-heading-3! text-text mt-1.5 font-bold!">{stat.value}</p>
    {stat.note && (
      <p
        className={`ds-caption! mt-0.5 ${stat.noteAccent ? 'font-semibold! text-rose-500' : 'text-slate-700'}`}
      >
        {stat.note}
      </p>
    )}
  </div>
);

export const StatsRow: React.FC<{ stats: StatCard[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {stats.map((stat) => (
      <StatCardItem key={stat.label} stat={stat} />
    ))}
  </div>
);

StatsRow.displayName = 'StatsRow';
