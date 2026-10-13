import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCocData } from '../ConditionsOfContractContext';
import { isVisibleStatus } from '../../shared/isVisibleStatus';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import { StatusBadge } from './Tags';

// --- SECTION 01: EDITION & AMENDMENTS --- maps to JSON `edition_and_amendments[]`
export const EditionSection: React.FC = () => {
  const { data } = useCocData();
  const rows = (data?.edition_and_amendments ?? []).filter((row) => !!row.value);

  if (rows.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="01" title="EDITION & AMENDMENTS" />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start"
          >
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                {row.label}
              </span>
              <div className="min-w-0">
                <span className="ds-body-strong! text-text">{row.value}</span>
                {row.note && (
                  <ExpandableText
                    lines={3}
                    className="ds-micro! mt-0.5 block max-w-3xl leading-normal! text-slate-600"
                  >
                    {row.note}
                  </ExpandableText>
                )}
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2 self-start">
              {isVisibleStatus(row.status) && <StatusBadge text={row.status.toUpperCase()} />}
              <PageChip page={row.page} searchText={row.value} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
