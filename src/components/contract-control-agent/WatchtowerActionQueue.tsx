'use client';

/**
 * WatchtowerActionQueue
 * Full-page "Watchtower & Action Queue" — pixel-matched to the Figma design.
 * Route: /projects/watchtower-queue  (also embedded in the project dashboard)
 *
 * This file owns page composition and state only. Data fetching, filtering, expansion and
 * navigation behave exactly as before; the row/card presentation lives in ./watchtower-queue.
 */

import { useQueryClient } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import { FileText, ShieldCheck } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSendProjectEmail } from '@/hooks/modules/project';
import {
  PROJECT_TASKS_QUERY_KEY,
  useGetProjectActionQueueGrouped,
  useGetProjectTasks,
} from '@/hooks/modules/project-tasks';
import { toLocalDayjs } from '@/lib/utils';
import {
  getWatchtowerRowHref,
  isCompensationEventRow,
  isMeetingInviteRow,
} from '@/lib/utils/org-dashboard.utils';
import {
  CompensationEventComposeEmailModal,
  type ComposeEmailDefaults,
  type ComposeEmailValues,
} from '@/modules/compensation-event';
import { EwCreateMeetingModal } from '@/modules/early-warning';
import { useProjectStore } from '@/store/project.store';
import type { WatchtowerRow } from '@/types/dashboard/org-dashboard.types';
import {
  CARD_SHADOW,
  CATEGORY_LABELS,
  type FilterOption,
  mapGroupToEventCard,
  ROW_PAD_X,
  TABLE_CARD,
  WATCHTOWER_MIN_WIDTH,
  WATCHTOWER_ROW_GRID,
  WATCHTOWER_TABLE_HEADER_BG,
  WatchtowerFilterBar,
  WatchtowerGroupedCard,
} from './watchtower-queue';

/** Column labels for the table header band — same four columns every `WatchtowerEventRow` renders,
 *  in the same order, so the header stays a single source of truth for the row grid it labels. */
const WATCHTOWER_HEADER_COLUMNS = ['Event', 'Assigned', 'Due Date', 'Required Action'];

/** This screen's column labels read as Title Case navy rather than the shared
 *  `TABLE_HEADER_LABEL`'s tracked-out grey uppercase — kept local so the Awareness table, which
 *  still uses that token, does not move with it. */
const WATCHTOWER_HEADER_LABEL = 'text-text text-[14px] leading-5 font-semibold';

const PRIORITY_OPTIONS: FilterOption[] = [
  { key: 'High', label: 'High' },
  { key: 'Medium', label: 'Medium' },
  { key: 'Low', label: 'Low' },
];

export interface WatchtowerActionQueueProps {
  /** A row id handed off by the dashboard Watchtower panel (`?rowId=`) — once its group loads,
   *  that matter is found, its group auto-expands, and the row arms itself as if a first click
   *  had already landed here. A second click on it then fires the real action. */
  targetRowId?: string;
}

