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
  DEFECT_NOTICE_EXPORT_COPY,
  DEFECT_NOTICE_REGISTER_COPY,
  DEFECT_NOTICE_REGISTER_STATUSES,
  DEFECT_NOTICE_STATUS_LABELS,
} from '../constants/defect-notice.constants';
import { fetchDefectNotices, useGetDefectNotices } from '../hooks/use-defect-notices';
import type { DefectNotice } from '../types/defect-notice.types';
import { DEFECT_NOTICE_EXPORT_COLUMNS } from '../utils/defect-notice-export.utils';
import DefectNoticeRegisterHeader from './defect-notice-register-header';
import DefectNoticeTable from './defect-notice-table';
import DefectNoticeThemeProvider from './defect-notice-theme-provider';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

// Drawn from the register's own status list and label map rather than restated here, so the
// filter cannot offer a status the badge map would not know how to render.
const STATUS_FILTER_OPTIONS = DEFECT_NOTICE_REGISTER_STATUSES.map((status) => ({
  value: status,
  label: DEFECT_NOTICE_STATUS_LABELS[status],
}));

// Container — owns state & side effects; delegates rendering to presentational components.
// Paging is server-driven: the API takes skip/top and returns meta.totalCount, which the
// table's antd Pagination renders — same shape as the PMI register.
const DefectNoticeListPage = () => {
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

  // The list endpoint takes no status parameter, so the filter narrows the fetched page
  // client-side (the PMI register passes its filter to the API — DN's backend differs).
  const query = useGetDefectNotices({
    projectId: projectId ?? undefined,
    params: {
      skip: (currentPage - 1) * pageSize,
      top: pageSize,
      term: term || undefined,
      includeAll: true,
    },
  });

  const notices = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const totalCount = useMemo(() => Number(query.data?.count ?? 0), [query.data?.count]);
  const filtered = useMemo(
    () =>
      selectedStatuses.length === 0
        ? notices
        : notices.filter((n) => selectedStatuses.includes(n.status)),
    [notices, selectedStatuses]
  );

  const hasActiveFilters = search.trim() !== '' || selectedStatuses.length > 0;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setCurrentPage(1);
    // `term` trails the search box through the debounce effect, so clearing `search`
    // clears it too on the next tick.
  };

  const handleAdd = () => router.push(`${MENU_PATH.CCA_DEFECT_NOTICES.pathname}/new`);

  // Exports the whole register (all pages) rather than just the on-screen rows — same rule
  // the PMI register's export follows.
  const handleExport = async () => {
    if (!projectId) return;

    setIsExporting(true);
    try {
      const result = await fetchDefectNotices(projectId, { skip: 0, includeAll: true });
      const exportRows = result.items;

      if (exportRows.length === 0) {
        notification.info({ message: DEFECT_NOTICE_EXPORT_COPY.empty });
        return;
      }

      const stamp = dayjs().format(DEFECT_NOTICE_EXPORT_COPY.fileTimestampFormat);

      exportToXlsx({
        fileName: `${projectName || DEFECT_NOTICE_EXPORT_COPY.fileNameFallback}-${DEFECT_NOTICE_EXPORT_COPY.registerFileSuffix}-${stamp}`,
        sheetName: DEFECT_NOTICE_EXPORT_COPY.registerSheetName,
        columns: DEFECT_NOTICE_EXPORT_COLUMNS,
        rows: exportRows,
      });
    } catch {
      notification.error({ message: DEFECT_NOTICE_EXPORT_COPY.failed });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpen = (notice: DefectNotice) =>
    router.push(`${MENU_PATH.CCA_DEFECT_NOTICES.pathname}/${notice.id}`);

  return (
    <DefectNoticeThemeProvider>
      <Flex vertical gap={16}>
        <DefectNoticeRegisterHeader
          exporting={isExporting}
          onAdd={handleAdd}
          onExport={handleExport}
        />

        <Card
          extra={
            <RegisterSearchFilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={DEFECT_NOTICE_REGISTER_COPY.searchPlaceholder}
              selectedStatuses={selectedStatuses}
              onStatusesChange={(values) => {
                setSelectedStatuses(values);
                setCurrentPage(1);
              }}
              statusOptions={STATUS_FILTER_OPTIONS}
              filterLabel={DEFECT_NOTICE_REGISTER_COPY.filterLabel}
              extraActions={
                <DisabledTooltip
                  disabled={!hasActiveFilters}
                  reason="There is nothing to clear yet."
                >
                  <Typography.Link
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="font-medium shrink-0"
                  >
                    Clear all
                  </Typography.Link>
                </DisabledTooltip>
              }
            />
          }
        >
          <DefectNoticeTable
            data={filtered}
            loading={query.isFetching}
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onPageChange={handlePageChange}
            onOpen={handleOpen}
          />
        </Card>
      </Flex>
    </DefectNoticeThemeProvider>
  );
};

export default DefectNoticeListPage;
