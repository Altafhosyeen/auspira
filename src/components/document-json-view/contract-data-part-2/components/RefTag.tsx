import React from 'react';

// --- CUSTOM REFTAG ---
export const RefTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="bg-badge-neutral-soft ds-micro! text-badge-neutral inline-block shrink-0 rounded border border-slate-200 px-2 py-0.5 font-semibold! whitespace-nowrap">
    {text}
  </span>
);
