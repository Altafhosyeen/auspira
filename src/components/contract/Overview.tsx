import React from 'react';

// Simple Arrow SVG icon component to avoid extra package dependencies
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const Overview = () => {
  return (
    <div className="space-y-6">
      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Contract Value */}
        <div className="flex min-h-[135px] flex-col justify-between rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <span className="ds-micro! mb-2 block font-bold! tracking-wider text-slate-700 uppercase">
              Contract Value
            </span>
            <div className="ds-heading-1! text-text">
              £8.4<span className="ds-heading-2! font-semibold!">m</span>
            </div>
          </div>
          <span className="ds-caption! text-slate-700">Option A · fee from CD</span>
        </div>

        {/* Card 2: To Completion */}
        <div className="flex min-h-[135px] flex-col justify-between rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <span className="ds-micro! mb-2 block font-bold! tracking-wider text-slate-700 uppercase">
              To Completion
            </span>
            <div className="ds-heading-1! text-text">
              198 <span className="ds-heading-2! font-normal! text-slate-700">days</span>
            </div>
          </div>
          <span className="ds-caption! text-slate-700">from Contract Data</span>
        </div>

        {/* Card 3: Open Matters */}
        <div className="flex min-h-[135px] flex-col justify-between rounded-lg border border-orange-100 bg-orange-50 p-5 shadow-sm">
          <div>
            <span className="ds-micro! mb-2 block font-bold! tracking-wider text-orange-500 uppercase">
              Open Matters
            </span>
            <div className="ds-heading-1! text-orange-600">17</div>
          </div>
          <span className="ds-caption! font-semibold! text-orange-600">
            3 EWN · 11 CE · 3 other
          </span>
        </div>

        {/* Card 4: Clocks Live */}
        <div className="flex min-h-[135px] flex-col justify-between rounded-lg border border-red-100! bg-red-50 p-5 shadow-sm">
          <div>
            <span className="ds-micro! mb-2 block font-bold! tracking-wider text-red-500 uppercase">
              Clocks Live
            </span>
            <div className="ds-heading-1! text-red-600">4</div>
          </div>
          <span className="ds-caption! font-semibold! text-red-500">1 critical ≤7 days</span>
        </div>
      </div>

      {/* Detailed Sections (Grid layout) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Parties & Roles */}
        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="ds-micro! mb-5 font-bold! tracking-wider text-slate-700 uppercase">
            Parties & Roles
          </h3>
          <div className="space-y-4">
            <div className="ds-body! flex items-center justify-between border-b border-slate-50 py-1">
              <span className="text-slate-700">Client</span>
              <span className="font-semibold! text-slate-700">Stena Line Ports Ltd</span>
            </div>
            <div className="ds-body! flex items-center justify-between border-b border-slate-50 py-1">
              <span className="text-slate-700">Contractor</span>
              <span className="font-semibold! text-slate-700">GPS Marine</span>
            </div>
            <div className="ds-body! flex items-center justify-between border-b border-slate-50 py-1">
              <span className="text-slate-700">Project Manager</span>
              <span className="font-semibold! text-slate-700">named in CD Part 1</span>
            </div>
            <div className="ds-body! flex items-center justify-between py-1">
              <span className="text-slate-700">Adjudicator body</span>
              <span className="font-semibold! text-slate-700">Institution of Civil Engineers</span>
            </div>
          </div>
        </div>

        {/* Key Dates & Periods */}
        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="ds-micro! mb-5 font-bold! tracking-wider text-slate-700 uppercase">
            Key Dates & Periods
          </h3>
          <div className="space-y-4">
            <div className="ds-body! flex items-center justify-between border-b border-slate-50 py-1">
              <span className="text-slate-700">Revised programmes</span>
              <span className="font-semibold! text-slate-700">≤ 28 days</span>
            </div>
            <div className="ds-body! flex items-center justify-between border-b border-slate-50 py-1">
              <span className="text-slate-700">First programme</span>
              <span className="font-semibold! text-slate-700">1 week</span>
            </div>
            <div className="ds-body! flex items-center justify-between border-b border-slate-50 py-1">
              <span className="text-slate-700">Defects date</span>
              <span className="font-semibold! text-slate-700">52 weeks</span>
            </div>
            <div className="ds-body! flex items-center justify-between py-1">
              <span className="text-slate-700">Defect correction</span>
              <span className="font-semibold! text-slate-700">4 wk / 24 hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mid-level Navigation/KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Options selected */}
        <div className="group relative cursor-pointer rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-slate-200">
          <div className="absolute top-4 right-4 text-slate-700 transition-colors group-hover:text-slate-500">
            <ArrowRightIcon />
          </div>
          <div className="ds-heading-1! text-text mb-2">9</div>
          <div className="ds-body-strong! mb-1 text-slate-700">Options selected</div>
          <div className="ds-caption! text-slate-700">
            <span className="font-medium! text-orange-500">4 carry flags</span> · 1 main + 8
            secondary
          </div>
        </div>

        {/* Z-clauses */}
        <div className="group relative cursor-pointer rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-slate-200">
          <div className="absolute top-4 right-4 text-slate-700 transition-colors group-hover:text-slate-500">
            <ArrowRightIcon />
          </div>
          <div className="ds-heading-1! text-text mb-2">23</div>
          <div className="ds-body-strong! mb-1 text-slate-700">Z-clauses</div>
          <div className="ds-caption! text-slate-700">
            <span className="font-medium! text-red-500">Z11 + Z17 ground risk</span> · 5 modify time
            bars
          </div>
        </div>

        {/* Time bars */}
        <div className="group relative cursor-pointer rounded-lg border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-slate-200">
          <div className="absolute top-4 right-4 text-slate-700 transition-colors group-hover:text-slate-500">
            <ArrowRightIcon />
          </div>
          <div className="ds-heading-1! text-text mb-2">21</div>
          <div className="ds-body-strong! mb-1 text-slate-700">Time bars</div>
          <div className="ds-caption! text-slate-700">
            <span className="font-medium! text-orange-500">5 modified</span> from NEC4 default
          </div>
        </div>
      </div>

      {/* Lower Live registers */}
      <div>
        <h4 className="ds-micro! mb-3 font-bold! tracking-wider text-slate-700 uppercase">
          Notice Registers - Live
        </h4>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Register Item 1 */}
          <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="ds-heading-3! text-text font-bold!">
              3 <span className="ds-caption! font-semibold! text-slate-700">EWN</span>
            </div>
            <div className="ds-caption! mt-1 font-medium! text-orange-500">1 awaiting meeting</div>
          </div>

          {/* Register Item 2 */}
          <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="ds-heading-3! text-text font-bold!">
              11 <span className="ds-caption! font-semibold! text-slate-700">CE</span>
            </div>
            <div className="ds-caption! mt-1 font-medium! text-red-500">1 lever ready</div>
          </div>

          {/* Register Item 3 */}
          <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="ds-heading-3! text-text font-bold!">
              2 <span className="ds-caption! font-semibold! text-slate-700">NCR/T&R</span>
            </div>
            <div className="ds-caption! mt-1 text-slate-700">all open</div>
          </div>

          {/* Register Item 4 */}
          <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="ds-heading-3! text-text font-bold!">
              18 <span className="ds-caption! font-semibold! text-slate-700">PMI</span>
            </div>
            <div className="ds-caption! mt-1 text-slate-700">2 to assess</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
