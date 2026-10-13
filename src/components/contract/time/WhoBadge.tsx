import type React from 'react';

const BADGE_BASE =
  'ds-micro! inline-flex h-5 items-center justify-center rounded font-extrabold! whitespace-nowrap';

/**
 * Badge appearance per `who` value. `fixedWidth` is for the short codes (PM, CL) which read as
 * chips of equal width rather than text-sized pills.
 */
const WHO_BADGE: Record<string, { label: string; className: string; fixedWidth?: boolean }> = {
  C: { label: 'Contractor acts', className: 'badge-success' },
  Contractor: { label: 'Contractor acts', className: 'badge-success' },
  Subcontractor: { label: 'Subcontractor', className: 'badge-warning' },
  Client: { label: 'Client', className: 'badge-info' },
  PM: { label: 'PM', className: 'badge-accent', fixedWidth: true },
  CL: { label: 'CL', className: 'badge-info', fixedWidth: true },
  EITHER: { label: 'EITHER', className: 'badge-neutral' },
  ADJ: { label: 'ADJ', className: 'badge-info' },
};

/** The WHO column's badge — who the clause puts the onus on. */
export const WhoBadge: React.FC<{ who: string }> = ({ who }) => {
  const badge = WHO_BADGE[who];
  if (!badge) return <span className="font-bold text-slate-700">-</span>;

  return (
    <span className={`${badge.className} ${BADGE_BASE} ${badge.fixedWidth ? 'w-6' : 'px-1.5'}`}>
      {badge.label}
    </span>
  );
};
