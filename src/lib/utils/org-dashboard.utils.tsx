import dayjs from 'dayjs';
import { ClipboardList, CloudRain, FileText, Mail, NotebookPen, TriangleAlert } from 'lucide-react';
import {
  buildProgrammeDetailPathFromAlert,
  ContractEntityType,
  EwLifecycleStage,
  MENU_PATH,
  ProjectAlertSource,
  ProjectAlertStatus,
  ProjectAlertType,
} from '@/constants';
import { ALERT_TYPE_META, DEFAULT_TYPE_META } from '@/constants/org-dashboard.constants';
import { getPrimaryAlertEmail, type ProjectAlert } from '@/hooks/modules/project-alerts';
import type { ProjectTask } from '@/hooks/modules/project-tasks';
import type { SignalRow, WatchtowerRow } from '@/types/dashboard/org-dashboard.types';
import { toLocalDayjs } from './datetime';

/** Awareness list route — its rows and the dashboard panel both deep-link into `<path>/<alertId>`. */
export const AWARENESS_LIST_PATH = '/projects/awareness';

/** Backend `reference` fields sometimes carry a raw GUID instead of a human code ("EW-017") —
 *  a database id means nothing to a reader, so every rendered reference goes through this
 *  filter: GUID-like values are suppressed, human codes pass through untouched. */
const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const toDisplayReference = (reference: string | null | undefined): string | null =>
  reference && !GUID_RE.test(reference.trim()) ? reference : null;

/**
 * Every row's icon sits in the same outer white/bordered box (`AwarenessPanel` renders that
 * wrapper); this only builds what goes *inside* it. Auto-ingested mail (Outlook/Graph API) gets a
 * small solid brand-colour tile — like an app icon — everything manually logged (notes, diary
 * entries, meeting minutes) gets a bare outline glyph.
 */
