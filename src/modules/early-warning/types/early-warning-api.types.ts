// Wire shapes for /api/early-warnings, mirroring the backend DTOs exactly.
// The UI never consumes these directly — `toEarlyWarning` maps them onto the
// module's domain model first.

import type { EwLifecycleStage, EwLifecycleStatus } from '@/constants/enum.constant';

/** Numeric fields come back as number or string depending on the serialiser. */
export type ApiNumber = number | string;

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
  /** Direction of the source email (ProjectEmail.boxType) — absent until the backend sends it. */
  boxType?: number | null;
  isRaisedManually: boolean;
  closingReason: string | null;
  closingNotes: string | null;
  closingDate: string | null;
  closedByName: string | null;
  status: ApiNumber;
  earlyWarningLifecycles?: ApiEarlyWarningLifecycle[] | null;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  summary?: string | null;
}

export interface EarlyWarningPageResultDto {
  meta: { totalCount: ApiNumber };
  items: ApiEarlyWarningDetail[];
}

/** GET /api/early-warnings/project/:projectId/lookup — id/title/reference only. */
export interface EarlyWarningLookupDto {
  id: string;
  title: string;
  reference: string;
}

export interface VerifyEarlyWarningReferenceResult {
  referenceId: string;
  /** `true` when the reference does not already exist on the project — i.e. free to use. */
  isAvailable: boolean;
}

/** GET /api/attachments/:entityId/projects/:projectId — attachments hanging off an entity. */
export interface EarlyWarningAttachmentDto {
  id: string;
  projectId: string;
  entityId: string;
  entityType: number;
  fileName: string;
  fileExtension: string;
  /** The blob storage URL — pass this to the download endpoint as its `url` query. */
  filePath: string;
  fileSizeBytes: number;
  fileSizeMb: number;
  uploadedAt: string;
  role: number;
  uploadedByName: string;
  isEmailAttachment: boolean;
}

/** GET /api/audit-logs?entityId=:id — one entry per lifecycle/action on the EW. */
export interface EarlyWarningAuditTrailEntry {
  id: string;
  earlyWarningId?: string;
  // Mirrors `EarlyWarningAuditActionType` — usually the enum name (e.g. "Created") but the
  // backend has also been observed sending the raw numeric value, so both shapes are handled.
  actionType: string | number;
  /** Null unless the action ties to a lifecycle stage (e.g. `LifecycleCompleted`). */
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
  sender?: string | null;
}

/** GET /api/project-emails/:id/conversations — the EW's mail-thread summary. */
export interface EarlyWarningConversationDto {
  // Thread summaries are backend-shaped; keep it loose until fields are stable.
  [key: string]: unknown;
}

/** Query params for GET /api/early-warnings/project/:projectId (lowercase, as the backend binds them). */
export interface EarlyWarningProjectListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
  /** Comma-separated numeric lifecycle codes — the API takes `status` as a string. */
  status?: string;
}

/** Multipart payload for POST /api/early-warnings — PascalCase keys to bind to the backend DTO. */
export interface RegisterEarlyWarningRequest {
  ProjectId: string;
  /** Absent when the EW is raised manually rather than promoted from a project alert. */
  ProjectAlertId?: string;
  Reference: string;
  RaisedBy: string;
  Title: string;
  Description: string;
  DateRaised: string;
  To: string;
  CC: string;
  BCC: string;
  Subject: string;
  PotentialImpacts: string;
  ProposedActions: string;
  KeyDatesAffected: string;
  DelayToCompletion: boolean;
  KeyDateImpact: boolean;
  CostIncrease: boolean;
  PerformanceImpairment: boolean;
  /** Picked files, streamed as repeated multipart parts under this key. */
  Attachments: File[];
  ProjectName: string;
  ProjectReference: string;
  // Clause fields are separate top-level fields (no nested/combined string).
  ClauseNumber: string;
  ClauseTitle: string;
  ClauseDescription: string;
}

/** GET /api/agreed-actions/{earlyWarningId} */
export interface AgreedActionDto {
  id: string;
  riskReductionMeetingId: string;
  description: string;
  isCompleted: boolean;
  responsibleParty?: string | null;
  dueDate?: string | null;
  earlyWarningId: string;
  conversationId?: string | null;
  userId?: string | null;
  assignedAt?: string | null;
  assignedNotes?: string | null;
  completedAt?: string | null;
  completionNotes?: string | null;
  userFullName?: string | null;
}

/** GET /api/risk-reduction-meetings/early-warning/{earlyWarningId} */
export interface EarlyWarningMeetingDto {
  id: string;
  projectAlertId?: string | null;
  earlyWarningId: string;
  projectEmailId?: string | null;
  earlyWarningReference?: string | null;
  meetingDate?: string | null;
  location?: string | null;
  participants?: string | null;
  summary?: string | null;
  clauseDescription?: string | null;
  outcomeSoFar?: string | null;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
}

export interface ExternalAttendeeDto {
  name?: string | null;
  email: string;
}

export enum ProjectRole {
  None = 0,
  Supervisor = 1,
  Contractor = 2,
  Observer = 3,
  ProjectManager = 4,
}

export interface MeetingActionAssigneeDto {
  id: string;
  meetingActionId: string;
  applicationUserId?: string | null;
  role: ProjectRole | number;
  email: string;
  name: string;
  isExternal: boolean;
}

export interface UpdateMeetingActionAssigneesPayload {
  projectId: string;
  userIdsToAdd?: string[];
  externalAttendeesToAdd?: ExternalAttendeeDto[];
  assigneeIdsToRemove?: string[];
}

export interface MeetingActionDto {
  id: string;
  meetingId: string;
  projectId?: string;
  title?: string | null;
  description?: string | null;
  dueDate?: string | null;
  priority?: number | string;
  assignNotes?: string | null;
  completionNotes?: string | null;
  completedDate?: string | null;
  conversationId?: string | null;
  userIds?: string[];
  userFullName?: string | null;
  assignees?: MeetingActionAssigneeDto[];
  assignedUsers?: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  }>;
  externalAttendees?: ExternalAttendeeDto[];
  attachments?: Array<{
    id: string;
    fileName: string;
    filePath?: string;
  }>;
  isCompleted?: boolean;
}

export interface CreateMeetingActionPayload {
  MeetingId: string;
  ProjectId: string;
  Title: string;
  Description?: string;
  DueDate?: string;
  Priority?: number;
  AssignNotes?: string;
  UserIds?: string[];
  ExternalAttendees?: ExternalAttendeeDto[];
  Attachments?: File[];
}

export interface MarkMeetingActionCompleteDto {
  completionNotes?: string | null;
}

export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export interface UserLookupDto {
  id: string;
  fullName: string;
  email: string;
}

export interface MeetingAttendeeDto {
  id?: string;
  meetingId?: string;
  applicationUserId?: string | null;
  role?: ProjectRole | number | null;
  email?: string | null;
  name?: string | null;
  isExternal?: boolean;
}

export interface MeetingDto {
  id: string;
  subject: string;
  agenda?: string | null;
  startTime: string;
  endTime: string;
  timeZone: string;
  location?: string | null;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string | null;
  conversationId?: string | null;
  createdByName?: string | null;
  actionsCount?: number;
  meetingAttendees?: MeetingAttendeeDto[];
}
