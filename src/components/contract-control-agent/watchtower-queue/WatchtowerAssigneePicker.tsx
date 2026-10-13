'use client';

/**
 * WatchtowerAssigneePicker
 * "Add Assignee" popover for a sub-event row's Assigned cell — search project members, click one
 * to assign the row's task to them. Renders the trigger itself (a filled grey "Add Assignee" pill
 * when the row has no assignee yet, a name chip for one assignee, or an avatar stack with a "+N"
 * overflow for several). Hovering an assigned cell lists every assignee with an unassign control.
 * Matches the reference design's popover: a white card with a search field and a list of colour-coded member rows.
 */

import { CloseOutlined, LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { notification, Popover } from 'antd';
import { Search } from 'lucide-react';
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useAssignProjectTask, useUnassignProjectTask } from '@/hooks/modules/project-tasks';
import { type UserLookupDto, useGetProjectUsersLookup } from '@/modules/early-warning';
import { FOCUS_RING } from './watchtower-queue.config';
import type { EventCard } from './watchtower-queue.types';

interface WatchtowerAssigneePickerProps {
  taskId: string;
  projectId: string;
  assigned: EventCard['assigned'];
  assignees?: EventCard['assignees'];
}

/** Avatars shown before the rest collapse into a "+N" chip. */
const MAX_VISIBLE_ASSIGNEES = 2;

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

/** Deterministic per-assignee tint, picked from a small fixed palette by name hash — same
 *  convention as the row's own `getAvatarBg` in `watchtower-queue.mappers.ts`, kept local here
 *  since the picker needs a lighter (badge-style) variant of the same palette. */
const AVATAR_PALETTE = [
  'bg-sky-100 text-main-p',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-rose-100 text-rose-700',
];

const getAvatarBg = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

