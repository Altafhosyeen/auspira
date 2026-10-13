'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  PMI_REGISTER_COPY,
  PMI_TYPE_COLORS,
  PMI_TYPE_LABELS,
  PMI_TYPE_LEGEND_CODES,
} from '../constants/pmi.constants';
import type { ProjectManagerInstruction } from '../types/pmi.types';
import PmiActionMenuCell from './pmi-action-menu-cell';
import PmiStatusTag from './pmi-status-tag';

interface PmiTableProps {
  data: ProjectManagerInstruction[];
  loading?: boolean;
  /** Server-driven pagination — the API's skip/top + meta.totalCount. */
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (pmi: ProjectManagerInstruction) => void;
  onViewQuotation?: (pmi: ProjectManagerInstruction) => void;
  onOpenCompensationEvent?: (pmi: ProjectManagerInstruction) => void;
  onViewCrossReference?: (pmi: ProjectManagerInstruction) => void;
}

const REF_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'PMI REF',
  dataIndex: 'reference',
  key: 'reference',
  width: 120,
  render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
};

const TITLE_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
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
      <Tooltip title={record.details || record.title}>
        <InfoCircleOutlined style={{ color: '#98A2B3', cursor: 'pointer', flexShrink: 0 }} />
      </Tooltip>
    </Flex>
  ),
};

const TYPE_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'TYPE',
  dataIndex: 'type',
  key: 'type',
  width: 100,
  render: (value: number) => {
    const code = Number(value ?? 0);
    const marker = PMI_TYPE_LEGEND_CODES[code] ?? PMI_TYPE_LEGEND_CODES[3];
    const color = PMI_TYPE_COLORS[code] ?? 'default';
    return (
      <Tooltip title={PMI_TYPE_LABELS[code] ?? 'Other'}>
        <Tag
          color={color}
          style={{ fontWeight: 500, margin: 0, minWidth: 32, textAlign: 'center' }}
        >
          {marker}
        </Tag>
      </Tooltip>
    );
  },
};

const RAISED_BY_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'RAISED BY',
  dataIndex: 'createdBy',
  key: 'createdBy',
  width: 160,
  render: (value?: string) => (
    <Flex vertical>
      <Typography.Text>{value || '—'}</Typography.Text>
    </Flex>
  ),
};

const RAISED_AT_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'RAISED AT',
  dataIndex: 'dateIssued',
  key: 'dateIssued',
  width: 140,
};

const STATUS_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'STATUS',
  dataIndex: 'status',
  key: 'status',
  width: 130,
  render: (_: unknown, record) => (
    <PmiStatusTag status={Number(record.status)} label={record.statusLabel} />
  ),
};

const CLAUSE_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'REFERENCE CLAUSE',
  dataIndex: 'referenceClause',
  key: 'referenceClause',
  width: 150,
  render: (value: string) => (
    <Typography.Text>{value === '—' ? '—' : `Clause ${value}`}</Typography.Text>
  ),
};

// The linked CE's reference (e.g. "CE-0001") — clicking it jumps to the event, same as
// the action-column link.
const CE_REF_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
  title: 'CE REF',
  dataIndex: 'compensationEventReference',
  key: 'compensationEventReference',
  width: 110,
  render: (_: unknown, record) => {
    if (!record.compensationEventReference) {
      return <Typography.Text type="secondary">—</Typography.Text>;
    }
    return <Typography.Text strong>{record.compensationEventReference}</Typography.Text>;
  },
};

const COLUMNS = (
  onViewQuotation?: (pmi: ProjectManagerInstruction) => void,
  onOpenCompensationEvent?: (pmi: ProjectManagerInstruction) => void,
  onViewCrossReference?: (pmi: ProjectManagerInstruction) => void
) => {
  const ACTION_COLUMN: ColumnsType<ProjectManagerInstruction>[number] = {
    title: '',
    key: 'action',
    width: 64,
    align: 'center',
    render: (_: unknown, record) => (
      <PmiActionMenuCell
        pmi={record}
        onViewQuotation={onViewQuotation}
        onOpenCompensationEvent={onOpenCompensationEvent}
        onViewCrossReference={onViewCrossReference}
      />
    ),
  };

  return [
    REF_COLUMN,
    TITLE_COLUMN,
    TYPE_COLUMN,
    RAISED_BY_COLUMN,
    RAISED_AT_COLUMN,
    STATUS_COLUMN,
    CLAUSE_COLUMN,
    CE_REF_COLUMN,
    ACTION_COLUMN,
  ];
};

// Presentational — props-in, callbacks-out; the container owns fetching and navigation.
// The legend decodes the short markers the TYPE column shows (CS / PI / SW / O).
const PmiTypeLegend = () => (
  <Flex gap={16} style={{ padding: '8px 0' }}>
    {Object.entries(PMI_TYPE_LABELS).map(([code, label]) => (
      <Flex key={code} align="center" gap={6}>
        <Tag
          color={PMI_TYPE_COLORS[Number(code)] ?? 'default'}
          style={{ fontWeight: 500, margin: 0, minWidth: 32, textAlign: 'center' }}
        >
          {PMI_TYPE_LEGEND_CODES[Number(code)] ?? label}
        </Tag>
        <Typography.Text type="secondary">{label}</Typography.Text>
      </Flex>
    ))}
  </Flex>
);

const PmiTable = ({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onOpen,
  onViewQuotation,
  onOpenCompensationEvent,
  onViewCrossReference,
}: PmiTableProps) => (
  <>
    <PmiTypeLegend />
    <Table<ProjectManagerInstruction>
      rowKey="id"
      columns={COLUMNS(onViewQuotation, onOpenCompensationEvent, onViewCrossReference)}
      dataSource={data}
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (count, range) => `${range[0]}-${range[1]} of ${count}`,
      }}
      onChange={(pagination) => onPageChange(pagination.current ?? 1, pagination.pageSize ?? 10)}
      locale={{
        emptyText: (
          <EmptyState
            tone="neutral"
            icon={<FileText className="text-slate-400" />}
            title={PMI_REGISTER_COPY.tableEmptyTitle}
            description={PMI_REGISTER_COPY.tableEmptyDescription}
          />
        ),
      }}
      onRow={(record) => ({
        onClick: () => onOpen(record),
        style: { cursor: 'pointer' },
      })}
    />
  </>
);

export default PmiTable;
