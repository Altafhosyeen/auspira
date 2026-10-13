import React from 'react';
import type { ProgrammeMeta } from './types';

const MetaChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="ds-caption! inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium! text-slate-500">
    <span className="font-semibold! text-slate-700 uppercase">{label}</span>
    {value}
  </span>
);

export const ProgrammeMetaHeader: React.FC<{ meta: ProgrammeMeta }> = ({ meta }) => {
  // Nothing worth showing if the backend returned an empty identity block.
  if (!meta.name && !meta.type && !meta.programmeId) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {meta.name && (
          <h3 className="ds-body-large! text-text m-0 font-bold! tracking-tight">{meta.name}</h3>
        )}
        {meta.type && (
          <span className="ds-caption! rounded-md bg-emerald-50 px-2 py-0.5 font-bold! tracking-wide text-emerald-600 uppercase">
            {meta.type}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {meta.programmeId && <MetaChip label="ID" value={meta.programmeId} />}
        {meta.revision && <MetaChip label="Rev" value={meta.revision} />}
        {meta.status && <MetaChip label="Status" value={meta.status} />}
      </div>
    </div>
  );
};

ProgrammeMetaHeader.displayName = 'ProgrammeMetaHeader';
