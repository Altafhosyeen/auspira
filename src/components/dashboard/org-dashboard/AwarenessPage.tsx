'use client';

/**
 * AwarenessPage
 * Full-page "Awareness" signals table — pixel-matched to the Figma design.
 * Route: /projects/signals  →  app/(dashboard)/projects/signals/page.tsx
 *
 * This file owns the presentation layer only. Data fetching, filtering,
 * selection, pagination and navigation behave exactly as before.
 */

import type { MenuProps } from 'antd';
import { Checkbox, DatePicker, Dropdown, Input, Skeleton } from 'antd';
import type { Dayjs } from 'dayjs';
import { CalendarDays, CircleAlert, Plus, RotateCcw, Search } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import FeaturePageHeader from '@/components/shared/FeaturePageHeader';
import GenericPagination from '@/components/shared/Pagination';
import {
  FILTER_BAR,
  FILTER_BAR_TRAILING,
  FILTER_DATE_PICKER,
  FOCUS_RING,
  PILL_ACTIVE,
  PILL_BASE,
  PILL_IDLE,
  SEARCH_INPUT,
  TABLE_CARD,
  TABLE_HEADER_BG,
  TABLE_HEADER_LABEL,
} from '@/constants/list-page.constants';
import { useGetProjectAlerts } from '@/hooks/modules/project-alerts';
import { getAlertDetailHref } from '@/lib/utils/org-dashboard.utils';
import { useProjectStore } from '@/store/project.store';
import {
  COL,
  type FilterTab,
  mapAlertToSignal,
  ROW_PAD,
  type Signal,
  STATUS_CONFIG,
  type StatusType,
} from './awareness-page.helpers';
import { FilterPill, RouteBadge, SignalRow } from './awareness-page.parts';

/* ─── Presentational primitives ─────────────────────────────────────────── */

const ColHeader = ({ children }: { children: React.ReactNode }) => (
  <span className={`${TABLE_HEADER_LABEL} pr-4 last:pr-0`}>{children}</span>
);

/* ─── Page ──────────────────────────────────────────────────────────────── */

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'early-warning', label: 'Early Warning' },
  { key: 'pmi', label: 'PMI' },
  { key: 'compensation', label: 'Compensation' },
];

