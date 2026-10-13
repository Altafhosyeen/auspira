import React from 'react';
import { PageChip } from '../../shared/PageChip';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCd2Category } from '../ContractDataPart2Context';
import type { Cd2Detail } from '../types';
import { RefTag } from './RefTag';
import { ExpandableText } from '../../shared/ExpandableText';

function toPage(raw: number | string | null | undefined): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function refText(detail: Cd2Detail) {
  return detail.reference || undefined;
}

// --- SECTION 02: KEY PEOPLE --- maps to JSON category `keyPeople`
export const KeyPeopleSection: React.FC = () => {
  const category = useCd2Category('keyPeople');
  const details = (category?.details ?? []).filter((d) => !!d.name || !!d.value);

  if (details.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="02" title={category?.title ?? 'Key people'} />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex flex-col justify-between gap-3 px-4 py-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-1 font-bold! tracking-wider text-slate-900 uppercase">
                {detail.label}
              </span>
              <div className="space-y-1">
                {detail.name ? (
                  <div className="space-y-0.5">
                    <h4 className="ds-caption! text-main-p font-bold!">{detail.name}</h4>
                    {detail.role && (
                      <p className="ds-micro! font-semibold! tracking-wide text-slate-500 uppercase">
                        {detail.role}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="ds-caption! font-bold! text-slate-900">{detail.value}</span>
                    {detail.status && (
                      <span className="ds-micro! rounded bg-slate-100 px-1.5 py-0.5 font-bold! tracking-wider text-slate-500 uppercase">
                        {detail.status}
                      </span>
                    )}
                  </div>
                )}
                {detail.description && (
                  <ExpandableText
                    lines={3}
                    className="ds-micro! max-w-2xl leading-normal! text-slate-600"
                  >
                    {detail.description}
                  </ExpandableText>
                )}
              </div>
            </div>
            {(refText(detail) || toPage(detail.page) != null) && (
              <div className="flex shrink-0 items-center gap-1.5">
                {refText(detail) && <RefTag text={refText(detail)!} />}
                {toPage(detail.page) != null && (
                  <PageChip
                    page={toPage(detail.page)!}
                    searchText={
                      detail.name ?? (typeof detail.value === 'string' ? detail.value : undefined)
                    }
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
