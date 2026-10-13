'use client';

/**
 * SignalsInbox
 * Inbox-style table of incoming project "signals" with filter tabs, checkboxes,
 * route badges, status indicators, and a bottom info bar — matching the Figma design.
 */

import type { MenuProps } from 'antd';
import { Checkbox, DatePicker, Dropdown, Input } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { CalendarDays, ChevronRight, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useMemo, useState } from 'react';
import { FILTER_DATE_PICKER } from '@/constants/list-page.constants';
import { useGetProjectAlerts } from '@/hooks/modules/project-alerts';
import { getAlertDetailHref } from '@/lib/utils/org-dashboard.utils';
import { useProjectStore } from '@/store/project.store';
import {
  BADGE_CLASS,
  type FilterTab,
  mapAlertToSignal,
  ROUTE_ICON,
  type Signal,
  SOURCE_ICON,
  STATUS_CONFIG,
  type StatusType,
} from './signals-inbox.helpers';

const COL_GRID = 'grid-cols-[36px_200px_1fr_160px_110px_100px_40px]';

const RouteBadge = ({ route }: { route: Signal['route'] }) => {
  const Icon = ROUTE_ICON[route.type];
  return (
    <span
      className={`ds-micro! inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold! ${BADGE_CLASS[route.tone]}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {route.label}
    </span>
  );
};

const ColHeader = ({ children }: { children: React.ReactNode }) => (
  <span className="ds-micro! font-bold! tracking-wider text-slate-400 uppercase">{children}</span>
);

export default function SignalsInbox() {
  const router = useRouter();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusType | null>(null);

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
    if (dateFilter)
      list = list.filter(
        (s) =>
          s.received.day ===
          (dateFilter.isSame(dayjs(), 'day') ? 'Today' : dateFilter.format('DD MMM YYYY'))
      );
    return list;
  }, [signals, activeTab, searchQuery, statusFilter, dateFilter]);

  const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
  const someSelected = filtered.some((s) => selectedIds.has(s.id));

  const toggleAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const signal of filtered) {
        if (allSelected) next.delete(signal.id);
        else next.add(signal.id);
      }
      return next;
    });

  const openSignal = (signal: Signal) =>
    router.push(getAlertDetailHref(signal.alertType, signal.id));

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'early-warning', label: 'Early Warning' },
    { key: 'pmi', label: 'PMI' },
    { key: 'compensation', label: 'Compensation' },
  ];

  const moreMenuItems: MenuProps['items'] = [
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
      onClick: () => {
        setStatusFilter(null);
        setDateFilter(null);
        setActiveTab('all');
        setSearchQuery('');
      },
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((tab) => {
            const count = tabCounts[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`ds-caption! inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-semibold! transition-colors ${isActive ? 'border-main-p/20 bg-main-p/8 text-main-p' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] leading-none font-bold ${isActive ? 'bg-main-p text-white' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <DatePicker
            value={dateFilter}
            onChange={(d) => setDateFilter(d)}
            allowClear
            placement="bottomLeft"
            format="DD MMM YYYY"
            placeholder="Select Date"
            suffixIcon={<CalendarDays className="h-3.5 w-3.5 text-slate-400" />}
            className={`ds-caption! ${FILTER_DATE_PICKER} rounded-lg! border px-3! py-1.5! font-medium! transition-colors ${dateFilter ? 'border-main-p/20 bg-main-p/8 text-main-p' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
          />
          <Dropdown menu={{ items: moreMenuItems }} trigger={['click']} placement="bottomLeft">
            <button
              type="button"
              className={`ds-caption! inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium! transition-colors ${statusFilter ? 'border-main-p/20 bg-main-p/8 text-main-p' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              More{statusFilter ? ` · ${STATUS_CONFIG[statusFilter].label}` : ''}
            </button>
          </Dropdown>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search signals..."
            prefix={<Search className="h-3.5 w-3.5 text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ds-caption! w-40 rounded-lg! border-slate-200!"
            size="small"
          />
          <button
            type="button"
            aria-label="Advanced filters"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div
            className={`grid ${COL_GRID} bg-surface-table-header mb-2 items-center rounded-lg px-4 py-2.5`}
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
              />
            </div>
            <ColHeader>Source</ColHeader>
            <ColHeader>Signal</ColHeader>
            <ColHeader>Suggested Route</ColHeader>
            <ColHeader>Status</ColHeader>
            <ColHeader>Received</ColHeader>
            <span />
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            {!selectedProjectId ? (
              <p className="ds-caption! py-10 text-center text-slate-400">
                Select a project to view signals.
              </p>
            ) : isLoading ? (
              <p className="ds-caption! py-10 text-center text-slate-400">Loading signals…</p>
            ) : filtered.length === 0 ? (
              <p className="ds-caption! py-10 text-center text-slate-400">
                No signals match your filters.
              </p>
            ) : (
              filtered.map((signal, idx) => {
                const { bg, iconClass, Icon } = SOURCE_ICON[signal.source.type];
                const status = STATUS_CONFIG[signal.status];
                const isSelected = selectedIds.has(signal.id);
                return (
                  // Same convention as WatchtowerEventRow: the trailing chevron <button> is
                  // the row's accessible affordance and this click a mouse convenience over it.
                  // biome-ignore lint/a11y/noStaticElementInteractions: see above
                  // biome-ignore lint/a11y/useKeyWithClickEvents: see above
                  <div
                    key={signal.id}
                    onClick={() => openSignal(signal)}
                    className={`grid ${COL_GRID} cursor-pointer items-center px-4 py-2.5! transition-colors ${isSelected ? 'bg-main-p/5' : idx === 0 ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'}`}
                  >
                    <div className="flex items-center justify-center">
                      {/* Handlers sit on the Checkbox so the cell stays a plain container. */}
                      <Checkbox
                        checked={isSelected}
                        aria-label={`Select signal: ${signal.signal}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(signal.id);
                        }}
                      />
                    </div>
                    <div className="flex min-w-0 items-center gap-2! pr-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
                      >
                        <Icon className={`h-4 w-4 ${iconClass}`} />
                      </span>
                      <div className="min-w-0">
                        <p className="ds-caption! my-0 truncate font-semibold! text-slate-800">
                          {signal.source.name}
                        </p>
                        <p className="ds-micro! my-0 text-slate-400">{signal.source.sub}</p>
                      </div>
                    </div>
                    <p className="ds-caption! my-0 line-clamp-2 pr-4 font-medium! text-slate-700">
                      {signal.signal}
                    </p>
                    <div className="pr-3">
                      <RouteBadge route={signal.route} />
                    </div>
                    <div
                      className={`ds-caption! flex items-center gap-1.5 font-semibold! ${status.textClass}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                      {status.label}
                    </div>
                    <div>
                      <p className="ds-caption! my-0 leading-tight font-semibold! text-slate-700">
                        {signal.received.day}
                      </p>
                      <p className="ds-micro! my-0 leading-tight text-slate-400">
                        {signal.received.time}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        aria-label={`Open signal: ${signal.signal}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openSignal(signal);
                        }}
                        className="hover:text-main-p flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:outline-none"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Info bar */}
      {/* <div className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-400"><Info className="h-3 w-3" /></span>
        <p className="ds-caption! my-0 text-slate-500">
          Start by reviewing all incoming signals. Move to <span className="font-semibold! text-slate-700">Confirm Signal</span> to approve the suggested route.
        </p>
      </div> */}
    </div>
  );
}
