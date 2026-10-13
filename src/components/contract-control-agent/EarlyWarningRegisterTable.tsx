'use client';

import { Badge, notification, Tabs, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  Clock,
  FileSpreadsheet,
  FileTextIcon,
  Gauge,
  Mail,
  MapPin,
  PoundSterling,
  Search,
  ShieldCheck,
  Star,
  UserPen,
} from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import type React from 'react';
import { useMemo, useState } from 'react';
import ButtonX from '@/components/antd/ButtonX';
import TableX from '@/components/antd/TableX';
import { EmptyState } from '@/components/shared/EmptyState';
import { MENU_PATH } from '@/constants';
import { ROW_OPEN_BUTTON, ROW_OPEN_ICON } from '@/constants/list-page.constants';
import { getEarlyWarnings, useGetEarlyWarnings } from '@/hooks/modules/early-warning';
import { useGetProjectById } from '@/hooks/modules/project';
import { exportToXlsx, parseBackendDate, type XlsxColumn } from '@/lib/utils';
import { useProjectStore } from '@/store/project.store';
import type { IMetaPaginatedResponse } from '@/types';
import type { ProjectDetailSummary } from '@/types/project/selection.types';
import {
  type EarlyWarning,
  type EwImpact,
  type EwStatus,
  IMPACT_LABEL,
  IMPACT_STYLE,
  STATUS_STYLE,
} from './early-warning.data';
import type { ApiEarlyWarningDetail } from './early-warning-detail.map';
import { mapApiEarlyWarning } from './early-warning-register.mappers';

// ─── CELL PARTS ──────────────────────────────────────────────────────────────

const IMPACT_ICON: Record<EwImpact, React.ComponentType<{ size?: number }>> = {
  DELAY: Clock,
  KEY_DATE: MapPin,
  COST: PoundSterling,
  PERFORMANCE: Gauge,
};

const ImpactChip = ({ impact }: { impact: EwImpact }) => {
  const Icon = IMPACT_ICON[impact];
  const style = IMPACT_STYLE[impact].active;
  return (
    <span
      className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      style={style}
    >
      <Icon size={11} />
      {IMPACT_LABEL[impact]}
    </span>
  );
};

const StatusPill = ({ status, label }: { status: EwStatus; label: string }) => (
  <span
    className="inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase"
    style={STATUS_STYLE[status]}
  >
    {label}
  </span>
);

// ─── TABS ────────────────────────────────────────────────────────────────────

/** Active holds every EW still in play; Archived holds the closed-out ones. */
type RegisterTab = 'ACTIVE' | 'ARCHIVED';

const TAB_LABEL: Record<RegisterTab, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
};

/**
 * The list endpoint has no status filter, and the tab counts need the whole register rather than
 * the visible page — so it is fetched in one call and split, searched and paginated in the
 * browser. A project's register runs to tens of rows, not thousands.
 */
const REGISTER_FETCH_LIMIT = 500;

const matchesTerm = (ew: EarlyWarning, term: string) =>
  [ew.ref, ew.risk, ew.by, ew.source, ew.statusLabel, ew.potentialImpacts, ew.description].some(
    (field) => field?.toLowerCase().includes(term)
  );

// ─── EXCEL EXPORT ────────────────────────────────────────────────────────────

/** ISO string → Date so the workbook gets a real, sortable date cell instead of formatted text. */
const toDateCell = (value?: string | null) => {
  if (!value) return null;
  return parseBackendDate(value) ?? value;
};

/**
 * One export covers the whole register — Active and Archived together, distinguished by the
 * Status column — so close-out fields (blank on Active rows) sit alongside the rest rather than
 * only appearing in a separate Archived-only export. `id` is deliberately not a column.
 */
