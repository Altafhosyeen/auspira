'use client';

/**
 * WatchtowerFilterBar
 * The toolbar above the queue — one combined "Filters" dropdown (category / priority / assignee /
 * date), free-text search and a "Clear all" reset. Purely controlled: every value and handler is
 * owned by the page.
 *
 * Matches the reference design's toolbar shape, which collapses what used to be four separate
 * filter pills into a single Filters trigger — the individual filters still exist as state on the
 * page, just surfaced from one panel instead of four pills.
 *
 * Renders as a band *inside* the table card (no card chrome of its own, just a bottom divider):
 * the reference design runs the toolbar and the table it acts on together as one surface, with
 * the column-header band directly beneath this one.
 */

import { DatePicker, Dropdown, Input, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import { ChevronDown, Filter, Search } from 'lucide-react';
import { CARD_SHADOW, FILTER_DATE_PICKER, FOCUS_RING } from '@/constants/list-page.constants';

/** Search field. Deliberately not the shared `SEARCH_INPUT`: that one is a 32px pill sized to sit
 *  between filter pills, where this toolbar's reference gives the search a wide 40px field of its
 *  own. The `!`s are required for the same reason they are there — antd's own CSS-in-JS sets
 *  width/height on `.ant-input-affix-wrapper` at a higher precedence than Tailwind's utilities. */
const QUEUE_SEARCH_INPUT =
  'h-10 w-96! min-w-[10rem] shrink rounded-xl! border-slate-200! bg-white! text-[14px]!';

export interface FilterOption {
  key: string;
  label: string;
}

interface WatchtowerFilterBarProps {
  categoryFilter: string | null;
  categoryOptions: FilterOption[];
  onCategoryChange: (value: string | null) => void;

  priorityFilter: string | null;
  priorityOptions: FilterOption[];
  onPriorityChange: (value: string | null) => void;

  assigneeFilter: string | null;
  assigneeOptions: FilterOption[];
  onAssigneeChange: (value: string | null) => void;

  dateFilter: Dayjs | null;
  onDateChange: (value: Dayjs | null) => void;

  searchQuery: string;
  onSearchChange: (value: string) => void;

  onClearFilters: () => void;
}

export default function WatchtowerFilterBar({
  categoryFilter,
  categoryOptions,
  onCategoryChange,
  priorityFilter,
  priorityOptions,
  onPriorityChange,
  assigneeFilter,
  assigneeOptions,
  onAssigneeChange,
  dateFilter,
  onDateChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}: WatchtowerFilterBarProps) {
  const activeCount = [categoryFilter, priorityFilter, assigneeFilter, dateFilter].filter(
    Boolean
  ).length;
  const hasActiveFilters = activeCount > 0 || !!searchQuery.trim();

  const panel = (
    <div className={`w-72 rounded-xl border border-slate-200 bg-white p-4 ${CARD_SHADOW}`}>
      <p className="my-0 mb-3 text-[13px] font-semibold text-slate-700">Filters</p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span
            id="watchtower-filter-category-label"
            className="text-[11px] font-medium text-slate-500"
          >
            Category
          </span>
          <Select
            aria-labelledby="watchtower-filter-category-label"
            value={categoryFilter ?? undefined}
            placeholder="All categories"
            allowClear
            onChange={(value) => onCategoryChange(value ?? null)}
            options={categoryOptions.map((option) => ({ value: option.key, label: option.label }))}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span
            id="watchtower-filter-priority-label"
            className="text-[11px] font-medium text-slate-500"
          >
            Priority
          </span>
          <Select
            aria-labelledby="watchtower-filter-priority-label"
            value={priorityFilter ?? undefined}
            placeholder="All priorities"
            allowClear
            onChange={(value) => onPriorityChange(value ?? null)}
            options={priorityOptions.map((option) => ({ value: option.key, label: option.label }))}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span
            id="watchtower-filter-assignee-label"
            className="text-[11px] font-medium text-slate-500"
          >
            Assignee
          </span>
          <Select
            aria-labelledby="watchtower-filter-assignee-label"
            value={assigneeFilter ?? undefined}
            placeholder="All assignees"
            allowClear
            onChange={(value) => onAssigneeChange(value ?? null)}
            options={assigneeOptions.map((option) => ({ value: option.key, label: option.label }))}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-500">Due date</span>
          <DatePicker
            value={dateFilter}
            onChange={onDateChange}
            allowClear
            format="DD MMM YYYY"
            placeholder="Select date"
            aria-label="Filter by due date"
            className={`${FILTER_DATE_PICKER} w-full`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-nowrap items-center gap-3 border-b border-slate-200 px-5 py-3">
      {/* `ms-auto` keeps the search + filters on the toolbar's trailing edge; the page's own
          heading card already names the table, so the toolbar carries no label of its own. */}
      <div className="ms-auto flex min-w-0 shrink items-center gap-3">
        <Input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by user, action or details..."
          aria-label="Search signals"
          allowClear
          prefix={<Search className="mr-1 h-4 w-4 text-slate-400" aria-hidden="true" />}
          className={QUEUE_SEARCH_INPUT}
        />

        <Dropdown popupRender={() => panel} trigger={['click']} placement="bottomRight">
          <button
            type="button"
            aria-label="Filters"
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-[14px] leading-5 font-medium transition-colors duration-200 ease-in-out ${FOCUS_RING} ${
              activeCount > 0
                ? 'border-main-p/25 bg-main-p/8 text-main-p'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4 shrink-0" aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="bg-main-p flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          </button>
        </Dropdown>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className={`shrink-0 rounded text-[14px] font-semibold transition-colors duration-200 ease-in-out ${FOCUS_RING} ${
            hasActiveFilters ? 'text-main-p hover:underline' : 'cursor-not-allowed text-slate-300'
          }`}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
