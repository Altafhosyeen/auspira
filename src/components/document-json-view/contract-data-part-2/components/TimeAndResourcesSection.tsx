import React from 'react';
import { PageChip } from '../../shared/PageChip';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCd2Category } from '../ContractDataPart2Context';
import { RefTag } from './RefTag';
import { ExpandableText } from '../../shared/ExpandableText';

// --- SECTION 05: TIME & RESOURCES --- maps to JSON category `timeAndResources` (no static fallback — JSON-only section)
export const TimeAndResourcesSection: React.FC = () => {
  const category = useCd2Category('timeAndResources');
  const details = category?.details ?? [];

  if (details.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="05" title={category?.title ?? 'Time & resources'} />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {details.map((detail) => {
          const page =
            detail.page != null && Number.isFinite(Number(detail.page))
              ? Number(detail.page)
              : undefined;
          const refTagText = detail.reference || undefined;

          return (
            <div
              key={detail.label}
              className="flex flex-col justify-between gap-2 px-4 py-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
                <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                  {detail.label}
                </span>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {detail.value && (
                      <span className="ds-caption! font-bold! text-slate-900">{detail.value}</span>
                    )}
                    {detail.status && (
                      <span className="ds-micro! rounded bg-slate-100 px-1.5 py-0.5 font-bold! tracking-wider text-slate-500 uppercase">
                        {detail.status}
                      </span>
                    )}
                  </div>
                  {detail.description && (
                    <ExpandableText
                      lines={3}
                      className="ds-micro! max-w-2xl leading-normal! text-slate-600"
                    >
                      {detail.description}
                    </ExpandableText>
                  )}
                  {detail.items && detail.items.length > 0 && (
                    <ul className="space-y-1 pl-0.5">
                      {detail.items.map((item) => (
                        <li
                          key={item}
                          className="ds-micro! flex items-start gap-2 leading-relaxed! text-slate-600"
                        >
                          <span className="ds-micro! mt-0.75 shrink-0 leading-none! text-amber-500">
                            ◆
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {(refTagText || page != null) && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {refTagText && <RefTag text={refTagText} />}
                  {page != null && <PageChip page={page} searchText={detail.value} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
