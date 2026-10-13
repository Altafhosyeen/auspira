'use client';

import { Card, ConfigProvider, Divider, Flex, notification } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import { MENU_PATH } from '@/constants';
import type { CompensationEventStatus as CompensationEventStatusCode } from '@/constants/enum.constant';
import { exportToXlsx } from '@/lib/utils';
import { useProjectStore } from '@/store/project.store';
import { COMPENSATION_EVENT_EXPORT_COPY } from '../constants/compensation-event.constants';
import { REGISTER_THEME } from '../constants/compensation-event-register.theme';
import {
  getCompensationEvents,
  useGetCompensationEvents,
  useGetCompensationEventTotals,
} from '../hooks/use-compensation-events';
import { summarizeCompensationEvents } from '../utils/compensation-event.utils';
import { COMPENSATION_EVENT_EXPORT_COLUMNS } from '../utils/compensation-event-export.utils';
import CompensationEventRegisterHeader from './compensation-event-register-header';
import CompensationEventRegisterNote from './compensation-event-register-note';
import CompensationEventRegisterSummary from './compensation-event-register-summary';
import CompensationEventRegisterToolbar from './compensation-event-register-toolbar';
import CompensationEventTable from './compensation-event-table';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
// Baseline fetch behind the parent-Early-Warning highlight. It is deliberately unfiltered
// by state — the CE that was opened from an EW has to be findable even once a state
// narrows the table below.
const SUMMARY_SIZE = 500;
const SEARCH_DEBOUNCE_MS = 400;

interface CompensationEventListPageProps {
  // Reference of the Early Warning the register was opened from — highlights its CE.
  parentEarlyWarningReference?: string;
}