export default function WatchtowerAssigneePicker({
  taskId,
  projectId,
  assigned,
  assignees = [],
}: WatchtowerAssigneePickerProps) {
  const [open, setOpen] = useState(false);
  // Hover card listing every assignee with a remove control — kept shut while the
  // "Add Assignee" popover is open so the two never stack.
  const [listOpen, setListOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: projectUsers = [], isLoading } = useGetProjectUsersLookup({
    projectId,
    enabled: open && !!projectId,
  });
  const { mutate: assignTask, isPending } = useAssignProjectTask();
  const {
    mutate: unassignTask,
    isPending: isUnassigning,
    variables: unassignVars,
  } = useUnassignProjectTask();
  const assignedIds = useMemo(() => new Set(assignees.map((user) => user.id)), [assignees]);

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  const filteredUsers = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return projectUsers;
    return projectUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term)
    );
  }, [projectUsers, searchText]);

  const openAddAssignee = () => {
    setListOpen(false);
    setOpen(true);
  };

  const handleSelect = (user: UserLookupDto) => {
    // Failures already toast through the global MutationCache handler — only success is shown here.
    assignTask(
      { taskId, userId: user.id },
      {
        onSuccess: () =>
          notification.success({ message: `${user.fullName} assigned to this task.` }),
      }
    );
    setOpen(false);
    setSearchText('');
  };

  const content = (
    <div className="w-72">
      <p className="my-0 mb-3 text-[15px] font-bold text-slate-900">Add Assignee</p>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          ref={searchInputRef}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Enter name to find member"
          className="w-full border-0 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="mt-2 max-h-56 overflow-y-auto">
        {isLoading ? (
          <p className="my-0 py-3 text-center text-[11px] font-medium text-slate-400">
            Loading members…
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="my-0 py-3 text-center text-[11px] font-medium text-slate-400">
            No members found.
          </p>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              disabled={isPending || assignedIds.has(user.id)}
              onClick={() => handleSelect(user)}
              className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors duration-150 ease-in-out hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${getAvatarBg(user.fullName)}`}
                  aria-hidden="true"
                >
                  {getInitials(user.fullName)}
                </span>
                <span className="truncate text-[15px] font-medium text-main-p">
                  {user.fullName}
                </span>
              </span>
              {assignedIds.has(user.id) ? (
                <span className="shrink-0 text-[11px] font-medium text-slate-400">Assigned</span>
              ) : (
                <UserOutlined className="shrink-0 text-[14px] text-main-p" aria-hidden="true" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  const assigneeList = (
    <div className="w-64">
      <p className="my-0 mb-2 text-[13px] font-bold text-slate-900">
        Assignees <span className="font-medium text-slate-400">({assignees.length})</span>
      </p>
      <ul className="m-0 max-h-56 list-none overflow-y-auto p-0">
        {assignees.map((user) => {
          const removing = isUnassigning && unassignVars?.userId === user.id;
          return (
            <li
              key={user.id || user.name}
              className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-slate-50"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${user.avatarBg}`}
                  aria-hidden="true"
                >
                  {user.initials}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium text-slate-800">
                    {user.name}
                  </span>
                  {user.role && (
                    <span className="truncate text-[11px] text-slate-400">{user.role}</span>
                  )}
                </span>
              </span>
              {/* Rows without a real user id (legacy payloads) can't be addressed by the API. */}
              {user.id && (
                <button
                  type="button"
                  disabled={isUnassigning}
                  onClick={() =>
                    unassignTask(
                      { taskId, userId: user.id },
                      {
                        onSuccess: () =>
                          notification.success({
                            message: `${user.name} unassigned from this task.`,
                          }),
                      }
                    )
                  }
                  aria-label={`Unassign ${user.name}`}
                  title="Unassign"
                  className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors duration-150 ease-in-out hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`}
                >
                  {removing ? (
                    <LoadingOutlined style={{ fontSize: 10 }} aria-hidden="true" />
                  ) : (
                    <CloseOutlined style={{ fontSize: 10 }} aria-hidden="true" />
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={openAddAssignee}
        className={`mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-[12px] font-medium text-main-p transition-colors duration-150 ease-in-out hover:bg-slate-50 ${FOCUS_RING}`}
      >
        <PlusOutlined style={{ fontSize: 11 }} aria-hidden="true" />
        Add assignee
      </button>
    </div>
  );

  const withAddPopover = (trigger: ReactElement) => (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setListOpen(false);
      }}
      content={content}
      trigger="click"
      placement="bottomLeft"
    >
      {trigger}
    </Popover>
  );

  const single = assignees[0] ?? assigned;

  if (!single) {
    return withAddPopover(
      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        aria-label="Add assignee"
        className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 transition-colors duration-150 ease-in-out hover:bg-slate-200 ${FOCUS_RING}`}
      >
        <UserOutlined className="text-[13px] text-slate-400" aria-hidden="true" />
        Add Assignee
      </button>
    );
  }

  const trigger =
    assignees.length > 1 ? (
      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        aria-label={`Assignees: ${assignees.map((user) => user.name).join(', ')}`}
        className={`inline-flex cursor-pointer items-center rounded-full p-0.5 transition-colors duration-150 ease-in-out hover:bg-slate-50 ${FOCUS_RING}`}
      >
        {assignees.slice(0, MAX_VISIBLE_ASSIGNEES).map((user, index) => (
          <span
            key={user.id || user.name}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white ${index > 0 ? '-ml-2' : ''} ${user.avatarBg}`}
            aria-hidden="true"
          >
            {user.initials}
          </span>
        ))}
        {assignees.length > MAX_VISIBLE_ASSIGNEES && (
          <span
            className="-ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white"
            aria-hidden="true"
          >
            +{assignees.length - MAX_VISIBLE_ASSIGNEES}
          </span>
        )}
      </button>
    ) : (
      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        aria-label={`Assignee: ${single.name}`}
        className={`inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-md py-1 pr-1.5 pl-1 text-left transition-colors duration-150 ease-in-out hover:bg-slate-50 ${FOCUS_RING}`}
      >
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${single.avatarBg}`}
          aria-hidden="true"
        >
          {single.initials}
        </span>
        <span className="truncate text-[12px] font-medium text-slate-700">{single.name}</span>
      </button>
    );

  // Hover shows the assignee list (each with an unassign ×); click opens "Add Assignee".
  return (
    <Popover
      open={listOpen && !open}
      onOpenChange={setListOpen}
      content={assigneeList}
      trigger="hover"
      placement="bottomLeft"
      mouseEnterDelay={0.15}
    >
      {withAddPopover(trigger)}
    </Popover>
  );
}
