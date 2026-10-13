'use client';

import React from 'react';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { CategorySection } from './components/CategorySection';
import { deriveTypeLabel } from './components/ZClauseCard';
import { MetricsRow } from './components/MetricsRow';
import type { ZClauseCategoryData } from './types';
import { useZcData, ZClausesProvider } from './ZClausesContext';

// Titles/descriptions the extractor emits for empty/unused clause slots — treat these as
// "no clause" and hide them rather than listing a placeholder card. A clause can carry a
// real title (e.g. "Subcontractor Involvement") while its description is just "Not Used",
// so both fields need the same placeholder check.
const PLACEHOLDER_TEXTS = new Set(['not used', 'not found', 'none found']);
const isPlaceholderText = (text: string): boolean =>
  PLACEHOLDER_TEXTS.has(text.trim().toLowerCase());
const isRealClauseTitle = (title: string): boolean => {
  const t = title.trim();
  return t !== '' && !isPlaceholderText(t);
};

const ZClausesContent: React.FC = () => {
  const { data } = useZcData();
  if (!data) return <NoExtractedDataPanel label="Z-Clauses" />;

  // Map the exact JSON `categories[]` shape onto the card-friendly display shape.
  // `clauseDetails[number]` (when present) overrides the page/description for that clause.
  const categories: ZClauseCategoryData[] = (data.categories ?? [])
    .filter((cat) => !!cat.title)
    .map((cat) => ({
      id: cat.id,
      title: cat.title,
      clauses: cat.clauses
        .filter((clause) => !!clause.number)
        .map((clause) => {
          const detail = data.clauseDetails?.[clause.number];
          const rawPage = detail?.page ?? clause.page;
          const page =
            rawPage != null
              ? Number.isFinite(Number(rawPage))
                ? Number(rawPage)
                : undefined
              : undefined;
          const title = detail?.title ?? clause.title;
          return {
            number: clause.number,
            title: title ?? '',
            description: detail?.description ?? clause.description ?? '',
            typeLabel: deriveTypeLabel(clause),
            refLabel: clause.number,
            page,
            impact: clause.impact ?? undefined,
          };
        })
        .filter((c) => isRealClauseTitle(c.title) && !isPlaceholderText(c.description)),
    }))
    .filter((cat) => cat.clauses.length > 0);

  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {/* TOP SUMMARY METRICS */}
        <MetricsRow />

        {/* CATEGORY SECTIONS */}
        {categories.map((category, index) => (
          <CategorySection key={category.id} category={category} number={String(index + 1)} />
        ))}
      </div>
    </div>
  );
};

export default function ZClausesMetadataDashboard() {
  return (
    <ZClausesProvider>
      <ZClausesContent />
    </ZClausesProvider>
  );
}