export default function WatchtowerActionQueue({ targetRowId }: WatchtowerActionQueueProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [emailRow, setEmailRow] = useState<WatchtowerRow | null>(null);
  /** Early Warning Meeting rows open the same `EwCreateMeetingModal` the EW detail screen uses —
   *  no separate invite composer. Held here so the modal mounts once for any meeting row. */
  const [meetingRow, setMeetingRow] = useState<WatchtowerRow | null>(null);
  /** Id of the row armed for its confirming click — either by a click here, or handed off
   *  pre-armed from the dashboard via `targetRowId`. A second click on that same row is what
   *  actually opens it; clicking a different row just re-arms that one instead. */
  const [selectedRowId, setSelectedRowId] = useState<string | null>(targetRowId ?? null);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { data: actionQueueGrouped, isLoading: isLoadingGrouped } = useGetProjectActionQueueGrouped(
    {
      projectId: selectedProjectId ?? '',
      enabled: !!selectedProjectId,
    }
  );
  /** A first click just arms the row (highlighted, nothing opens yet); the same row clicked again
   * is what fires the real action — at the Early Warning Meeting stage that's the same create-
   * meeting modal the EW detail screen uses, early warning rows otherwise link straight through
   * to the EW Register detail screen, a CE's "Review Quotation" stage links straight through to
   * the CE detail page, and every other Compensation Event row opens the compose-email modal.
   * Clicking a different row while one is armed just re-arms the new one instead of opening it. */
  const handleSelectRow = useCallback(
    (row: WatchtowerRow) => {
      setSelectedRowId((current) => {
        if (current !== row.id) return row.id;

        if (isMeetingInviteRow(row)) {
          setMeetingRow(row);
          return null;
        }

        const href = getWatchtowerRowHref(row);
        if (href) {
          router.push(href);
        } else if (isCompensationEventRow(row)) {
          setEmailRow(row);
        }
        return null;
      });
    },
    [router]
  );

  const { mutate: sendProjectEmail, isPending: isSendingProjectEmail } = useSendProjectEmail();

  // Seeds the compose modal off the armed row's task — the same fields `getWatchtowerRowHref`/
  // `isCompensationEventRow` read, so a Compensation Event row (including "Link to CE", which
  // carries no real CE yet) opens pre-addressed to whoever is assigned and named after the task.
  const emailDefaults = useMemo<ComposeEmailDefaults | undefined>(() => {
    const task = emailRow?.task;
    if (!task) return undefined;
    const assignedEmail = task.assignedUsers[0]?.email;
    return {
      to: assignedEmail ? [assignedEmail] : [],
      subject: task.title,
      body: task.description ? `<p>${task.description}</p>` : '',
    };
  }, [emailRow]);

  // The create-meeting modal keys off the early warning itself — the same entity id the old
  // invite endpoint used — and the project scopes its user lookup.
  const meetingEarlyWarningId = meetingRow?.task?.entityId ?? '';
  const meetingProjectId = meetingRow?.task?.projectId ?? selectedProjectId ?? '';

  // The send hooks only invalidate the entity they wrote — this screen's own
  // action-queue-grouped/project-tasks lists are invalidated here so the row's next
  // stage pulls in immediately rather than showing the just-actioned one.
  const handleActionSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_QUERY_KEY });
  }, [queryClient]);

  // A meeting invite sent from the queue completes the row's meeting stage — send the
  // user on to the Early Warning listing where the new meeting lands, rather than
  // leaving them on a queue row that has already been actioned.
  const handleMeetingSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_QUERY_KEY });
    router.push('/contract-control-agent/early-warning');
  }, [queryClient, router]);

  const handleSendEmail = useCallback(
    (values: ComposeEmailValues) => {
      const task = emailRow?.task;
      if (!task) return;

      sendProjectEmail(
        {
          projectEmailId: '',
          projectId: task.projectId,
          to: values.to.join(', '),
          cc: values.cc.join(', '),
          bcc: values.bcc.join(', '),
          subject: values.subject,
          body: values.body,
        },
        { onSuccess: handleActionSuccess }
      );
    },
    [emailRow, sendProjectEmail, handleActionSuccess]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);

  const { data: projectTasks } = useGetProjectTasks({
    projectId: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  // The grouped action-queue endpoint's `taskId`s are the same backend task ids as this plain
  // list — used to look up each grouped task's *real* record (entityType/entityId/description/…)
  // so WatchtowerGroupedCard's rows open the same modal/route a real task row would, not just the
  // subset (Risk Reduction invite) derivable from the grouped endpoint's own sparse fields alone.
  const taskById = useMemo(
    () => new Map((projectTasks ?? []).map((task) => [task.id, task])),
    [projectTasks]
  );

  // The filter toolbar filters the Early Warning Lifecycle groups below — read off each group's
  // own governing card (its own first task, same as what `WatchtowerGroupedCard` renders) rather
  // than duplicating that derivation here. The governing task's own reference (off the plain
  // project-tasks list) wins over the group's shared one — see the note on `mapGroupToEventCard`
  // — so the search box and category filter read the same title/code the card itself shows.
  const groupCards = useMemo(
    () =>
      (actionQueueGrouped?.groups ?? []).map((group) => {
        const current = group.tasks[0] ?? null;
        return {
          group,
          card: mapGroupToEventCard(
            group,
            current,
            group.tasks[1] ?? null,
            current ? taskById.get(current.taskId)?.reference : null
          ),
        };
      }),
    [actionQueueGrouped, taskById]
  );

  // The dashboard only hands off a task id, not which Early Warning lifecycle group it belongs
  // to — search every group's stages for it so that group is pinned open and reveals the row.
  // Cards already mount expanded by default, so this only matters if that default ever changes;
  // it stays computed synchronously with `groupCards` (not in an effect) so it's correct on the
  // very same render `WatchtowerGroupedCard` first mounts for the matching group.
  const targetGroupId = useMemo(() => {
    if (!targetRowId) return null;
    const hit = groupCards.find(
      ({ group }) =>
        group.groupId === targetRowId || group.tasks.some((task) => task.taskId === targetRowId)
    );
    return hit?.group.groupId ?? null;
  }, [groupCards, targetRowId]);

  // Scrolls the handed-off row into view once its group has expanded and the row itself is in
  // the DOM. Runs once the group is known — `WatchtowerEventRow` renders are synchronous, so by
  // the time this effect fires the row element already exists.
  useEffect(() => {
    if (!targetRowId || !targetGroupId) return;
    const el = document.getElementById(`watchtower-row-${targetRowId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [targetRowId, targetGroupId]);

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      Array.from(new Set(groupCards.map(({ card }) => card.type))).map((code) => ({
        key: code,
        label: CATEGORY_LABELS[code] ?? code,
      })),
    [groupCards]
  );

  const assigneeOptions = useMemo<FilterOption[]>(
    () =>
      Array.from(
        new Set(groupCards.flatMap(({ card }) => card.assignees.map((user) => user.name)))
      ).map((name) => ({ key: name, label: name })),
    [groupCards]
  );

  const filteredGroups = useMemo(() => {
    return groupCards.filter(({ group, card }) => {
      if (categoryFilter && card.type !== categoryFilter) return false;

      if (priorityFilter && card.clock.priority !== priorityFilter) return false;

      if (assigneeFilter && !card.assignees.some((user) => user.name === assigneeFilter))
        return false;

      if (dateFilter) {
        const dueValue = group.tasks[0]?.dueDateTime;
        if (!dueValue || !toLocalDayjs(dueValue).isSame(dateFilter, 'day')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack =
          `${card.title} ${card.code} ${card.assignees.map((user) => user.name).join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [groupCards, categoryFilter, priorityFilter, assigneeFilter, dateFilter, searchQuery]);

  const hasGroups = groupCards.length > 0;

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter(null);
    setPriorityFilter(null);
    setAssigneeFilter(null);
    setDateFilter(null);
  }, []);

  return (
    <div className="flex flex-col">
      {/* ─── Page chrome: header + filter toolbar. The whole page scrolls as one inside
          BaseLayout's `Content` (`flex-1 overflow-y-auto`) — this screen deliberately does NOT
          open a vertical scroll container of its own. A nested one has no bounded height to
          resolve against here (every ancestor up to `Content` scrolls rather than clipping), so
          it settled at an arbitrary height and cut matter rows off at the top and bottom. */}
      <div className="mx-auto w-full ">
        {/* Title sits in its own card, matching the reference design's three stacked bands
            (title · explainer · toolbar). Deliberately not `FeaturePageHeader`: that component is
            shared with the other list screens and draws a circular icon tile, where this screen's
            reference puts a bare glyph on a card. */}
        <div
          className={`mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 ${CARD_SHADOW}`}
        >
          <FileText className="text-main-p h-7 w-7 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <h1 className="ds-heading-2! text-main-p my-0!">Action Queue</h1>
        </div>

        {/* What the queue is, in the reference design's own words — a standing explainer above the
            toolbar rather than per-row help text, since it describes every matter the table holds. */}
        <p className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-[13px] leading-5 font-medium text-slate-600">
          This notice informs stakeholders of an event that has occurred or is expected to occur and
          may impact the project&apos;s scope, cost, schedule, or quality. The event requires
          assessment to determine its potential impact and necessary action.
        </p>
      </div>

      {/* ─── Early Warning lifecycle (from the grouped action-queue endpoint) ─────────── */}
      {/* Always rendered — a query still loading or one that came back with zero groups both
          need their own message here, not blank space where the card would otherwise sit. */}
      <div className="mx-auto flex w-full  flex-col">
        <section className={`${TABLE_CARD} flex flex-col`}>
          {/* Toolbar is the card's own first band, above the column headers it filters — the
              reference design runs the two together as one surface rather than floating the
              toolbar in a detached card above the table. */}
          <WatchtowerFilterBar
            categoryFilter={categoryFilter}
            categoryOptions={categoryOptions}
            onCategoryChange={setCategoryFilter}
            priorityFilter={priorityFilter}
            priorityOptions={PRIORITY_OPTIONS}
            onPriorityChange={setPriorityFilter}
            assigneeFilter={assigneeFilter}
            assigneeOptions={assigneeOptions}
            onAssigneeChange={setAssigneeFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearFilters={clearFilters}
          />

          {/* `overflow-x-auto` only: the narrow-viewport story is horizontal scroll down to
              `WATCHTOWER_MIN_WIDTH`. Vertical scrolling belongs to `Content` above, so the card
              grows to its full content height and every matter row renders in full. */}
          <div className="overflow-x-auto p-4 sm:p-5">
            <div className={WATCHTOWER_MIN_WIDTH}>
              {/* Column-header band only makes sense once there's something to label — hidden
                  once loading has settled on zero groups.

                  Deliberately not sticky: `TABLE_CARD` carries `overflow-hidden`, which clips a
                  sticky child to the card's own box, and the card no longer has a bounded height
                  to scroll within. The band had nothing left to pin against, so it simply painted
                  over the first matter row. It now scrolls with the table it labels. */}
              {(isLoadingGrouped || hasGroups) && (
                <div
                  className={`mb-3 rounded-lg ${WATCHTOWER_ROW_GRID} ${ROW_PAD_X} ${WATCHTOWER_TABLE_HEADER_BG} py-3.5`}
                >
                  {WATCHTOWER_HEADER_COLUMNS.map((label) => (
                    <span key={label} className={`${WATCHTOWER_HEADER_LABEL} pr-4`}>
                      {label}
                    </span>
                  ))}
                  {/* Matches the row's trailing open-chevron track, which carries no label. */}
                  <span aria-hidden="true" />
                </div>
              )}

              {isLoadingGrouped ? (
                <p className="ds-caption! my-0 py-10 text-center font-semibold! text-slate-400">
                  Loading matters…
                </p>
              ) : !hasGroups ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="ds-caption! my-0 font-semibold! text-slate-700">
                      All clear — nothing needs attention
                    </p>
                    <p className="ds-micro! mt-1 mb-0 text-slate-400">
                      No Early Warnings or other matters are currently active for this project.
                    </p>
                  </div>
                </div>
              ) : filteredGroups.length === 0 ? (
                <p className="ds-caption! my-0 py-10 text-center font-semibold! text-slate-400">
                  No matters match your filters.
                </p>
              ) : (
                filteredGroups.map(({ group }) => (
                  <WatchtowerGroupedCard
                    key={group.groupId}
                    group={group}
                    projectId={selectedProjectId ?? ''}
                    taskById={taskById}
                    onSelectRow={handleSelectRow}
                    selectedRowId={selectedRowId}
                    forceExpanded={group.groupId === targetGroupId ? true : undefined}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <EwCreateMeetingModal
        open={!!meetingRow}
        onClose={() => setMeetingRow(null)}
        earlyWarningId={meetingEarlyWarningId}
        projectId={meetingProjectId}
        onSuccess={handleMeetingSuccess}
      />

      <CompensationEventComposeEmailModal
        open={!!emailRow}
        title="Compose Email"
        defaults={emailDefaults}
        projectId={emailRow?.task?.projectId}
        sending={isSendingProjectEmail}
        onCancel={() => setEmailRow(null)}
        onSend={handleSendEmail}
      />
    </div>
  );
}
