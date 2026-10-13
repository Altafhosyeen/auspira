'use client';

import React from 'react';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { SourcePagesBar } from '../shared/SourcePagesBar';
import { DataRowSection } from './components/DataRowSection';
import { MetricsRow } from './components/MetricsRow';
import { SurveysSection } from './components/SurveysSection';
import { useSiteInformationData } from './SiteInformationContext';

/** A section renders as a status checklist (Surveys & Reports style) when every item carries a status. */
const isSurveysSection = (items: { status?: string | null }[]) =>
  items.length > 0 && items.every((item) => !!item.status);

// --- MAIN SITE INFORMATION PANEL PAGE ---
// Renders `data.sections[]` / `data.metrics[]` generically — no section or
// item is hardcoded, so the panel reflects whatever the AI extraction
// produces. Shows an empty state when the document has no jsonData yet.
export default function SiteInformationOfContractMetaPanel() {
  const { data } = useSiteInformationData();

  if (!data) return <NoExtractedDataPanel label="Site Information" />;

  const metrics = data.metrics ?? [];
  const sections = data.sections ?? [];

  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {/* SOURCE PAGES */}
        <SourcePagesBar sourcePages={data.summary?.sourcePages} />

        {/* TOP SUMMARY METRICS */}
        <MetricsRow metrics={metrics} />

        {/* SECTIONS — rendered generically from the JSON */}
        {sections.map((section, index) => {
          const number = String(index + 1).padStart(2, '0');
          return isSurveysSection(section.items) ? (
            <SurveysSection
              key={`${section.title}-${index}-surveys`}
              number={number}
              title={section.title}
              items={section.items}
            />
          ) : (
            <DataRowSection
              key={`${section.title}-${index}-rows`}
              number={number}
              title={section.title}
              rows={section.items}
            />
          );
        })}
      </div>
    </div>
  );
}
