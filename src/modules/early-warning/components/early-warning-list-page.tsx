import { DownOutlined } from '@ant-design/icons';
import { Button, Card, Flex, notification, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import RegisterSearchFilterToolbar from '@/components/shared/register-search-filter-toolbar';
import { EarlyWarningStatus } from '@/constants/enum.constant';
import { useGetProjectById } from '@/hooks/modules/project';
import { exportToXlsx, parseBackendDate, type XlsxColumn } from '@/lib/utils';
import { useProjectStore } from '@/store/project.store';
import {
  EARLY_WARNING_IMPACT_LABELS,
  EARLY_WARNING_REGISTER_COPY,
  EARLY_WARNING_STATUS_LABELS,
} from '../constants/early-warning.constants';
import { fetchEarlyWarnings, useGetEarlyWarnings } from '../hooks/use-early-warnings';
import type { EarlyWarning } from '../types/early-warning.types';
import { matchesSearchTerm } from '../utils/early-warning.utils';
import EarlyWarningRegisterHeader from './early-warning-register-header';
import EarlyWarningTable from './early-warning-table';
import EwThemeProvider from './ew-theme-provider';

const DEFAULT_VISIBLE_COUNT = 10;
const LOAD_MORE_STEP = 10;
const SEARCH_DEBOUNCE_MS = 400;

// The list endpoint is fetched with includeAll, then searched and filtered.
const REGISTER_FETCH_LIMIT = 500;

/** ISO string → Date so the workbook gets a real, sortable date cell instead of formatted text. */
const toDateCell = (value?: string | null) => (value ? (parseBackendDate(value) ?? value) : null);

/** One export covers the whole register (see onExport) — close-out fields sit beside the rest. */
const EXPORT_COLUMNS: XlsxColumn<EarlyWarning>[] = [
  { header: 'Reference', width: 14, value: (ew) => ew.reference },
  { header: 'Risk', width: 46, value: (ew) => ew.title },
  { header: 'Description', width: 60, value: (ew) => ew.description },
  { header: 'Source', width: 16, value: (ew) => ew.source },
  { header: 'Raised On', width: 14, value: (ew) => toDateCell(ew.raisedAt) },
  { header: 'Raised By', width: 22, value: (ew) => ew.raisedBy },
  {
    header: 'Potential Impacts',
    width: 34,
    value: (ew) =>
      ew.impacts.length > 0
        ? ew.impacts.map((impact) => EARLY_WARNING_IMPACT_LABELS[impact]).join(', ')
        : ew.potentialImpacts,
  },
  {
    header: 'Status',
    width: 14,
    value: (ew) => EARLY_WARNING_STATUS_LABELS[ew.status] ?? ew.status,
  },
  { header: 'Closed On', width: 14, value: (ew) => toDateCell(ew.closedAt) },
  { header: 'Closing Reason', width: 28, value: (ew) => ew.closingReason },
  { header: 'Closed By', width: 22, value: (ew) => ew.closedBy },
];

const STATUS_FILTER_OPTIONS = [
  { value: EarlyWarningStatus.Open, label: 'Open' },
  { value: EarlyWarningStatus.Closed, label: 'Closed' },
  { value: EarlyWarningStatus.NotAccepted, label: 'Not Accepted' },
  { value: EarlyWarningStatus.Discard, label: 'Discard' },
];

// Container — owns state & side effects; delegates rendering to presentational components.
const EarlyWarningListPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const [exporting, setExporting] = useState(false);

  const projectId = useProjectStore((store) => store.selectedProjectId);

  const { data: project } = useGetProjectById({
    id: projectId ?? '',
    enabled: !!projectId,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTerm(search.trim().toLowerCase());
      setVisibleCount(DEFAULT_VISIBLE_COUNT);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  // One fetch covers every status; includeAll keeps closed rows in the payload.
  // Selected lifecycle codes go to the API as `status=0,1,...` — the client-side
  // status check stays as a safety net in case the backend ignores the param.
  const query = useGetEarlyWarnings({
    projectId: projectId ?? undefined,
    params: {
      skip: 0,
      top: REGISTER_FETCH_LIMIT,
      term: term || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses.join(',') : undefined,
      includeAll: true,
    },
  });

  const allWarnings = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const filtered = useMemo(
    () =>
      allWarnings.filter((ew) => {
        if (
          selectedStatuses.length > 0 &&
          (ew.statusCode === undefined || !selectedStatuses.includes(ew.statusCode))
        ) {
          return false;
        }
        if (term && !matchesSearchTerm(ew, term)) {
          return false;
        }
        return true;
      }),
    [allWarnings, selectedStatuses, term]
  );

  const visibleWarnings = filtered.slice(0, visibleCount);

  // Exports the whole register (every status, all pages) rather than just the on-screen rows.
  const handleExport = async () => {
    if (!projectId) return;

    setExporting(true);
    try {
      const result = await fetchEarlyWarnings(projectId, { skip: 0, includeAll: true });
      const exportRows = result.items;

      if (exportRows.length === 0) {
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
      setExporting(false);
    }
  };

  return (
    <EwThemeProvider>
      <Flex vertical gap={16}>
        <EarlyWarningRegisterHeader
          exporting={exporting}
          onExport={handleExport}
          clauseNumber={project?.clauseNumber ?? ''}
          clauseDescription={project?.clauseDescription ?? ''}
          onRaise={() => router.push('/contract-control-agent/early-warning/register')}
        />

        <Card
          extra={
            <RegisterSearchFilterToolbar
              search={search}
              onSearchChange={setSearch}
              selectedStatuses={selectedStatuses}
              onStatusesChange={(values) => {
                setSelectedStatuses(values);
                setVisibleCount(DEFAULT_VISIBLE_COUNT);
              }}
              statusOptions={STATUS_FILTER_OPTIONS}
            />
          }
        >
          <Flex vertical gap={16}>
            <EarlyWarningTable
              data={visibleWarnings}
              loading={query.isFetching}
              onOpen={(ew) => router.push(`/contract-control-agent/early-warning/${ew.id}`)}
            />

            <Flex vertical align="center" gap={12} style={{ marginTop: 8 }}>
              <Typography.Text style={{ color: '#475467', fontSize: 14 }}>
                {`Showing 1 to ${visibleWarnings.length} of ${filtered.length} activities`}
              </Typography.Text>

              {visibleWarnings.length < filtered.length && (
                <Button
                  type="primary"
                  loading={query.isFetching}
                  icon={<DownOutlined />}
                  iconPosition="end"
                  style={{
                    background: '#0F2E4C',
                    borderColor: '#0F2E4C',
                    fontWeight: 600,
                  }}
                  onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}
                >
                  {EARLY_WARNING_REGISTER_COPY.loadMoreLabel}
                </Button>
              )}
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </EwThemeProvider>
  );
};

export default EarlyWarningListPage;
