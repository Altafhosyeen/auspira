'use client';

import { Card, ConfigProvider, Divider, Flex, notification } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { MENU_PATH } from '@/constants';
import { exportToXlsx } from '@/lib/utils';
import { useProjectStore } from '@/store/project.store';
import { REQUEST_FOR_INFORMATION_EXPORT_COPY } from '../constants/request-for-information.constants';
import { REGISTER_THEME } from '../constants/request-for-information-register.theme';
import {
  getRequestForInformationList,
  useGetRequestForInformationList,
} from '../hooks/use-request-for-information';
import type {
  RequestForInformation,
  RequestForInformationStatus,
} from '../types/request-for-information.types';
import { REQUEST_FOR_INFORMATION_EXPORT_COLUMNS } from '../utils/request-for-information-export.utils';
import RequestForInformationRegisterHeader from './request-for-information-register-header';
import RequestForInformationRegisterToolbar from './request-for-information-register-toolbar';
import RequestForInformationTable from './request-for-information-table';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
const SEARCH_DEBOUNCE_MS = 400;

// Container — owns state & side effects; delegates rendering to presentational components.
const RequestForInformationListPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [statuses, setStatuses] = useState<RequestForInformationStatus[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isExporting, setIsExporting] = useState(false);

  const projectId = useProjectStore((store) => store.selectedProjectId);
  const projectName = useProjectStore(
    (store) => store.projectOptions.find((option) => option.id === store.selectedProjectId)?.name
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const pagedQuery = useGetRequestForInformationList({
    projectId: projectId ?? 'mock-project',
    params: {
      skip: (page - 1) * pageSize,
      top: pageSize,
      term: term || undefined,
      statuses: statuses.length ? statuses : undefined,
      includeAll: true,
    },
  });

  const visibleRequests = pagedQuery.data?.items ?? [];
  const total = pagedQuery.data?.count ?? 0;
  const isTableLoading = pagedQuery.isFetching;

  const handleSearchChange = (value: string) => setSearch(value);

  const handleStatusesChange = (nextStatuses: RequestForInformationStatus[]) => {
    setStatuses(nextStatuses);
    setPage(1);
  };

  const handleClearAll = () => {
    setSearch('');
    setTerm('');
    setStatuses([]);
    setPage(1);
  };

  const handleAdd = () => router.push(`${MENU_PATH.OCA_REQUEST_FOR_INFORMATION.pathname}/new`);

  const handleOpen = (request: RequestForInformation) =>
    router.push(`${MENU_PATH.OCA_REQUEST_FOR_INFORMATION.pathname}/${request.id}`);

  const handleCreatePmi = (requestId: string) =>
    router.push(`${MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname}/new?rfiId=${requestId}`);

  // With no rows ticked the whole register is exported — the search box and status
  // filter still scope what "the whole register" is, so it re-fetches with `includeAll`
  // rather than exporting only the page currently on screen.
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const rows =
        (
          await getRequestForInformationList(projectId ?? 'mock-project', {
            skip: 0,
            includeAll: true,
            term: term || undefined,
            statuses: statuses.length ? statuses : undefined,
          })
        )?.items ?? [];

      if (rows.length === 0) {
        notification.info({ message: REQUEST_FOR_INFORMATION_EXPORT_COPY.empty });
        return;
      }

      const stamp = dayjs().format(REQUEST_FOR_INFORMATION_EXPORT_COPY.fileTimestampFormat);

      exportToXlsx({
        fileName: `${projectName || REQUEST_FOR_INFORMATION_EXPORT_COPY.fileNameFallback}-${REQUEST_FOR_INFORMATION_EXPORT_COPY.registerFileSuffix}-${stamp}`,
        sheetName: REQUEST_FOR_INFORMATION_EXPORT_COPY.registerSheetName,
        columns: REQUEST_FOR_INFORMATION_EXPORT_COLUMNS,
        rows,
      });
    } catch {
      notification.error({ message: REQUEST_FOR_INFORMATION_EXPORT_COPY.failed });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ConfigProvider theme={REGISTER_THEME}>
      <Flex vertical gap={16}>
        <RequestForInformationRegisterHeader
          exporting={isExporting}
          onAdd={handleAdd}
          onExport={handleExport}
        />

        <Card
          styles={{
            header: {
              borderBottom: 'none',
              paddingTop: 12,
              paddingBottom: 0,
              minHeight: 'auto',
            },
            body: { paddingTop: 0 },
          }}
          extra={
            <RequestForInformationRegisterToolbar
              search={search}
              statuses={statuses}
              onSearchChange={handleSearchChange}
              onStatusesChange={handleStatusesChange}
              onClearAll={handleClearAll}
            />
          }
        >
          <Divider className="my-3" />

          <RequestForInformationTable
            data={visibleRequests}
            loading={isTableLoading}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (count, [from, to]) => `Showing ${from} to ${to} of ${count} requests`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPageSize === pageSize ? nextPage : 1);
                setPageSize(nextPageSize);
              },
            }}
            onOpen={handleOpen}
            onCreatePmi={handleCreatePmi}
          />
        </Card>
      </Flex>
    </ConfigProvider>
  );
};

export default RequestForInformationListPage;
