'use client';

import { CloseOutlined, UserOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  ConfigProvider,
  Divider,
  Flex,
  Modal,
  notification,
  Select,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import IconChip from '@/components/shared/icon-chip';
import { useGetUsers } from '@/hooks/modules/users';
import { getAvatarTheme, getInitials } from '@/lib/utils/avatar.color';
import { PROJECT_ROLE_OPTIONS } from '../constants/project-user.constants';
import { PROJECT_ROLE_ACCESS_SUMMARY } from '../constants/project-user-access.constants';
import { useAssignProjectUser, useUpdateProjectUserRole } from '../hooks/use-project-users';

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

export interface ProjectUserAssignModalProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  // Pre-fills and locks the user for a re-assign (role change) instead of a fresh assign.
  editUser?: UserOption | null;
  // The user's current project role — pre-selects it on edit.
  editProjectRole?: number | null;
}

const ProjectUserAssignModal = ({
  open,
  projectId,
  onClose,
  editUser = null,
  editProjectRole = null,
}: ProjectUserAssignModalProps) => {
  const isEditing = !!editUser;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(editUser);
  // No default on create — the field starts empty until the user picks a role.
  // On edit, pre-select the user's current project role when it's known.
  const [projectRole, setProjectRole] = useState<number | null>(editProjectRole);
  const [checkedAccessItems, setCheckedAccessItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setSelectedUser(editUser);
      setProjectRole(editProjectRole);
    }
  }, [open, editUser, editProjectRole]);

  // Debounce the search box before it drives the API call — searching by name or email
  // shouldn't fire a request on every keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({
    // Opening the dropdown with no query yet still shows the org's users — narrowed as
    // soon as debouncedSearch picks up whatever gets typed. No `top` — fetch the full
    // org user list rather than capping it.
    enabled: open,
    term: debouncedSearch,
    skipLoader: true,
  });
  const { mutateAsync: assignUser, isPending: isAssigning } = useAssignProjectUser(projectId);
  const { mutateAsync: updateRole, isPending: isUpdatingRole } =
    useUpdateProjectUserRole(projectId);
  const isPending = isAssigning || isUpdatingRole;

  const userOptions: UserOption[] = useMemo(() => {
    const list = Array.isArray(usersResponse)
      ? usersResponse
      : ((usersResponse as any)?.items ?? []);
    return list.map((user: any) => ({ id: user.id, fullName: user.fullName, email: user.email }));
  }, [usersResponse]);

  // Preview the first role's access list until one is actually picked, so the summary
  // section never renders empty.
  const accessSummary =
    PROJECT_ROLE_ACCESS_SUMMARY[projectRole ?? PROJECT_ROLE_OPTIONS[0].value] ?? [];

  const resetState = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedUser(null);
    setProjectRole(null);
    setCheckedAccessItems({});
  };

  const handleRoleChange = (value: number) => {
    setProjectRole(value);
    // A role switch swaps the whole permission list, so any per-item overrides from
    // the previous role no longer apply — start every item checked again.
    setCheckedAccessItems({});
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAssign = async () => {
    if (!selectedUser || projectRole == null) return;
    try {
      if (isEditing) {
        await updateRole({ userId: selectedUser.id, projectRole });
      } else {
        await assignUser({ userId: selectedUser.id, projectRole });
      }
      notification.success({
        message: isEditing
          ? `${selectedUser.fullName}'s role updated`
          : `${selectedUser.fullName} assigned to project`,
      });
      resetState();
      onClose();
    } catch (error) {
      notification.error({
        message: isEditing ? 'Failed to update role' : 'Failed to assign user',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={false}
      destroyOnClose
      width={700}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={10}>
          <IconChip icon={<UserOutlined />} bordered />
          <Typography.Text strong style={{ fontSize: 16 }}>
            {isEditing ? 'Edit User Role' : 'Assign User'}
          </Typography.Text>
        </Flex>
        <Button
          type="text"
          shape="circle"
          icon={<CloseOutlined />}
          onClick={handleClose}
          aria-label="Close"
        />
      </Flex>

      <Divider style={{ margin: '16px 0' }} />

      <StepSection value={1} title="Select User">
        <Select<string>
          showSearch
          allowClear={!isEditing}
          disabled={isEditing}
          value={selectedUser?.id}
          placeholder="Search by name or email"
          filterOption={false}
          searchValue={search}
          onSearch={(value) => {
            setSearch(value);
            // Typing again means picking someone else — drop the current selection so the
            // field shows the typed text instead of overlapping it with the old label.
            if (selectedUser) setSelectedUser(null);
          }}
          loading={isLoadingUsers}
          notFoundContent={
            !debouncedSearch ? null : isLoadingUsers ? 'Searching…' : 'No users found.'
          }
          options={userOptions.map((user) => ({ value: user.id, user }))}
          optionRender={({ data }) => (
            <Flex align="center" gap={10}>
              <UserAvatar name={data.user.fullName} />
              <Flex vertical gap={0}>
                <Typography.Text strong>{data.user.fullName}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {data.user.email}
                </Typography.Text>
              </Flex>
            </Flex>
          )}
          labelRender={() =>
            selectedUser ? (
              <Flex align="center" gap={10}>
                <UserAvatar name={selectedUser.fullName} />
                <Flex vertical gap={0}>
                  <Typography.Text strong>{selectedUser.fullName}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {selectedUser.email}
                  </Typography.Text>
                </Flex>
              </Flex>
            ) : null
          }
          onChange={(userId) => {
            const user = userOptions.find((option) => option.id === userId) ?? null;
            setSelectedUser(user);
            // Clear the query once picked — otherwise the stale search term keeps
            // `userOptions` pinned to the old results and the closed dropdown briefly
            // shows "No users found" behind the selected value.
            setSearch('');
            setDebouncedSearch('');
          }}
          onClear={() => setSelectedUser(null)}
          size="large"
          style={{ width: '100%' }}
          popupMatchSelectWidth
        />
      </StepSection>

      <StepSection value={2} title="Select Role">
        <Select
          value={projectRole ?? undefined}
          placeholder="Select a role"
          onChange={handleRoleChange}
          options={PROJECT_ROLE_OPTIONS}
          size="large"
        />
      </StepSection>

      <StepSection value={3} title="Access Summary" last>
        <ConfigProvider
          theme={{
            components: {
              Checkbox: { colorPrimary: '#22C55E', colorPrimaryHover: '#22C55E' },
            },
          }}
        >
          <Flex vertical gap={6} style={{ background: '#F9FAFB', borderRadius: 8, padding: 12 }}>
            {accessSummary.map((item) => (
              <Checkbox
                key={item}
                checked={checkedAccessItems[item] ?? true}
                onChange={(event) =>
                  setCheckedAccessItems((prev) => ({ ...prev, [item]: event.target.checked }))
                }
              >
                {item}
              </Checkbox>
            ))}
          </Flex>
        </ConfigProvider>
      </StepSection>

      <Flex justify="end" gap={8} style={{ marginTop: 24 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          type="primary"
          icon={<UserOutlined />}
          loading={isPending}
          disabled={!selectedUser || projectRole == null}
          onClick={handleAssign}
        >
          {isEditing ? 'Update Role' : 'Assign User'}
        </Button>
      </Flex>
    </Modal>
  );
};

interface StepSectionProps {
  value: number;
  title: string;
  last?: boolean;
  children: ReactNode;
}

// One numbered circle per step, joined by a continuous rail down the left edge —
// the rail is this step's own trailing segment, so it reaches exactly to the next circle.
const StepSection = ({ value, title, last, children }: StepSectionProps) => (
  <div style={{ display: 'flex', marginBottom: last ? 0 : 20 }}>
    <Flex
      align="center"
      justify="center"
      style={{
        width: 22,
        height: 22,
        flexShrink: 0,
        borderRadius: '50%',
        background: '#224C7D',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {value}
    </Flex>
    <Flex vertical gap={8} style={{ flex: 1, marginLeft: 12, paddingBottom: last ? 0 : 4 }}>
      <Typography.Text strong>{title}</Typography.Text>
      {children}
    </Flex>
  </div>
);

const UserAvatar = ({ name }: { name: string }) => {
  const theme = getAvatarTheme(name);
  const initials = getInitials(name);
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${theme.bg} ${theme.text} ${theme.border}`}
    >
      {initials}
    </div>
  );
};

export default ProjectUserAssignModal;
