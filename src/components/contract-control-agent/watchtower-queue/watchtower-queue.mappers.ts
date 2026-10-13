/**
 * Watchtower & Action Queue — task → card mapping.
 *
 * Unchanged behaviour, lifted out of the page component so the governing row and its sub-event
 * rows share one derivation. Split out of `watchtower-queue.config.ts`, which re-exports it —
 * import from there rather than reaching in here.
 */

import dayjs from 'dayjs';
import { EwLifecycleStage } from '@/constants';
import type {
  ActionQueueGroup,
  ActionQueueGroupedTask,
  ProjectTask,
  ProjectTaskAssignedUser,
} from '@/hooks/modules/project-tasks';
import { toLocalDayjs } from '@/lib/utils';
import {
  getTaskBadgeType,
  getTaskDueDate,
  getTaskDueTag,
  normalizeTypeCode,
  toDisplayReference,
} from '@/lib/utils/org-dashboard.utils';
import { CATEGORY_LABELS } from './watchtower-queue.tokens';
import type { ClockTone, EventCard } from './watchtower-queue.types';

/* ─── Task → card mapping (unchanged behaviour) ─────────────────────────── */

/** Type-code derivation lives with the shared task utils — the Watchtower panel on the org
 *  dashboard keys its badges off the same codes, and it sits below this module in the import
 *  graph. Re-exported so `./watchtower-queue.config` stays the one import for the queue. */
export { getTaskBadgeType, normalizeTypeCode };

export const getTaskPriority = (task: ProjectTask): EventCard['clock']['priority'] =>
  (task.stage ?? 0) >= 4 ? 'High' : 'Medium';

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

/** Deterministic per-assignee avatar colour, picked from a small fixed palette by name hash. */
const AVATAR_PALETTE = [
  'bg-main-p text-white',
  'bg-emerald-500 text-white',
  'bg-orange-500 text-white',
  'bg-violet-500 text-white',
  'bg-sky-600 text-white',
  'bg-rose-500 text-white',
];

const getAvatarBg = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

/** The Assigned column's chip, or `null` for an unassigned matter — the backend sends "no
 *  assignee" as a missing field on some endpoints and an empty string on others, so both fall
 *  through to the same empty cell. */
const toAssigned = (name?: string | null, role = '', id = ''): EventCard['assigned'] => {
  const fullName = name?.trim();
  if (!fullName) return null;
  return {
    id,
    name: fullName,
    role,
    initials: getInitials(fullName),
    avatarBg: getAvatarBg(fullName),
  };
};

/** Every assignee's chip, in the backend's order, skipping blank names. */
const toAssignees = (users?: ProjectTaskAssignedUser[] | null): EventCard['assignees'] =>
  (users ?? [])
    .map((user) => toAssigned(user.fullName, user.email ?? '', user.id))
    .filter((user): user is NonNullable<EventCard['assigned']> => user !== null);

/** A 0%-width fill renders as a bare grey track — floor it so the clock always reads as coloured. */
const CLOCK_MIN_PROGRESS = 8;

/**
 * How much of the response window has run down, as a percentage.
 *
 * The window is `createdOn` (raised) → due date. The deadline is checked *first*: being at or
 * past it reads full regardless of whether we know when the task was raised — `createdOn` is
 * optional on `ProjectTask`, and an overdue matter must never render as an empty bar. Only
 * when there is time left do we need a usable window to measure against; without one the bar
 * falls back to the minimum sliver rather than inventing a start date.
 */
const getClockProgress = (task: ProjectTask): number => {
  const dueValue = getTaskDueDate(task);
  const due = dueValue ? toLocalDayjs(dueValue) : null;
  if (!due?.isValid()) return CLOCK_MIN_PROGRESS;

  const now = dayjs();
  if (!now.isBefore(due)) return 100;

  const raised = task.createdOn ? toLocalDayjs(task.createdOn) : null;
  if (!raised?.isValid() || !raised.isBefore(due)) return CLOCK_MIN_PROGRESS;

  const elapsed = Math.round((now.diff(raised) / due.diff(raised)) * 100);
  return Math.max(CLOCK_MIN_PROGRESS, Math.min(100, elapsed));
};

