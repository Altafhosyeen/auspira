import React from 'react';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import type { ContractDataRow } from '../types';
import { RefTag } from './RefTag';

// --- STANDARD METADATA ROW ---
export const DataRow: React.FC<ContractDataRow> = ({
  label,
  value,
  pills,
  subtext,
  isBlank = false,
  badgeText,
  refTagText,
  refTagPage,
  isPerson = false,
}) => (
  <div
    className={`flex flex-col justify-between px-4 transition duration-700 hover:bg-slate-50/30 sm:flex-row ${
      isPerson ? 'gap-3 py-4 sm:items-start' : 'gap-2 py-3 sm:items-center'
    }`}
  >
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
      {/* Label (Left Column) */}
      <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
        {label}
      </span>

      {/* Value & Badges (Middle Column) */}
      <div className="space-y-0.5">
        {isPerson ? (
          <div className="space-y-0.5">
            {value && <h4 className="ds-caption! text-main-p font-bold!">{value}</h4>}
            {badgeText && (
              <p className="ds-micro! font-semibold! tracking-wide text-slate-500 uppercase">
                {badgeText}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {pills ? (
              <div className="flex flex-wrap gap-1">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="ds-micro! rounded border border-slate-200/50 bg-slate-100 px-1.5 py-0.5 font-bold! text-slate-500"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            ) : isBlank ? (
              <span className="ds-caption! font-medium! text-slate-500">{value}</span>
            ) : (
              <span className="ds-caption! font-bold! text-slate-900">{value}</span>
            )}

            {badgeText && (
              <span className="ds-micro! rounded border border-slate-200/50 bg-slate-100 px-1.5 py-0.5 font-bold! tracking-wider text-slate-500 uppercase">
                {badgeText}
              </span>
            )}
          </div>
        )}
        {subtext &&
          (isPerson ? (
            <ExpandableText
              lines={3}
              className="ds-micro! max-w-2xl leading-normal! text-slate-500"
            >
              {subtext}
            </ExpandableText>
          ) : (
            <p className="ds-micro! font-medium! text-slate-500">{subtext}</p>
          ))}
      </div>
    </div>

    {/* Right Column — reference tag + separate page chip */}
    {(refTagText || refTagPage != null) && (
      <div className="flex shrink-0 items-center gap-1.5">
        {refTagText && <RefTag text={refTagText} />}
        {refTagPage != null && <PageChip page={refTagPage} searchText={value} />}
      </div>
    )}
  </div>
);
