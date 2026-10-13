import React from 'react';

export const RefTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="bg-badge-neutral-soft ds-micro! inline-block shrink-0 rounded border border-slate-200 px-2 py-0.5 font-semibold! whitespace-nowrap text-slate-500">
    {text}
  </span>
);

// --- STATUS BADGE (e.g. ● CONFIRMED / PRESENT) ---
export const StatusBadge: React.FC<{ text: string | undefined }> = ({ text }) => (
  <span className="border-badge-success-soft bg-badge-success-soft ds-micro! text-badge-success inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-bold! tracking-wide">
    <span className="bg-badge-success inline-block h-1.5 w-1.5 rounded-full" />
    {text}
  </span>
);
