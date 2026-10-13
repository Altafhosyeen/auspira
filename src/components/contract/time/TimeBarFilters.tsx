import { Checkbox, Input, Popover } from 'antd';
import { Search, SlidersHorizontal } from 'lucide-react';
import type React from 'react';
import type { TimeBarFilter } from './types';

interface GroupOption {
  value: string;
  label: React.ReactNode;
}

interface TimeBarFiltersProps {
  activeFilter: TimeBarFilter;
  onFilterChange: (filter: TimeBarFilter) => void;
  counts: { all: number; modified: number; contractor: number };
  groupOptions: GroupOption[];
  selectedGroups: string[];
  onSelectedGroupsChange: (groups: string[]) => void;
  searchText: string;
  onSearchTextChange: (value: string) => void;
}

const PILL_BASE = 'rounded-full px-3 py-1.5 font-medium transition-colors';
const PILL_ACTIVE = 'bg-surface-dark text-white!';
const PILL_IDLE = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

const pillClass = (isActive: boolean) => `${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_IDLE}`;

/** Controls bar above the table: quick-filter pills and category tick-boxes on the left, search on the right. */
export const TimeBarFilters: React.FC<TimeBarFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
  groupOptions,
  selectedGroups,
  onSelectedGroupsChange,
  searchText,
  onSearchTextChange,
}) => {
  const pills: { key: TimeBarFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'modified', label: 'Modified', count: counts.modified },
    { key: 'contractor', label: 'Contractor acts', count: counts.contractor },
  ];

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="ds-caption! flex flex-wrap items-center gap-2">
        {pills.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => onFilterChange(pill.key)}
            className={pillClass(activeFilter === pill.key)}
          >
            {pill.label} · {pill.count}
          </button>
        ))}

        <Popover
          trigger="click"
          placement="bottomLeft"
          content={
            <div className="w-60">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="ds-micro! font-bold! tracking-wider text-slate-500 uppercase">
                  Categories
                </span>
                <button
                  type="button"
                  onClick={() => onSelectedGroupsChange([])}
                  disabled={selectedGroups.length === 0}
                  className="ds-micro! text-main-p font-semibold! hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                >
                  Clear
                </button>
              </div>
              {groupOptions.length === 0 ? (
                <p className="ds-caption! my-0 text-slate-400">No categories yet</p>
              ) : (
                <>
                  <Checkbox.Group
                    value={selectedGroups}
                    onChange={(checked) => onSelectedGroupsChange(checked as string[])}
                    className="flex flex-col gap-2"
                    options={groupOptions}
                  />
                  {selectedGroups.length === 0 && (
                    <p className="ds-micro! mt-3 mb-0 text-slate-400">
                      Nothing ticked — showing all categories.
                    </p>
                  )}
                </>
              )}
            </div>
          }
        >
          <button
            type="button"
            className={`inline-flex shrink-0 items-center gap-1.5 ${pillClass(
              selectedGroups.length > 0
            )}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Categories
            {selectedGroups.length > 0 && <span>· {selectedGroups.length}</span>}
          </button>
        </Popover>
      </div>

      <div className="w-full sm:w-64">
        <Input
          placeholder="Search clauses, periods, who, source..."
          prefix={<Search className="mr-1 text-slate-700" size={14} />}
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          className="ds-caption! rounded-lg border-slate-200 py-1.5 placeholder-slate-400"
        />
      </div>
    </div>
  );
};
