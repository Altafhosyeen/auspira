'use client';

import { CloseOutlined, UserAddOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Flex, Modal, message, Tag, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_THEME, BRAND_COLORS, SEMANTIC_COLORS } from '@/constants';
import {
  useGetProjectUsersLookup,
  useUpdateMeetingActionAssignees,
} from '../../hooks/use-early-warnings';
import type {
  MeetingActionAssigneeDto,
  MeetingActionDto,
} from '../../types/early-warning-api.types';
import {
  getAvatarStyle,
  getInitials,
  getProjectRoleLabel,
} from '../../utils/early-warning-meeting.utils';
import EwActionContextSummary from './ew-action-context-summary';
import EwCreateMeetingAttendeesSelect from './ew-create-meeting-attendees-select';

interface EwEditActionAssigneesModalProps {
  open: boolean;
  onClose: () => void;
  action?: MeetingActionDto | null;
  projectId: string;
  onSuccess?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Select key for an assignee row: internal → user id, external → email.
const keyOf = (assignee: MeetingActionAssigneeDto): string =>
  (assignee.applicationUserId || assignee.email || assignee.id).toLowerCase();

const getAssigneeSubtitle = (assignee: MeetingActionAssigneeDto): string => {
  if (assignee.isExternal) return 'External User';
  return getProjectRoleLabel(Number(assignee.role)) || assignee.email || 'Team Member';
};

/** Avatar + name + subtitle row shared by current and newly-added assignees. */
const AssigneeRow = ({
  name,
  subtitle,
  isExternal,
  dimmed,
  action,
}: {
  name: string;
  subtitle: string;
  isExternal?: boolean;
  dimmed?: boolean;
  action: React.ReactNode;
}) => {
  const style = getAvatarStyle(name);

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={8}
      style={{ padding: '10px 12px' }}
    >
      <Flex align="center" gap={10} style={{ minWidth: 0, opacity: dimmed ? 0.45 : 1 }}>
        <Avatar
          size={32}
          style={{
            backgroundColor: style.bg,
            color: style.color,
            fontWeight: 600,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {getInitials(name)}
        </Avatar>
        <Flex vertical>
          <Flex align="center" gap={8}>
            <Typography.Text strong>{name}</Typography.Text>
            {isExternal && (
              <Tag
                color="blue"
                bordered={false}
                style={{ fontSize: 10, margin: 0, padding: '1px 6px' }}
              >
                External User
              </Tag>
            )}
          </Flex>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {subtitle}
          </Typography.Text>
        </Flex>
      </Flex>
      {action}
    </Flex>
  );
};

export const EwEditActionAssigneesModal = ({
  open,
  onClose,
  action,
  projectId,
  onSuccess,
}: EwEditActionAssigneesModalProps) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { mutateAsync: updateAssignees, isPending } = useUpdateMeetingActionAssignees();

  const { data: projectUsers = [], isLoading: loadingUsers } = useGetProjectUsersLookup({
    projectId,
    enabled: open && !!projectId,
  });

  const currentAssignees: MeetingActionAssigneeDto[] = action?.assignees || [];

  const initialKeys = useMemo(() => currentAssignees.map(keyOf), [currentAssignees]);

  useEffect(() => {
    if (open) {
      // Current assignees start pre-selected in the picker.
      setSelectedKeys((action?.assignees ?? []).map(keyOf));
    }
  }, [open, action]);

  const isSameKey = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

  const isAssigneeSelected = useCallback(
    (assignee: MeetingActionAssigneeDto) => {
      const aId = assignee.id?.toLowerCase();
      const aUserId = assignee.applicationUserId?.toLowerCase();
      const aEmail = assignee.email?.toLowerCase();
      return selectedKeys.some((sk) => {
        const k = sk.trim().toLowerCase();
        return (aUserId && k === aUserId) || (aEmail && k === aEmail) || (aId && k === aId);
      });
    },
    [selectedKeys]
  );

  // Rows whose key is no longer selected are marked for removal.
  const assigneeIdsToRemove = useMemo(() => {
    return currentAssignees.filter((a) => !isAssigneeSelected(a)).map((a) => a.id);
  }, [currentAssignees, isAssigneeSelected]);

  const hasNoAssignees = selectedKeys.filter((k) => k.trim().length > 0).length === 0;

  const toggleAssigneeRow = (assignee: MeetingActionAssigneeDto) => {
    const isSelected = isAssigneeSelected(assignee);
    const aId = assignee.id?.toLowerCase();
    const aUserId = assignee.applicationUserId?.toLowerCase();
    const aEmail = assignee.email?.toLowerCase();

    if (isSelected) {
      setSelectedKeys((prev) =>
        prev.filter((sk) => {
          const k = sk.trim().toLowerCase();
          return k !== aUserId && k !== aEmail && k !== aId;
        })
      );
    } else {
      setSelectedKeys((prev) => [
        ...prev,
        assignee.applicationUserId || assignee.email || assignee.id,
      ]);
    }
  };

  const handleFinish = async () => {
    if (!action?.id) {
      message.error('Meeting action ID is missing');
      return;
    }

    if (hasNoAssignees) {
      message.error(
        'At least one assignee is required. Please assign a team member or enter an email address.'
      );
      return;
    }

    const additions = selectedKeys.filter((k) => {
      const lk = k.trim().toLowerCase();
      return !initialKeys.some((initKey) => {
        const matchedInit = currentAssignees.find(
          (a) =>
            (a.applicationUserId && a.applicationUserId.toLowerCase() === lk) ||
            (a.email && a.email.toLowerCase() === lk) ||
            (a.id && a.id.toLowerCase() === lk)
        );
        return isSameKey(initKey, k) || !!matchedInit;
      });
    });
    const userIdsToAdd: string[] = [];
    const externalAttendeesToAdd: Array<{ name: string; email: string }> = [];
    const invalidEntries: string[] = [];

    additions.forEach((rawKey) => {
      const key = rawKey.trim();
      const matchedUser = projectUsers.find(
        (u) =>
          u.id.toLowerCase() === key.toLowerCase() ||
          (u.email && u.email.toLowerCase() === key.toLowerCase())
      );

      if (matchedUser) {
        userIdsToAdd.push(matchedUser.id);
      } else if (EMAIL_RE.test(key)) {
        // External assignee from a typed email — name derived from the prefix.
        const email = key.toLowerCase();
        const name = email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        externalAttendeesToAdd.push({ name, email });
      } else {
        invalidEntries.push(key);
      }
    });

    if (invalidEntries.length > 0) {
      message.error(
        `Remove the invalid assignee(s): ${invalidEntries.join(', ')}. Pick a project member or enter an email address.`
      );
      return;
    }

    const remainingExistingCount = currentAssignees.length - assigneeIdsToRemove.length;
    const totalAssigneesAfterSave =
      remainingExistingCount + userIdsToAdd.length + externalAttendeesToAdd.length;

    if (totalAssigneesAfterSave === 0) {
      message.error(
        'At least one assignee is required. Please assign a team member or enter an email address.'
      );
      return;
    }

    if (
      userIdsToAdd.length === 0 &&
      externalAttendeesToAdd.length === 0 &&
      assigneeIdsToRemove.length === 0
    ) {
      message.info('No changes made to assignees.');
      onClose();
      return;
    }

    try {
      await updateAssignees({
        meetingActionId: action.id,
        payload: {
          projectId,
          userIdsToAdd,
          externalAttendeesToAdd,
          assigneeIdsToRemove,
        },
      });

      message.success('Assignees updated successfully');
      setSelectedKeys([]);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error(err?.message || 'Failed to update assignees');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
      width={640}
      destroyOnHidden
      styles={{
        container: { padding: 0, overflow: 'hidden' },
        body: { padding: 0 },
      }}
    >
      {/* Modal Header */}
      <Flex justify="space-between" align="center" style={{ padding: '20px 24px' }}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 40,
              height: 40,
              borderRadius: APP_THEME.radius.lg,
              border: `1px solid ${BRAND_COLORS.accent2}`,
              backgroundColor: SEMANTIC_COLORS.surfaceTableHeader,
            }}
          >
            <UserAddOutlined style={{ fontSize: 16, color: SEMANTIC_COLORS['main-p'] }} />
          </Flex>
          <Typography.Title level={4} style={{ margin: 0 }} ellipsis>
            Edit Assignees
          </Typography.Title>
        </Flex>

        <Button onClick={onClose} aria-label="Close" icon={<CloseOutlined />} />
      </Flex>

      <Divider style={{ margin: 0 }} />

      <Flex vertical gap={20} style={{ padding: '20px 24px 24px' }}>
        {/* Read-only action recap; assignees below are the only editable part. */}
        <EwActionContextSummary action={action} projectId={projectId} enabled={open} />

        {/* Assignees Selector — Shared Gmail-style dropdown component */}
        <Flex vertical gap={8}>
          <Flex justify="space-between" align="center">
            <Typography.Text strong>Assignees</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {selectedKeys.length} Selected
            </Typography.Text>
          </Flex>
          <EwCreateMeetingAttendeesSelect
            value={selectedKeys}
            onChange={setSelectedKeys}
            projectUsers={projectUsers}
            existingAssignees={currentAssignees}
            loading={loadingUsers}
            placeholder="Search project members or type an email to add..."
          />
          {hasNoAssignees && (
            <Typography.Text type="danger" style={{ fontSize: 12 }}>
              At least one assignee is required. Please select a project member or enter an email
              address.
            </Typography.Text>
          )}
        </Flex>

        {/* Current assignees — the list sits directly under the picker it mirrors. */}
        <Flex vertical gap={8}>
          {assigneeIdsToRemove.length > 0 && (
            <Flex justify="flex-end">
              <Typography.Text type="warning" style={{ fontSize: 12 }}>
                {assigneeIdsToRemove.length} marked for removal
              </Typography.Text>
            </Flex>
          )}

          {currentAssignees.length === 0 ? (
            <Typography.Text type="secondary">No assignees currently recorded.</Typography.Text>
          ) : (
            <Flex
              vertical
              style={{
                border: '1px solid var(--theme-border)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {currentAssignees.map((assignee, idx) => {
                const isMarkedForRemoval = assigneeIdsToRemove.includes(assignee.id);

                return (
                  <div
                    key={assignee.id}
                    style={{
                      borderBottom:
                        idx === currentAssignees.length - 1
                          ? 'none'
                          : '1px solid var(--theme-border)',
                      backgroundColor: isMarkedForRemoval
                        ? 'var(--ds-surface-subtle)'
                        : 'var(--theme-surface)',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <AssigneeRow
                      name={isMarkedForRemoval ? `${assignee.name} (removing)` : assignee.name}
                      subtitle={getAssigneeSubtitle(assignee)}
                      isExternal={assignee.isExternal}
                      dimmed={isMarkedForRemoval}
                      action={
                        <Button
                          size="small"
                          danger={!isMarkedForRemoval}
                          variant="filled"
                          color={isMarkedForRemoval ? 'primary' : 'default'}
                          onClick={() => toggleAssigneeRow(assignee)}
                        >
                          {isMarkedForRemoval ? 'Undo' : 'Remove'}
                        </Button>
                      }
                    />
                  </div>
                );
              })}
            </Flex>
          )}
        </Flex>

        {/* Footer Actions */}
        <Flex justify="flex-end" gap={12} style={{ paddingTop: 4 }}>
          <Button color="default" variant="filled" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>

          <Button
            type="primary"
            onClick={handleFinish}
            loading={isPending}
            disabled={hasNoAssignees}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default EwEditActionAssigneesModal;
