'use client';

import { DownOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import AppPageTitle from '@/components/shared/app-page-title';
import { ProjectAlertType } from '@/constants';
import { getAlertDetailHref } from '@/lib/utils/org-dashboard.utils';
import { useProjectStore } from '@/store/project.store';
import { AWARENESS_COPY } from '../constants/awareness.constants';
import { useGetAwarenessSignals } from '../hooks/use-awareness';
import type { FilterTab, Signal } from '../types/awareness.types';
import AwarenessSignalTable from './awareness-signal-table';
import AwarenessThemeProvider from './awareness-theme-provider';
import AwarenessToolbar from './awareness-toolbar';

const PAGE_SIZE = 6;
const FETCH_LIMIT = 500;

const ALERT_TYPE_BY_TAB: Record<FilterTab, number | undefined> = {
  all: undefined,
  'early-warning': ProjectAlertType.EarlyWarning,
  pmi: ProjectAlertType.PMI,
  compensation: ProjectAlertType.CompensationEvent,
  tq: undefined,
  meeting: ProjectAlertType.Meeting,
  quotation: ProjectAlertType.Quotation,
};

// Container — owns the filters + pagination; the table is presentational.
const AwarenessListPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const projectId = useProjectStore((store) => store.selectedProjectId);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setTerm(search.trim().toLowerCase());
      setVisibleCount(PAGE_SIZE);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const { data: allSignals, isFetching } = useGetAwarenessSignals({
    projectId: projectId ?? undefined,
    params: { skip: 0, top: FETCH_LIMIT },
  });

  const signals = useMemo(() => allSignals ?? [], [allSignals]);

  // The query is gated on a project, so with none selected it never runs and `isFetching`
  // stays false — without this the table would sit on "no match" instead of saying why.
  // A genuinely empty register (no project filter involved) falls through to the table's
  // own "all clear" empty state instead of being named here.
  const emptyText = !projectId
    ? AWARENESS_COPY.empty.noProject
    : signals.length === 0
      ? undefined
      : AWARENESS_COPY.empty.noMatches;

  const counts = useMemo<Record<FilterTab, number>>(
    () => ({
      all: signals.length,
      'early-warning': signals.filter((s) => s.alertType === ProjectAlertType.EarlyWarning).length,
      pmi: signals.filter((s) => s.alertType === ProjectAlertType.PMI).length,
      compensation: signals.filter((s) => s.alertType === ProjectAlertType.CompensationEvent)
        .length,
      tq: 0,
      meeting: signals.filter((s) => s.alertType === ProjectAlertType.Meeting).length,
      quotation: signals.filter((s) => s.alertType === ProjectAlertType.Quotation).length,
    }),
    [signals]
  );

  const filtered = useMemo(() => {
    if (tab === 'all') {
      return signals.filter(
        (signal) =>
          (!date || dayjs(signal.createdOn).isSame(date, 'day')) &&
          (!term ||
            `${signal.signal} ${signal.source.name} ${signal.refNumber} ${signal.route.label}`
              .toLowerCase()
              .includes(term))
      );
    }
    const type = ALERT_TYPE_BY_TAB[tab];
    return signals.filter(
      (signal) =>
        type !== undefined &&
        signal.alertType === type &&
        (!date || dayjs(signal.createdOn).isSame(date, 'day')) &&
        (!term ||
          `${signal.signal} ${signal.source.name} ${signal.refNumber} ${signal.route.label}`
            .toLowerCase()
            .includes(term))
    );
  }, [signals, tab, date, term]);

  const visible = filtered.slice(0, visibleCount);

  const handleOpen = (signal: Signal) => {
    router.push(getAlertDetailHref(signal.alertType, signal.id));
  };

  return (
    <AwarenessThemeProvider>
      <Flex vertical gap={16}>
        <AppPageTitle icon={<FileTextOutlined />} title={AWARENESS_COPY.title} />

        <AwarenessToolbar
          activeTab={tab}
          counts={counts}
          search={search}
          date={date}
          onTabChange={(next) => {
            setTab(next);
            setVisibleCount(PAGE_SIZE);
          }}
          onSearchChange={setSearch}
          onDateChange={(next) => {
            setDate(next ?? null);
            setVisibleCount(PAGE_SIZE);
          }}
        />

        <Card styles={{ body: { padding: 0 } }}>
          <AwarenessSignalTable
            signals={visible}
            onOpen={handleOpen}
            loading={isFetching}
            emptyText={emptyText}
          />
          {/* Nothing to page through — the empty state already says why the table is blank. */}
          {filtered.length > 0 && (
            <Flex justify="center" align="center" gap={16} style={{ padding: '20px 0 24px 0' }}>
              <Typography.Text type="secondary" className="text-sm">
                {AWARENESS_COPY.showing} 1 to {visible.length} {AWARENESS_COPY.of} {filtered.length}{' '}
                {AWARENESS_COPY.activities}
              </Typography.Text>
              {visible.length < filtered.length && (
                <Button
                  type="primary"
                  icon={<DownOutlined />}
                  iconPosition="end"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  {AWARENESS_COPY.loadMore}
                </Button>
              )}
            </Flex>
          )}
        </Card>
      </Flex>
    </AwarenessThemeProvider>
  );
};

export default AwarenessListPage;
