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
  PROJECT_DAILY_REPORT_COPY,
  PROJECT_DAILY_REPORT_EXPORT_COPY,
  PROJECT_DAILY_REPORT_STATUSES,
  projectDailyReportStatusLabel,
} from '../constants/project-daily-report.constants';
import {
  fetchProjectDailyReports,
  useGetProjectDailyReports,
} from '../hooks/use-project-daily-reports';
import type { ProjectDailyReport } from '../types/project-daily-report.types';
import { PROJECT_DAILY_REPORT_EXPORT_COLUMNS } from '../utils/project-daily-report-export.utils';
import ProjectDailyReportRegisterHeader from './project-daily-report-register-header';
import ProjectDailyReportTable from './project-daily-report-table';
import ProjectDailyReportThemeProvider from './project-daily-report-theme-provider';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

// Drawn from the module's own status list rather than restated here, so the filter cannot
// offer a status the label map would not know how to render — the same rule the Defect
// Notice register follows.
const STATUS_FILTER_OPTIONS = PROJECT_DAILY_REPORT_STATUSES.map((status) => ({
  value: status,
  label: projectDailyReportStatusLabel(status),
}));

// Container — owns state & side effects; delegates rendering to presentational components.
// Paging is server-driven: the API takes skip/top and returns meta.totalCount, which the
// table's antd Pagination renders — same shape as the Defect Notice and PMI registers.
const ProjectDailyReportListPage = () => {
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

  const query = useGetProjectDailyReports({
    projectId: projectId ?? undefined,
    params: {
      skip: (currentPage - 1) * pageSize,
      top: pageSize,
      term: term || undefined,
      includeAll: true,
    },
  });

  const reports = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const totalCount = useMemo(() => Number(query.data?.count ?? 0), [query.data?.count]);

  const hasActiveFilters = search.trim() !== '' || selectedStatuses.length > 0;

  // The register endpoint takes no status parameter, so the filter narrows the fetched page
  // client-side (the Defect Notice register's backend differs, but its filter works the same
  // way). A page holding none of the selected status simply comes back empty, as there.
  const filtered = useMemo(
    () =>
      selectedStatuses.length === 0
        ? reports
        : reports.filter(
            (report) =>
              report.statusCode !== undefined && selectedStatuses.includes(report.statusCode)
          ),
    [reports, selectedStatuses]
  );

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

  // Exports the whole register (all pages) rather than just the on-screen rows — same rule
  // the PMI and Defect Notice registers follow.
  const handleExport = async () => {
    if (!projectId) return;

    setIsExporting(true);
    try {
      const result = await fetchProjectDailyReports(projectId, { skip: 0, includeAll: true });
      const exportRows = result.items;

      if (exportRows.length === 0) {
        notification.info({ message: PROJECT_DAILY_REPORT_EXPORT_COPY.empty });
        return;
      }

      const stamp = dayjs().format(PROJECT_DAILY_REPORT_EXPORT_COPY.fileTimestampFormat);

      exportToXlsx({
        fileName: `${projectName || PROJECT_DAILY_REPORT_EXPORT_COPY.fileNameFallback}-${PROJECT_DAILY_REPORT_EXPORT_COPY.registerFileSuffix}-${stamp}`,
        sheetName: PROJECT_DAILY_REPORT_EXPORT_COPY.registerSheetName,
        columns: PROJECT_DAILY_REPORT_EXPORT_COLUMNS,
        rows: exportRows,
      });
    } catch {
      notification.error({ message: PROJECT_DAILY_REPORT_EXPORT_COPY.failed });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpen = (report: ProjectDailyReport) =>
    router.push(`${MENU_PATH.OCA_REPORTING.pathname}/${report.id}`);

  return (
    <ProjectDailyReportThemeProvider>
      <Flex vertical gap={16}>
        <ProjectDailyReportRegisterHeader exporting={isExporting} onExport={handleExport} />

        {/* The card head carries only the toolbar, and antd draws its own rule under it —
            the band above the table the other registers show. */}
        <Card
          extra={
            <RegisterSearchFilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={PROJECT_DAILY_REPORT_COPY.searchPlaceholder}
              selectedStatuses={selectedStatuses}
              onStatusesChange={(values) => {
                setSelectedStatuses(values);
                setCurrentPage(1);
              }}
              statusOptions={STATUS_FILTER_OPTIONS}
              filterLabel={PROJECT_DAILY_REPORT_COPY.filterLabel}
              extraActions={
                <DisabledTooltip
                  disabled={!hasActiveFilters}
                  reason={PROJECT_DAILY_REPORT_COPY.clearAllDisabledReason}
                >
                  <Typography.Link
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="font-medium shrink-0"
                  >
                    {PROJECT_DAILY_REPORT_COPY.clearAllLabel}
                  </Typography.Link>
                </DisabledTooltip>
              }
            />
          }
        >
          <ProjectDailyReportTable
            data={filtered}
            loading={query.isFetching}
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
            onOpen={handleOpen}
          />
        </Card>
      </Flex>
    </ProjectDailyReportThemeProvider>
  );
};

export default ProjectDailyReportListPage;
