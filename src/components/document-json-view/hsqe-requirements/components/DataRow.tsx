import React from 'react';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import type { HsqeDetail } from '../types';
import { BlueRefTag } from './RefTags';

// --- STANDARD METADATA ROW ---
// Takes the whole row as a single `row` prop rather than spreading its fields —
// `HsqeDetail.key` collides with React's reserved `key` prop when spread as JSX props.
/** A reference is valid only if it contains at least one alphanumeric character. */
const isValidRef = (ref?: string | null): ref is string => !!ref && /[a-z0-9]/i.test(ref);

export const DataRow: React.FC<{ row: HsqeDetail }> = ({ row }) => {
  const pageNum = row.page != null && Number.isFinite(Number(row.page)) ? Number(row.page) : null;
  const ref = isValidRef(row.reference) ? row.reference : null;

  return (
    <div className="flex flex-col justify-between gap-2 px-4 py-4 transition duration-150 hover:bg-slate-50/20 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
        {/* Label Column */}
        <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
          {row.label}
        </span>

        {/* Value Column */}
        <div className="space-y-1">
          <span className="ds-caption! block leading-normal! font-bold! text-slate-900">
            {row.key}
          </span>
          {row.description && (
            <ExpandableText
              lines={3}
              className="ds-micro! max-w-3xl leading-normal! text-slate-600"
            >
              {row.description}
            </ExpandableText>
          )}
        </div>
      </div>

      {/* Right Column — only shown when there is a real reference or a valid page */}
      {(ref || pageNum != null) && (
        <div className="flex shrink-0 items-center gap-1.5">
          {ref && <BlueRefTag text={ref} />}
          {pageNum != null && <PageChip page={pageNum} searchText={row.key} />}
        </div>
      )}
    </div>
  );
};
