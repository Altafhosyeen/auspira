/**
 * Maps GET /api/early-warnings/{id} onto the Early Warning detail view models.
 *
 * Only the header, risk summary and lifecycle come from the API — the email thread and evidence
 * pack have no counterpart in this response and stay on the static copy in
 * `early-warning-detail.data.ts` until endpoints exist for them. The audit trail has its own
 * endpoint (`GET /api/early-warnings/{id}/audit-trail`) and is fetched directly in
 * `EarlyWarningAuditTrailTab` via `useGetEarlyWarningAuditTrail`.
 */

import {
  EarlyWarningAuditActionType,
  EarlyWarningStatus,
  EwLifecycleStage,
  EwLifecycleStatus,
} from '@/constants/enum.constant';
import type { EarlyWarningAuditTrailEntry } from '@/hooks/modules/early-warning';
import { parseBackendDate } from '@/lib/utils';
import { isInboundEmail } from './action-queue.data';
import type { ImpactChip, LifecycleStep, SummaryRow } from './early-warning-detail.data';

// ─── API SHAPE ───────────────────────────────────────────────────────────────

export interface ApiEarlyWarningLifecycle {
  id: string;
  earlyWarningId: string;
  stage: EwLifecycleStage;
  status: EwLifecycleStatus;
  occurredAt: string | null;
  dueDate: string | null;
  note: string | null;
}

