'use client';

import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Flex, Input, Popover, Typography } from 'antd';
import { FilterIcon, SearchIcon, UserPlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStatusConfig, Status } from '@/constants/status.constant';
import { useProjectStore } from '@/store/project.store';
import { useGetProjectUsers, useRemoveProjectUser } from '../hooks/use-project-users';
import type { ProjectUser } from '../types/project-user.types';
import ProjectUserAssignModal from './project-user-assign-modal';
import ProjectUserTable from './project-user-table';

// Project users can only ever be Active/Pending/Invited/Inactive — Deleted/Rejected/
// Suspended/Unknown are org-user-only states, so they're filtered out of the enum here
// rather than hardcoding the four values that remain.
const PROJECT_USER_STATUSES = new Set([
  Status.Active,
  Status.Pending,
  Status.Invited,
  Status.InActive,
]);
const STATUS_FILTER_OPTIONS = Object.values(Status)
  .filter((status): status is Status => typeof status === 'number')
  .filter((status) => PROJECT_USER_STATUSES.has(status))
  .map((status) => ({ value: status, label: getStatusConfig(status).label }));

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
const SEARCH_DEBOUNCE_MS = 400;

const ProjectUsersTab = () => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editUser, setEditUser] = useState<ProjectUser | null>(null);

  // Debounce the search box before it drives the API call — searching shouldn't fire
  // a request on every keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { data, isFetching } = useGetProjectUsers(selectedProjectId ?? '', {
    skip: (page - 1) * pageSize,
    top: pageSize,
    term: term || undefined,
    status: statusFilter.length ? statusFilter : undefined,
  });
  const {
    mutateAsync: removeUser,
    isPending: isRemoving,
    variables: removingUserId,
  } = useRemoveProjectUser(selectedProjectId ?? '');

  const users = data?.items ?? [];
  const total = data?.meta?.totalCount ?? 0;

  const handleStatusFilterChange = (values: number[]) => {
    setStatusFilter(values);
    setPage(1);
  };

  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <UserOutlined />
          <Typography.Text strong>Project Users</Typography.Text>
        </Flex>
      }
      extra={
        <Flex align="center" gap={8}>
          <Button
            type="primary"
            icon={<UserPlusIcon size={16} />}
            onClick={() => setAssignOpen(true)}
          >
            Assign User
          </Button>
          <Input
            placeholder="Search by user, action or details..."
            prefix={<SearchIcon size={16} className="text-gray-400" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Popover
            trigger="click"
            placement="bottomRight"
            content={
              <Flex vertical gap={8} style={{ width: 200 }}>
                <Typography.Text strong>Status</Typography.Text>
                <Checkbox.Group
                  value={statusFilter}
                  onChange={(values) => handleStatusFilterChange(values as number[])}
                  style={{ width: '100%', flexDirection: 'column', gap: 8 }}
                  options={STATUS_FILTER_OPTIONS}
                />
              </Flex>
            }
          >
            <Button icon={<FilterIcon size={16} />}>
              Filters{statusFilter.length ? ` (${statusFilter.length})` : ''}
            </Button>
          </Popover>
        </Flex>
      }
    >
      <ProjectUserTable
        data={users}
        loading={isFetching}
        onEdit={(user) => setEditUser(user)}
        onRemove={(user) => removeUser(user.id)}
        removingUserId={isRemoving ? removingUserId : undefined}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (count, [from, to]) => `${from}-${to} of ${count}`,
          onChange: (nextPage, nextPageSize) => {
            // Changing the page size re-cuts the list, so the old page number no longer
            // points at the same rows — go back to the first page instead.
            setPage(nextPageSize === pageSize ? nextPage : 1);
            setPageSize(nextPageSize);
          },
        }}
      />

      <ProjectUserAssignModal
        open={assignOpen || !!editUser}
        projectId={selectedProjectId ?? ''}
        editUser={editUser}
        editProjectRole={editUser?.projectRole}
        onClose={() => {
          setAssignOpen(false);
          setEditUser(null);
        }}
      />
    </Card>
  );
};

export default ProjectUsersTab;
