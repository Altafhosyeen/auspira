import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCocData } from '../ConditionsOfContractContext';
import { isVisibleStatus } from '../../shared/isVisibleStatus';
import { PageChip } from '../../shared/PageChip';
import { StatusBadge } from './Tags';

// --- SECTION 02: OPTION CLAUSES BOUND IN --- maps to JSON `option_clauses`
export const OptionsSection: React.FC = () => {
  const { data } = useCocData();
  const opts = data?.option_clauses;

  const mainOption = opts?.main_option;
  const disputesOption = opts?.disputes_option;
  const secondaryOptions = opts?.secondary_options;

  if (!mainOption && !disputesOption && !secondaryOptions) return null;

  const mainOptionValue = mainOption
    ? `${mainOption.value}${mainOption.description ? ` — ${mainOption.description}` : ''}`
    : undefined;

  return (
    <section>
      <DocumentSectionHeader number="02" title="OPTION CLAUSES BOUND IN" />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Main Option */}
        {mainOption && !!mainOption.value && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Main Option
              </span>
              <div className="min-w-0">
                <span className="ds-caption! font-bold! text-slate-900">{mainOptionValue}</span>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2 self-start">
              {isVisibleStatus(mainOption.status) && (
                <StatusBadge text={mainOption.status.toUpperCase()} />
              )}
              <PageChip page={mainOption.page} searchText={mainOptionValue} />
            </div>
          </div>
        )}

        {/* Disputes */}
        {disputesOption && !!disputesOption.value && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Disputes
              </span>
              <div className="min-w-0">
                <span className="ds-caption! font-bold! text-slate-900">
                  {disputesOption.value}
                </span>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2 self-start">
              {isVisibleStatus(disputesOption.status) && (
                <StatusBadge text={disputesOption.status.toUpperCase()} />
              )}
              <PageChip page={disputesOption.page} searchText={disputesOption.value} />
            </div>
          </div>
        )}

        {/* Secondary Options */}
        {secondaryOptions && secondaryOptions.values?.length > 0 && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Secondary Options
              </span>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap gap-1">
                  {secondaryOptions.values.map((pill) => (
                    <span
                      key={pill}
                      className="ds-micro! rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-bold! text-slate-500"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5 self-start">
              <PageChip page={secondaryOptions.page} searchText={secondaryOptions.values} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