/**
 * How much of the *required action's* window has run down, as a percentage — the governing-card
 * counterpart to `getClockProgress`, but the window here is stage-to-stage (current stage's due
 * date → next stage's due date) rather than raised → due, since a grouped-endpoint stage carries
 * no `createdOn`. No next stage (the lifecycle's final one) reads as fully run down — there's
 * nothing further to count down to.
 */
const getSequenceProgress = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): number => {
  if (!endDate) return 100;
  const end = toLocalDayjs(endDate);
  if (!end.isValid()) return CLOCK_MIN_PROGRESS;

  const now = dayjs();
  if (!now.isBefore(end)) return 100;

  const start = startDate ? toLocalDayjs(startDate) : null;
  if (!start?.isValid() || !start.isBefore(end)) return CLOCK_MIN_PROGRESS;

  const elapsed = Math.round((now.diff(start) / end.diff(start)) * 100);
  return Math.max(CLOCK_MIN_PROGRESS, Math.min(100, elapsed));
};

/** Clock-column phrasing of a deadline as distance in days ("Due in 28 days" / "Due today" /
 *  "Overdue by 2 days"). Whole calendar days, so a deadline late tonight still reads "Due today".
 *  The Required Action column prints the same deadline in full date-time form — this column
 *  reads it as distance instead of repeating the date. */
export const formatDueInDays = (dueDateTime: string): string => {
  const days = toLocalDayjs(dueDateTime).startOf('day').diff(dayjs().startOf('day'), 'day');
  if (days === 0) return 'Due today';
  const count = Math.abs(days);
  const unit = count === 1 ? 'day' : 'days';
  return days < 0 ? `Overdue by ${count} ${unit}` : `Due in ${count} ${unit}`;
};

const getClockTone = (tag: string): ClockTone => {
  if (tag === 'Overdue' || tag === 'Due Today') return 'critical';
  if (tag.startsWith('Due in')) return 'warning';
  return 'normal';
};

/** Days-left banding is fixed (not calendar-week-relative like `getTaskDueTag`), so it applies
 *  evenly no matter what day of the week "today" is: under 3 days left (overdue included) reads
 *  critical, 3-5 days left reads warning, anything further out reads normal. Drives the required
 *  action bar and the sub-event timeline dot — see `DUE_URGENCY_CLASS`. */
export const getDueUrgencyTone = (dueDateTime: string | null | undefined): ClockTone => {
  if (!dueDateTime) return 'normal';
  const due = toLocalDayjs(dueDateTime);
  if (!due.isValid()) return 'normal';

  const daysLeft = due.startOf('day').diff(dayjs().startOf('day'), 'day');
  if (daysLeft < 3) return 'critical';
  if (daysLeft <= 5) return 'warning';
  return 'normal';
};

