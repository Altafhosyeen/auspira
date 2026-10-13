'use client';

import { Card, Flex, notification, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import RegisterSearchFilterToolbar from '@/components/shared/register-search-filter-toolbar';
import { MENU_PATH } from '@/constants';
import { exportToXlsx } from '@/lib/utils';
import { useProjectStore } from '@/store/project.store';
import {
  PROGRAMME_REGISTER_COPY,
  PROGRAMME_REGISTER_EXPORT_COPY,
  programmeStatusFilterOptions,
} from '../constants/programme.constants';
import {
  fetchProgrammeSummaries,
  useDownloadProgrammeFile,
  useGetProgrammeSummary,
} from '../hooks/use-programme';
import type { ProgrammeRegisterRow } from '../types/programme.types';
import { PROGRAMME_REGISTER_EXPORT_COLUMNS } from '../utils/programme-export.utils';
import ProgrammeRegisterHeader from './programme-register-header';
import ProgrammeRegisterTable from './programme-register-table';
import ProgrammeThemeProvider from './programme-theme-provider';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

// Container — owns state & side effects; delegates rendering to presentational components.
// Paging and search are server-driven (Skip/Top/Term), exactly as the PDR and DN registers
// are, so the register stays a window onto the backend rather than a fully-loaded page.
const ProgrammeListPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isExporting, setIsExporting] = useState(false);

  const projectId = useProjectStore((store) => store.selectedProjectId);
  const projectName = useProjectStore(
    (store) => store.projectOptions.find((option) => option.id === store.selectedProjectId)?.name
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTerm(search.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const query = useGetProgrammeSummary({
    projectId: projectId ?? undefined,
    params: {
      skip: (currentPage - 1) * pageSize,
      top: pageSize,
      term: term || undefined,
      includeAll: true,
    },
  });

  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const totalCount = useMemo(() => Number(query.data?.count ?? 0), [query.data?.count]);

  // The status and health fields come back as bare integers and the backend publishes no enum,
  // so the filter is built from the codes actually on the page rather than from a fixed list —
  // there is nothing to enumerate it from. Sorted, so the options never reorder mid-session.
  const statusOptions = useMemo(() => programmeStatusFilterOptions(rows), [rows]);

  const hasActiveFilters = search.trim() !== '' || selectedStatuses.length > 0;

  // The summary endpoint takes no status parameter, so the filter narrows the fetched page
  // client-side — the same way the PDR register's filter works.
  const filtered = useMemo(
    () =>
      selectedStatuses.length === 0
        ? rows
        : rows.filter(
            (row) => row.statusCode !== undefined && selectedStatuses.includes(row.statusCode)
          ),
    [rows, selectedStatuses]
  );

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // The row id is the programme health id, which is what the detail route reads.
  const handleOpenRecord = (row: ProgrammeRegisterRow) => {
    router.push(`${MENU_PATH.OCA_PROGRAM_HEALTH.pathname}/${row.id}`);
  };

  const { mutate: downloadFile, downloadingId } = useDownloadProgrammeFile();

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setCurrentPage(1);
    // `term` trails the search box through the debounce effect, so clearing `search` clears it
    // too on the next tick.
  };

  // Exports the whole register (all pages) rather than just the on-screen rows — same rule the
  // PMI, DN and PDR registers follow.
  const handleExport = async () => {
    if (!projectId) return;

    setIsExporting(true);
    try {
      const result = await fetchProgrammeSummaries(projectId, { skip: 0, includeAll: true });
      const exportRows = result.items;

      if (exportRows.length === 0) {
        notification.info({ message: PROGRAMME_REGISTER_EXPORT_COPY.empty });
        return;
      }

      const stamp = dayjs().format(PROGRAMME_REGISTER_EXPORT_COPY.fileTimestampFormat);

      exportToXlsx({
        fileName: `${projectName || PROGRAMME_REGISTER_EXPORT_COPY.fileNameFallback}-${PROGRAMME_REGISTER_EXPORT_COPY.registerFileSuffix}-${stamp}`,
        sheetName: PROGRAMME_REGISTER_EXPORT_COPY.registerSheetName,
        columns: PROGRAMME_REGISTER_EXPORT_COLUMNS,
        rows: exportRows,
      });
    } catch {
      notification.error({ message: PROGRAMME_REGISTER_EXPORT_COPY.failed });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProgrammeThemeProvider>
      <Flex vertical gap={16}>
        <ProgrammeRegisterHeader
          exporting={isExporting}
          exportDisabled={!projectId}
          onExport={handleExport}
        />

        {/* The card head carries only the toolbar, and antd draws its own rule under it — the
            band above the table the other registers show. */}
        <Card
          extra={
            <RegisterSearchFilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={PROGRAMME_REGISTER_COPY.searchPlaceholder}
              selectedStatuses={selectedStatuses}
              onStatusesChange={(values) => {
                setSelectedStatuses(values);
                setCurrentPage(1);
              }}
              statusOptions={statusOptions}
              filterLabel={PROGRAMME_REGISTER_COPY.filterLabel}
              extraActions={
                <DisabledTooltip
                  disabled={!hasActiveFilters}
                  reason={PROGRAMME_REGISTER_COPY.clearAllDisabledReason}
                >
                  <Typography.Link
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="font-medium shrink-0"
                  >
                    {PROGRAMME_REGISTER_COPY.clearAll}
                  </Typography.Link>
                </DisabledTooltip>
              }
            />
          }
        >
          <ProgrammeRegisterTable
            data={filtered}
            loading={query.isFetching}
            onOpen={handleOpenRecord}
            onDownload={downloadFile}
            downloadingId={downloadingId}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (count, range) => `${range[0]}-${range[1]} of ${count}`,
            }}
            onChange={(pagination) =>
              handlePageChange(pagination.current ?? 1, pagination.pageSize ?? DEFAULT_PAGE_SIZE)
            }
          />
        </Card>
      </Flex>
    </ProgrammeThemeProvider>
  );
};

export default ProgrammeListPage;
