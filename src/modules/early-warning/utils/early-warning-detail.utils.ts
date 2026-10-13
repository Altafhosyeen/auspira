import { toLifecycleStageStates } from '@/components/shared/detail-lifecycle-rail';
import { EarlyWarningStatus, EwLifecycleStage, EwLifecycleStatus } from '@/constants/enum.constant';
import { parseBackendDate } from '@/lib/utils';
import type { ApiEarlyWarningDetail } from '../types/early-warning-api.types';

// ─── VIEW MODELS ─────────────────────────────────────────────────────────────

export type LifecycleStatus = 'completed' | 'active' | 'upcoming';

export interface LifecycleStep {
  title: string;
  status: LifecycleStatus;
  subtext: string;
  /** Render subtext in the warning/overdue tone (e.g. "Due … — pending"). */
  highlight?: boolean;
  actor?: string;
}

export interface SummaryRow {
  label: string;
  value?: string;
  /** `description` renders relaxed; `value` renders bold. Default `value`. */
  variant?: 'description' | 'value';
  impactFlags?: EarlyWarningImpactFlag[];
}

export type EarlyWarningImpactFlag = 'DELAY' | 'KEY_DATE' | 'COST' | 'PERFORMANCE';

export interface DetailHeader {
  reference: string;
  title: string;
  clauseBadge: string;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  primaryAction: string;
  startedLabel: string;
  /** Earliest outstanding lifecycle due date, e.g. "4 Jul 2026" — for the RRM warning. */
  rrmDue?: string;
  rrmDueDaysLeft?: number;
  progressPercent: number;
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────

const formatDate = (value?: string | null): string | undefined => {
  const date = parseBackendDate(value);
  if (!date) return undefined;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value?: string | null): string | undefined => {
  const date = parseBackendDate(value);
  if (!date) return undefined;
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

const wholeDaysLeft = (value?: string | null): number | undefined => {
  const due = parseBackendDate(value);
  if (!due) return undefined;
  const startOfDue = new Date(due);
  startOfDue.setHours(0, 0, 0, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
};

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

const stageFor = (record: ApiEarlyWarningDetail, stage: EwLifecycleStage) =>
  record.earlyWarningLifecycles?.find((entry) => entry.stage === stage);

// The register life as a timeline, matching the 5 EwLifecycleStage enum steps. Stage
// completion/progress resolves through the shared `toLifecycleStageStates` mapper, the
// same one the PMI and CE rails use; EW keeps its due-date subtext on pending stages.
export const toLifecycleSteps = (record: ApiEarlyWarningDetail): LifecycleStep[] => {
  const STAGES: { stage: EwLifecycleStage; title: string }[] = [
    { stage: EwLifecycleStage.Detected, title: 'Detected' },
    { stage: EwLifecycleStage.Registered, title: 'Registered' },
    { stage: EwLifecycleStage.EarlyWarningMeeting, title: 'Early Warning Meeting' },
    { stage: EwLifecycleStage.LinkToCE, title: 'Link to CE' },
    { stage: EwLifecycleStage.Close, title: 'Close' },
  ];

  const states = toLifecycleStageStates(
    record.earlyWarningLifecycles,
    STAGES.map(({ stage }) => stage)
  );

  return STAGES.map(({ stage, title }, index) => {
    const state = states[index];
    const entry = stageFor(record, stage);

    if (state.complete) {
      return {
        title,
        status: 'completed' as const,
        subtext: entry?.occurredAt
          ? (formatDateTime(entry.occurredAt) ?? 'Completed')
          : 'Completed',
        highlight: false,
      };
    }

    if (state.active) {
      const due = formatDate(entry?.dueDate);
      return {
        title,
        status: 'active' as const,
        subtext: due ? `Due ${due} — pending` : 'In progress',
        highlight: true,
      };
    }

    return {
      title,
      status: 'upcoming' as const,
      subtext: 'Not started',
      highlight: false,
    };
  });
};

/** Share of the lifecycle completed (0–100) for the header progress bar. */
export const lifecycleProgress = (record: ApiEarlyWarningDetail): number => {
  const stages = [EwLifecycleStage.Registered, EwLifecycleStage.EarlyWarningMeeting];
  const completed = stages.filter(
    (stage) => stageFor(record, stage)?.status === EwLifecycleStatus.Completed
  ).length;
  return Math.round((completed / stages.length) * 100);
};

// ─── RISK SUMMARY ────────────────────────────────────────────────────────────

const impactFlags = (record: ApiEarlyWarningDetail): EarlyWarningImpactFlag[] => {
  const flags: EarlyWarningImpactFlag[] = [];
  if (record.delayToCompletion) flags.push('DELAY');
  if (record.keyDateImpact) flags.push('KEY_DATE');
  if (record.costIncrease) flags.push('COST');
  if (record.performanceImpairment) flags.push('PERFORMANCE');
  return flags;
};

export interface ProjectSummaryMeta {
  name?: string | null;
  referenceId?: string | null;
}

export const toSummaryRows = (
  record: ApiEarlyWarningDetail,
  project?: ProjectSummaryMeta | null
): SummaryRow[] => {
  const rows: SummaryRow[] = [];

  // 1. Project
  const projectLabel = project?.name
    ? project.referenceId
      ? `${project.name} [REF: ${project.referenceId}]`
      : project.name
    : record.projectId;
  if (projectLabel) {
    rows.push({
      label: 'Project',
      value: projectLabel,
    });
  }

  // 2. Raised By
  if (record.raisedBy) {
    rows.push({
      label: 'Raised By',
      value: record.raisedBy,
    });
  }

  // 3. Potential Impacts
  if (record.potentialImpacts) {
    rows.push({
      label: 'Potential Impacts',
      value: record.potentialImpacts,
      variant: 'description',
    });
  }

  // 4. Proposed Actions
  if (record.proposedActions) {
    rows.push({
      label: 'Proposed Actions',
      value: record.proposedActions,
      variant: 'description',
    });
  }

  // 5. Key Dates Affected
  if (record.keyDatesAffected) {
    rows.push({
      label: 'Key Dates Affected',
      value: record.keyDatesAffected,
    });
  }

  // 6. Impact Types (Tags)
  const flags = impactFlags(record);
  if (flags.length > 0) {
    rows.push({
      label: 'Impact Types',
      impactFlags: flags,
    });
  }

  return rows;
};

// ─── HEADER ──────────────────────────────────────────────────────────────────

const nextDueDate = (record: ApiEarlyWarningDetail): string | undefined => {
  const due = (record.earlyWarningLifecycles ?? [])
    .filter((entry) => entry.status !== EwLifecycleStatus.Completed && entry.dueDate)
    .map((entry) => entry.dueDate as string)
    .sort();
  return formatDate(due[0]);
};

export const toDetailHeader = (record: ApiEarlyWarningDetail): DetailHeader => {
  const raised = formatDate(record.dateRaised);
  const dueDate = nextDueDate(record);
  const days = wholeDaysLeft(dueDate);

  return {
    reference: record.reference,
    title: record.title,
    clauseBadge: record.clauseNumber ? `NEC4 Cl. ${record.clauseNumber}` : 'NEC4 Cl. 15.1',
    clauseNumber: record.clauseNumber,
    clauseTitle: record.clauseTitle,
    clauseDescription: record.clauseDescription,
    primaryAction: 'Early Warning Meeting',
    startedLabel: raised ? `Started: ${raised}` : 'Not yet started',
    rrmDue: dueDate,
    rrmDueDaysLeft: days,
    progressPercent: lifecycleProgress(record),
  };
};

/** The EW is read-only once it has been closed out. */
export const isClosed = (record: ApiEarlyWarningDetail): boolean =>
  record.status === EarlyWarningStatus.Closed;

/** A discarded EW is terminal — no further actions (close, CE link, meetings). */
export const isDiscarded = (record: ApiEarlyWarningDetail): boolean =>
  record.status === EarlyWarningStatus.Discard;
