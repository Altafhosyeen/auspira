'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Cd2ShortScheduleOfCostComponents } from '../types';

const formatRate = (rate: number | null | undefined, unit: string | null | undefined) => {
  const normalizedUnit = unit?.trim() || 'unit';
  if (typeof rate !== 'number' || !Number.isFinite(rate)) return `— / ${normalizedUnit}`;

  return `£${rate.toFixed(2)} / ${normalizedUnit}`;
};

interface PeopleRatesWorkspaceProps {
  peopleRates?: Cd2ShortScheduleOfCostComponents['peopleRates'];
}

// --- PEOPLE COLLAPSIBLE WORKSPACE (within PRICE section) ---
export const PeopleRatesWorkspace: React.FC<PeopleRatesWorkspaceProps> = ({ peopleRates }) => {
  const [showAllPeopleRows, setShowAllPeopleRows] = useState(false);

  if (!peopleRates?.items?.length) return null;

  const rows = peopleRates.items
    .filter((item) => !!item.description)
    .map((item) => ({
      role: item.description,
      hours: item.applicableHours ?? '',
      rateLabel: formatRate(item.rate, item.unit),
    }));

  const uplifts = (peopleRates.uplifts ?? [])
    .filter((u) => !!u.description)
    .map((u) => ({
      desc: u.description,
      hours: u.applicableHours,
      multi: u.multiplier,
    }));

  if (rows.length === 0) return null;

  const note = peopleRates.note;

  const visiblePeopleRates = showAllPeopleRows ? rows : rows.slice(0, 5);

  return (
    <div className="divide-y divide-slate-100">
      <div className="flex w-full items-start justify-between gap-4 p-4 text-left">
        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
          <span className="ds-micro! w-40 shrink-0 pt-1 font-bold! tracking-wider text-slate-900 uppercase">
            People
          </span>
          <div className="space-y-0.5">
            <span className="ds-body-strong! text-text">{rows.length} people · CECA -20%</span>
            <span className="ds-micro! mt-0.5 block text-slate-500">
              Short Schedule of Cost Components — site & offsite rates for compensation events,
              excluding the fee
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-subtle space-y-4 border-t border-slate-100 p-4">
        <div className="border-badge-warning-soft bg-badge-warning-soft rounded border p-2 text-center">
          <span className="ds-micro! font-bold! tracking-wide text-amber-700">
            SITE AND OFFSITE RATES TO APPLY TO COMPENSATION EVENTS — EXCL. THE FEE PERCENTAGE
          </span>
        </div>

        <div className="mx-auto max-w-4xl space-y-1 rounded border border-slate-100 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="ds-micro! mb-2 border-b border-slate-50 pb-1.5 font-bold! tracking-wide text-slate-500 uppercase">
            THE PEOPLE RATES ARE:
          </div>
          <div className="ds-micro! mb-2 grid grid-cols-12 gap-2 border-b border-slate-100 pb-1 font-bold! tracking-wide text-slate-500 uppercase">
            <div className="col-span-6">Description</div>
            <div className="col-span-3 text-right">Applicable</div>
            <div className="col-span-3 text-right">Rate / Unit</div>
          </div>
          {visiblePeopleRates.map((row) => (
            <div
              key={`${row.role}-${row.hours}-${row.rateLabel}`}
              className="ds-micro! grid grid-cols-12 gap-2 border-b border-slate-50 py-1 hover:bg-slate-50/20"
            >
              <div className="col-span-6 font-semibold! text-slate-700">{row.role}</div>
              <div className="col-span-3 text-right text-slate-500">{row.hours}</div>
              <div className="col-span-3 text-right font-bold! text-slate-900">{row.rateLabel}</div>
            </div>
          ))}
        </div>

        {/* Interactive toggle link */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => setShowAllPeopleRows(!showAllPeopleRows)}
            className="ds-micro! mx-auto inline-flex cursor-pointer items-center gap-1 font-semibold! transition hover:text-blue-600!"
          >
            {showAllPeopleRows ? (
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

        {/* Uplifts table */}
        <div className="mx-auto max-w-4xl space-y-1">
          <div className="ds-micro! grid grid-cols-12 gap-2 border-b border-slate-100 pb-1 font-bold! tracking-wide text-slate-500 uppercase">
            <div className="col-span-6">Uplifts</div>
            <div className="col-span-3 text-right">Applicable</div>
            <div className="col-span-3 text-right">Multiplier</div>
          </div>
          {uplifts.map((row) => (
            <div
              key={`${row.desc}-${row.hours}-${row.multi}`}
              className="ds-micro! grid grid-cols-12 gap-2 border-b border-slate-50 py-1"
            >
              <div className="col-span-6 font-semibold! text-slate-700">{row.desc}</div>
              <div className="col-span-3 text-right text-slate-500">{row.hours}</div>
              <div className="col-span-3 text-right font-bold! text-slate-900">{row.multi}</div>
            </div>
          ))}
          {note && <p className="ds-micro! pt-2 font-medium! text-amber-600">{note}</p>}
        </div>
      </div>
    </div>
  );
};
