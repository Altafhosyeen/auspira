'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Cd2ShortScheduleOfCostComponents } from '../types';

const formatCurrency = (rate: number | null | undefined) => {
  if (typeof rate !== 'number' || !Number.isFinite(rate)) return '—';

  return `£${rate.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface PlantRatesWorkspaceProps {
  equipmentOtherRates?: Cd2ShortScheduleOfCostComponents['equipmentOtherRates'];
  designOutsideWorkingAreas?: Cd2ShortScheduleOfCostComponents['designOutsideWorkingAreas'];
}

// --- PLANT & DESIGN RATES COLLAPSIBLE WORKSPACE (within PRICE section) ---
export const PlantRatesWorkspace: React.FC<PlantRatesWorkspaceProps> = ({
  equipmentOtherRates,
  designOutsideWorkingAreas,
}) => {
  const [showAllPlantRows, setShowAllPlantRows] = useState(false);

  const plantRows = (equipmentOtherRates?.items ?? [])
    .filter((item) => !!item.description)
    .map((item) => ({
      item: item.description,
      rate: formatCurrency(item.rate),
      unit: item.unit,
    }));

  const designRows = (designOutsideWorkingAreas?.items ?? [])
    .filter((item) => !!item.role)
    .map((item) => ({
      role: item.role,
      rate: formatCurrency(item.rate),
      unit: item.unit,
    }));

  if (plantRows.length === 0 && designRows.length === 0) return null;

  const designNote = designOutsideWorkingAreas?.note;

  const visiblePlantRates = showAllPlantRows ? plantRows : plantRows.slice(0, 5);

  return (
    <div className="divide-y divide-slate-100">
      <div className="flex w-full items-start justify-between gap-4 p-4 text-left">
        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
          <span className="ds-micro! w-40 shrink-0 pt-1 font-bold! tracking-wider text-slate-900 uppercase">
            Plant Rates
          </span>
          <div className="space-y-0.5">
            <span className="ds-body-strong! text-text">
              {plantRows.length} plant · {designRows.length} design
            </span>
            <span className="ds-micro! mt-0.5 block text-slate-500">
              Short Schedule of Cost Components — site & offsite rates for compensation events,
              excluding the fee
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-subtle space-y-4 border-t border-slate-100 p-4">
        {plantRows.length > 0 && (
          <>
            <div className="ds-micro! mb-2 border-b border-slate-100 font-bold! tracking-wide text-slate-500 uppercase">
              THE RATES FOR OTHER EQUIPMENT ARE:
            </div>

            <div className="mx-auto max-w-4xl space-y-1 rounded border border-slate-100 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <div className="ds-micro! mb-2 grid grid-cols-12 gap-2 border-b border-slate-100 pb-1 font-bold! tracking-wide text-slate-500 uppercase">
                <div className="col-span-6">
                  Rates for other equipment (excluding operator unless stated)
                </div>
                <div className="col-span-3 text-right">Rate</div>
                <div className="col-span-3 text-right">Unit</div>
              </div>
              {visiblePlantRates.map((row) => (
                <div
                  key={`${row.item}-${row.rate}-${row.unit}`}
                  className="ds-micro! grid grid-cols-12 gap-2 border-b border-slate-50 py-1 hover:bg-slate-50/20"
                >
                  <div className="col-span-6 font-semibold! text-slate-700">{row.item}</div>
                  <div className="col-span-3 text-right font-bold! text-slate-900">{row.rate}</div>
                  <div className="col-span-3 text-right font-medium! text-slate-500">
                    {row.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive toggle link */}
            {plantRows.length > 5 && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllPlantRows(!showAllPlantRows)}
                  className="ds-micro! mx-auto inline-flex cursor-pointer items-center gap-1 font-semibold! text-blue-500! transition hover:text-blue-600!"
                >
                  {showAllPlantRows ? (
                    <>
                      Show less <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Design rates outside working areas */}
        {designRows.length > 0 && (
          <div className="mx-auto max-w-4xl space-y-1">
            <div className="ds-micro! mt-4 mb-2 border-b border-slate-100 font-bold! tracking-wide text-slate-500 uppercase">
              THE RATES FOR DEFINED COST OF DESIGN OUTSIDE THE WORKING AREAS ARE:
            </div>
            <div className="ds-micro! mb-2 grid grid-cols-12 gap-2 border-b border-slate-100 pb-1 font-bold! tracking-wide text-slate-500 uppercase">
              <div className="col-span-6">Rates for Design Outside the Working Areas</div>
              <div className="col-span-3 text-right">Rate</div>
              <div className="col-span-3 text-right">Unit</div>
            </div>
            {designRows.map((row) => (
              <div
                key={`${row.role}-${row.rate}-${row.unit}`}
                className="ds-micro! grid grid-cols-12 gap-2 border-b border-slate-50 py-1"
              >
                <div className="col-span-6 font-semibold! text-slate-700">{row.role}</div>
                <div className="col-span-3 text-right font-bold! text-slate-900">{row.rate}</div>
                <div className="col-span-3 text-right font-medium! text-slate-500">{row.unit}</div>
              </div>
            ))}
            {designNote && (
              <p className="ds-micro! pt-2 leading-relaxed! font-medium! text-slate-500">
                {designNote}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
