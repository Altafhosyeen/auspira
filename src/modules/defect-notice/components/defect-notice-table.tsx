'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  DEFECT_NOTICE_REGISTER_COLUMNS,
  DEFECT_NOTICE_REGISTER_COPY,
} from '../constants/defect-notice.constants';
import { REGISTER_SIZES } from '../constants/defect-notice-register.theme';
import type { DefectNotice } from '../types/defect-notice.types';
import DefectNoticeStatusBadge from './defect-notice-status-badge';

interface DefectNoticeTableProps {
  data?: DefectNotice[];
  loading?: boolean;
  /** Server-driven pagination — the API's skip/top + meta.totalCount, PMI-style. */
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen?: (notice: DefectNotice) => void;
}

// Presentational — props in, callbacks out; the parent owns the logic. There is no action
// column: the whole row is the affordance into the notice, advertised by its hover
// highlight and pointer cursor.
const DefectNoticeTable = ({
  data = [],
  loading = false,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onOpen,
}: DefectNoticeTableProps) => {
  const columns: ColumnsType<DefectNotice> = [
    {
      title: DEFECT_NOTICE_REGISTER_COLUMNS.reference,
      dataIndex: 'reference',
      width: 120,
      render: (reference: string) => <Typography.Text strong>{reference}</Typography.Text>,
    },
    {
      // PMI's title cell: two-line ellipsis, with the info icon spelling out the notice's
      // description (falling back to the title when the record carries none). The paragraph is
      // sized by its own text rather than grown to fill the cell, so the icon sits right beside
      // the title (4px) instead of being pushed to the column's far edge.
      title: DEFECT_NOTICE_REGISTER_COLUMNS.title,
      dataIndex: 'title',
      render: (title: string, record) => (
        <Flex align="center" gap={4} style={{ maxWidth: 520, minWidth: 0 }}>
          <Typography.Paragraph
            ellipsis={{ rows: 2, tooltip: title }}
            style={{ marginBottom: 0, minWidth: 0, fontSize: REGISTER_SIZES.cellFontSize }}
          >
            {title}
          </Typography.Paragraph>
          <Tooltip title={record.description || title}>
            <InfoCircleOutlined
              style={{ color: '#98A2B3', cursor: 'pointer', flexShrink: 0 }}
              onClick={(event) => event.stopPropagation()}
            />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: DEFECT_NOTICE_REGISTER_COLUMNS.raisedBy,
      dataIndex: 'raisedByName',
      width: 200,
      render: (raisedByName: string, record) => (
        <Flex vertical>
          <Typography.Text>{raisedByName || '—'}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.raisedByRole}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: DEFECT_NOTICE_REGISTER_COLUMNS.raisedAt,
      dataIndex: 'dateIssued',
      width: 120,
    },
    {
      title: DEFECT_NOTICE_REGISTER_COLUMNS.dueDate,
      dataIndex: 'dueDate',
      width: 120,
      render: (dueDate: string) => dueDate || '—',
    },
    {
      title: DEFECT_NOTICE_REGISTER_COLUMNS.status,
      dataIndex: 'status',
      width: 110,
      render: (_: unknown, record) => <DefectNoticeStatusBadge status={record.status} />,
    },
  ];

  return (
    <Table<DefectNotice>
      rowKey="id"
      columns={columns}
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
            title={DEFECT_NOTICE_REGISTER_COPY.tableEmptyTitle}
            description={DEFECT_NOTICE_REGISTER_COPY.tableEmptyDescription}
          />
        ),
      }}
      onRow={(record) => ({
        onClick: () => onOpen?.(record),
        className: 'cursor-pointer',
      })}
    />
  );
};

export default DefectNoticeTable;
