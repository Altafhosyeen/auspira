import type { Dayjs } from 'dayjs';
import type { IPaginatedApiResponse } from '@/types';

// DefectNoticeStatus mirrors the backend integer enum (see Swagger). Unknown is the
// placeholder value the register never filters on — it is skipped everywhere, same
// rule the PMI register applies to its own Unknown status.
export enum DefectNoticeStatus {
  Open = 0,
  Closed = 1,
  NotAccepted = 2,
  Discard = 3,
}

export type DefectNoticeStatusValue = DefectNoticeStatus | number;

export type DefectNoticeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Register row — derived from the API DTO, ready for the table + export. */
export interface DefectNotice {
  id: string;
  projectId?: string;
  projectName?: string;
  reference: string;
  title: string;
  raisedByName: string;
  raisedByRole: string;
  /** Formatted display value (e.g. "20 Jul 2026"). */
  dateIssued: string;
  dueDate: string;
  status: DefectNoticeStatusValue;
  /** Uppercased status label (OPEN / CLOSED / …). */
  statusLabel: string;
  to?: string;
  referenceClause?: string;
  description?: string;
  summary?: string;
  // The email the notice was issued through, as the API reports it. Informational only —
  // the Email Thread tab reads conversations by the notice's own id.
  projectEmailId?: string | null;
  /** Raw ISO due date — the status badge tones off it, the export keeps the display one. */
  overdueDateTime?: string | null;
}

/** Query params for the project list endpoint (Skip/Top/Term/IncludeAll). */
export interface DefectNoticeListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
}

export type DefectNoticeListResponse = IPaginatedApiResponse<DefectNotice>;

/* -------------------------------------------------------------------------- */
/* API DTOs (mirror the Swagger schemas)                                       */
/* -------------------------------------------------------------------------- */

export interface DefectNoticeMetaObject {
  totalCount?: number | string;
}

export interface DefectNoticePageResultDto {
  meta: DefectNoticeMetaObject;
  items: DefectNoticeResponseDto[];
}

/** Shared shape of GET /api/defect-notices/{id} and the paged list items. */
export interface DefectNoticeResponseDto {
  id: string;
  projectId: string;
  reference: string;
  raisedBy: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  dateRaised: string;
  overdueDateTime?: string | null;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  /** The email the notice was issued through — scopes the Email Thread tab. */
  projectEmailId?: string | null;
  isRaisedManually?: boolean;
  closingReason?: string | null;
  closingNotes?: string | null;
  closingDate?: string | null;
  closedByName?: string | null;
  notAcceeptReason?: string | null;
  notAcceptReasonTitle?: string | null;
  status?: number | null;
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

/** POST /api/defect-notices/close — JSON body per the Swagger schema. */
export interface CloseDefectNoticeInput {
  defectNoticeId: string;
  closingNotes?: string;
}

/** Form values — the create screen's local model, before the API mapping. */
export interface DefectNoticeFormValues {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  defectTitle?: string;
  defectDescription?: string;
  clauseReference?: string;
  dueDate?: Dayjs;
}

/** Wire shape of the multipart POST — PascalCase keys bind straight to the DTO. */
export interface CreateDefectNoticeRequest {
  ProjectId: string;
  RaisedBy: string;
  DateRaised: string;
  Title: string;
  Description: string;
  Summary: string;
  ClauseNumber: string;
  ClauseTitle: string;
  ClauseDescription: string;
  OverdueDateTime: string;
  Subject: string;
  CC: string;
  BCC: string;
  To: string;
  Attachments: File[];
}

/** POST /api/defect-notices/accept (multipart) — creates the notice from a project alert. */
export interface AcceptDefectNoticeInput {
  projectAlertId: string;
  attachments?: File[];
}

export interface DefectNoticeThreadMessage {
  id: string;
  /** Set when the row resolves to a real mail conversation, for the thread modal. */
  conversationId?: string;
  authorName: string;
  subject?: string;
  body: string;
  sentAt: string;
}

export type DefectNoticeAuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DOCUMENT_UPLOADED'
  | 'MITIGATION_AGREED'
  | 'CLOSED';

/** GET /api/audit-logs?entityId= — one entry per lifecycle/action on the notice. */
export interface DefectNoticeAuditEntry {
  id: string;
  /** Raw `AuditActionType` enum name or ordinal, per the shared audit-log endpoint. */
  actionType: string | number;
  /** Null unless the action ties to a lifecycle stage. */
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
  /** Set only for email-originated actions. */
  sender?: string | null;
}

/** GET /api/attachments/:entityId/projects/:projectId — files hanging off the notice. */
export interface DefectNoticeAttachmentDto {
  id: string;
  projectId: string;
  entityId: string;
  entityType: number;
  fileName: string;
  fileExtension: string | null;
  /** The blob storage URL — pass this to the download endpoint as its `url` query. */
  filePath: string;
  fileSizeBytes: number | string;
  fileSizeMb: number | string;
  uploadedAt: string;
  role: number;
  uploadedByName: string;
  isEmailAttachment: boolean;
}

/** GET /api/project-emails/:id/conversations — the notice's mail-thread summaries. */
export interface DefectNoticeConversationDto {
  conversationId: string;
  subject: string;
  body: string;
  senderEmail: string | null;
  timestampUtc: string;
  count: number | string;
}

/** GET /api/meetings/list/{entityId} — meetings booked against the notice. */
export interface DefectNoticeMeetingDto {
  id: string;
  subject: string;
  agenda?: string | null;
  startTime: string;
  endTime: string;
  timeZone?: string | null;
  location?: string | null;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string | null;
  conversationId?: string | null;
  createdByName?: string | null;
  actionsCount?: number | string;
}

// One meeting-notes entry: an instruction/finding sent from one attendee to another,
// same shape the Meetings tab's correspondence list renders.
export interface DefectNoticeMeetingEntry {
  id: string;
  fromName: string;
  fromRole: string;
  toName: string;
  toRole: string;
  message: string;
  occurredAt: string;
}
