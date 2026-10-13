'use client';

import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Building2 } from 'lucide-react';
import TableX from '@/components/antd/TableX';
import { EmptyState } from '@/components/shared/EmptyState';
import TableActions from '@/components/shared/Table/TableActions';

interface IOrganization {
  id: string;
  name: string;
  address?: string | null;
  industrySector?: string | null;
  houseNumber?: string | null;
  expectedUsers?: number;
  status: number; // 0 = denied, 1 = approved, 2 = pending
  rejectionReason?: string | null;
}

interface OrganizationTableProps {
  data?: IOrganization[];
  loading?: boolean;
  pagination?: TableProps<IOrganization>['pagination'];
  onChange?: TableProps<IOrganization>['onChange'];
  onApprove?: (record: IOrganization) => void;
  onDeny?: (record: IOrganization) => void;
}

const STATUS_CONFIG = {
  0: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  1: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  2: {
    label: 'In Review',
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
} as const;

const OrganizationTable = ({
  data = [],
  loading = false,
  pagination,
  onChange,
  onApprove,
  onDeny,
}: OrganizationTableProps) => {
  const columns: ColumnsType<IOrganization> = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Industry',
      dataIndex: 'industrySector',
      render: (val) => val || '-',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: (val) => val || '-',
    },
    {
      title: 'House No.',
      dataIndex: 'houseNumber',
      render: (val) => val || '-',
    },
    {
      title: 'Expected Users',
      dataIndex: 'expectedUsers',
      render: (val) => val ?? 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (val: number, record) => {
        const status = STATUS_CONFIG[val as keyof typeof STATUS_CONFIG] ?? {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-600',
        };

        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>

            {/* show reason only when rejected */}
            {val === 0 && record.rejectionReason && (
              <span className="text-xs text-red-500">Reason: {record.rejectionReason}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <TableActions
          items={[
            {
              key: 'approve',
              icon: <CheckOutlined />,
              disabled: record.status === 1,
              label: (
                <Popconfirm
                  title="Approve this organisation?"
                  onConfirm={() => onApprove?.(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  Approve
                </Popconfirm>
              ),
            },
            {
              key: 'deny',
              icon: <CloseOutlined />,
              disabled: record.status === 0,
              label: (
                <Popconfirm
                  title="Deny this organisation?"
                  onConfirm={() => onDeny?.(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  Deny
                </Popconfirm>
              ),
              danger: true,
            },
          ]}
        >
          <Button type="primary" icon={<EditOutlined />} />
        </TableActions>
      ),
    },
  ];

  return (
    <div className="mt-5">
      <TableX
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={onChange}
        rowKey="id"
        scroll={{ y: 500 }}
        locale={{
          emptyText: (
            <EmptyState
              icon={<Building2 className="text-slate-700" size={22} />}
              title="No organisations found"
              description="Organisations awaiting review or already approved will appear here."
            />
          ),
        }}
      />
    </div>
  );
};

export default OrganizationTable;
