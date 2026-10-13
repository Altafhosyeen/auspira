import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useHsqeData } from '../HsqeContext';

// --- SECTION 05: WHAT THIS DOCUMENT DOES IN THE CONTRACT --- maps to JSON `contract_functions[]`
export const ContractFunctionsSection: React.FC = () => {
  const { data } = useHsqeData();

  const rows = (data?.contract_functions ?? [])
    .filter((fn) => !!fn.audience && !!fn.role_description)
    .map((fn) => ({
      label: fn.audience,
      value: fn.role_description,
    }));

  if (rows.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="05" title="What this document does in the contract" />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 px-4 py-4 transition duration-150 hover:bg-slate-50/20 sm:flex-row sm:items-start sm:gap-12"
          >
            <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
              {row.label}
            </span>
            <span className="ds-caption! block max-w-3xl leading-normal! font-bold! text-slate-900">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
