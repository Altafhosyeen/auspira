import type { IPaginatedApiResponse } from '@/types';

// DailySiteReportStatus mirrors the backend integer enum (see Swagger).
export enum DailySiteReportStatus {
  Accepted = 0,
  Discarded = 1,
}

export type ProjectDailyReportTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Register row — derived from the API DTO, ready for the table + export. */
export interface ProjectDailyReport {
  id: string;
  /** The report's project — needed to read its attachments, which are project-scoped. */
  projectId?: string;
  projectName?: string;
  reference: string;
  title: string;
  submittedByName: string;
  raisedAt: string;
  // Cumulative works progress the report was submitted against, 0-100.
  progress: number;
  /** The API's own status value — a `DailySiteReportStatus` code. */
  statusCode?: DailySiteReportStatus | number;
  description?: string;
}

export interface ProjectDailyReportThreadMessage {
  id: string;
  /** The conversation this row belongs to — what `EmailThreadModal` fetches with. */
  conversationId?: string;
  authorName: string;
  subject?: string;
  body: string;
  sentAt: string;
}

/** POST /api/daily-site-reports/accept (multipart) — creates the report from a project alert. */
export interface AcceptDailySiteReportInput {
  projectAlertId: string;
  attachments?: File[];
}

/** Query params for the project list endpoint (Skip/Top/Term/IncludeAll). */
export interface ProjectDailyReportListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
}

export type ProjectDailyReportListResponse = IPaginatedApiResponse<ProjectDailyReport>;

/* -------------------------------------------------------------------------- */
/* API DTOs (mirror the Swagger schemas)                                       */
/* -------------------------------------------------------------------------- */

/** Shared shape of GET /api/daily-site-reports/{id} and the paged list items. */
export interface DailySiteReportResponseDto {
  id: string;
  projectId: string;
  reference: string;
  raisedBy: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  dateRaised: string;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  progressPercentage?: number | string | null;
  projectEmailId?: string | null;
  notAcceptReason?: string | null;
  notAcceptReasonTitle?: string | null;
  status?: number | string | null;
}

export interface DailySiteReportMetaObject {
  totalCount?: number | string;
}

export interface DailySiteReportPageResultDto {
  meta?: DailySiteReportMetaObject | null;
  items?: DailySiteReportResponseDto[] | null;
}

/** GET /api/project-emails/{entityId}/conversations — the report's mail-thread summary. */
export interface DailySiteReportConversationDto {
  conversationId: string;
  subject: string;
  body: string;
  senderEmail: string | null;
  timestampUtc: string;
  count: number | string;
}

/** One row of GET /api/attachments/{entityId}/projects/{projectId}. */
export interface DailySiteReportAttachmentDto {
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

/** GET /api/audit-logs?entityId= — one entry per action on the report. */
export interface DailySiteReportAuditEntryDto {
  id: string;
  actionType: string | number;
  /** Null unless the action ties to a lifecycle stage. */
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
  sender?: string | null;
}