// Container — owns state & side effects; delegates rendering to presentational components.
const CompensationEventListPage = ({
  parentEarlyWarningReference,
}: CompensationEventListPageProps) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [states, setStates] = useState<CompensationEventStatusCode[]>([]);
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

  // The table's own page — Skip/Top and the state filter all go to the backend, so the
  // rows on screen are exactly the page the API returned.
  const pagedQuery = useGetCompensationEvents({
    projectId: projectId ?? undefined,
    params: {
      skip: (page - 1) * pageSize,
      top: pageSize,
      term: term || undefined,
      statuses: states.length ? states : undefined,
      includeAll: true,
    },
  });

  // Unfiltered baseline — the parent-Early-Warning lookup spans the whole register, so
  // it may not see the state filter.
  const summaryQuery = useGetCompensationEvents({
    projectId: projectId ?? undefined,
    params: { skip: 0, top: SUMMARY_SIZE, term: term || undefined, includeAll: true },
  });

  const summaryEvents = useMemo(() => summaryQuery.data?.items ?? [], [summaryQuery.data?.items]);

  // The tiles' two headline figures come from the backend, which totals them across the
  // whole project rather than across the rows this page happened to fetch. The counts and
  // currency beneath them still come from the register's own baseline rows.
  const totalsQuery = useGetCompensationEventTotals({ projectId: projectId ?? undefined });
  const registerSummary = useMemo(
    () => summarizeCompensationEvents(summaryEvents),
    [summaryEvents]
  );

  const visibleEvents = pagedQuery.data?.items ?? [];
  const total = pagedQuery.data?.count ?? 0;
  const isTableLoading = pagedQuery.isFetching;

  const highlightedEvent = parentEarlyWarningReference
    ? summaryEvents.find(
        (event) => event.parentEarlyWarningReference === parentEarlyWarningReference
      )
    : undefined;

  const handleSearchChange = (value: string) => setSearch(value);

  const handleStatesChange = (nextStates: CompensationEventStatusCode[]) => {
    setStates(nextStates);
    setPage(1);
  };

  // Clearing `search` is enough to reset the debounced `term` and the page — the search
  // debounce effect runs on the change and does both.
  const handleClearFilters = () => {
    setSearch('');
    setStates([]);
  };

  const handleAdd = () => router.push(`${MENU_PATH.COMPENSATION_EVENT.pathname}/new`);

  // The export is always the whole register: it re-fetches with `includeAll` rather than
  // exporting the page on screen, and the search box and state filter still scope what
  // "the whole register" is.
  const handleExport = async () => {
    if (!projectId) return;

    setIsExporting(true);
    try {
      const rows =
        (
          await getCompensationEvents(projectId, {
            skip: 0,
            includeAll: true,
            term: term || undefined,
            statuses: states.length ? states : undefined,
          })
        )?.items ?? [];

      if (rows.length === 0) {
        // An empty workbook would just look like a broken download.
        notification.info({ message: COMPENSATION_EVENT_EXPORT_COPY.empty });
        return;
      }

      const stamp = dayjs().format(COMPENSATION_EVENT_EXPORT_COPY.fileTimestampFormat);

      exportToXlsx({
        fileName: `${projectName || COMPENSATION_EVENT_EXPORT_COPY.fileNameFallback}-${COMPENSATION_EVENT_EXPORT_COPY.registerFileSuffix}-${stamp}`,
        sheetName: COMPENSATION_EVENT_EXPORT_COPY.registerSheetName,
        columns: COMPENSATION_EVENT_EXPORT_COLUMNS,
        rows,
      });
    } catch {
      notification.error({ message: COMPENSATION_EVENT_EXPORT_COPY.failed });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ConfigProvider theme={REGISTER_THEME}>
      <Flex vertical gap={20}>
        <CompensationEventRegisterHeader
          exporting={isExporting}
          exportDisabled={!projectId}
          onAdd={handleAdd}
          onExport={handleExport}
        />

        <CompensationEventRegisterSummary
          totalQuotationValue={totalsQuery.data?.totalQuotedValue ?? 0}
          quotationCount={registerSummary.quotationCount}
          currency={registerSummary.currency}
          totalDurationImpactDays={totalsQuery.data?.totalQuotedDays ?? 0}
          eventCount={registerSummary.eventCount}
          isLoading={totalsQuery.isLoading}
        />

        {/* The toolbar is the card's whole header, so antd's header rule is turned off and
            a Divider separates it from the table instead — one separator under our control
            rather than a border that spans the empty left half of the header. */}
        <Card
          styles={{
            // Only the padding either side of the Divider is dropped — the rule carries
            // that spacing itself. The header keeps its top padding so the toolbar is not
            // flush against the top edge of the card.
            header: {
              borderBottom: 'none',
              paddingTop: 16,
              paddingBottom: 0,
              minHeight: 'auto',
            },
            body: { paddingTop: 0 },
          }}
          extra={
            <CompensationEventRegisterToolbar
              search={search}
              states={states}
              onSearchChange={handleSearchChange}
              onStatesChange={handleStatesChange}
              onClear={handleClearFilters}
            />
          }
        >
          <Divider style={{ margin: '16px 0' }} />

          <CompensationEventTable
            data={visibleEvents}
            loading={isTableLoading}
            highlightedId={highlightedEvent?.id}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (count, [from, to]) => `Showing ${from} to ${to} of ${count} activities`,
              onChange: (nextPage, nextPageSize) => {
                // Changing the page size re-cuts the register, so the old page number no
                // longer points at the same rows — go back to the first page instead.
                setPage(nextPageSize === pageSize ? nextPage : 1);
                setPageSize(nextPageSize);
              },
            }}
            onOpen={(event) => router.push(`${MENU_PATH.COMPENSATION_EVENT.pathname}/${event.id}`)}
            onSendFormResponse={(quotationId) =>
              router.push(
                `${MENU_PATH.COMPENSATION_EVENT.pathname}/quotation/detail/${quotationId}?action=send-form-response`
              )
            }
          />
        </Card>

        {highlightedEvent && (
          <CompensationEventRegisterNote
            reference={highlightedEvent.reference}
            parentEarlyWarningReference={parentEarlyWarningReference}
          />
        )}
      </Flex>
    </ConfigProvider>
  );
};

export default CompensationEventListPage;
