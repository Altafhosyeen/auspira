'use client';

import { Card, Flex, notification, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import RegisterSearchFilterToolbar from '@/components/shared/register-search-filter-toolbar';
import { buildContractCrossReferencePath } from '@/constants/routes.constants';
import { useGetProjectById } from '@/hooks/modules/project';
import { exportToXlsx, type XlsxColumn } from '@/lib/utils';
import { useProjectStore } from '@/store/project.store';
import { PMI_REGISTER_COPY } from '../constants/pmi.constants';
import { fetchPmis, useGetPmis } from '../hooks/use-pmis';
import { PmiStatus, type ProjectManagerInstruction } from '../types/pmi.types';
import PmiRegisterHeader from './pmi-register-header';
import PmiTable from './pmi-table';
import PmiThemeProvider from './pmi-theme-provider';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/** One export covers the whole register (see onExport). */
const EXPORT_COLUMNS: XlsxColumn<ProjectManagerInstruction>[] = [
  { header: 'PMI Ref', width: 14, value: (pmi) => pmi.reference },
  { header: 'Title', width: 46, value: (pmi) => pmi.title },
  { header: 'Type', width: 30, value: (pmi) => pmi.typeLabel },
  { header: 'Details', width: 60, value: (pmi) => pmi.details },
  { header: 'Date Issued', width: 14, value: (pmi) => pmi.dateIssued || null },
  { header: 'Status', width: 18, value: (pmi) => pmi.statusLabel },
  { header: 'Reference Clause', width: 18, value: (pmi) => pmi.referenceClause },
  { header: 'Response Required By', width: 18, value: (pmi) => pmi.responseRequiredBy || null },
];

// Unknown (0) is the backend's placeholder status — never offered as a filter.
const STATUS_FILTER_OPTIONS = [
  { value: PmiStatus.Open, label: 'Open' },
  { value: PmiStatus.Implemented, label: 'Implemented' },
  { value: PmiStatus.QuotationRevisionRequested, label: 'Quotation Revision Requested' },
  { value: PmiStatus.QuotationInProgress, label: 'Quotation In Progress' },
];
// Container — owns state & side effects; delegates rendering to presentational components.
// Paging is server-driven: the API takes skip/top and returns meta.totalCount, which the
// table's antd Pagination renders.
const PmiListPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [exporting, setExporting] = useState(false);

  const projectId = useProjectStore((store) => store.selectedProjectId);

  const { data: project } = useGetProjectById({
    id: projectId ?? '',
    enabled: !!projectId,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTerm(search.trim().toLowerCase());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  // Status codes go to the API as `status=1,2,...`; the term is the debounced search.
  const query = useGetPmis({
    projectId: projectId ?? undefined,
    params: {
      skip: (currentPage - 1) * pageSize,
      top: pageSize,
      term: term || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses.join(',') : undefined,
      includeAll: true,
    },
  });

  const pmis = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const totalCount = useMemo(() => Number(query.data?.count ?? 0), [query.data?.count]);

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

  // Exports the whole register (every status, all pages) rather than just the on-screen rows.
  const handleExport = async () => {
    if (!projectId) return;

    setExporting(true);
    try {
      const result = await fetchPmis(projectId, { skip: 0, includeAll: true });
      const exportRows = result.items;

      if (exportRows.length === 0) {
        notification.info({ message: 'There are no PMIs to export.' });
        return;
      }

      exportToXlsx({
        fileName: `${project?.referenceId || 'project'}-PMI-${dayjs().format('DD MMM YYYY HH-mm')}`,
        sheetName: 'PMI Register',
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
    <PmiThemeProvider>
      <Flex vertical gap={16}>
        <PmiRegisterHeader
          exporting={exporting}
          onExport={handleExport}
          onAdd={() =>
            router.push('/contract-control-agent/project-management-instruction/register')
          }
          clauseNumber={project?.clauseNumber ?? ''}
          clauseDescription={project?.clauseDescription ?? ''}
        />

        <Card
          extra={
            <RegisterSearchFilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={PMI_REGISTER_COPY.searchPlaceholder}
              selectedStatuses={selectedStatuses}
              onStatusesChange={(values) => {
                setSelectedStatuses(values);
                setCurrentPage(1);
              }}
              statusOptions={STATUS_FILTER_OPTIONS}
              filterLabel={PMI_REGISTER_COPY.filterLabel}
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
          <PmiTable
            data={pmis}
            loading={query.isFetching}
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onPageChange={handlePageChange}
            onOpen={(pmi) =>
              router.push(`/contract-control-agent/project-management-instruction/${pmi.id}`)
            }
            onViewQuotation={(pmi) => {
              if (pmi.quotationId) {
                router.push(
                  `/contract-control-agent/compensation-event/quotation/detail/${pmi.quotationId}`
                );
              }
            }}
            onOpenCompensationEvent={(pmi) => {
              if (pmi.compensationEventId) {
                router.push(
                  `/contract-control-agent/compensation-event/${pmi.compensationEventId}`
                );
              }
            }}
            onViewCrossReference={(pmi) => {
              if (pmi.projectCrossReferenceId) {
                router.push(buildContractCrossReferencePath(pmi.projectCrossReferenceId));
              }
            }}
          />
        </Card>
      </Flex>
    </PmiThemeProvider>
  );
};

export default PmiListPage;
