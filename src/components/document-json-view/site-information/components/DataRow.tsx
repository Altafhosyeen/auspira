import React from 'react';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import type { SiteInfoItem } from '../types';
import { BlueRefTag } from './RefTags';

// --- STANDARD METADATA ROW ---
export const DataRow: React.FC<SiteInfoItem> = ({ label, value, details, reference, page }) => {
  const pageNum = page != null && Number.isFinite(Number(page)) ? Number(page) : null;

  return (
    <div className="flex flex-col justify-between gap-2 px-4 py-4 transition duration-150 hover:bg-slate-50/20 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
        {/* Label (Left Column) */}
        <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
          {label}
        </span>

        {/* Value & Details (Middle Column) */}
        <div className="space-y-1">
          <ExpandableText
            lines={3}
            className="ds-caption! block leading-normal! font-bold! text-slate-900"
          >
            {value}
          </ExpandableText>
          {details && (
            <ExpandableText
              lines={3}
              className="ds-micro! max-w-3xl leading-normal! text-slate-600"
            >
              {details}
            </ExpandableText>
          )}
        </div>
      </div>

      {/* Right Column — reference tag + separate page chip */}
      {(reference || pageNum != null) && (
        <div className="flex shrink-0 items-center gap-1.5">
          {reference && <BlueRefTag text={reference} />}
          {pageNum != null && <PageChip page={pageNum} searchText={value} />}
        </div>
      )}
    </div>
  );
};