const tileIcon = (Icon: typeof Mail, bg: string) => (
  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${bg}`}>
    <Icon className="h-3.5 w-3.5 text-white" />
  </span>
);

/** Keyed off the backend's `ProjectAlertSource` on the alert; meeting minutes are still called
 * out by `alertType` since the source enum has no dedicated value for them. */
const getAlertSourceMeta = (alert: ProjectAlert) => {
  if (alert.alertType === ProjectAlertType.Meeting) {
    return { label: 'Meeting Minutes', icon: <FileText className="h-5 w-5 text-violet-600" /> };
  }
  switch (alert.source) {
    case ProjectAlertSource.DailySiteReport:
      return { label: 'Side Diary', icon: <NotebookPen className="h-5 w-5 text-violet-600" /> };
    case ProjectAlertSource.Email: {
      if (alert.conversationId) {
        return { label: 'Outlook', icon: tileIcon(Mail, 'bg-[#0078D4]') };
      }
      const primaryEmail = getPrimaryAlertEmail(alert);
      return {
        label: primaryEmail?.emailSender || primaryEmail?.emailSubject || 'Email',
        icon: <Mail className="h-5 w-5 text-blue-600" />,
      };
    }
    case ProjectAlertSource.Weather:
      return { label: 'Weather', icon: <CloudRain className="h-5 w-5 text-sky-600" /> };
    case ProjectAlertSource.PMI:
      return { label: 'PMI', icon: <ClipboardList className="h-5 w-5 text-indigo-600" /> };
    default:
      return {
        label: alert.clauseDescription || 'System',
        icon: <TriangleAlert className="h-5 w-5 text-orange-500" />,
      };
  }
};

const formatAlertReceived = (createdOn: string) => {
  const created = toLocalDayjs(createdOn);
  return {
    day: created.isSame(dayjs(), 'day') ? 'Today' : created.format('DD MMM YYYY'),
    time: created.format('h:mm A'),
  };
};

export const mapAlertToSignalRow = (alert: ProjectAlert): SignalRow => {
  const { label, icon } = getAlertSourceMeta(alert);
  const { day, time } = formatAlertReceived(alert.createdOn);
  const typeMeta = ALERT_TYPE_META[alert.alertType] ?? DEFAULT_TYPE_META;
  return {
    id: alert.id,
    icon,
    title: alert.title,
    source: label,
    day,
    time,
    typeLabel: typeMeta.label,
    typeFullLabel: typeMeta.fullLabel,
    typeTone: typeMeta.tone,
    TypeIcon: typeMeta.Icon,
    alertType: alert.alertType,
    urgent: alert.alertStatus === ProjectAlertStatus.Overdue,
  };
};

/** Which screen an awareness row opens, keyed on the alert's suggested route. Shared by the
 * dashboard `AwarenessPanel` preview and the full Awareness table so the same row lands on the
 * same screen from either surface — a Quotation goes to the CE quotation it belongs to, a meeting
 * to the risk-reduction meeting, a Programee alert to the Program Health detail screen, and
 * everything else to the generic awareness review screen. */
export const getAlertDetailHref = (alertType: number, alertId: string): string => {
  switch (alertType) {
    case ProjectAlertType.Meeting:
      return `${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}/risk-reduction-meeting/${alertId}`;
    case ProjectAlertType.Quotation:
      return `${MENU_PATH.COMPENSATION_EVENT.pathname}/quotation/${alertId}`;
    case ProjectAlertType.Programee:
      // Carries the source flag: the Program Health detail reads the signal off the alert API
      // for this entry path, and the stored programme record only for a register row.
      return buildProgrammeDetailPathFromAlert(alertId);
    default:
      return `/projects/awareness/${alertId}`;
  }
};

export const getTaskDueDate = (task: {
  dueDate?: string | null;
  dueDateTime?: string | null;
  createdOn?: string;
}) => task.dueDateTime ?? task.dueDate ?? task.createdOn;

/** How urgent a due date reads — the single signal that the row's dot, type badge and due tag
 *  all key off, so the three never disagree about how urgent a row is (the dot used to be coloured
 *  by lifecycle stage and the badge by matter type, both unrelated to the due date the tag itself
 *  reported). */
export type TaskUrgencyTone = 'critical' | 'warning' | 'normal';

const DOT_CLASS_BY_TONE: Record<TaskUrgencyTone, string> = {
  critical: 'bg-rose-500',
  warning: 'bg-orange-500',
  normal: 'bg-slate-400',
};

export const getTaskDotClass = (tone: TaskUrgencyTone) => DOT_CLASS_BY_TONE[tone];

const BADGE_CLASS_BY_TONE: Record<TaskUrgencyTone, string> = {
  critical: 'bg-rose-50 text-rose-700 border border-rose-200',
  warning: 'bg-orange-50 text-orange-700 border border-orange-200',
  normal: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export const getTaskBadgeToneClass = (tone: TaskUrgencyTone) => BADGE_CLASS_BY_TONE[tone];

interface TaskDueTag {
  tag: string;
  tagClass: string;
  tone: TaskUrgencyTone;
  /** Relative day-count ("Today" / "3 days ago"), present only when the task is past due. Kept
   *  out of `tag` because callers (e.g. the queue's clock tone) match on that string exactly. */
  overdueSince?: string;
}

export const getTaskDueTag = (dueDateValue: string): TaskDueTag => {
  const due = toLocalDayjs(dueDateValue);
  if (due.isSame(dayjs(), 'day')) {
    return { tag: 'Due Today', tagClass: 'bg-orange-100 text-orange-600', tone: 'warning' };
  }
  if (due.isBefore(dayjs(), 'day')) {
    const daysAgo = dayjs().startOf('day').diff(due.startOf('day'), 'day');
    return {
      tag: 'Overdue',
      tagClass: 'bg-rose-100 text-rose-700',
      tone: 'critical',
      overdueSince: daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
    };
  }
  if (due.isSame(dayjs(), 'week')) {
    const daysAway = due.diff(dayjs(), 'day');
    return {
      tag: `Due in ${daysAway} Days`,
      tagClass: 'bg-orange-100 text-orange-600',
      tone: 'warning',
    };
  }
  return {
    tag: due.format('DD MMM YYYY'),
    tagClass: 'bg-slate-100 text-slate-600',
    tone: 'normal',
  };
};

/** Stages worked by emailing the other party rather than by filling in a form. For these the
 * generic matter-detail modal is a stop on the way to the composer — its only real action is its
 * own `Invite` button — so the row opens the composer directly. */
const MEETING_INVITE_STAGES: ReadonlySet<number> = new Set([
  EwLifecycleStage.EarlyWarningMeeting,
  // EwLifecycleStage.Detected,
  // EwLifecycleStage.Registered,
]);

/** Tasks sitting at a meeting-invite stage open the invite-email modal instead of navigating
 * anywhere — checked before `getWatchtowerRowHref` / `isCompensationEventRow`. */
export const isMeetingInviteRow = (row: WatchtowerRow): boolean =>
  row.task?.stage !== undefined && MEETING_INVITE_STAGES.has(row.task.stage);

/** Early warning tasks link straight through to the EW Register detail screen (keyed by the
 * task's `entityId`, not its own `id`) instead of opening the matter-detail modal. */
export const getWatchtowerRowHref = (row: WatchtowerRow): string | null => {
  const task = row.task;
  // "Link to CE" is worked by raising the compensation event itself, so the row goes straight to
  // the blank CE form rather than to the EW detail screen its other stages share. Checked before
  // the early-warning branch: the stage still carries EW entity data, which would otherwise win.
  // if (task?.stage === EwLifecycleStage.LinkToCE) {
  //   return `${MENU_PATH.COMPENSATION_EVENT.pathname}/new`;
  // }
  // Link-to-CE tasks land here too while the branch above is disabled — the stage carries EW
  // entity data, so the EW detail screen is the right destination for them. Without an `entityId`
  // there is nothing to open, so the row stays non-navigable rather than linking to an
  // `undefined` id. Points at the early-warning module's own detail route, the same screen the
  // EW register and the CE table's parent-EW link open, rather than the older
  // early-warning-register/detail page.
  if (task?.entityType === ContractEntityType.EarlyWarning && task.entityId) {
    return `${MENU_PATH.CCA_EARLY_WARNING_NEW.pathname}/${task.entityId}`;
  }
  // "Review Quotation" is worked on the quotation itself, not by email, so this one stage routes
  // straight to the quotation detail page (keyed by its real id, `entityId` — backfilled from
  // the grouped endpoint's `subEntityId` in `mapGroupedTaskToProjectTask`) instead of falling
  // through to `isCompensationEventRow`'s compose-email modal like every other CE stage.
  // `from=watchtower` tells the quotation screen it was reached from this queue, so it knows to
  // look up the task behind the row and carry its deadline over. The register and the financial
  // summary link to the same screen without it and stay a single fetch.
  if (task?.entityType === ContractEntityType.CompensationEvent && task.entityId) {
    // `stage` rides along so the screen asks for this row's own lifecycle stage rather than
    // taking whichever task the entity happens to return first. Read off `queueStage` first:
    // grouped CE rows clear `stage` so the EW stage rules can't fire on their numbering, and
    // `queueStage` is where the grouped endpoint's real stage survives that. Omitted when the
    // backend sent none.
    const stage = task.queueStage ?? task.stage;
    const stageParam = stage == null ? '' : `&stage=${stage}`;
    return `${MENU_PATH.COMPENSATION_EVENT.pathname}/quotation/detail/${task.entityId}?from=watchtower${stageParam}`;
  }
  return null;
};

/** Compensation Event tasks open the send-email modal instead of the generic matter-detail modal. */
export const isCompensationEventRow = (row: WatchtowerRow): boolean =>
  row.task?.entityType === ContractEntityType.CompensationEvent;

/** entityType is the backend's authoritative task kind; reference-prefix parsing is only a
 *  fallback for kinds it doesn't cover (e.g. Early Warning Meetings) or when it's Unknown. */
const ENTITY_TYPE_CODE: Partial<Record<ContractEntityType, string>> = {
  [ContractEntityType.EarlyWarning]: 'EW',
  [ContractEntityType.CompensationEvent]: 'CE',
  [ContractEntityType.PMI]: 'PMI',
};

/** Readable name for a task's `entityType`, for the dashboard row tooltip. Unknown/absent
 *  values get a neutral label rather than exposing a bare enum number to the user. */
const ENTITY_TYPE_LABEL: Record<ContractEntityType, string> = {
  [ContractEntityType.Unknown]: 'Unknown',
  [ContractEntityType.EarlyWarning]: 'Early Warning',
  [ContractEntityType.PMI]: 'Project Manager Instruction',
  [ContractEntityType.CompensationEvent]: 'Compensation Event',
  [ContractEntityType.Quotation]: 'Quotation',
  [ContractEntityType.PmAssessment]: 'PM Assessment',
  [ContractEntityType.Notification]: 'Notification',
  [ContractEntityType.Project]: 'Project',
  [ContractEntityType.Other]: 'Other',
};

export const getEntityTypeLabel = (entityType?: ContractEntityType | number | null): string => {
  if (entityType === null || entityType === undefined) return 'Unknown';
  return ENTITY_TYPE_LABEL[entityType as ContractEntityType] ?? 'Unknown';
};

/** Kind names the grouped endpoint stamps on a group (`groupType`) — free-form PascalCase words
 *  ("CompensationEvent"), not the short codes the badges, icons and category filter are keyed
 *  off. Matched case- and separator-insensitively, since the backend's casing isn't consistent. */
const RAW_TYPE_CODE: Record<string, string> = {
  earlywarning: 'EW',
  earlywarningnotice: 'EWN',
  compensationevent: 'CE',
  projectmanagerinstruction: 'PMI',
  pminstruction: 'PMI',
  riskreductionmeeting: 'RRM',
  earlywarningmeeting: 'ERM',
  close: 'CLS',
};

/** `groupType` now also arrives as `ContractEntityType`'s own numeric value (e.g. `1` for
 *  EarlyWarning) rather than its PascalCase name — same backend enum, just sent as a number.
 *  Kinds `ContractEntityType` doesn't distinguish (meetings, notices, close) still only ever
 *  arrive as the PascalCase string above. */
const ENTITY_TYPE_TO_CODE: Partial<Record<ContractEntityType, string>> = {
  [ContractEntityType.EarlyWarning]: 'EW',
  [ContractEntityType.PMI]: 'PMI',
  [ContractEntityType.CompensationEvent]: 'CE',
};

/**
 * Normalises any type value the backend sends for a matter's kind — a group's `groupType`, as
 * either `ContractEntityType`'s numeric value (`3`) or its PascalCase name ("CompensationEvent"),
 * a reference prefix ("EWN-024"), or an already-short code ("CE") — to the one canonical code
 * every visual is keyed off, so a matter renders the same icon, colour, chip and category label
 * wherever it comes from. Anything unrecognised keeps its own uppercase prefix, which
 * `getTypeVisual`/`CATEGORY_LABELS` fall back to their generic style/label for.
 */
export const normalizeTypeCode = (raw: string | number | null | undefined): string => {
  if (typeof raw === 'number') return ENTITY_TYPE_TO_CODE[raw as ContractEntityType] ?? 'TK';

  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return 'TK';

  // The backend has also been seen sending the numeric enum as a numeric string for fields typed
  // as string here, so check that before falling through to the PascalCase-name lookup.
  if (/^\d+$/.test(value)) {
    return ENTITY_TYPE_TO_CODE[Number(value) as ContractEntityType] ?? 'TK';
  }

  const known = RAW_TYPE_CODE[value.toLowerCase().replace(/[\s._-]/g, '')];
  if (known) return known;

  if (/^\d+$/.test(value)) {
    const num = Number.parseInt(value, 10);
    if (num === 1) return 'EW';
    if (num === 2) return 'PMI';
    if (num === 3) return 'CE';
    if (num === 4) return 'RRM';
    if (num === 5) return 'CE';
  }

  // Reference prefixes vary in the wild ("EWN-024" for early warnings, "EW-017" for others) —
  // normalise the ones we know about to their canonical short code.
  const prefix = value.match(/^[A-Za-z]+/)?.[0]?.toUpperCase();
  if (!prefix) return 'TK';
  return prefix.startsWith('EW') ? 'EW' : prefix;
};

export const getTaskBadgeType = (task: {
  entityType?: ContractEntityType;
  reference?: string | null;
}) => {
  // Early Warning Meetings have no dedicated entityType (they're a sub-task of an early warning
  // task, so entityType would just say "EarlyWarning") — their reference prefix is the only
  // signal, so it has to be checked before entityType.
  const prefix = task.reference?.match(/^[A-Za-z]+/)?.[0]?.toUpperCase();
  if (prefix === 'RRM') return 'RRM';

  const fromEntityType =
    task.entityType !== undefined ? ENTITY_TYPE_CODE[task.entityType] : undefined;
  if (fromEntityType) return fromEntityType;

  return normalizeTypeCode(task.reference);
};

export const mapProjectTaskToWatchtowerRow = (task: ProjectTask): WatchtowerRow => {
  const dueDateValue = getTaskDueDate(task);
  const dueMeta = getTaskDueTag(dueDateValue!);
  return {
    id: task.id,
    dot: getTaskDotClass(dueMeta.tone),
    badge: getTaskBadgeType(task),
    badgeClass: getTaskBadgeToneClass(dueMeta.tone),
    title: task.title,
    sub: `${task.reference ?? 'Task'} · ${task.assignedUsers[0]?.fullName ?? 'Unassigned'}`,
    tag: dueMeta.tag,
    tagClass: dueMeta.tagClass,
    overdueSince: dueMeta.overdueSince,
    // The relative phrase ("3 days ago") says how urgent the row is; this is the exact timestamp
    // it fell/falls due, printed alongside it since "3 days ago" alone doesn't say which date.
    dueDateTimeLabel: dueDateValue
      ? toLocalDayjs(dueDateValue).format('DD MMM YYYY, h:mm A')
      : undefined,
    task,
  };
};
