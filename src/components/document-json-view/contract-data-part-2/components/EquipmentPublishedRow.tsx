import React from 'react';
import type { Cd2ShortScheduleOfCostComponents } from '../types';

interface EquipmentPublishedRowProps {
  hoverClass?: string;
  equipmentPublishedList?: Cd2ShortScheduleOfCostComponents['equipmentPublishedList'];
}

// --- "EQUIPMENT — PUBLISHED LIST" BASELINE ROW (repeated in PRICE section) ---
export const EquipmentPublishedRow: React.FC<EquipmentPublishedRowProps> = ({
  hoverClass = 'hover:bg-slate-50/10',
  equipmentPublishedList,
}) => {
  if (!equipmentPublishedList) return null;

  const { publisher, edition, adjustment } = equipmentPublishedList;

  if (!publisher && !edition && !adjustment) return null;

  return (
    <div
      className={`flex flex-col justify-between gap-2 p-4 transition sm:flex-row sm:items-center ${hoverClass}`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
        <span className="ds-micro! w-40 shrink-0 pt-0.5 leading-normal! font-bold! tracking-wider text-slate-500 uppercase">
          Equipment — Published List
        </span>
        {(edition || publisher) && (
          <div>
            <span className="ds-micro! font-semibold! text-slate-800">
              {edition && `The published list of Equipment is the edition ${edition.toLowerCase()}`}
              {edition && publisher && ', published by '}
              {!edition && publisher && 'Published by '}
              {publisher}
            </span>
          </div>
        )}
      </div>
      {adjustment && (
        <div className="flex shrink-0 items-center gap-2">
          <span className="ds-micro! rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-bold! text-slate-600">
            {adjustment}
          </span>
          <span className="ds-micro! rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-semibold! text-slate-500">
            adjust
          </span>
        </div>
      )}
    </div>
  );
};
