import React from 'react';

interface EmptyMetadataPanelProps {
  /** Document type label shown in the placeholder, e.g. "Conditions of Contract" */
  label: string;
}

// ==========================================
// PLACEHOLDER METADATA PANEL
// Used by document types whose metadata panel content is not built yet.
// ==========================================
export function EmptyMetadataPanel({ label }: EmptyMetadataPanelProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </span>
      <h2 className="heading-card">{label}</h2>
      <p className="text-xs font-medium text-slate-500">Metadata panel coming soon</p>
    </div>
  );
}
