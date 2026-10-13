'use client';

import { Spin } from 'antd';
import { useState } from 'react';
import SourceOverviewDialog, {
  type SourceOverviewData,
} from '@/components/document-json-view/option-source/SourceOverviewDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import InfiniteScrollDiv from '@/components/shared/InfiniteScrollDiv/InfiniteScrollDiv';
import { useProjectStore } from '@/store/project.store';
import { TimeBarFilters } from './time/TimeBarFilters';
import { TimeBarRow } from './time/TimeBarRow';
import type { TimeBarFilter } from './time/types';
import { useTimeBarData } from './time/useTimeBarData';

/**
 * Shared styling for the sticky header cells. The background has to be fully opaque and sit on the
 * `th` itself — a translucent fill, or one set only on the `tr`, lets the rows scrolling underneath
 * bleed through the header.
 */
const TH_CLASS =
  'bg-badge-info-soft ds-micro! text-badge-neutral px-4 py-2.5 font-extrabold! tracking-wider';

export default function ContractClocksDashboard() {
  const [activeFilter, setActiveFilter] = useState<TimeBarFilter>('all');
  const [searchText, setSearchText] = useState('');
  // Categories the user has ticked. Starts empty, and empty means "no category filter" — the table
  // shows everything until at least one box is ticked, then it narrows to just those.
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [expandedModifies] = useState<Set<string>>(() => new Set());
  const [dialogData, setDialogData] = useState<SourceOverviewData | null>(null);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  const { visibleRows, groupOptions, counts, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useTimeBarData({
      projectId: selectedProjectId,
      searchText,
      activeFilter,
      selectedGroups,
    });

  return (
    <div className="bg-surface-subtle font-sans">
      {/* Main Card container — same shell as the Z-clauses tab */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <TimeBarFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
          groupOptions={groupOptions}
          selectedGroups={selectedGroups}
          onSelectedGroupsChange={setSelectedGroups}
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />

        {/* Every row in one flat table — no per-category tables or grouping bands. The category
            rides along in its own column, and the header is written once and stays sticky. */}
        <InfiniteScrollDiv
          className="max-h-[600px] overflow-x-auto overflow-y-auto"
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        >
          {visibleRows.length === 0 ? (
            <EmptyState
              title={searchText ? 'No periods found' : 'No time bars in this category'}
              description={
                searchText
                  ? `No clauses or periods match "${searchText}". Try a different search term.`
                  : 'Try selecting a different filter.'
              }
            />
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-badge-info-soft divide-x divide-slate-200/70 border-b border-slate-200/60">
                  <th className={`${TH_CLASS} w-[10%]`}>CLAUSE</th>
                  <th className={`${TH_CLASS} w-[13%]`}>PERIOD</th>
                  <th className={`${TH_CLASS} w-[10%] text-center`}>WHO</th>
                  <th className={`${TH_CLASS} w-[40%]`}>CLOCK STARTS WHEN...</th>
                  <th className={`${TH_CLASS} w-[12%]`}>CATEGORY</th>
                  <th className={`${TH_CLASS} w-[10%]`}>SOURCE</th>
                  <th className={`${TH_CLASS} w-[5%]`} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map(({ item, group }) => (
                  <TimeBarRow
                    key={item.id}
                    item={item}
                    group={group}
                    isModifiesExpanded={expandedModifies.has(item.id)}
                    onViewSource={setDialogData}
                  />
                ))}
              </tbody>
            </table>
          )}
          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Spin size="small" />
            </div>
          )}
        </InfiniteScrollDiv>
      </div>

      <SourceOverviewDialog
        open={!!dialogData}
        onClose={() => setDialogData(null)}
        kind="timebar"
        projectId={selectedProjectId ?? ''}
        data={dialogData}
      />
    </div>
  );
}
