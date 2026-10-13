'use client';

import {
  AccountBookOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Flex, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { AWARENESS_COPY } from '../constants/awareness.constants';
import type { Signal } from '../types/awareness.types';
import { TONE_HEX } from '../utils/awareness.utils';

const ROUTE_ICON: Record<string, ReactNode> = {
  'early-warning': <WarningOutlined />,
  pmi: <FileTextOutlined />,
  compensation: <AccountBookOutlined />,
  quotation: <AccountBookOutlined />,
  meeting: <TeamOutlined />,
  'defect-notice': <AccountBookOutlined />,
  'daily-site-report': <CalendarOutlined />,
  programme: <ScheduleOutlined />,
  watchtower: <EyeOutlined />,
};

interface AwarenessSignalTableProps {
  signals: Signal[];
  loading?: boolean;
  /** Why the table is blank — the container knows whether a project is even selected. */
  emptyText?: ReactNode;
  onOpen: (signal: Signal) => void;
}

const DEFAULT_EMPTY = (
  <EmptyState
    tone="success"
    icon={<ShieldCheck className="text-emerald-500" size={22} />}
    title="All clear — nothing needs attention"
    description={AWARENESS_COPY.empty.noSignals}
  />
);

const SourceCell = ({ signal }: { signal: Signal }) => (
  <Flex vertical gap={2} style={{ minWidth: 0 }}>
    <Typography.Text strong className="text-sm text-slate-900" ellipsis>
      {signal.source.name}
    </Typography.Text>
    <Typography.Text type="secondary" className="text-xs text-slate-500">
      {signal.source.sub}
    </Typography.Text>
  </Flex>
);

const RouteChip = ({ signal }: { signal: Signal }) => {
  const tone = TONE_HEX[signal.route.tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: tone.color,
        background: tone.background,
        border: `1px solid ${tone.color}`,
        borderRadius: 4,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {ROUTE_ICON[signal.route.type] ?? <FileTextOutlined />}
      {signal.route.label}
    </span>
  );
};

const DueDateCell = ({ signal }: { signal: Signal }) => {
  if (!signal.dueDate) {
    return (
      <Typography.Text type="secondary" className="text-sm text-slate-400">
        —
      </Typography.Text>
    );
  }
  return (
    <Flex vertical gap={2} style={{ whiteSpace: 'nowrap' }}>
      <Typography.Text className="text-sm text-slate-700">{signal.dueDate.day}</Typography.Text>
      {signal.dueDate.time && (
        <Typography.Text type="secondary" className="text-xs text-slate-500">
          {signal.dueDate.time}
        </Typography.Text>
      )}
    </Flex>
  );
};

const ReceivedCell = ({ signal }: { signal: Signal }) => (
  <Flex vertical gap={2} style={{ whiteSpace: 'nowrap' }}>
    <Typography.Text className="text-sm text-slate-700">{signal.received.day}</Typography.Text>
    <Typography.Text type="secondary" className="text-xs text-slate-500">
      {signal.received.time}
    </Typography.Text>
  </Flex>
);

// antd Table — built-in header, loading spinner and empty state.
const AwarenessSignalTable = ({
  signals,
  loading,
  emptyText,
  onOpen,
}: AwarenessSignalTableProps) => {
  const columns: ColumnsType<Signal> = [
    {
      title: AWARENESS_COPY.columns.source,
      key: 'source',
      width: '15%',
      render: (_, s) => <SourceCell signal={s} />,
    },
    {
      title: AWARENESS_COPY.columns.signal,
      key: 'signal',
      width: '27%',
      render: (_, s) => (
        <Typography.Text className="text-sm text-slate-900 font-medium">{s.signal}</Typography.Text>
      ),
    },
    {
      title: AWARENESS_COPY.columns.reference,
      key: 'refNumber',
      width: '16%',
      render: (_, s) => {
        if (!s.refNumber || s.refNumber === '—' || s.refNumber === '-') {
          return (
            <Typography.Text type="secondary" className="text-sm text-slate-400">
              —
            </Typography.Text>
          );
        }
        return (
          <Typography.Text className="text-sm font-medium text-[#0284C7] hover:underline">
            {s.refNumber}
          </Typography.Text>
        );
      },
    },
    {
      title: AWARENESS_COPY.columns.route,
      key: 'route',
      width: '15%',
      render: (_, s) => <RouteChip signal={s} />,
    },
    {
      title: AWARENESS_COPY.columns.dueDate,
      key: 'dueDate',
      width: '13%',
      render: (_, s) => <DueDateCell signal={s} />,
    },
    {
      title: AWARENESS_COPY.columns.received,
      key: 'received',
      width: '14%',
      render: (_, s) => <ReceivedCell signal={s} />,
    },
  ];

  return (
    <Table<Signal>
      rowKey="id"
      columns={columns}
      dataSource={signals}
      loading={loading}
      pagination={false}
      onRow={(record, index) => ({
        onClick: () => onOpen(record),
        style: {
          cursor: 'pointer',
          borderLeft: index === 0 ? '3px solid #0F2E4C' : '3px solid transparent',
        },
      })}
      className="[&_.ant-table-thead_th]:!bg-[#F0F8FF] [&_.ant-table-thead_th]:!text-[#00355F] [&_.ant-table-thead_th]:!font-semibold [&_.ant-table-thead_th]:!py-3.5"
      locale={{ emptyText: emptyText ?? DEFAULT_EMPTY }}
    />
  );
};

export default AwarenessSignalTable;
