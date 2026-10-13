import React from 'react';

// --- CUSTOM REFTAG ---
export const RefTag: React.FC<{ text: string }> = ({ text }) => (
  <span className="border-badge-warning-soft bg-badge-warning-soft ds-micro! text-badge-warning inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-semibold! whitespace-nowrap">
    <span className="text-amber-500">*</span>
    {text}
  </span>
);
