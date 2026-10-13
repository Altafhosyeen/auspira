import React from 'react';
import { useFoaData, getCategory, getDetail, detailRefTag } from '../FormOfAgreementContext';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';

const BlueRef: React.FC<{ text: string }> = ({ text }) => (
  <span className="border-badge-info-soft bg-badge-info-soft ds-micro! text-badge-info inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-semibold! tracking-wide whitespace-nowrap">
    <span className="bg-badge-info inline-block h-1.5 w-1.5 rounded-full" />
    {text}
  </span>
);

// --- SECTION 04: EXECUTION --- maps to JSON category `execution`
export const ExecutionSection: React.FC = () => {
  const { data } = useFoaData();
  const cat = getCategory(data, 'execution');

  if (!cat) return null;

  const rows = [
    { label: 'Manner', detail: getDetail(cat, 'Manner') },
    { label: 'Date', detail: getDetail(cat, 'Date') },
    { label: 'Signatures', detail: getDetail(cat, 'Signatures') },
  ].filter((row) => row.detail);

  if (rows.length === 0) return null;

  return (
    <section className="space-y-3">
      {cat.title?.trim() && <DocumentSectionHeader number="04" title={cat.title} />}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {rows.map(({ label, detail }) => {
          const value = typeof detail?.value === 'string' ? detail.value : undefined;
          const isBlank = detail?.status === 'blank' || value === 'Not provided' || !value;
          const { page } = detailRefTag(detail, '');
          const ref = detail?.reference?.trim() || null;

          return (
            <div
              key={label}
              className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-center"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
                <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                  {label}
                </span>
                <div>
                  {isBlank ? (
                    <div className="flex items-center gap-2">
                      <span className="ds-caption! font-semibold! text-slate-500">{value}</span>
                    </div>
                  ) : (
                    <>
                      <span className="ds-caption! block font-bold! text-slate-900">{value}</span>
                      {detail?.description && (
                        <ExpandableText lines={3} className="ds-caption! mt-1 block text-slate-600">
                          {detail.description}
                        </ExpandableText>
                      )}
                    </>
                  )}
                </div>
              </div>
              {(ref || page != null) && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {ref && <BlueRef text={ref} />}
                  <PageChip page={page} searchText={value} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
