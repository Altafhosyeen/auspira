import React from 'react';

// Small labelled stat card used in the Option Source overview panel.
export const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex min-h-[76px] flex-col justify-between rounded border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
    <span className="ds-micro! font-bold! tracking-wider text-slate-500 uppercase">{label}</span>
    <div className="text-main-p mt-1 text-sm font-bold!">{value}</div>
  </div>
);
