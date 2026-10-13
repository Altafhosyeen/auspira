'use client';

import React from 'react';
import { Popover, Select, Switch } from 'antd';
import { RotateCcw } from 'lucide-react';
import SearchInputX from '@/components/shared/Search/SearchInputX';
import type { SortOption, StatusFilter, ViewMode } from './types';
import { FilterIcon, GridIcon, ListIcon } from './icons';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'passed', label: 'Passed' },
  { value: 'resolved', label: 'Resolved' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Reference A-Z' },
  { value: 'severity', label: 'Severity (high to low)' },
  { value: 'unresolved', label: 'Unresolved first' },
  { value: 'sources', label: 'Most documents' },
];

interface CrossReferenceToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;

  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;

  documentFilter: string;
  onDocumentFilterChange: (value: string) => void;
  documentOptions: string[];

  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;

  showErrorsOnly: boolean;
  onShowErrorsOnlyChange: (checked: boolean) => void;

  showUnresolvedOnly: boolean;
  onShowUnresolvedOnlyChange: (checked: boolean) => void;
  showContractRouteOnly: boolean;
  onShowContractRouteOnlyChange: (checked: boolean) => void;

  filtersDirty: boolean;
  onResetFilters: () => void;

  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const CrossReferenceToolbar: React.FC<CrossReferenceToolbarProps> = ({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  documentFilter,
  onDocumentFilterChange,
  documentOptions,
  sortBy,
  onSortByChange,
  showErrorsOnly,
  onShowErrorsOnlyChange,
  showUnresolvedOnly,
  onShowUnresolvedOnlyChange,
  showContractRouteOnly,
  onShowContractRouteOnlyChange,
  filtersDirty,
  onResetFilters,
  view,
  onViewChange,
}) => {
  const filtersActive = showUnresolvedOnly || showContractRouteOnly;

  return (
    <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Search */}
      <div className="flex min-w-0 flex-1 items-center border-r border-slate-200 px-3 py-2">
        <SearchInputX
          value={searchTerm}
          onChange={onSearchTermChange}
          placeholder="Search references, values..."
          size="small"
          className="w-full! border-none! bg-transparent! shadow-none!"
        />
      </div>

      {/* Status */}
      <div className="flex shrink-0 items-center border-r border-slate-200 px-3 py-2">
        <Select<StatusFilter>
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={STATUS_OPTIONS}
          variant="borderless"
          size="small"
          className="w-20!"
        />
      </div>

      {/* Documents */}
      <div className="flex shrink-0 items-center border-r border-slate-200 px-3 py-2">
        <Select
          value={documentFilter}
          onChange={onDocumentFilterChange}
          variant="borderless"
          size="small"
          className="w-32!"
          options={[
            { value: 'all', label: 'All documents' },
            ...documentOptions.map((doc) => ({ value: doc, label: doc })),
          ]}
        />
      </div>

      {/* Sort by */}
      <div className="flex shrink-0 items-center border-r border-slate-200 px-3 py-2">
        <Select<SortOption>
          value={sortBy}
          onChange={onSortByChange}
          options={SORT_OPTIONS}
          variant="borderless"
          size="small"
          className="w-36!"
        />
      </div>

      {/* Show errors only */}
      <div className="flex shrink-0 items-center gap-2 border-r border-slate-200 px-4 py-2">
        <Switch checked={showErrorsOnly} onChange={onShowErrorsOnlyChange} size="small" />
        <span className="text-sm font-medium whitespace-nowrap text-slate-700">
          Show errors only
        </span>
      </div>

      {/* Filters */}
      <Popover
        trigger="click"
        placement="bottomRight"
        content={
          <div className="flex w-56 flex-col gap-3 py-1">
            <label className="ds-caption! flex items-center justify-between gap-3 font-medium! text-slate-600">
              Unresolved only
              <Switch
                checked={showUnresolvedOnly}
                onChange={onShowUnresolvedOnlyChange}
                size="small"
              />
            </label>
            <label className="ds-caption! flex items-center justify-between gap-3 font-medium! text-slate-600">
              Contract route only
              <Switch
                checked={showContractRouteOnly}
                onChange={onShowContractRouteOnlyChange}
                size="small"
              />
            </label>
          </div>
        }
      >
        <button
          type="button"
          className={`flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r border-slate-200 px-4 py-2 text-sm font-medium transition ${
            filtersActive ? 'text-main-p bg-sky-50' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FilterIcon className="h-4 w-4" />
          Filters
        </button>
      </Popover>

      {/* Reset */}
      <button
        type="button"
        onClick={onResetFilters}
        disabled={!filtersDirty}
        className={`flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-slate-200 px-4 py-2 text-sm font-medium transition ${
          filtersDirty
            ? 'cursor-pointer text-slate-600 hover:bg-slate-50'
            : 'cursor-not-allowed text-slate-300'
        }`}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </button>

      {/* Grid / List toggle */}
      <div className="flex shrink-0 items-center gap-0.5 px-2 py-2">
        <button
          type="button"
          aria-label="Grid view"
          onClick={() => onViewChange('grid')}
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition ${
            view === 'grid' ? 'bg-main-p text-white!' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <GridIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="List view"
          onClick={() => onViewChange('list')}
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition ${
            view === 'list' ? 'bg-main-p text-white!' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <ListIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

CrossReferenceToolbar.displayName = 'CrossReferenceToolbar';
