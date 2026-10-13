'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import type { SiteInfoItem } from '../types';

const isIngested = (status?: string | null) => (status ?? '').trim().toLowerCase() === 'ingested';

interface SurveysSectionProps {
  number: string;
  title: string;
  items: SiteInfoItem[];
}

// --- SURVEYS & REPORTS — REFERENCED DOCUMENTS (status-driven checklist) ---
export const SurveysSection: React.FC<SurveysSectionProps> = ({ number, title, items }) => {
  const visibleItems = items.filter((item) => !!item.label);

  if (visibleItems.length === 0) return null;

  return (
    <section className="space-y-3">
      <DocumentSectionHeader number={number} title={title} />

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {/* Table Rows Checklist */}
        <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
          {visibleItems.map((doc, index) => {
            const ingested = isIngested(doc.status);
            return (
              <div
                key={`${doc.label}-${doc.reference ?? 'no-ref'}-${index}`}
                className="flex items-start justify-between gap-4 p-4 transition duration-150 hover:bg-slate-50/20"
              >
                {/* Left — checkbox + content */}
                <div className="flex items-start gap-3">
                  {ingested && (
                    <div className="pt-0.5">
                      {/* <input
                        type="checkbox"
                        checked={!!checkedDocs[idx]}
                        onChange={() => toggleCheckbox(idx)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-main-p focus:ring-main-p"
                      /> */}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="ds-caption! font-bold! text-slate-900">{doc.label}</span>
                      {doc.reference && (
                        <Info className="h-3.5 w-3.5 cursor-pointer text-slate-700 hover:text-slate-500" />
                      )}
                    </div>
                    {doc.reference && (
                      <span className="ds-micro! font-bold! tracking-wider text-slate-500 uppercase">
                        {doc.reference}
                      </span>
                    )}
                    {doc.value && (
                      <ExpandableText lines={3} className="ds-micro! max-w-2xl text-slate-600">
                        {doc.value}
                      </ExpandableText>
                    )}
                    {doc.details && (
                      <ExpandableText
                        lines={3}
                        className="ds-micro! max-w-2xl font-medium! text-slate-600"
                      >
                        {doc.details}
                      </ExpandableText>
                    )}
                  </div>
                </div>

                {/* Right — page chip + status badge, top-aligned */}
                <div className="flex shrink-0 items-center gap-2 self-start">
                  {ingested ? (
                    <span className="border-badge-success-soft bg-badge-success-soft ds-micro! text-badge-success inline-flex items-center rounded-full border px-2 py-0.5 font-bold! tracking-wide">
                      INGESTED
                    </span>
                  ) : (
                    <span className="border-badge-warning-soft bg-badge-warning-soft ds-micro! text-badge-warning inline-flex items-center rounded-full border px-2 py-0.5 font-bold! tracking-wide uppercase">
                      Awaiting Upload
                    </span>
                  )}

                  <PageChip page={doc.page} searchText={doc.label} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanatory Footnote block */}
        <div className="pt-2 pl-1">
          <p className="ds-micro! leading-relaxed! font-medium! text-slate-500">
            <span className="font-bold! text-amber-500">* Why pointers</span> — each report is a
            document in its own right. These reports are third- party documents... Auspira holds
            each in the knowledge base as the user's own document and summarises it in its own words
            — never reproducing the report text. The PBI resolves when uploaded.
          </p>
        </div>
      </div>
    </section>
  );
};
