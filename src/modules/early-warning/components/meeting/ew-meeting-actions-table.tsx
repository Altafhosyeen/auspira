'use client';

import {
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Button, Dropdown, Flex, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MeetingActionAssigneeDto } from '../../types/early-warning-api.types';
import {
  type DisplayMeetingAction,
  getAvatarStyle,
  getInitials,
  getProjectRoleLabel,
} from '../../utils/early-warning-meeting.utils';

interface EwMeetingActionsTableProps {
  actions: DisplayMeetingAction[];
  loading?: boolean;
  onCompleteAction?: (action: DisplayMeetingAction) => void;
  onDeleteAction?: (action: DisplayMeetingAction) => void;
  onEditAssignees?: (action: DisplayMeetingAction) => void;
  onOpenThread?: (action: DisplayMeetingAction) => void;
}

const renderPriorityTag = (priority: DisplayMeetingAction['priority']) => {
  switch (priority) {
    case 'High':
      return (
        <Tag color="error" bordered={false}>
          High
        </Tag>
      );
    case 'Medium':
      return (
        <Tag color="warning" bordered={false}>
          Medium
        </Tag>
      );
    default:
      return (
        <Tag color="default" bordered={false}>
          Low
        </Tag>
      );
  }
};

const renderStatusTag = (status: DisplayMeetingAction['status']) => {
  return status === 'Closed' ? (
    <Tag color="success" bordered={false}>
      Closed
    </Tag>
  ) : (
    <Tag color="processing" bordered={false}>
      Open
    </Tag>
  );
};

/** Assignee subtitle: role for internals, "External User" for externals (role 0). */
const getAssigneeSubtitle = (assignee: MeetingActionAssigneeDto): string => {
  if (assignee.isExternal) return 'External User';
  return getProjectRoleLabel(Number(assignee.role)) || assignee.email || 'Team Member';
};

export const EwMeetingActionsTable = ({
  actions,
  loading = false,
  onCompleteAction,
  onDeleteAction,
  onEditAssignees,
  onOpenThread,
}: EwMeetingActionsTableProps) => {
  const columns: ColumnsType<DisplayMeetingAction> = [
    {
      title: 'Ref',
      dataIndex: 'ref',
      key: 'ref',
      width: 70,
      render: (ref: string) => <Typography.Text strong>{ref}</Typography.Text>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: DisplayMeetingAction) => (
        <Flex align="center" gap={6}>
          {/* Clamped to two lines so one long title cannot inflate the row. */}
          <span className="line-clamp-2 min-w-0 flex-1 wrap-break-word">{title}</span>
          <Tooltip
            title={
              <Flex vertical gap={6}>
                <span>{title}</span>
                {record.description && <span style={{ opacity: 0.85 }}>{record.description}</span>}
              </Flex>
            }
          >
            <InfoCircleOutlined style={{ color: 'var(--ds-icon)', fontSize: 13, flexShrink: 0 }} />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: 'Assignees',
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 180,
      render: (_: string, record: DisplayMeetingAction) => {
        const assignees = record.assignees && record.assignees.length > 0 ? record.assignees : [];
        const [first, ...rest] = assignees;

        // Legacy fallback row when the API returns no assignee objects.
        if (!first) {
          return (
            <Flex align="center" gap={8}>
              <Avatar
                size={24}
                style={{
                  backgroundColor: record.ownerAvatarBg,
                  color: record.ownerAvatarColor,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {record.ownerInitials}
              </Avatar>
              <Typography.Text ellipsis style={{ maxWidth: 140 }}>
                {record.ownerName}
              </Typography.Text>
            </Flex>
          );
        }

        const firstStyle = getAvatarStyle(first.name);
        const menuItems: MenuProps['items'] = assignees.map((a) => {
          const style = getAvatarStyle(a.name);
          return {
            key: a.id || a.email || a.name,
            disabled: true,
            label: (
              <Flex align="center" gap={8}>
                <Avatar
                  size={24}
                  style={{
                    backgroundColor: style.bg,
                    color: style.color,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {getInitials(a.name)}
                </Avatar>
                <Flex vertical>
                  <Typography.Text>{a.name}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {getAssigneeSubtitle(a)}
                  </Typography.Text>
                </Flex>
              </Flex>
            ),
          };
        });

        return (
          <Flex align="center" gap={8}>
            <Avatar
              size={24}
              style={{
                backgroundColor: firstStyle.bg,
                color: firstStyle.color,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {getInitials(first.name)}
            </Avatar>
            <Typography.Text ellipsis style={{ maxWidth: 110 }}>
              {first.name}
            </Typography.Text>
            {rest.length > 0 && (
              <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                <Button size="small">+{rest.length}</Button>
              </Dropdown>
            )}
          </Flex>
        );
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 110,
      render: (deadline: string) => <Typography.Text>{deadline}</Typography.Text>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 88,
      render: (priority: DisplayMeetingAction['priority']) => renderPriorityTag(priority),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 92,
      render: (status: DisplayMeetingAction['status']) => renderStatusTag(status),
    },
    {
      title: 'Thread',
      key: 'thread',
      width: 96,
      render: (_, record: DisplayMeetingAction) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          disabled={!record.conversationId}
          onClick={() => onOpenThread?.(record)}
        >
          View
        </Button>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      align: 'center',
      render: (_, record: DisplayMeetingAction) => {
        const isOpen = record.status !== 'Closed';
        const menuItems = [
          ...(isOpen && onEditAssignees
            ? [
                {
                  key: 'edit-assignees',
                  icon: <UserOutlined />,
                  label: 'Edit Assignees',
                  onClick: () => onEditAssignees(record),
                },
              ]
            : []),
          ...(isOpen && onCompleteAction
            ? [
                {
                  key: 'complete',
                  icon: <CheckCircleOutlined />,
                  label: 'Mark Complete',
                  onClick: () => onCompleteAction(record),
                },
              ]
            : []),
          ...(onDeleteAction
            ? [
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  label: 'Delete Action',
                  onClick: () => onDeleteAction(record),
                },
              ]
            : []),
        ];

        if (menuItems.length === 0) return null;

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button size="small" icon={<MoreOutlined />} aria-label="Action menu" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={actions}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 880 }}
    />
  );
};

export default EwMeetingActionsTable;
