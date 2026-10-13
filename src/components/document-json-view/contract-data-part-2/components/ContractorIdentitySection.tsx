import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { PageChip } from '../../shared/PageChip';
import { useCd2Category } from '../ContractDataPart2Context';
import { RefTag } from './RefTag';

// --- SECTION 01: CONTRACTOR IDENTITY --- maps to JSON category `contractorIdentity`
export const ContractorIdentitySection: React.FC = () => {
  const category = useCd2Category('contractorIdentity');

  const rows = (category?.details ?? [])
    .filter((detail) => !!detail.value)
    .map((detail) => {
      const page =
        detail.page != null && Number.isFinite(Number(detail.page))
          ? Number(detail.page)
          : undefined;
      return {
        label: detail.label,
        value: detail.value as string,
        refTagText: detail.reference || undefined,
        refTagPage: page,
      };
    });

  if (rows.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="01" title={category?.title ?? 'Contractor identity'} />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col justify-between gap-2 px-4 py-3 transition hover:bg-slate-50/10 sm:flex-row sm:items-center"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                {row.label}
              </span>
              <span className="ds-caption! font-bold! text-slate-900">{row.value}</span>
            </div>
            {(row.refTagText || row.refTagPage != null) && (
              <div className="flex shrink-0 items-center gap-1.5">
                {row.refTagText && <RefTag text={row.refTagText} />}
                {row.refTagPage != null && (
                  <PageChip page={row.refTagPage} searchText={row.value} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