/** Converts a real project task (top-level matter or child sub-event) into the event-card shape the UI renders. */
export const mapTaskToEventCard = (task: ProjectTask, categoryLabel: string): EventCard => {
  const dueDateValue = getTaskDueDate(task);
  const dueMeta = dueDateValue
    ? getTaskDueTag(dueDateValue)
    : { tag: 'No due date', tagClass: 'bg-slate-100 text-slate-600' };
  const assignees = toAssignees(task.assignedUsers);
  const stage = task.stage ?? 0;
  const badgeType = getTaskBadgeType(task);
  // An Early Warning task's own `stage` is its position in the Cl. 15 lifecycle (see
  // `EwLifecycleStage`) — without a real parent/child link, sibling stages of the same EW show
  // up as separate flat "governing" cards (same as the grouped-endpoint sub-events), so they need
  // the same per-stage icon to read as distinct. Only EW tasks carry that stage numbering — any
  // other matter type keeps its own badge type untouched.
  const typeCode = badgeType === 'EW' ? (getStageTypeCode(task.stage) ?? badgeType) : badgeType;
  // Raw ids (GUID references, id fragments) never render — a row without a human code just
  // leaves its code line empty.
  const displayRef = toDisplayReference(task.reference);

  return {
    id: task.id,
    type: typeCode,
    categoryLabel,
    title: task.title,
    code: displayRef ?? '',
    requiredAction: {
      // What the matter is waiting on — deliberately NOT the due state, which is already the
      // whole Clock column; feeding `dueMeta.tag` in here printed "Overdue" twice per row and
      // left the column carrying no information of its own.
      label: task.description?.trim() || task.title,
      // A 0%-width bar renders as literally invisible — floor it so there's always a visible sliver.
      progress: Math.max(6, Math.min(100, Math.round((stage / 6) * 100))),
    },
    assigned: assignees[0] ?? null,
    assignees,
    clock: {
      badgeText: dueMeta.tag,
      badgeTone: getClockTone(dueMeta.tag),
      priority: getTaskPriority(task),
      dueDateTime: dueDateValue ?? null,
      subText: displayRef ? `Ref ${displayRef}` : '',
      progress: getClockProgress(task),
    },
  };
};

/* ─── Action-queue group → card mapping ─────────────────────────────────── */

/** Backend sends priority as free-form text with inconsistent casing ("High"/"high"/"LOW"/…), so
 *  match case-insensitively — but render the tier it actually sent rather than folding everything
 *  that isn't "High" into "Medium", which used to show "Low" tasks as amber "Medium". A missing or
 *  unrecognised value falls back to "Medium" as the neutral middle tier. */