export default function AwarenessPage() {
  const router = useRouter();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusType | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: alertsData, isLoading } = useGetProjectAlerts({
    projectId: selectedProjectId ?? '',
    params: { includeAll: true },
    enabled: !!selectedProjectId,
  });

  const signals = useMemo(() => (alertsData?.items ?? []).map(mapAlertToSignal), [alertsData]);
  const tabCounts = useMemo(
    () => ({
      all: signals.length,
      'early-warning': signals.filter((s) => s.route.type === 'early-warning').length,
      pmi: signals.filter((s) => s.route.type === 'pmi').length,
      compensation: signals.filter((s) => s.route.type === 'compensation').length,
    }),
    [signals]
  );

  const filtered = useMemo(() => {
    let list = signals;
    if (activeTab !== 'all') list = list.filter((s) => s.route.type === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.signal.toLowerCase().includes(q) ||
          s.source.name.toLowerCase().includes(q) ||
          s.route.label.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    return list;
  }, [signals, activeTab, searchQuery, statusFilter]);

  // The deps are the effect's trigger, not values it reads — changing any filter sends the
  // reader back to page 1, so they stay listed even though the body only calls `setPage`.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => setPage(1), [activeTab, searchQuery, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const allSelected = paginated.length > 0 && paginated.every((s) => selectedIds.has(s.id));
  const someSelected = paginated.some((s) => selectedIds.has(s.id));
  const selectedSignals = useMemo(
    () => filtered.filter((s) => selectedIds.has(s.id)),
    [filtered, selectedIds]
  );

  const toggleAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const signal of paginated) {
        if (allSelected) next.delete(signal.id);
        else next.add(signal.id);
      }
      return next;
    });

  const toggleRow = useCallback(
    (id: string) =>
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    []
  );

  const openSignal = useCallback(
    (signal: Signal) => router.push(getAlertDetailHref(signal.alertType, signal.id)),
    [router]
  );

  const clearFilters = useCallback(() => {
    setStatusFilter(null);
    setDateFilter(null);
    setActiveTab('all');
    setSearchQuery('');
  }, []);

  const hasActiveFilters = !!(
    statusFilter ||
    dateFilter ||
    activeTab !== 'all' ||
    searchQuery.trim()
  );

  const moreItems: MenuProps['items'] = [
    {
      key: 'status-new',
      label: (
        <span className={statusFilter === 'new' ? 'text-main-p font-semibold' : ''}>
          Status: New
        </span>
      ),
      onClick: () => setStatusFilter((p) => (p === 'new' ? null : 'new')),
    },
    {
      key: 'status-linked',
      label: (
        <span className={statusFilter === 'linked' ? 'text-main-p font-semibold' : ''}>
          Status: Linked
        </span>
      ),
      onClick: () => setStatusFilter((p) => (p === 'linked' ? null : 'linked')),
    },
    {
      key: 'status-closed',
      label: (
        <span className={statusFilter === 'closed' ? 'text-main-p font-semibold' : ''}>
          Status: Closed
        </span>
      ),
      onClick: () => setStatusFilter((p) => (p === 'closed' ? null : 'closed')),
    },
    { type: 'divider' },
    {
      key: 'clear',
      label: 'Clear all filters',
      danger: true,
      onClick: clearFilters,
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Page header — breadcrumb comes from the global BreadcrumbBar (see BREADCRUMB_MAP). */}
      <FeaturePageHeader Icon={CircleAlert} title="Awareness" />

      {/* Filter toolbar — its own card above the table, matching Watchtower & Action Queue */}
      <div className={FILTER_BAR}>
        {TABS.map((tab) => (
          <FilterPill
            key={tab.key}
            label={tab.label}
            count={tabCounts[tab.key]}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
        <DatePicker
          value={dateFilter}
          onChange={(d) => setDateFilter(d)}
          allowClear
          placement="bottomLeft"
          format="DD MMM YYYY"
          placeholder="Select Date"
          aria-label="Filter by received date"
          suffixIcon={null}
          prefix={<CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
          className={`${FILTER_DATE_PICKER} h-8 shrink-0 rounded-full! border px-3.5! text-[13px]! font-medium! transition-colors duration-200 ease-in-out ${
            dateFilter ? PILL_ACTIVE : PILL_IDLE
          }`}
        />
        <Dropdown menu={{ items: moreItems }} trigger={['click']} placement="bottomLeft">
          <button
            type="button"
            className={`${PILL_BASE} ${FOCUS_RING} ${statusFilter ? PILL_ACTIVE : PILL_IDLE}`}
          >
            <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            More{statusFilter ? ` · ${STATUS_CONFIG[statusFilter].label}` : ''}
          </button>
        </Dropdown>

        <div className={FILTER_BAR_TRAILING}>
          <Input
            placeholder="Search awareness..."
            aria-label="Search awareness"
            allowClear
            prefix={<Search className="mr-1 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={SEARCH_INPUT}
          />
          <DisabledTooltip
            disabled={!hasActiveFilters}
            reason="No filters applied — nothing to reset."
          >
            <button
              type="button"
              aria-label="Reset filters"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={`${PILL_BASE} ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-50 ${
                hasActiveFilters
                  ? `${PILL_IDLE} text-main-p!`
                  : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Reset
            </button>
          </DisabledTooltip>
        </div>
      </div>

      {/* Table card */}
      <section className={TABLE_CARD}>
        {/* Selected-signals review panel */}
        {selectedSignals.length > 0 && (
          <div className="border-b border-slate-100 px-4 py-4">
            <CollapsibleSection
              title={`Selected awareness (${selectedSignals.length})`}
              badge="Review before action"
              defaultOpen
            >
              <div className="space-y-3">
                {selectedSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="ds-caption! my-0! mb-1! truncate font-semibold! text-slate-900">
                          {signal.signal}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                          <span>{signal.source.name}</span>
                          <span>•</span>
                          <span>{signal.refNumber}</span>
                          <span>•</span>
                          <span>{signal.route.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RouteBadge route={signal.route} />
                        <span
                          className={`h-2 w-2 rounded-full ${STATUS_CONFIG[signal.status].dot}`}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {/* 1064px = 32px container padding + 48px row padding + the 984px column tracks below. */}
          <div className="min-w-[1064px] p-4 sm:p-5">
            <div
              className={`grid ${COL} ${ROW_PAD} ${TABLE_HEADER_BG} mb-3 items-center rounded-lg py-3.5`}
            >
              <div className="flex items-center">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={toggleAll}
                  aria-label="Select all awareness on this page"
                />
              </div>
              <ColHeader>Source</ColHeader>
              <ColHeader>Awareness</ColHeader>
              <ColHeader>Reference Number</ColHeader>
              <ColHeader>Suggested route</ColHeader>
              <ColHeader>Status</ColHeader>
              <ColHeader>Received</ColHeader>
              <span />
            </div>

            <div className="flex flex-col">
              {!selectedProjectId ? (
                <p className="ds-caption! my-0! py-10 text-center text-slate-400">
                  Select a project to view awareness.
                </p>
              ) : isLoading ? (
                <div className="px-4 py-4">
                  <Skeleton active title={false} paragraph={{ rows: 6 }} />
                </div>
              ) : filtered.length === 0 ? (
                <p className="ds-caption! my-0! py-10 text-center text-slate-400">
                  No awareness matches your filters.
                </p>
              ) : (
                paginated.map((signal) => (
                  <SignalRow
                    key={signal.id}
                    signal={signal}
                    isSelected={selectedIds.has(signal.id)}
                    onToggle={toggleRow}
                    onOpen={openSignal}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3">
            <GenericPagination
              currentPage={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </section>

      {/* Guidance bar — a standalone card below the table, per the design */}
      {/* <aside className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <CircleAlert className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="ds-caption! my-0 text-slate-500">
          Start by reviewing all incoming awareness. Move to{' '}
          <span className="font-semibold! text-slate-700">Confirm Awareness</span> to approve the
          suggested route.
        </p>
      </aside> */}
    </div>
  );
}