const EXPORT_COLUMNS: XlsxColumn<EarlyWarning>[] = [
  { header: 'Reference', width: 14, value: (ew) => ew.ref },
  { header: 'Risk', width: 46, value: (ew) => ew.risk },
  { header: 'Description', width: 60, value: (ew) => ew.description },
  { header: 'Source', width: 16, value: (ew) => ew.source },
  { header: 'Raised On', width: 14, value: (ew) => toDateCell(ew.raisedAt) },
  { header: 'Raised By', width: 22, value: (ew) => ew.by },
  {
    header: 'Potential Impacts',
    width: 34,
    // Mirrors the Impact column: the flag chips when set, otherwise the free-text assessment.
    value: (ew) =>
      ew.impacts.length > 0
        ? ew.impacts.map((impact) => IMPACT_LABEL[impact]).join(', ')
        : ew.potentialImpacts,
  },
  { header: 'Status', width: 14, value: (ew) => ew.statusLabel },
  { header: 'Closed On', width: 14, value: (ew) => toDateCell(ew.closedAt) },
  { header: 'Closing Reason', width: 28, value: (ew) => ew.closingReason },
  { header: 'Closed By', width: 22, value: (ew) => ew.closedBy },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const EarlyWarningRegisterTable = () => {
  const router = useRouter();
  const [tab, setTab] = useState<RegisterTab>('ACTIVE');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  const { data, isLoading } = useGetEarlyWarnings<IMetaPaginatedResponse<ApiEarlyWarningDetail>>({
    projectId: selectedProjectId ?? '',
    params: { skip: 0, top: REGISTER_FETCH_LIMIT },
    enabled: !!selectedProjectId,
  });

  const { data: project } = useGetProjectById<ProjectDetailSummary>({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  const openEw = (id: string) => {
    router.push(`${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}/detail/${id}`);
  };

  const rows = useMemo(() => (data?.items ?? []).map(mapApiEarlyWarning), [data]);

  const byTab = useMemo(
    () => ({
      ACTIVE: rows.filter((ew) => ew.status !== 'CLOSED'),
      ARCHIVED: rows.filter((ew) => ew.status === 'CLOSED'),
    }),
    [rows]
  );

  const visibleRows = useMemo(() => {
    const query = term.trim().toLowerCase();
    return query ? byTab[tab].filter((ew) => matchesTerm(ew, query)) : byTab[tab];
  }, [byTab, tab, term]);

  const selectTab = (nextTab: RegisterTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const exportToExcel = async () => {
    if (!selectedProjectId) return;

    // Exports the whole register — Active and Archived together — regardless of which tab, search
    // or page is on screen, since it is meant to be the full validated record, not the current
    // view. So it re-fetches with `includeAll` from skip 0 rather than reusing the table's rows,
    // which are capped at REGISTER_FETCH_LIMIT.
    setIsExporting(true);
    try {
      const all = await getEarlyWarnings<IMetaPaginatedResponse<ApiEarlyWarningDetail>>(
        selectedProjectId,
        { skip: 0, includeAll: true }
      );
      const exportRows = (all?.items ?? []).map(mapApiEarlyWarning);

      if (exportRows.length === 0) {
        // An empty workbook would just look like a broken download.
        notification.info({ message: 'There are no early warnings to export.' });
        return;
      }

      exportToXlsx({
        fileName: `${project?.referenceId || 'project'}-EW-${dayjs().format('DD MMM YYYY HH-mm')}`,
        sheetName: 'Early Warnings',
        columns: EXPORT_COLUMNS,
        rows: exportRows,
      });
    } catch {
      notification.error({ message: 'Could not export the register. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setPage(1);
          }}
          placeholder="Search EWs..."
          className="h-9 w-64 rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-700 transition-colors outline-none placeholder:text-gray-400 focus:border-[#0F4C81]"
        />
      </div>
      <ButtonX
        onClick={exportToExcel}
        loading={isExporting}
        disabled={!selectedProjectId}
        icon={<FileSpreadsheet size={15} />}
      >
        Export to Excel
      </ButtonX>
    </div>
  );

  const table = (
    <div className="[&_.ant-table-body]:overflow-y-auto! [&_.ant-table-tbody>tr:hover>td]:bg-gray-50/70! [&_.ant-table-tbody>tr>td]:px-3! [&_.ant-table-tbody>tr>td]:py-2! [&_.ant-table-tbody>tr>td]:align-top! [&_.ant-table-tbody>tr>td.ew-open-col]:align-middle! [&_.ant-table-thead>tr>th]:bg-[#DCEEFF]! [&_.ant-table-thead>tr>th]:px-3! [&_.ant-table-thead>tr>th]:py-2.5! [&_.ant-table-thead>tr>th]:text-[11px]! [&_.ant-table-thead>tr>th]:font-semibold! [&_.ant-table-thead>tr>th]:tracking-wider! [&_.ant-table-thead>tr>th]:text-gray-500! [&_.ant-table-thead>tr>th]:uppercase! [&_.ant-table-thead>tr>th]:whitespace-nowrap!">
      <TableX<EarlyWarning>
        columns={columns}
        dataSource={visibleRows}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: TABLE_MIN_WIDTH }}
        // TableX defaults to 420px, which cut a 10-row page roughly in half behind an inner
        // scrollbar. Tighter rows plus this fit a full page without one on a normal screen.
        defaultScrollY={640}
        // `group` lets the trailing open button light up with the rest of the row on hover.
        onRow={(ew) => ({ onClick: () => openEw(ew.id), className: 'group cursor-pointer' })}
        pagination={{
          current: page,
          pageSize,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
        locale={{
          emptyText: term.trim() ? (
            'No early warnings match your filters.'
          ) : (
            <EmptyState
              tone="success"
              icon={<ShieldCheck className="text-emerald-500" size={22} />}
              title={
                tab === 'ARCHIVED' ? 'No closed early warnings yet' : 'All clear — nothing active'
              }
              description={
                tab === 'ARCHIVED'
                  ? 'Early warnings closed on this project will appear here.'
                  : 'No active early warnings on this project right now.'
              }
            />
          ),
        }}
      />
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="contract-tabs [&_.ant-tabs-nav-list]:w-auto! [&_.ant-tabs-nav-list]:gap-6! [&_.ant-tabs-tab-btn]:text-[15px]! [&_.ant-tabs-tab:not(.ant-tabs-tab-active)_.ant-tabs-tab-btn]:font-medium! [&_.ant-tabs-tab:not(.ant-tabs-tab-active)_.ant-tabs-tab-btn]:text-slate-600!">
        <Tabs
          activeKey={tab}
          onChange={(key) => selectTab(key as RegisterTab)}
          tabBarExtraContent={{ right: toolbar }}
          items={(Object.keys(TAB_LABEL) as RegisterTab[]).map((key) => ({
            key,
            label: (
              <span className="flex items-center gap-2 px-1 py-0.5">
                {TAB_LABEL[key]}
                <Badge
                  count={byTab[key].length}
                  showZero
                  overflowCount={999}
                  color={key === tab ? 'var(--ds-main-p)' : '#94a3b8'}
                />
              </span>
            ),
            // Only the open tab gets the table, so a single instance moves between panes rather
            // than each tab keeping its own mounted copy.
            children: key === tab ? table : null,
          }))}
        />
      </div>

      {(data?.meta?.totalCount ?? 0) > rows.length && (
        <p className="mt-2 mb-0! px-1 text-xs text-amber-600">
          Showing the {rows.length} most recent of {data?.meta?.totalCount} early warnings — the tab
          counts cover these only. The Excel export still covers the full register.
        </p>
      )}
    </div>
  );
};

const columns: ColumnsType<EarlyWarning> = [
  {
    title: 'Reference Number',
    dataIndex: 'ref',
    key: 'ref',
    className: 'whitespace-nowrap',
    width: 120,
    render: (_, ew) => (
      <>
        <div className="text-sm font-bold text-[#0F2E4C]">{ew.ref}</div>
        {ew.isNew && (
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-amber-500 uppercase">
            <Star size={11} className="fill-amber-500" /> New
          </div>
        )}
      </>
    ),
  },
  {
    title: 'Risk',
    dataIndex: 'risk',
    key: 'risk',
    width: 230,
    render: (_, ew) => (
      <>
        <div className="flex items-start gap-1.5 text-sm leading-snug font-semibold text-gray-800">
          {ew.source && (
            <Tooltip title={ew.source}>
              <span
                className={`inline-flex shrink-0 items-center justify-center rounded-full p-1 ${
                  ew.source === 'From email'
                    ? 'bg-blue-50 text-blue-500'
                    : 'bg-violet-50 text-violet-500'
                }`}
              >
                {ew.source === 'From email' ? (
                  <Mail size={13} strokeWidth={2.25} />
                ) : (
                  <UserPen size={13} strokeWidth={2.25} />
                )}
              </span>
            </Tooltip>
          )}
          <div className="min-w-0 flex-1">
            <Tooltip title={ew.risk}>
              <span className="line-clamp-2">{ew.risk}</span>
            </Tooltip>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Raised On',
    dataIndex: 'raised',
    key: 'raised',
    className: 'whitespace-nowrap',
    width: 140,
    render: (_, ew) => <span className="text-sm text-gray-500">{ew.raised}</span>,
  },
  {
    title: 'Raised By',
    dataIndex: 'by',
    key: 'by',
    // Fixed width + truncation: the table runs on `table-layout: fixed` (TableX sets scroll.y), so
    // a long address would otherwise spill over the next column instead of widening this one.
    width: 160,
    render: (_, ew) => (
      <Tooltip title={ew.by}>
        <span className="block truncate text-sm text-gray-600">{ew.by}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Potential Impacts',
    key: 'impact',
    // Widest text column after Risk. Every column is sized because the fixed layout makes an
    // un-widthed one absorb the shortfall on a narrow viewport, collapsing it to nothing.
    width: 225,
    render: (_, ew) =>
      ew.impacts.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {ew.impacts.map((impact) => (
            <ImpactChip key={impact} impact={impact} />
          ))}
        </div>
      ) : ew.potentialImpacts ? (
        // No flag was set, but the extraction still captured a free-text impact — show that
        // instead of leaving the column looking empty.
        <Tooltip title={ew.potentialImpacts}>
          <span className="block truncate text-xs text-gray-500">{ew.potentialImpacts}</span>
        </Tooltip>
      ) : (
        <span className="text-xs text-gray-300">—</span>
      ),
  },
  {
    title: 'Status',
    key: 'status',
    className: 'whitespace-nowrap',
    // Sized to the widest pill ('MITIGATING') so the leftover width falls to Potential Impacts
    // rather than being split evenly with it.
    width: 125,
    render: (_, ew) => <StatusPill status={ew.status} label={ew.statusLabel} />,
  },
  {
    // Affordance only — the whole row is already the click target (see `onRow`), so this is
    // decorative and hidden from screen readers rather than a second, competing control.
    title: '',
    key: 'open',
    width: 56,
    className: 'ew-open-col whitespace-nowrap',
    render: () => (
      <div className="flex h-full items-center justify-center">
        <span className={ROW_OPEN_BUTTON} aria-hidden>
          <FileTextIcon className={ROW_OPEN_ICON} />
        </span>
      </div>
    ),
  },
];

/**
 * Horizontal scroll floor, deliberately set *below* the ~1045px the columns above add up to.
 * `scroll.x` renders as `width: Npx; min-width: 100%`, so any container wider than this wins and
 * the fixed layout scales all seven columns to fit — the register stays on one screen with no
 * sideways scroll. Only a container narrower than this pins the table and scrolls, which is the
 * point at which the columns would be too cramped to read anyway.
 */
const TABLE_MIN_WIDTH = 900;

export default EarlyWarningRegisterTable;
