'use client';

import { EditOutlined } from '@ant-design/icons';
import { notification, Popconfirm, type TableProps, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Trash, UserCheck, Users } from 'lucide-react';
import React from 'react';
import TableX from '@/components/antd/TableX';
import { EmptyState } from '@/components/shared/EmptyState';
import { ROLE_NAMES, SYSTEM_ROLE_IDS } from '@/constants/role.ids';
import { getStatusConfig, Status } from '@/constants/status.constant';
import { useDeleteUser } from '@/hooks/modules/users';
import { getAvatarTheme, getInitials } from '@/lib/utils/avatar.color';
import type { User } from '@/types/users/users.types';
import AssignProjectModal from './AssignProjectModal';
import EditUserDrawer from './EditUserDrawer';

const getStatusColor = (status?: number): string => {
  switch (status) {
    case Status.Active:
      return 'green';
    case Status.Pending:
      return 'blue';
    case Status.Invited:
      return 'cyan';
    case Status.InActive:
      return 'default';
    case Status.Deleted:
    case Status.Rejected:
    case Status.Suspended:
      return 'red';
    default:
      return 'default';
  }
};

const getRoleTagStyle = (roleId: string): React.CSSProperties => {
  switch (roleId) {
    case SYSTEM_ROLE_IDS.SYSTEM_ADMIN:
      return { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: 'transparent' };
    case SYSTEM_ROLE_IDS.ORGANIZATION_ADMIN:
      return { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: 'transparent' };
    case SYSTEM_ROLE_IDS.ORGANIZATION_USER:
      return { backgroundColor: '#d1fae5', color: '#047857', borderColor: 'transparent' };
    default:
      return { backgroundColor: '#f1f5f9', color: '#334155', borderColor: 'transparent' };
  }
};

interface UsersTableProps {
  data?: User[] | undefined;
  loading?: boolean;
  pagination?: TableProps<User>['pagination'];
  onChange?: TableProps<User>['onChange'];
}

const UsersTable = ({ data, pagination, onChange }: UsersTableProps) => {
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [assigningUser, setAssigningUser] = React.useState<User | null>(null);
  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteUser();

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      notification.success({
        message: 'User deleted',
      });
    } catch (error) {
      notification.error({
        message: 'Failed to delete user',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const openEditDrawer = (record: User) => {
    setEditingUser(record);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 250,
      render: (_, record) => {
        const name = record.fullName || 'N/A';
        const theme = getAvatarTheme(name);
        const initials = getInitials(name);

        return (
          <div className="flex items-center gap-3 py-1">
            {/* Custom professional circular avatar */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${theme.bg} ${theme.text} ${theme.border}`}
            >
              {initials}
            </div>

            <div className="flex flex-col">
              <span className="text-sm leading-tight font-semibold text-gray-800">{name}</span>
              {/* {record.email && (
                <span className="mt-0.5 text-xs leading-none text-gray-400">{record.email}</span>
              )} */}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (value) => <span className="text-gray-500">{value}</span>,
      width: 200,
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      render: (roleId: User['roleId']) => (
        <Tag
          bordered={false}
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={getRoleTagStyle(roleId)}
        >
          {ROLE_NAMES[roleId as keyof typeof ROLE_NAMES] || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Projects',
      dataIndex: 'allocatedProjectsCount',
      render: (value: number) => <span className="text-gray-600">{value} Projects</span>,
    },
    {
      title: 'Mailbox Connected',
      dataIndex: 'emailInboxConnected',
      render: (connected: User['emailInboxConnected']) => (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={connected ? 'text-green-600' : 'text-gray-500'}>
            {connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>{getStatusConfig(record.status).label}</Tag>
      ),
    },
    {
      title: 'Actions',
      width: 120,
      // fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-4 text-gray-400">
          {/* Delete */}
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okButtonProps={{ loading: isDeletingUser }}
            >
              <button type="button" className="cursor-pointer transition-colors hover:text-red-500">
                <Trash size={16} color="red" />
              </button>
            </Popconfirm>
          </Tooltip>

          {/* View */}
          <Tooltip
            title={
              record.emailInboxConnected ? 'Assign Projects' : 'Connect mailbox to assign projects'
            }
          >
            <button
              type="button"
              onClick={() => record.emailInboxConnected && setAssigningUser(record)}
              disabled={!record.emailInboxConnected}
              className={
                record.emailInboxConnected
                  ? 'cursor-pointer transition-colors hover:text-gray-700'
                  : 'cursor-not-allowed opacity-40'
              }
            >
              <UserCheck size={16} />
            </button>
          </Tooltip>

          {/* Edit */}
          <Tooltip title="Edit">
            <button
              type="button"
              onClick={() => openEditDrawer(record)}
              className="cursor-pointer transition-colors hover:text-gray-700"
            >
              <EditOutlined style={{ color: '#0F4C81' }} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
      <TableX<User>
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={onChange}
        rowClassName={() => 'hover:bg-gray-50'}
        rowKey="id"
        scroll={{
          y: 250,
        }}
        locale={{
          emptyText: (
            <EmptyState
              icon={<Users className="text-slate-700" size={22} />}
              title="No users found"
              description="Invite a user to this organisation to see them listed here."
            />
          ),
        }}
      />

      <EditUserDrawer
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />

      <AssignProjectModal
        open={Boolean(assigningUser)}
        onClose={() => setAssigningUser(null)}
        user={assigningUser}
      />
    </div>
  );
};

export default UsersTable;
