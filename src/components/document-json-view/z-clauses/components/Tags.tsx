import React from 'react';

export const StatusTypeLabel: React.FC<{ text: string }> = ({ text }) => (
  <span className="ds-micro! block text-right font-bold! tracking-wider text-slate-500 uppercase">
    {text}
  </span>
);

export const OrangePageTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="border-badge-warning-soft bg-badge-warning-soft ds-micro! text-badge-warning inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-semibold! tracking-wide">
    <span className="bg-badge-warning inline-block h-1.5 w-1.5 rounded-full" />
    {text}
  </span>
);
