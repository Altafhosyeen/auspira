import { AuditActionType } from '@/constants/enum.constant';

/**
 * The full audit-action vocabulary, one entry per backend `AuditActionType` member —
 * the single list every trail (Early Warning, PMI, Compensation Event) resolves rows
 * against, so no ordinal can land on a raw "Action 22" fallback.
 */
export type SharedAuditAction =
  | 'CREATED'
  | 'DETECTED'
  | 'LIFECYCLE_COMPLETED'
  | 'MITIGATION_AGREED'
  | 'MEETING_INVITE_SENT'
  | 'UPDATED'
  | 'STATUS_CHANGED'
  | 'LOCKED'
  | 'UNLOCKED'
  | 'DOCUMENT_UPLOADED'
  | 'EVIDENCE_ADDED'
  | 'DECISION_RECORDED'
  | 'REVIEWED'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'REJECTED'
  | 'IMPLEMENTED'
  | 'CLOSED'
  | 'COMMENT_ADDED'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'NOT_ACCEPTED'
  | 'DISCARDED';

/** Action code → human label, shown as the headline fallback and the entry tag. */
export const AUDIT_ACTION_LABELS: Record<SharedAuditAction, string> = {
  CREATED: 'Created',
  DETECTED: 'Detected',
  LIFECYCLE_COMPLETED: 'Lifecycle completed',
  MITIGATION_AGREED: 'Mitigation agreed',
  MEETING_INVITE_SENT: 'Meeting invite sent',
  UPDATED: 'Updated',
  STATUS_CHANGED: 'Status changed',
  LOCKED: 'Locked',
  UNLOCKED: 'Unlocked',
  DOCUMENT_UPLOADED: 'Document uploaded',
  EVIDENCE_ADDED: 'Evidence added',
  DECISION_RECORDED: 'Decision recorded',
  REVIEWED: 'Reviewed',
  APPROVED: 'Approved',
  REVISION_REQUESTED: 'Revision requested',
  REJECTED: 'Rejected',
  IMPLEMENTED: 'Implemented',
  CLOSED: 'Closed',
  COMMENT_ADDED: 'Comment added',
  ACCEPTED: 'Accepted',
  CONFIRMED: 'Confirmed',
  NOT_ACCEPTED: 'Not accepted',
  DISCARDED: 'Discarded',
};

// The live trail sends `actionType` as the `AuditActionType` ordinal (Swagger types it
// `integer` with no published name mapping). Total over the enum, so every ordinal the
// backend can log resolves off the number alone.
export const AUDIT_ACTION_BY_ORDINAL: Record<AuditActionType, SharedAuditAction> = {
  [AuditActionType.Created]: 'CREATED',
  [AuditActionType.Detected]: 'DETECTED',
  [AuditActionType.LifecycleCompleted]: 'LIFECYCLE_COMPLETED',
  [AuditActionType.MitigationAgreed]: 'MITIGATION_AGREED',
  [AuditActionType.RiskReductionMeetingInviteSent]: 'MEETING_INVITE_SENT',
  [AuditActionType.Updated]: 'UPDATED',
  [AuditActionType.StatusChanged]: 'STATUS_CHANGED',
  [AuditActionType.Locked]: 'LOCKED',
  [AuditActionType.Unlocked]: 'UNLOCKED',
  [AuditActionType.DocumentUploaded]: 'DOCUMENT_UPLOADED',
  [AuditActionType.EvidenceAdded]: 'EVIDENCE_ADDED',
  [AuditActionType.DecisionRecorded]: 'DECISION_RECORDED',
  [AuditActionType.Reviewed]: 'REVIEWED',
  [AuditActionType.Approved]: 'APPROVED',
  [AuditActionType.RevisionRequested]: 'REVISION_REQUESTED',
  [AuditActionType.Rejected]: 'REJECTED',
  [AuditActionType.Implemented]: 'IMPLEMENTED',
  [AuditActionType.Closed]: 'CLOSED',
  [AuditActionType.CommentAdded]: 'COMMENT_ADDED',
  [AuditActionType.Accepted]: 'ACCEPTED',
  [AuditActionType.Confirm]: 'CONFIRMED',
  [AuditActionType.NotAccepted]: 'NOT_ACCEPTED',
  [AuditActionType.Discarded]: 'DISCARDED',
};

