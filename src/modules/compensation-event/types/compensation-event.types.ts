import type { EntityLifecycleEntry } from '@/constants/enum.constant';
import type { IPaginatedApiResponse } from '@/types';

// Register vocabulary from the Compensation Event Register design.
export type CompensationEventRegisterState =
  | 'DRAFT'
  | 'QUOTATION_TO_BE_SUBMITTED'
  | 'QUOTATION_SUBMITTED'
  | 'IMPLEMENTED'
  | 'REVISED_QUOTATION_TO_BE_SUBMITTED'
  | 'PROJECT_MANAGER_ASSESSMENT'
  | 'EXTENSION_OF_TIME_REQUESTED'
  // The Project Manager rejected the notified event itself, so no quotation follows it.
  | 'NOT_ACCEPTED'
  // Terminal — the event was withdrawn, so it never runs the rest of the lifecycle.
  | 'DISCARDED';
// Values the API may still return from the pre-register vocabulary.
export type CompensationEventLegacyStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

export type CompensationEventStatus =
  | CompensationEventRegisterState
  | CompensationEventLegacyStatus;

export type CompensationEventDirection = 'IN' | 'OUT';

export type CompensationEventTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface CompensationEvent {
  id: string;
  projectId?: string;
  reference: string;
  title: string;
  description?: string;
  // Short standalone blurb the register/detail banners show — distinct from `description`.
  summary?: string;
  amount: number;
  currency: string;
  status: CompensationEventStatus;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
  // Register columns — optional until the backend serves them.
  direction?: CompensationEventDirection;
  parentEarlyWarningReference?: string;
  timeImpactDays?: number | null;
  replyDueDate?: string | null;
  clauses?: string[];
  // Set when the event already has a quotation — the register links straight to it.
  quotationId?: string;
  // The contractor's submitted quote — absent until a quotation exists for the event, so
  // the register falls back to the estimate (`amount` / `timeImpactDays`) until it lands.
  quotedValue?: number | null;
  quotedDays?: number | null;
  // Notice fields the API record carries verbatim — read by the Overview tab.
  typeValue?: number;
  statusName?: string;
  clauseNumber?: string;
  clauseTitle?: string;
  clauseDescription?: string;
  additionalClauses?: string[];
  proposedEffect?: string;
  isQuotationRequired?: boolean;
  requiresPmDecision?: boolean;
  isRaisedManually?: boolean;
  notes?: string;
  parentEarlyWarningId?: string;
  // Detail screen fields — optional until the backend serves them.
  projectName?: string;
  contractReference?: string;
  contractorName?: string;
  raisedByName?: string;
  raisedToName?: string;
  projectManagerName?: string;
  finalizedOn?: string | null;
  originalQuoteAmount?: number | null;
  pmAssessmentAmount?: number | null;
  finalApprovedAmount?: number | null;
  approvedTimeImpactDays?: number | null;
  quoteReceivedDate?: string | null;
  decisionDate?: string | null;
  /** When the PM's assessment was recorded against the quotation. */
  assessmentOn?: string | null;
  /** One entry per `CeLifecycleStage`, with its progress and occurrence date. */
  lifecycle?: EntityLifecycleEntry[] | null;
  thread?: CompensationEventThreadMessage[];
  evidence?: CompensationEventEvidenceFile[];
  auditTrail?: CompensationEventAuditEntry[];
}

export type CompensationEventThreadParty = 'CONTRACTOR' | 'PM';

export interface CompensationEventThreadMessage {
  id: string;
  authorName: string;
  authorParty: CompensationEventThreadParty;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  // Absent on rows the register does not carry a conversation for — the row is only
  // clickable-to-open-thread when the backend has actually supplied one.
  conversationId?: string;
  // Kept raw off the backend message so the shared thread list infers inbound/outbound the
  // same way every other thread panel does; absent on demo/register-supplied rows.
  boxType?: number | string | null;
  source?: string | null;
  accountEmail?: string | null;
}

export type CompensationEventEvidenceKind = 'PDF' | 'XLSX' | 'DOCX' | 'ZIP' | 'IMAGE' | 'FILE';

export interface CompensationEventEvidenceFile {
  id: string;
  name: string;
  kind: CompensationEventEvidenceKind;
  /** Absent for a mail attachment: the conversation endpoint reports no size. */
  sizeBytes?: number | null;
  /** Absent until the message the file rode in on is known — the row then reads a dash. */
  uploadedAt?: string | null;
  /** Blob storage URL — set when the file comes from the attachments API. */
  filePath?: string;
  uploadedByName?: string;
}

export type CompensationEventActorParty = 'CONTRACTOR' | 'PM' | 'COMMERCIAL' | 'SYSTEM';

// One-to-one mirror of the backend `AuditActionType` enum, in ordinal order.
// `COMPENSATION_EVENT_AUDIT_ACTION_BY_ORDINAL` holds the numeric mapping.
// A string union rather than the enum itself, so the labels, colours and phrase
// maps stay exhaustively type-checked.
export type CompensationEventAuditAction =
  | 'CREATED'
  | 'DETECTED'
  | 'LIFECYCLE_COMPLETED'
  | 'MITIGATION_AGREED'
  | 'RISK_REDUCTION_MEETING_INVITE_SENT'
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
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'COMMENT_ADDED'
  | 'NOT_ACCEPTED'
  | 'DISCARDED';

export interface CompensationEventAuditEntry {
  id: string;
  action: CompensationEventAuditAction;
  actorName: string;
  actorRole?: string | null;
  actorParty: CompensationEventActorParty;
  // True when actorName came from the log's `sender` (email-sourced) rather than an Auspira user.
  isSender: boolean;
  details: string;
  occurredAt: string;
}

export interface CompensationEventReplyCountdown {
  label: string;
  tone: CompensationEventTone;
}

export interface CompensationEventActivity {
  id: string;
  reference: string;
  // Absent when the list response carries no audit trail to attribute the entry to.
  actorName?: string;
  summary: string;
  occurredAt: string;
}

export interface CompensationEventListParams {
  skip?: number;
  top?: number;
  term?: string;
  status?: CompensationEventStatus;
}

export type CompensationEventListResponse = IPaginatedApiResponse<CompensationEvent>;

export interface CreateCompensationEventInput {
  reference: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  eventDate: string; // YYYY-MM-DD, converted from Dayjs at the form boundary
}

export type UpdateCompensationEventInput = Partial<CreateCompensationEventInput>;
