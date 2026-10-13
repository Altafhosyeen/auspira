import React from 'react';

// --- CUSTOM MINI TAGS ---
export const BlueRefTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="border-badge-info-soft bg-badge-info-soft ds-micro! text-badge-info inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-semibold! tracking-wide whitespace-nowrap">
    <span className="bg-badge-info inline-block h-1.5 w-1.5 rounded-full" />
    {text}
  </span>
);

export const OrangeRefTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="border-badge-warning-soft bg-badge-warning-soft ds-micro! text-badge-warning inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-semibold! tracking-wide whitespace-nowrap">
    <span className="bg-badge-warning inline-block h-1.5 w-1.5 rounded-full" />
    {text}
  </span>
);
