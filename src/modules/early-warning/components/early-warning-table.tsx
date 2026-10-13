'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import type { EarlyWarning } from '../types/early-warning.types';
import EarlyWarningImpactChip from './early-warning-impact-chip';
import EarlyWarningStatusTag from './early-warning-status-tag';

interface EarlyWarningTableProps {
  data: EarlyWarning[];
  loading?: boolean;
  onOpen: (ew: EarlyWarning) => void;
}

const REF_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'EW REF',
  dataIndex: 'reference',
  key: 'reference',
  width: 120,
  render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
};

const RISK_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'TITLE',
  dataIndex: 'title',
  key: 'title',
  render: (value: string, record) => (
    // The paragraph is sized by its own text, so the info icon sits right beside the title
    // (4px) instead of being pushed to the column's far edge by a flexed-out paragraph.
    <Flex align="center" gap={4} style={{ maxWidth: 420, minWidth: 0 }}>
      <Typography.Paragraph
        ellipsis={{ rows: 2, tooltip: value }}
        style={{ marginBottom: 0, minWidth: 0 }}
      >
        {value}
      </Typography.Paragraph>
      <Tooltip title={record.description || record.title}>
        <InfoCircleOutlined style={{ color: '#98A2B3', cursor: 'pointer', flexShrink: 0 }} />
      </Tooltip>
    </Flex>
  ),
};

const RAISED_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'RAISED AT',
  dataIndex: 'raisedOn',
  key: 'raisedOn',
  width: 140,
};

const BY_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'RAISED BY',
  dataIndex: 'raisedBy',
  key: 'raisedBy',
  width: 140,
  ellipsis: true,
};

const IMPACT_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'IMPACT',
  dataIndex: 'impacts',
  key: 'impacts',
  width: 150,
  // One badge inline; the rest collapse into a "+N" dropdown so rows stay short.
  render: (_: unknown, record) => {
    const [first, ...rest] = record.impacts;

    if (!first) {
      return <Typography.Text type="secondary">—</Typography.Text>;
    }

    return (
      <Flex align="center" gap={6} wrap>
        <EarlyWarningImpactChip impact={first} />
        {rest.length > 0 && (
          <Dropdown
            trigger={['click', 'hover']}
            placement="bottomRight"
            menu={{
              items: rest.map((impact) => ({
                key: impact,
                label: <EarlyWarningImpactChip impact={impact} />,
                disabled: true,
              })),
            }}
          >
            <Button
              size="small"
              onClick={(event) => {
                // The row navigates on any click — keep the dropdown isolated.
                event.stopPropagation();
              }}
            >
              +{rest.length}
            </Button>
          </Dropdown>
        )}
      </Flex>
    );
  },
};

const STATUS_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'STATUS',
  dataIndex: 'status',
  key: 'status',
  width: 130,
  render: (_: unknown, record) => (
    <EarlyWarningStatusTag status={record.displayStatus ?? record.status} />
  ),
};

const UPDATED_COLUMN: ColumnsType<EarlyWarning>[number] = {
  title: 'UPDATED AT',
  dataIndex: 'dueDate',
  key: 'dueDate',
  width: 140,
  render: (value: string | null, record) => (
    <Typography.Text>{value || record.raisedOn || '—'}</Typography.Text>
  ),
};

const COLUMNS: ColumnsType<EarlyWarning> = [
  REF_COLUMN,
  RISK_COLUMN,
  RAISED_COLUMN,
  BY_COLUMN,
  IMPACT_COLUMN,
  STATUS_COLUMN,
  UPDATED_COLUMN,
];

// Presentational — props-in, callbacks-out; the container owns fetching and navigation.
const EarlyWarningTable = ({ data, loading, onOpen }: EarlyWarningTableProps) => (
  <Table<EarlyWarning>
    rowKey="id"
    columns={COLUMNS}
    dataSource={data}
    loading={loading}
    pagination={false}
    locale={{
      emptyText: (
        <EmptyState
          tone="success"
          icon={<ShieldCheck className="text-emerald-500" size={22} />}
          title="No early warnings yet"
          description="Early warnings raised on this project will appear here."
        />
      ),
    }}
    onRow={(record) => ({
      onClick: () => onOpen(record),
      style: { cursor: 'pointer' },
    })}
  />
);

export default EarlyWarningTable;
