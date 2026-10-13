'use client';

import { Button, Flex, Table, type TableProps, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileTextIcon, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ROW_OPEN_BUTTON, ROW_OPEN_ICON } from '@/constants/list-page.constants';
import { REQUEST_FOR_INFORMATION_REGISTER_COLUMNS } from '../constants/request-for-information.constants';
import {
  REGISTER_COLORS,
  REGISTER_SIZES,
} from '../constants/request-for-information-register.theme';
import type { RequestForInformation } from '../types/request-for-information.types';
import { formatRegisterDate } from '../utils/request-for-information.utils';
import RequestForInformationActionMenuCell from './request-for-information-action-menu-cell';
import RequestForInformationStatusBadge from './request-for-information-status-badge';

interface RequestForInformationTableProps {
  data?: RequestForInformation[];
  loading?: boolean;
  pagination?: TableProps<RequestForInformation>['pagination'];
  onChange?: TableProps<RequestForInformation>['onChange'];
  onOpen?: (request: RequestForInformation) => void;
  onCreatePmi?: (requestId: string) => void;
}

const EMPTY_CELL = (
  <Typography.Text style={{ color: REGISTER_COLORS.textMuted }}>-</Typography.Text>
);

// Row-end shortcut into the RFI, drawn from the shared row-open token so this register
// stays visually identical to the CE/EW registers.
const RequestForInformationOpenButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <Button
    aria-label={label}
    icon={<FileTextIcon className={ROW_OPEN_ICON} />}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={ROW_OPEN_BUTTON}
  />
);

// Presentational — props in, callbacks out; the parent owns the logic.
const RequestForInformationTable = ({
  data = [],
  loading = false,
  pagination,
  onChange,
  onOpen,
  onCreatePmi,
}: RequestForInformationTableProps) => {
  const columns: ColumnsType<RequestForInformation> = [
    {
      title: REQUEST_FOR_INFORMATION_REGISTER_COLUMNS.refAndTitle,
      dataIndex: 'reference',
      width: 320,
      render: (reference: string, record) => (
        <Flex vertical gap={4} className="min-w-0">
          <Typography.Text style={{ fontSize: REGISTER_SIZES.refFontSize, fontWeight: 600 }}>
            {reference}
          </Typography.Text>
          <Typography.Text
            style={{
              color: REGISTER_COLORS.textMuted,
              fontSize: REGISTER_SIZES.subjectFontSize,
              maxWidth: REGISTER_SIZES.subjectMaxWidth,
            }}
          >
            {record.title}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: REQUEST_FOR_INFORMATION_REGISTER_COLUMNS.dateIssued,
      dataIndex: 'dateIssued',
      align: 'center',
      width: 130,
      render: (dateIssued?: string | null) =>
        dateIssued ? (
          <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize }}>
            {formatRegisterDate(dateIssued)}
          </Typography.Text>
        ) : (
          EMPTY_CELL
        ),
    },
    {
      title: REQUEST_FOR_INFORMATION_REGISTER_COLUMNS.raisedBy,
      dataIndex: 'raisedByName',
      width: 180,
      render: (raisedByName: string, record) => (
        <Flex vertical gap={2}>
          <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize, fontWeight: 500 }}>
            {raisedByName}
          </Typography.Text>
          {record.raisedByRole && (
            <Typography.Text
              style={{ color: REGISTER_COLORS.textMuted, fontSize: REGISTER_SIZES.badgeFontSize }}
            >
              {record.raisedByRole}
            </Typography.Text>
          )}
        </Flex>
      ),
    },
    {
      title: REQUEST_FOR_INFORMATION_REGISTER_COLUMNS.dueDate,
      dataIndex: 'dueDate',
      align: 'center',
      width: 130,
      render: (dueDate?: string | null) =>
        dueDate ? (
          <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize }}>
            {formatRegisterDate(dueDate)}
          </Typography.Text>
        ) : (
          EMPTY_CELL
        ),
    },
    {
      title: REQUEST_FOR_INFORMATION_REGISTER_COLUMNS.status,
      dataIndex: 'status',
      align: 'center',
      width: 110,
      render: (status: RequestForInformation['status']) => (
        <Flex justify="center">
          <RequestForInformationStatusBadge status={status} />
        </Flex>
      ),
    },
    {
      title: REQUEST_FOR_INFORMATION_REGISTER_COLUMNS.action,
      key: 'action',
      align: 'center',
      width: 110,
      render: (_, record) => (
        <Flex justify="center" align="center" gap={8}>
          <RequestForInformationActionMenuCell
            requestId={record.id}
            onCreatePmi={(id) => onCreatePmi?.(id)}
          />
          <RequestForInformationOpenButton
            label={`Open ${record.reference}`}
            onClick={() => onOpen?.(record)}
          />
        </Flex>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      locale={{
        emptyText: (
          <EmptyState
            tone="success"
            icon={<ShieldCheck className="text-emerald-500" size={22} />}
            title="No requests for information yet"
            description="Requests for information raised on this project will appear here."
          />
        ),
      }}
      onRow={(record) => ({
        onClick: () => onOpen?.(record),
        className: 'group cursor-pointer',
      })}
    />
  );
};

export default RequestForInformationTable;
