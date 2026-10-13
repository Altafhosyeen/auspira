'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCocData } from '../ConditionsOfContractContext';
import { isVisibleStatus } from '../../shared/isVisibleStatus';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import { StatusBadge } from './Tags';

const VISIBLE_COUNT = 6;

// --- SECTION 03: CLAUSE MAP — THE NINE CORE SECTIONS --- maps to JSON `clause_map[]`
export const ClauseMapSection: React.FC = () => {
  const { data } = useCocData();
  const [showAllCoreSections, setShowAllCoreSections] = useState(false);

  const rows = (data?.clause_map ?? []).filter((row) => !!row.name);

  if (rows.length === 0) return null;

  const visibleSections = showAllCoreSections ? rows : rows.slice(0, VISIBLE_COUNT);

  return (
    <section>
      <DocumentSectionHeader number="03" title="CLAUSE MAP — THE NINE CORE SECTIONS" />
      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {/* Grid Table Headers */}
        <div className="ds-micro! mb-2 grid grid-cols-12 gap-2 border-b border-slate-100 px-1 pb-2 font-bold! tracking-wide text-slate-500 uppercase">
          <div className="col-span-1">§</div>
          <div className="col-span-7">Core Section</div>
          <div className="col-span-1 text-center">Clauses</div>
          <div className="col-span-2 text-right">Status</div>
          <div className="col-span-1 text-center">Page</div>
        </div>

        {/* Grid Table Rows */}
        <div className="divide-y divide-slate-100">
          {visibleSections.map((row) => (
            <div
              key={row.section}
              className="ds-caption! grid grid-cols-12 gap-2 px-1 py-3 transition hover:bg-slate-50/20"
            >
              {/* § Number */}
              <div className="col-span-1 self-center font-bold! text-slate-900">{row.section}</div>

              {/* Core Section Name & Description */}
              <div className="col-span-7 space-y-0.5 self-center">
                <h4 className="font-bold! text-slate-900">{row.name}</h4>
                {row.summary && (
                  <ExpandableText
                    lines={2}
                    className="ds-micro! max-w-2xl leading-normal! text-slate-600"
                  >
                    {row.summary}
                  </ExpandableText>
                )}
              </div>

              {/* Clauses range */}
              <div className="col-span-1 self-center text-center font-semibold! text-slate-500">
                {row.clauses}
              </div>

              {/* Status Badge */}
              <div className="col-span-2 flex items-center justify-end">
                {isVisibleStatus(row.status) && <StatusBadge text={row.status.toUpperCase()} />}
              </div>

              {/* Page chip */}
              <div className="col-span-1 flex items-center justify-center">
                <PageChip page={row.page} searchText={row.name} />
              </div>
            </div>
          ))}
        </div>

        {/* Expand / Truncate button */}
        {rows.length > VISIBLE_COUNT && (
          <div className="mt-2 border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAllCoreSections(!showAllCoreSections)}
              className="ds-micro! mx-auto inline-flex cursor-pointer items-center gap-1 font-bold! text-blue-500! transition hover:text-blue-600!"
            >
              {showAllCoreSections ? (
                <>
                  Show less <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Show all {rows.length} <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
