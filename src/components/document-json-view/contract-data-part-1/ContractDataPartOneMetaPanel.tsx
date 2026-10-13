'use client';

import React, { useMemo } from 'react';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { ContractDataPart1Provider, useCd1Data } from './ContractDataPart1Context';
import { DataRowSection } from './components/DataRowSection';
import { MetricsRow } from './components/MetricsRow';
import type { Cd1Category, Cd1Detail, ContractDataRow } from './types';

/** Maps a JSON `Cd1Detail` onto the existing `ContractDataRow` shape DataRow/DataRowSection already render. */
const toRow = (detail: Cd1Detail, isPerson: boolean): ContractDataRow => {
  const page =
    detail.page != null && Number.isFinite(Number(detail.page)) ? Number(detail.page) : undefined;
  // Keep reference text clean — page chip is rendered separately beside it
  const refTagText = detail.reference ?? undefined;

  if (Array.isArray(detail.value)) {
    return { label: detail.label, pills: detail.value, refTagText, refTagPage: page };
  }

  return {
    label: detail.label,
    value: detail.value,
    subtext: detail.description,
    isBlank: !!detail.note,
    badgeText: detail.note ? detail.note.toUpperCase() : undefined,
    refTagText,
    refTagPage: page,
    isPerson,
  };
};

/** Flattens `groups[]` into rows, inserting a label-only spacer row before each group. */
const groupsToRows = (
  groups: NonNullable<Cd1Category['groups']>,
  isPerson: boolean
): ContractDataRow[] =>
  groups.flatMap((group) => [
    { label: group.groupName, isSpacer: true },
    ...group.details.map((detail) => toRow(detail, isPerson)),
  ]);

/** The "People" category gets name/role styling (blue name, plain role line) to
 * match the Key People section on Contract Data Part 2 — matched on id/title
 * since the backend field naming for this category isn't otherwise pinned down. */
const isPeopleCategory = (category: Cd1Category) =>
  category.id.toLowerCase().includes('people') || category.title.toLowerCase().includes('people');

const categoryToRows = (category: Cd1Category): ContractDataRow[] => {
  const isPerson = isPeopleCategory(category);
  return category.groups?.length
    ? groupsToRows(category.groups, isPerson)
    : (category.details ?? []).map((detail) => toRow(detail, isPerson));
};

function ContractDataPartOneContent() {
  const { data } = useCd1Data();

  const categories = useMemo(
    () =>
      (data?.categories ?? []).map((category) => ({
        id: category.id,
        title: category.title,
        rows: categoryToRows(category),
      })),
    [data]
  );

  if (!data) return <NoExtractedDataPanel label="Contract Data Part 1" />;

  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {/* TOP SUMMARY METRICS */}
        <MetricsRow />

        {/* CATEGORIES — rendered generically from the JSON */}
        {categories.map((category, index) => (
          <DataRowSection
            key={category.id}
            number={String(index + 1).padStart(2, '0')}
            title={category.title}
            rows={category.rows}
          />
        ))}
      </div>
    </div>
  );
}

// --- MAIN PANEL PAGE ---
export default function ContractDataPartOneMetaPanel() {
  return (
    <ContractDataPart1Provider>
      <ContractDataPartOneContent />
    </ContractDataPart1Provider>
  );
}