export interface ApiEarlyWarningDetail {
  id: string;
  projectId: string;
  reference: string;
  raisedBy: string;
  title: string;
  description: string | null;
  dateRaised: string | null;
  potentialImpacts: string | null;
  proposedActions: string | null;
  keyDatesAffected: string | null;
  delayToCompletion: boolean;
  keyDateImpact: boolean;
  costIncrease: boolean;
  performanceImpairment: boolean;
  mitigationAgreed: boolean;
  projectEmailId: string | null;
  /**
   * Direction of the source email, following `ProjectEmail.boxType` (1 = received, else sent).
   * Not currently returned by GET /api/early-warnings — optional so the header falls back to a
   * neutral "From email" until the backend starts sending it.
   */
  boxType?: number | null;
  isRaisedManually: boolean;
  closingReason: string | null;
  closingNotes: string | null;
  closingDate: string | null;
  closedByName: string | null;
  status: EarlyWarningStatus;
  earlyWarningLifecycles?: ApiEarlyWarningLifecycle[] | null;
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────

/** "2026-07-31T00:00:00Z" -> "31 Jul 2026". Returns undefined for null/unparseable input. */
const formatDate = (value?: string | null): string | undefined => {
  const date = parseBackendDate(value);
  if (!date) return undefined;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** "2026-07-29T19:12:00Z" -> "29 Jul 2026 · 19:12", matching the lifecycle subtext style. */
const formatDateTime = (value?: string | null): string | undefined => {
  const date = parseBackendDate(value);
  if (!date) return undefined;
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

/**
 * Display title for each lifecycle stage, in the order the timeline renders them. `role` is
 * appended after the actor's name (e.g. "Kamran Khan : PM") rather than baked into the title,
 * since the audit trail gives us a name but never a role.
 */
const LIFECYCLE_STAGES: { stage: EwLifecycleStage; title: string; role?: string }[] = [
  // { stage: EwLifecycleStage.Detected, title: 'Detected by Auspira' },
  { stage: EwLifecycleStage.Registered, title: 'Registered', role: '' },
  { stage: EwLifecycleStage.EarlyWarningMeeting, title: 'Early Warning Meeting' },
  { stage: EwLifecycleStage.LinkToCE, title: 'Link to CE' },
  { stage: EwLifecycleStage.Close, title: 'Close' },
];

/**
 * Tailwind can't see interpolated class names, so the progress bar picks from a fixed set
 * rather than building `w-[${n}%]`.
 */
const PROGRESS_WIDTH: Record<number, string> = {
  0: 'w-1/12',
  1: 'w-1/5',
  2: 'w-2/5',
  3: 'w-3/5',
  4: 'w-4/5',
  5: 'w-full',
};

const lifecycleFor = (record: ApiEarlyWarningDetail, stage: EwLifecycleStage) =>
  record.earlyWarningLifecycles?.find((entry) => entry.stage === stage);

/**
 * Who performed a stage, taken from the audit trail — the lifecycle rows themselves carry no
 * actor. Audit `stage` is the enum *name* ("Registered"), matched case-insensitively since these
 * responses have been inconsistent about casing elsewhere.
 *
 * Registration is the exception: it is logged as a `Created` action with no stage attached, so
 * that entry is the fallback for the Registered step.
 */
const actorForStage = (
  auditTrail: EarlyWarningAuditTrailEntry[] | undefined,
  stage: EwLifecycleStage
): string | undefined => {
  if (!auditTrail?.length) return undefined;
  const stageName = EwLifecycleStage[stage].toLowerCase();

  const entry =
    auditTrail.find((row) => row.stage?.toLowerCase() === stageName) ??
    (stage === EwLifecycleStage.Registered
      ? auditTrail.find(
          (row) =>
            String(row.actionType).toLowerCase() === 'created' ||
            Number(row.actionType) === EarlyWarningAuditActionType.Created
        )
      : undefined);

  return entry?.performedByUserFullName || entry?.performedBy || undefined;
};

export const toLifecycleSteps = (
  record: ApiEarlyWarningDetail,
  auditTrail?: EarlyWarningAuditTrailEntry[]
): LifecycleStep[] =>
  LIFECYCLE_STAGES.map(({ stage, title, role }) => {
    const entry = lifecycleFor(record, stage);

    // A stage with no row, or one explicitly at NotStarted, has not been reached yet.
    if (!entry || entry.status === EwLifecycleStatus.NotStarted) {
      return { title, status: 'upcoming', subtext: 'Not started' };
    }

    const actorName = actorForStage(auditTrail, stage);
    const actor = actorName && role ? `${actorName} : ${role}` : actorName;

    if (entry.status === EwLifecycleStatus.Completed) {
      return {
        title,
        status: 'completed',
        subtext: entry.note ?? formatDateTime(entry.occurredAt) ?? 'Complete',
        actor,
      };
    }

    const due = formatDate(entry.dueDate);
    return {
      title,
      status: 'active',
      subtext: entry.note ?? (due ? `Due ${due} — pending` : 'In progress'),
      subtextHighlight: true,
      actor,
    };
  });

/** Fraction of the lifecycle completed, as a Tailwind width class for the header bar. */
export const toProgressWidthClass = (record: ApiEarlyWarningDetail): string => {
  const completed = LIFECYCLE_STAGES.filter(
    (item) => lifecycleFor(record, item.stage)?.status === EwLifecycleStatus.Completed
  ).length;
  return PROGRESS_WIDTH[completed] ?? PROGRESS_WIDTH[0];
};

// ─── RISK SUMMARY ────────────────────────────────────────────────────────────

/** Impact chips are driven by the four booleans, so an EW with none shows no chip row. */
const toImpactChips = (record: ApiEarlyWarningDetail): ImpactChip[] => {
  const chips: ImpactChip[] = [];
  if (record.delayToCompletion)
    chips.push({ label: 'DELAY', icon: 'delay', wrapperClass: 'badge-error' });
  if (record.keyDateImpact)
    chips.push({ label: 'KEY DATE', icon: 'key-date', wrapperClass: 'badge-accent' });
  if (record.costIncrease)
    chips.push({ label: 'COST', icon: 'cost', wrapperClass: 'badge-warning' });
  if (record.performanceImpairment)
    chips.push({ label: 'PERFORMANCE', icon: 'performance', wrapperClass: 'badge-info' });
  return chips;
};

export const toSummaryRows = (record: ApiEarlyWarningDetail): SummaryRow[] => {
  const rows: SummaryRow[] = [];

  if (record.description) {
    rows.push({ label: 'Description', variant: 'description', value: record.description });
  }
  if (record.potentialImpacts) {
    rows.push({ label: 'Potential impacts', value: record.potentialImpacts });
  }
  if (record.keyDatesAffected) {
    rows.push({ label: 'Key date at risk', value: record.keyDatesAffected });
  }
  if (record.proposedActions) {
    rows.push({ label: 'Proposed actions', value: record.proposedActions });
  }

  const impacts = toImpactChips(record);
  if (impacts.length > 0) rows.push({ label: 'Impacts', impacts });

  return rows;
};

// ─── HEADER ──────────────────────────────────────────────────────────────────

/**
 * How the EW got into the register. `inbound`/`outbound` need the source email's direction; the
 * EW record doesn't reliably carry it, so `email` is the honest fallback for "came from a mail we
 * can't tell the direction of" — see `toSourceMeta`.
 */
export type EwSourceKind = 'manual' | 'email' | 'inbound' | 'outbound';

export interface EwSourceMeta {
  kind: EwSourceKind;
  label: string;
}

export interface EwDetailHeader {
  reference: string;
  title: string;
  meta: string[];
  /** Provenance chip shown beside the title — icon plus label. */
  source: EwSourceMeta;
  clauseBadge: string;
  primaryAction: string;
  /** Omitted when no lifecycle stage carries a due date. */
  rrmWarning?: string;
  startedLabel: string;
  progressWidthClass: string;
}

/**
 * Provenance of the EW, for the header's source chip.
 *
 * `ApiEarlyWarningDetail` carries `isRaisedManually` and a `projectEmailId`, but no direction of
 * its own — so when the backend starts returning the source email's `boxType` this resolves to
 * inbound/outbound, and until then an email-sourced EW stays the neutral "From email" rather than
 * being labelled with a direction nobody told us.
 */
const toSourceMeta = (record: ApiEarlyWarningDetail): EwSourceMeta => {
  if (record.isRaisedManually) return { kind: 'manual', label: 'Raised manually' };
  if (record.boxType === null || record.boxType === undefined) {
    return { kind: 'email', label: 'From email' };
  }
  return isInboundEmail(record.boxType)
    ? { kind: 'inbound', label: 'Inbound email' }
    : { kind: 'outbound', label: 'Outbound email' };
};

/** Earliest outstanding due date across the lifecycle — what the header warns about. */
const nextDueDate = (record: ApiEarlyWarningDetail): string | undefined => {
  const due = (record.earlyWarningLifecycles ?? [])
    .filter((entry) => entry.status !== EwLifecycleStatus.Completed && entry.dueDate)
    .map((entry) => entry.dueDate as string)
    .sort();
  return formatDate(due[0]);
};

export const toDetailHeader = (record: ApiEarlyWarningDetail): EwDetailHeader => {
  const raised = formatDate(record.dateRaised);
  const rrmDue = nextDueDate(record);

  return {
    reference: record.reference,
    title: record.title,
    meta: [`Raised by ${record.raisedBy || 'unknown'}`, raised].filter(Boolean) as string[],
    source: toSourceMeta(record),
    // Not carried on the record — every EW is raised under the same clause.
    clauseBadge: 'NEC4 Cl. 15.1',
    primaryAction: '→ Early Warning Meeting',
    rrmWarning: rrmDue ? `RRM due: ${rrmDue}` : undefined,
    startedLabel: raised ? `Started: ${raised}` : 'Not yet started',
    progressWidthClass: toProgressWidthClass(record),
  };
};