// Only whole numbers count as an ordinal — "EVENT_LOCKED" and "" must not become 0/NaN.
const toAuditOrdinal = (value?: string | number | null): number | null => {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  const trimmed = String(value ?? '').trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
};

const ALL_ACTIONS = Object.values(AUDIT_ACTION_LABELS) as SharedAuditAction[];

// Folds a free-text signal — an enum name or the row's own wording — onto the shared
// vocabulary. Only reached when the ordinal is absent or out of range. Ordered
// most-specific first where prefixes overlap ('NOT ACCEPTED' contains 'ACCEPT').
const matchAuditAction = (value: string): SharedAuditAction | null => {
  const normalised = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!normalised) return null;

  if (ALL_ACTIONS.includes(normalised as SharedAuditAction)) {
    return normalised as SharedAuditAction;
  }

  if (normalised.includes('NOTACCEPT') || normalised.includes('NOT_ACCEPT')) return 'NOT_ACCEPTED';
  if (normalised.includes('DISCARD')) return 'DISCARDED';
  if (normalised.includes('CONFIRM')) return 'CONFIRMED';
  if (normalised.includes('ACCEPT')) return 'ACCEPTED';
  // 'UNLOCK' contains 'LOCK', so it has to be tested first.
  if (normalised.includes('UNLOCK')) return 'UNLOCKED';
  if (normalised.includes('LOCK')) return 'LOCKED';
  if (normalised.includes('STATUS')) return 'STATUS_CHANGED';
  if (normalised.includes('IMPLEMENT')) return 'IMPLEMENTED';
  if (normalised.includes('APPROV')) return 'APPROVED';
  if (normalised.includes('RAISED') || normalised.includes('CREATED')) return 'CREATED';
  if (normalised.includes('UPLOAD') || normalised.includes('FILE')) return 'DOCUMENT_UPLOADED';
  if (normalised.includes('EVIDENCE') || normalised.includes('ATTACH')) return 'EVIDENCE_ADDED';
  if (normalised.includes('REVISION')) return 'REVISION_REQUESTED';
  if (normalised.includes('REVIEW')) return 'REVIEWED';
  if (normalised.includes('REJECT')) return 'REJECTED';
  if (normalised.includes('COMMENT')) return 'COMMENT_ADDED';
  if (normalised.includes('DECISION')) return 'DECISION_RECORDED';
  if (normalised.includes('CLOSE')) return 'CLOSED';
  if (normalised.includes('DETECT')) return 'DETECTED';
  if (normalised.includes('MITIGATION')) return 'MITIGATION_AGREED';
  if (normalised.includes('INVITE')) return 'MEETING_INVITE_SENT';
  if (normalised.includes('LIFECYCLE')) return 'LIFECYCLE_COMPLETED';
  if (normalised.includes('MEETING')) return 'MEETING_INVITE_SENT';
  if (normalised.includes('UPDATE')) return 'UPDATED';

  return null;
};

// Resolve in confidence order: confirmed ordinal, then the enum name / details wording
// for an ordinal this enum does not cover yet. Always resolves — 'CREATED' is the
// ultimate fallback so no row renders a raw "Action N".
export const resolveSharedAuditAction = (
  actionType?: string | number | null,
  details?: string | null
): SharedAuditAction => {
  const ordinal = toAuditOrdinal(actionType);
  if (ordinal !== null) {
    // Partial view: the ordinal on the wire is a bare integer and may sit outside the enum.
    const byOrdinal: Partial<Record<number, SharedAuditAction>> = AUDIT_ACTION_BY_ORDINAL;
    return byOrdinal[ordinal] ?? matchAuditAction(details ?? '') ?? 'CREATED';
  }

  return matchAuditAction(String(actionType ?? '')) ?? matchAuditAction(details ?? '') ?? 'CREATED';
};
