import React from 'react';

// --- REF TAG (LIGHT GRAY MINI CAPSULE) ---
export const RefTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="bg-badge-neutral-soft ds-micro! inline-block shrink-0 rounded border border-slate-200/60 px-2 py-0.5 font-semibold! whitespace-nowrap text-slate-500">
    {text}
  </span>
);
