import { AuditActionType } from '@/constants/enum.constant';
import type { CompensationEventAuditAction } from '../types/compensation-event.types';

export const COMPENSATION_EVENT_AUDIT_LABELS: Record<CompensationEventAuditAction, string> = {
  CREATED: 'Created',
  DETECTED: 'Detected',
  LIFECYCLE_COMPLETED: 'Lifecycle completed',
  MITIGATION_AGREED: 'Mitigation agreed',
  RISK_REDUCTION_MEETING_INVITE_SENT: 'Meeting invite sent',
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

// Drives the Filters dropdown, in the backend enum's ordinal order.
export const COMPENSATION_EVENT_AUDIT_ACTIONS: CompensationEventAuditAction[] = [
  'CREATED',
  'DETECTED',
  'LIFECYCLE_COMPLETED',
  'MITIGATION_AGREED',
  'RISK_REDUCTION_MEETING_INVITE_SENT',
  'UPDATED',
  'STATUS_CHANGED',
  'LOCKED',
  'UNLOCKED',
  'DOCUMENT_UPLOADED',
  'EVIDENCE_ADDED',
  'DECISION_RECORDED',
  'REVIEWED',
  'APPROVED',
  'REVISION_REQUESTED',
  'REJECTED',
  'IMPLEMENTED',
  'CLOSED',
  'COMMENT_ADDED',
  'ACCEPTED',
  'CONFIRMED',
  'NOT_ACCEPTED',
  'DISCARDED',
];

// The live trail sends `actionType` as the shared `AuditActionType` ordinal. The map is
// total over that enum, so every row the backend can log labels off its ordinal; the
// `details` wording in `resolveAuditAction` is only a fallback for an ordinal this enum
// does not cover yet.
export const COMPENSATION_EVENT_AUDIT_ACTION_BY_ORDINAL: Record<
  AuditActionType,
  CompensationEventAuditAction
> = {
  [AuditActionType.Created]: 'CREATED',
  [AuditActionType.Detected]: 'DETECTED',
  [AuditActionType.LifecycleCompleted]: 'LIFECYCLE_COMPLETED',
  [AuditActionType.MitigationAgreed]: 'MITIGATION_AGREED',
  [AuditActionType.RiskReductionMeetingInviteSent]: 'RISK_REDUCTION_MEETING_INVITE_SENT',
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

export const COMPENSATION_EVENT_AUDIT_PAGE_SIZE = 8;

export const COMPENSATION_EVENT_AUDIT_COPY = {
  title: 'Audit Trail',
  searchPlaceholder: 'Search by user, action or details...',
  filtersLabel: 'Filters',
  noFilterOptions: 'No activity to filter',
  clearAllLabel: 'Clear all',
  loadMore: 'Load More',
  systemActor: 'System',
  noEntries: 'No activity recorded yet.',
  noMatches: 'No activity matches your search.',
} as const;

export const COMPENSATION_EVENT_AUDIT_COLUMNS = {
  dateTime: 'Date & Time',
  user: 'User',
  activity: 'Activity',
  details: 'Details',
} as const;

// "Showing 1 to 8 of 28 activities"
export const buildAuditSummary = (shown: number, total: number): string =>
  `Showing 1 to ${shown} of ${total} ${total === 1 ? 'activity' : 'activities'}`;
