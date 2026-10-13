import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { FileText } from 'lucide-react';
import { useCocData } from '../ConditionsOfContractContext';
import { isVisibleStatus } from '../../shared/isVisibleStatus';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';

// --- SECTION 04: DEPARTURES FROM THE PUBLISHED TEXT --- maps to JSON `departures`
export const DeparturesSection: React.FC = () => {
  const { data } = useCocData();
  const departures = data?.departures;
  const zClauses = departures?.z_clauses;

  if (!departures) return null;

  return (
    <section>
      <DocumentSectionHeader number="04" title="DEPARTURES FROM THE PUBLISHED TEXT" />
      <div className="mt-3 space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {/* Inline Amendments metadata row */}
        {departures.inline_amendments && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Inline Amendments
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="ds-caption! font-bold! text-slate-900">
                    {departures.inline_amendments}
                  </span>
                </div>
                {departures.note && (
                  <ExpandableText lines={3} className="ds-micro! mt-0.5 block text-slate-600">
                    {departures.note}
                  </ExpandableText>
                )}
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5 self-start">
              <PageChip page={departures.page} searchText={departures.inline_amendments} />
            </div>
          </div>
        )}

        {/* Soft Blue Z-Clauses callout card */}
        {zClauses && (
          <div className="border-badge-info-soft bg-badge-info-soft flex flex-col justify-between gap-4 rounded-lg border p-4 transition sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="border-badge-info-soft text-badge-info shrink-0 rounded border bg-white p-2 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="ds-caption! text-main-p font-bold!">
                  {zClauses.range
                    ? `Z-clauses / Amendments (${zClauses.range})`
                    : 'Z-clauses / Amendments'}
                </h4>
                {zClauses.description && (
                  <ExpandableText
                    lines={3}
                    className="ds-micro! mt-0.5 block leading-normal! text-slate-600"
                  >
                    {zClauses.description}
                  </ExpandableText>
                )}
              </div>
            </div>
            {isVisibleStatus(zClauses.status) && (
              <span className="ds-micro! self-start rounded border border-slate-200 bg-slate-100 px-2.5 py-1 font-bold! tracking-wider text-slate-500 uppercase sm:self-center">
                {zClauses.status}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
