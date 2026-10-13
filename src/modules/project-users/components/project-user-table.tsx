'use client';

import { Dropdown, Flex, Popconfirm, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { EllipsisVerticalIcon, PencilIcon, UserMinusIcon } from 'lucide-react';
import TableX from '@/components/antd/TableX';
import { getAvatarTheme, getInitials } from '@/lib/utils/avatar.color';
import { formatLocalDate } from '@/lib/utils/datetime';
import { PROJECT_ROLE_NAMES, PROJECT_USER_COLUMNS } from '../constants/project-user.constants';
import type { ProjectUser } from '../types/project-user.types';
import ProjectUserStatusTag from './project-user-status-tag';

interface ProjectUserTableProps {
  data?: ProjectUser[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onEdit?: (user: ProjectUser) => void;
  onRemove?: (user: ProjectUser) => void;
  removingUserId?: string;
}

const DASH = <Tag bordered={false}>-</Tag>;

const ProjectUserTable = ({
  data = [],
  loading,
  pagination,
  onEdit,
  onRemove,
  removingUserId,
}: ProjectUserTableProps) => {
  const columns: ColumnsType<ProjectUser> = [
    {
      title: PROJECT_USER_COLUMNS.user,
      dataIndex: 'fullName',
      render: (_, record) => {
        const theme = getAvatarTheme(record.fullName);
        const initials = getInitials(record.fullName);
        return (
          <div className="flex items-center gap-3 py-1">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${theme.bg} ${theme.text} ${theme.border}`}
            >
              {initials}
            </div>
            <Typography.Text strong>{record.fullName}</Typography.Text>
          </div>
        );
      },
    },
    {
      title: PROJECT_USER_COLUMNS.role,
      dataIndex: 'projectRole',
      render: (projectRole: number) => (
        <span className="text-gray-600">{PROJECT_ROLE_NAMES[projectRole] ?? DASH}</span>
      ),
    },
    {
      title: PROJECT_USER_COLUMNS.email,
      dataIndex: 'email',
      render: (email: string) => <span className="text-gray-500">{email}</span>,
    },
    {
      title: PROJECT_USER_COLUMNS.status,
      dataIndex: 'status',
      render: (status: number) => <ProjectUserStatusTag status={status} />,
    },
    {
      title: PROJECT_USER_COLUMNS.assignDate,
      dataIndex: 'assignedOn',
      render: (assignedOn: string | null) => (
        <span className="text-gray-600">{assignedOn ? formatLocalDate(assignedOn) : DASH}</span>
      ),
    },
    {
      title: PROJECT_USER_COLUMNS.actions,
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: [
              {
                key: 'edit',
                label: (
                  <Flex align="center" gap={8}>
                    <PencilIcon size={14} />
                    <Typography.Text>Edit</Typography.Text>
                  </Flex>
                ),
                onClick: () => onEdit?.(record),
              },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Remove this user from the project?"
                    description={
                      <>
                        <Typography.Text strong>{record.fullName}</Typography.Text> will lose access
                        to this project.
                      </>
                    }
                    okText="Remove"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onRemove?.(record)}
                  >
                    <Flex align="center" gap={8}>
                      <UserMinusIcon size={14} />
                      <Typography.Text type="danger">Unassign</Typography.Text>
                    </Flex>
                  </Popconfirm>
                ),
                disabled: removingUserId === record.id,
              },
            ],
          }}
        >
          <button
            type="button"
            aria-label={`Actions for ${record.fullName}`}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            onClick={(event) => event.stopPropagation()}
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <TableX<ProjectUser>
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};

export default ProjectUserTable;