const normalizeGroupTaskPriority = (
  task: ActionQueueGroupedTask
): EventCard['clock']['priority'] => {
  switch (task.priority?.toLowerCase()) {
    case 'high':
      return 'High';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
};

const groupTaskDueMeta = (dueDateTime: string | null) =>
  dueDateTime
    ? getTaskDueTag(dueDateTime)
    : { tag: 'No due date', tagClass: 'bg-slate-100 text-slate-600' };

/** Human name for a `stage` number, keyed off the `EwLifecycleStage` enum — the grouped endpoint
 *  sends stage as a bare int, so a stage the enum doesn't cover falls back to "Stage N" rather
 *  than rendering nothing. */
const EW_LIFECYCLE_STAGE_LABELS: Record<EwLifecycleStage, string> = {
  [EwLifecycleStage.Detected]: 'Detected',
  [EwLifecycleStage.Registered]: 'Registered',
  [EwLifecycleStage.EarlyWarningMeeting]: 'Early Warning Meeting',
  [EwLifecycleStage.LinkToCE]: 'Link to CE',
  [EwLifecycleStage.Close]: 'Close',
};

const getStageLabel = (stage: number | null | undefined): string | null =>
  stage == null ? null : (EW_LIFECYCLE_STAGE_LABELS[stage as EwLifecycleStage] ?? `Stage ${stage}`);

/** `TYPE_VISUALS` key per lifecycle stage — `EarlyWarningMeeting`/`LinkToCE` reuse the real
 *  RRM/CE matter visuals (same icon+colour those stand-alone matter types already use
 *  elsewhere), the rest get their own dedicated key (`DET`/`REG`/`CLS`) added alongside them. */
const EW_LIFECYCLE_STAGE_TYPE: Record<EwLifecycleStage, string> = {
  [EwLifecycleStage.Detected]: 'DET',
  [EwLifecycleStage.Registered]: 'REG',
  [EwLifecycleStage.EarlyWarningMeeting]: 'RRM',
  [EwLifecycleStage.LinkToCE]: 'CE',
  [EwLifecycleStage.Close]: 'CLS',
};

const getStageTypeCode = (stage: number | null | undefined): string | null =>
  stage == null ? null : (EW_LIFECYCLE_STAGE_TYPE[stage as EwLifecycleStage] ?? null);

/** Clock-column subtext: what the lifecycle moves on to after this stage. Prefers the actual
 *  next task in the group's sequence; without one, the row is either genuinely at the terminal
 *  stage (`Close` → "Final stage") or the next stage simply has no task object yet
 *  (e.g. "Link to CE" with no linked CE) — in which case the upcoming stage is named off
 *  the enum rather than mislabelling the row as final. */
const getNextStageSubText = (
  stage: number | null | undefined,
  nextInSequence: ActionQueueGroupedTask | null
): string => {
  if (nextInSequence) return `Next: ${nextInSequence.title}`;
  if (stage === EwLifecycleStage.Close) return 'Final stage';
  const upcomingStageLabel = stage != null ? getStageLabel(stage + 1) : null;
  return upcomingStageLabel ? `Next: ${upcomingStageLabel}` : 'Final stage';
};

/** The clause pair off a grouped task, or `null` when the backend has no clause for that stage.
 *  Both fields arrive as empty strings rather than null in that case, so trim before deciding —
 *  and a clause number with no prose behind it still earns the badge, so only the reference is
 *  required. */
const getTaskClause = (task: ActionQueueGroupedTask): EventCard['clause'] => {
  const reference = task.clause?.trim();
  if (!reference) return null;
  return { reference, description: task.clauseDescription?.trim() ?? '' };
};

/** Builds just enough of a real `ProjectTask` for `isEarlyWarningMeetingRow` /
 *  `getWatchtowerRowHref` / `isCompensationEventRow` to run against a grouped-endpoint row the
 *  same way they do for a real top-level task row (see `WatchtowerPanel`). The grouped endpoint
 *  never sends `entityType`, so the EW-detail and send-email routes (which gate on it) stay out
 *  of reach here — but `stage` is real, and `entityId` carries the group's id (or, when the
 *  backend sent one, the stage's own `subEntityId` — a Compensation Event's real GUID for a
 *  "Review Quotation" stage, say) so the Early Warning Meeting invite can address
 *  POST /api/early-warnings/{id}/risk-reduction-meeting-invite even when the task has no real
 *  record in the plain list. Every other row still falls through to the generic matter modal
 *  same as before. */
export const mapGroupedTaskToProjectTask = (
  task: ActionQueueGroupedTask,
  group: ActionQueueGroup,
  projectId: string
): ProjectTask => ({
  id: task.taskId,
  projectId,
  status: 0,
  title: task.title,
  description: null,
  entityId: task.subEntityId ?? group.groupId,
  reference: group.reference ?? null,
  dueDateTime: task.dueDateTime,
  stage: task.stage ?? undefined,
  queueStage: task.stage ?? undefined,
  assignedUsers: task.assignedUsers ?? [],
});

/** Converts the governing matter into the event-card shape: identity (title/reference/context)
 *  comes off the group itself, everything else (assignee, priority, due date, next action) comes
 *  off `current` — the group's own first task (`tasks[0]`), never a sibling's. The grouped
 *  endpoint carries no `createdOn`, so the clock bar can't measure elapsed time and instead
 *  floors at `CLOCK_MIN_PROGRESS`. */
export const mapGroupToEventCard = (
  group: ActionQueueGroup,
  current: ActionQueueGroupedTask | null,
  // The task that follows `current` in `group.tasks` (the array's own order, not the backend's
  // per-task `nextTask` field, which can drift out of step with that order — see the same note
  // on `mapGroupTaskToEventCard`). Feeds the Clock subtext ("Next: …"), not the required action.
  nextInSequence: ActionQueueGroupedTask | null = null,
  // `current`'s own human reference, read off its matching real `ProjectTask` record (`taskById`
  // in `WatchtowerGroupedCard`) — wins over `group.reference` whenever it resolves. The grouped
  // endpoint's `group.reference` can be a stale/mismatched code (or the group's own id) rather
  // than the matter `current` is actually waiting on — see the same note on
  // `mapGroupTaskToEventCard`, which needed the identical fallback for sub-event rows.
  realReference?: string | null
): EventCard => {
  const dueMeta = groupTaskDueMeta(current?.dueDateTime ?? null);
  // The grouped endpoint sends the kind as a raw entity name ("CompensationEvent") or as
  // ContractEntityType's numeric value (3), so it has to be normalised to the short code the
  // badge chip, icon and category filter all read off — otherwise a CE row renders "3" or
  // "COMPENSATIONEVENT" on a generic slate tile next to "EW" ones.
  const typeCode = normalizeTypeCode(group.groupType);
  const assignees = toAssignees(current?.assignedUsers);
  // carries the human reference and/or the context (source email), or stays empty. `current`'s
  // own reference wins over the group's shared one whenever it resolved.
  const displayRef = toDisplayReference(realReference) ?? toDisplayReference(group.reference);
  // Some groups arrive titled with nothing but their own kind — "CompensationEvent", or a plain
  // English sentence like "Compensation events" / "Notifying compensation events" that still just
  // restates the category line above it — which just repeats the category line above it. Both
  // forms fall back to the human reference, then to the stage the matter is actually waiting on,
  // so the row always says something the category doesn't. `normalizeTypeCode` only recognises the
  // exact singular ("compensationevent"), so a plural/looser phrase is caught separately by
  // comparing against the category's own label, not just its code.
  const groupTitle =
    typeof group.title === 'string'
      ? group.title.trim()
      : group.title != null
        ? String(group.title).trim()
        : '';
  const categoryLabel = CATEGORY_LABELS[typeCode] ?? typeCode;
  const isGenericTitle =
    !groupTitle ||
    normalizeTypeCode(groupTitle) === typeCode ||
    groupTitle.toLowerCase().includes(categoryLabel.toLowerCase());
  const hasOwnTitle = !isGenericTitle;
  const title = hasOwnTitle
    ? groupTitle
    : (displayRef ?? current?.title ?? CATEGORY_LABELS[typeCode] ?? typeCode);
  // Whichever of the two lines didn't take the reference carries it, never both.
  const codeRef = title === displayRef ? null : displayRef;
  const code = codeRef
    ? group.context
      ? `${codeRef} · ${group.context}`
      : codeRef
    : (group.context ?? '');

  return {
    id: group.groupId,
    type: typeCode,
    categoryLabel: `${CATEGORY_LABELS[typeCode] ?? typeCode} `,
    title,
    code,
    requiredAction: {
      // This row's own pending stage — what the matter is waiting on right now. What comes
      // *after* it lives in the Clock subtext, so each column carries its own information.
      label: current?.title ?? 'No pending action',
      // Tracks this row's own due date — the same one the Clock badge on the right reads off
      // `current` — so the two columns read as the same countdown.
      progress: getSequenceProgress(undefined, current?.dueDateTime),
      dueDateTime: current?.dueDateTime ?? null,
    },
    assigned: assignees[0] ?? null,
    assignees,
    clock: {
      badgeText: dueMeta.tag,
      badgeTone: getClockTone(dueMeta.tag),
      priority: current ? normalizeGroupTaskPriority(current) : 'Medium',
      dueDateTime: current?.dueDateTime ?? null,
      // The reference already sits on the Event column's code line, so this slot carries the
      // lifecycle's next step instead of repeating it.
      subText: getNextStageSubText(current?.stage, nextInSequence),
      progress: CLOCK_MIN_PROGRESS,
    },
  };
};

/** Converts one earlier lifecycle stage (an `EwLifecycleStage` entry, e.g. "Early Warning
 *  Meeting") into the event-card shape used for the sub-event rows under a governing matter. */
export const mapGroupTaskToEventCard = (
  task: ActionQueueGroupedTask,
  group: ActionQueueGroup,
  // The task that follows `task` in `group.tasks` — derived from the array's own order rather
  // than trusted off `task.nextTask`, since the backend's per-task `nextTask` field doesn't
  // reliably track the actual sequence the array is rendered in. Feeds the Clock subtext
  // ("Next: …"), not the required action.
  nextInSequence: ActionQueueGroupedTask | null = null,
  // This stage's own human reference, read off the matching real `ProjectTask` record
  // (`taskById` in `WatchtowerGroupedCard`) — the grouped endpoint's own task shape carries no
  // reference field at all. A group can hold several distinct matters of the same kind (e.g.
  // more than one Compensation Event queued under the same Early Warning), each with its own
  // code, so `group.reference` — one value shared by the whole group — is only ever right for
  // the matter that happens to match it; every sibling stage needs its own record's reference
  // instead of inheriting that one.
  realReference?: string | null
): EventCard => {
  const dueMeta = groupTaskDueMeta(task.dueDateTime);
  const groupCode = normalizeTypeCode(group.groupType);
  // Every task in a group shares the group's matter type, so a sub-event row keyed off that
  // would render identically to its siblings — key off the stage instead so each row in the
  // timeline gets its own icon/colour, falling back to the group's type only for a stage number
  // `EwLifecycleStage` doesn't cover. Stage numbering IS that EW Cl. 15 lifecycle's own, though:
  // any other matter kind numbers its stages differently, so its rows keep the matter's visual
  // rather than borrowing an unrelated EW stage's icon.
  const stageCode = groupCode === 'EW' ? getStageTypeCode(task.stage) : null;
  const typeCode = stageCode ?? groupCode;
  // The label reads as the backend's own task title (e.g. "Link To Compensation Event") rather
  // than the abbreviation ("CE", still on the icon chip underneath) or the enum's shorter stage
  // name — the enum label only stands in when the task carries no title.
  const stageLabel =
    task.title?.trim() ||
    (groupCode === 'EW' ? getStageLabel(task.stage) : null) ||
    (CATEGORY_LABELS[typeCode] ?? typeCode);
  const assignees = toAssignees(task.assignedUsers);
  // GUID references never render — with no human code the label drops the "• …" tail and the
  // code line falls back to the clause reference (or stays empty), never a raw id. This stage's
  // own reference wins over the group's shared one whenever it resolved.
  const displayRef = toDisplayReference(realReference) ?? toDisplayReference(group.reference);

  return {
    id: task.taskId,
    type: typeCode,
    categoryLabel: displayRef ? `${stageLabel} • ${displayRef}` : stageLabel,
    title: task.title,
    hideTitle: true,
    clause: getTaskClause(task),
    // Prefer an actual clause reference — the stage's full name already sits on the category
    // line above, so repeating it here as the code line would just be noise. The matter's own
    // reference is on that line too (`stageLabel • EW-017`), so a stage with no clause leaves
    // this line empty rather than printing the same code twice in one row.
    code: task.clauseReference ?? '',
    requiredAction: {
      // This stage's own action — its title IS the stage name, which is what the row is
      // waiting on. What follows it lives in the Clock subtext.
      label: task.title,
      // Tracks this row's own due date — the same one the Clock badge on the right reads off
      // `task` — so the two columns read as the same countdown.
      progress: getSequenceProgress(undefined, task.dueDateTime),
      dueDateTime: task.dueDateTime,
    },
    assigned: assignees[0] ?? null,
    assignees,
    clock: {
      badgeText: dueMeta.tag,
      badgeTone: getClockTone(dueMeta.tag),
      priority: normalizeGroupTaskPriority(task),
      dueDateTime: task.dueDateTime,
      // The reference already sits on the Event column's code line ("Ref EW-…"), so this slot
      // carries the lifecycle's next step instead of repeating it.
      subText: getNextStageSubText(task.stage, nextInSequence),
      progress: CLOCK_MIN_PROGRESS,
    },
  };
};
