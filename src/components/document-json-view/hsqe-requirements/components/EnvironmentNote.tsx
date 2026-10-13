import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';

interface EnvironmentNoteProps {
  /** Expanded pollution-prevention controls from the JSON (`environment.pollution_prevention_expanded_controls`) */
  expandedControls?: string[] | null;
}

// --- ENVIRONMENT SECTION — EXPANDED POLLUTION-PREVENTION CONTROLS ---
export const EnvironmentNote: React.FC<EnvironmentNoteProps> = ({ expandedControls }) => {
  const visibleControls = (expandedControls ?? []).filter((c) => !!c);

  if (visibleControls.length === 0) return null;

  return (
    <section className="space-y-2">
      <DocumentSectionHeader number="1" title="Pollution prevention — expanded controls" />
      <div className="divide-y divide-slate-100 overflow-hidden rounded border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        {visibleControls.map((control, idx) => (
          <div
            key={control}
            className="flex flex-col gap-1 px-4 py-4 transition duration-150 hover:bg-slate-50/20 sm:flex-row sm:items-start sm:gap-12"
          >
            <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
              Control {idx + 1}
            </span>
            <span className="ds-caption! block leading-normal! font-bold! text-slate-900">
              {control}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
