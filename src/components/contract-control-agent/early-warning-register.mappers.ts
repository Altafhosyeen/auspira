import { EarlyWarningStatus, EwLifecycleStage, EwLifecycleStatus } from '@/constants/enum.constant';
import { formatLocalDate, parseBackendDate } from '@/lib/utils';
import {
  type EarlyWarning,
  type EwImpact,
  type EwStatus,
  STATUS_LABEL,
} from './early-warning.data';
import type { ApiEarlyWarningDetail } from './early-warning-detail.map';

// ─── API ROW MAPPING ─────────────────────────────────────────────────────────
// GET /api/early-warnings/project/:projectId returns { meta: { totalCount }, items }, where each
// item matches `ApiEarlyWarningDetail` (see early-warning-detail.map.ts). The top-level `status`
// enum (0 = Open, 1 = Closed) decides closed; the finer open states (IN RRM, MITIGATING) are
// still derived from the lifecycle rows, mirroring the detail page's logic.

export const isOverdue = (dueDate: string) => {
  const due = parseBackendDate(dueDate);
  if (!due) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return due.getTime() < startOfToday.getTime();
};

export const IMPACT_FLAG_KEYS: Record<EwImpact, keyof ApiEarlyWarningDetail> = {
  DELAY: 'delayToCompletion',
  KEY_DATE: 'keyDateImpact',
  COST: 'costIncrease',
  PERFORMANCE: 'performanceImpairment',
};

const stageStatus = (record: ApiEarlyWarningDetail, stage: EwLifecycleStage) =>
  record.earlyWarningLifecycles?.find((entry) => entry.stage === stage)?.status;

/** Earliest outstanding (non-completed) lifecycle due date — same rule as the detail header. */
const nextDueLifecycle = (record: ApiEarlyWarningDetail) =>
  (record.earlyWarningLifecycles ?? [])
    .filter((entry) => entry.status !== EwLifecycleStatus.Completed && entry.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))[0];

const deriveStatus = (record: ApiEarlyWarningDetail): EwStatus => {
  if (
    record.status === EarlyWarningStatus.Closed ||
    stageStatus(record, EwLifecycleStage.Close) === EwLifecycleStatus.Completed
  ) {
    return 'CLOSED';
  }
  // Stage 4 is "Link to CE" — completing it means the EW has become a Compensation Event, which
  // is exactly what the register calls CONVERTED. Mitigation is no longer a lifecycle stage of
  // its own, so MITIGATING now rests solely on the record's own `mitigationAgreed` flag.
  if (stageStatus(record, EwLifecycleStage.LinkToCE) === EwLifecycleStatus.Completed) {
    return 'CONVERTED';
  }
  if (record.mitigationAgreed) {
    return 'MITIGATING';
  }
  const meetingStatus = stageStatus(record, EwLifecycleStage.EarlyWarningMeeting);
  if (meetingStatus !== undefined && meetingStatus !== EwLifecycleStatus.NotStarted) {
    return 'IN_RRM';
  }
  return 'OPEN';
};

export const mapApiEarlyWarning = (record: ApiEarlyWarningDetail): EarlyWarning => {
  const status = deriveStatus(record);
  const dueEntry = nextDueLifecycle(record);

  return {
    id: record.id,
    ref: record.reference,
    risk: record.title,
    source: record.isRaisedManually ? 'Manual raise' : 'From email',
    raised: formatLocalDate(record.dateRaised),
    by: record.raisedBy,
    raisedAt: record.dateRaised,
    impacts: (Object.keys(IMPACT_FLAG_KEYS) as EwImpact[]).filter((impact) =>
      Boolean(record[IMPACT_FLAG_KEYS[impact]])
    ),
    status,
    statusLabel: STATUS_LABEL[status],
    due: dueEntry ? formatLocalDate(dueEntry.dueDate) : null,
    dueOverdue: dueEntry ? isOverdue(dueEntry.dueDate!) : false,
    closed: status === 'CLOSED',
    closedAt: record.closingDate,
    closingReason: record.closingReason,
    closedBy: record.closedByName,
    description: record.description ?? undefined,
    potentialImpacts: record.potentialImpacts ?? undefined,
  };
};
