'use client';

import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Popconfirm, Tag, type TableProps } from 'antd';
import TableX from '@/components/antd/TableX';
import TableActions from '@/components/shared/Table/TableActions';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';
import { Trash } from 'lucide-react';
import ButtonX from '@/components/antd/ButtonX';

type ZClauseRow = {
  key: string;
  clause: string;
  description: string;
  status: 'Reviewed' | 'Pending';
};

interface ZClauseTableProps {
  data?: ZClauseRow[] | null | undefined;
  loading?: boolean;
  pagination?: TableProps<ZClauseRow>['pagination'];
  onChange?: TableProps<ZClauseRow>['onChange'];
}

const Z_CLAUSES: ZClauseRow[] = [
  {
    key: 'z-1',
    clause: 'Z1',
    description: 'Special project amendment and contract note',
    status: 'Reviewed',
  },
  {
    key: 'z-2',
    clause: 'Z2',
    description: 'Additional commercial or legal requirement',
    status: 'Reviewed',
  },
  {
    key: 'z-3',
    clause: 'Z3',
    description: 'Needs confirmation from the review team',
    status: 'Pending',
  },
];

const ZClauseTable = ({
  data = Z_CLAUSES,
  loading = false,
  pagination,
  onChange,
}: ZClauseTableProps) => {
  const normalizedData = Array.isArray(data) ? data : [];

  const columns: ColumnsType<ZClauseRow> = [
    {
      title: 'Clause',
      dataIndex: 'clause',
      render: (_, record) => <span className="font-medium text-gray-800">{record.clause}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (value) => <span>{value}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (status: ZClauseRow['status']) => (
        <Tag color={status === 'Reviewed' ? 'green' : 'gold'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <TableActions
          children={<ButtonX type="primary" icon={<EditOutlined />} />}
          items={[
            {
              key: 'clone',
              label: 'Clone',
              icon: <CopyOutlined />,
              onClick: () => record,
            },
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined />,
              onClick: () => record,
            },
            {
              key: 'delete',
              icon: <Trash size={12} />,
              label: (
                <Popconfirm
                  title="Are you sure you want to delete this VAT rule?"
                  onConfirm={() => record}
                  okText="Yes"
                  cancelText="No"
                >
                  Delete
                </Popconfirm>
              ),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="mt-5 rounded-md border border-gray-300 bg-white p-4">
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
        <p className="text-lg font-semibold text-gray-800">Z-Clauses & Amendments</p>
        <p>4 Clauses Identified</p>
      </div>
      <TableX
        columns={columns}
        className="m-2"
        dataSource={normalizedData}
        loading={loading}
        pagination={pagination}
        onChange={onChange}
      />
    </div>
  );
};

export default ZClauseTable;
