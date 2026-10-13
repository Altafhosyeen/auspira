import React from 'react';
import { PageChip } from '../../shared/PageChip';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCd2Category } from '../ContractDataPart2Context';
import { EquipmentPublishedRow } from './EquipmentPublishedRow';
import { PeopleRatesWorkspace } from './PeopleRatesWorkspace';
import { PlantRatesWorkspace } from './PlantRatesWorkspace';
import { RefTag } from './RefTag';

// --- SECTION 03: PRICE --- maps to JSON category `price`
export const PriceSection: React.FC = () => {
  const category = useCd2Category('price');

  if (!category) return null;

  const sscc = category.shortScheduleOfCostComponents;
  const priceRefPage =
    category.page != null && Number.isFinite(Number(category.page))
      ? Number(category.page)
      : undefined;
  const priceRefTag = category.reference || undefined;

  return (
    <section>
      <DocumentSectionHeader number="03" title={category.title ?? 'Price'} />
      <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {category.feePercentage && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Fee Percentage
              </span>
              <div>
                <span className="ds-caption! font-bold! text-slate-900">
                  {category.feePercentage}
                </span>
                <span className="ds-micro! mt-0.5 block text-slate-500">
                  Applied to Defined Cost in compensation-event assessment
                </span>
              </div>
            </div>
            {(priceRefTag || priceRefPage != null) && (
              <div className="flex shrink-0 items-center gap-1.5">
                {priceRefTag && <RefTag text={priceRefTag} />}
                {priceRefPage != null && (
                  <PageChip
                    page={priceRefPage}
                    searchText={`fee percentage ${category.feePercentage ?? ''}`.trim()}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {category.tenderedTotal && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Tendered Total
              </span>
              <div>
                <span className="ds-caption! font-bold! text-slate-900">
                  {category.tenderedTotal}
                </span>
                <span className="ds-micro! mt-0.5 block text-slate-500">
                  The Option A priced total
                </span>
              </div>
            </div>
            {(priceRefTag || priceRefPage != null) && (
              <div className="flex shrink-0 items-center gap-1.5">
                {priceRefTag && <RefTag text={priceRefTag} />}
                {priceRefPage != null && (
                  <PageChip
                    page={priceRefPage}
                    searchText={`tendered total ${category.tenderedTotal ?? ''}`.trim()}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <EquipmentPublishedRow equipmentPublishedList={sscc?.equipmentPublishedList} />

        {/* PEOPLE COLLAPSIBLE WORKSPACE */}
        <PeopleRatesWorkspace peopleRates={sscc?.peopleRates} />

        {/* Repeat baseline spacer row */}
        <EquipmentPublishedRow
          hoverClass="hover:bg-slate-50/20"
          equipmentPublishedList={sscc?.equipmentPublishedList}
        />

        {/* PLANT & DESIGN RATES COLLAPSIBLE WORKSPACE */}
        <PlantRatesWorkspace
          equipmentOtherRates={sscc?.equipmentOtherRates}
          designOutsideWorkingAreas={sscc?.designOutsideWorkingAreas}
        />
      </div>
    </section>
  );
};
