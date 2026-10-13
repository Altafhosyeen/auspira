import type { EntityLifecycleEntry } from '@/constants/enum.constant';
import type { IPaginatedApiResponse } from '@/types';

// PmiStatus mirrors the backend integer enum (see Swagger). Unknown is the
// placeholder value the register never filters on — it is skipped everywhere.
export enum PmiStatus {
  Unknown = 0,
  Open = 1,
  Implemented = 2,
  QuotationRevisionRequested = 3,
  QuotationInProgress = 4,
}

export type PmiStatusValue = PmiStatus | number;

// PmiType mirrors the backend integer enum. Values follow the register design's
// PMI Selection order (0 = Change the Scope or a Key Date … 3 = Other).
export enum PmiType {
  ChangeScopeOrKeyDate = 0,
  ProposedInstruction = 1,
  StopWorkNotice = 2,
  Other = 3,
}

export type PmiTypeValue = PmiType | number;

/** Query params for the project list endpoint. */
export interface PmiListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
  /** Comma-joined status codes, e.g. "1,2" — sent to the API as `status`. */
  status?: number | string;
}

export type PmiListResponse = IPaginatedApiResponse<ProjectManagerInstruction>;

/** Register row — derived from the API DTO, ready for the table + export. */
export interface ProjectManagerInstruction {
  id: string;
  reference: string;
  title: string;
  details: string;
  /** Formatted display value (e.g. "17 Jul 2026"). */
  dateIssued: string;
  responseRequiredBy: string | null;
  clauseNumber: string;
  /** Display clause — clauseNumber || otherClauseReference || '—'. */
  referenceClause: string;
  status: PmiStatusValue;
  /** Uppercased status label (OPEN / IMPLEMENTED / …). */
  statusLabel: string;
  /** PMI type code (the selection made when registering). */
  type: PmiTypeValue;
  /** Display label for the type (e.g. "Change the Scope or a Key Date"). */
  typeLabel: string;
  /** The user who created the instruction (API `createdByName`). */
  createdBy?: string;
  createdOn: string | null;
  updatedOn: string | null;
  /** The quotation id when the contractor has submitted one. */
  quotationId?: string | null;
  /** The compensation event raised from this instruction, when one exists. */
  compensationEventId?: string | null;
  /** The linked compensation event's reference (e.g. "CE-0001"). */
  compensationEventReference?: string | null;
  /** The linked CE's numeric `CompensationEventStatus` code. */
  compensationEventStatus?: number | null;
  /** The cross-reference finding this instruction was raised from, when one exists. */
  projectCrossReferenceId?: string | null;
}

/* -------------------------------------------------------------------------- */
/* API DTOs (mirror the Swagger schemas)                                       */
/* -------------------------------------------------------------------------- */

export interface PmiMetaObject {
  totalCount?: number | string;
}

export interface PmiPageResultDto {
  meta: PmiMetaObject;
  items: ProjectManagerInstructionResponseDto[];
}

/** GET /api/project-manager-instructions/{id} response shape. */
export interface ProjectManagerInstructionResponseDto {
  id: string;
  projectId: string;
  reference: string;
  title: string;
  details: string;
  dateIssued: string;
  responseRequiredBy?: string | null;
  clauseTitle?: string | null;
  clauseNumber?: string | null;
  otherClauseReference?: string | null;
  type?: number;
  status?: number;
  compensationEventId?: string | null;
  compensationEventReference?: string | null;
  compensationEventStatus?: number | null;
  /** The cross-reference finding this instruction was raised from, when one exists. */
  projectCrossReferenceId?: string | null;
  quotationId?: string | null;
  quotationSubmittedOn?: string | null;
  revisionRequestedOn?: string | null;
  implementedOn?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
  /** Who created the instruction — the list DTO serves it as `createdByName`. */
  createdByName?: string | null;
  /** One entry per `PmiLifecycleStage`, with its progress and occurrence date. */
  lifecycle?: EntityLifecycleEntry[] | null;
}

/** GET /api/project-manager-instructions/lookup/project/{projectId} item. */
export interface PmiLookupResponseDto {
  pmiId: string;
  referenceNumber: string;
  title: string;
}

/* -------------------------------------------------------------------------- */
/* Register form (POST /api/project-manager-instructions)                       */
/* -------------------------------------------------------------------------- */

import type { Dayjs } from 'dayjs';

/** One entry of the PMI Selection dropdown — carries the clause it auto-fills. */
export interface PmiTypeOption {
  value: PmiTypeValue;
  label: string;
  /** Embedded clause of a preset option (e.g. "14.3"); absent on "Other". */
  clauseNumber?: string;
  /** Embedded clause title of a preset option (e.g. "Change to Works Information"). */
  clauseTitle?: string;
}

/** Form values — the create screen's local model, before the API mapping. */
export interface CreatePmiFormValues {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  pmiType?: PmiTypeValue;
  /** The picked clause, e.g. "Cl. 14.3" (preset) or "14.3 - Change to Works Information" (Other). */
  clauseReference?: string;
  title?: string;
  instructionDetails?: string;
  responseRequiredBy?: Dayjs;
}

// The cross-reference data point a PMI was raised from. Absent on a PMI created
// directly from the register — the link only exists for the cross-reference flow.
export interface PmiCrossReferenceOrigin {
  projectCrossReferenceId: string;
  /** The value agreed in the cross-reference drawer, e.g. "5%". May be empty. */
  value: string;
  /** The data point's name, e.g. "Retention Percentage" — printed under the heading. */
  dataPoint: string;
  /** Set when the data point was marked as the contract route rather than merely resolved. */
  isContractRoute: boolean;
}

/** Submit context — project identity + picked files (multipart parts, not fields). */
export interface CreatePmiContext {
  projectId: string;
  projectName?: string;
  projectReference?: string;
  attachments: File[];
  /** Set when the instruction was raised from a cross-reference data point. */
  crossReference?: PmiCrossReferenceOrigin;
}

/** Wire shape of the multipart POST — PascalCase keys to bind to the backend DTO. */
export interface RegisterPmiRequest {
  ProjectId: string;
  DateIssued: string;
  ClauseTitle: string;
  ClauseNumber: string;
  OtherClauseReference: string;
  Title: string;
  Details: string;
  ResponseRequiredBy: string;
  Type: PmiTypeValue;
  To: string;
  CC: string;
  BCC: string;
  Subject: string;
  Attachments: File[];
  /** Only sent when the PMI was raised from a cross-reference data point. */
  ProjectCrossReferenceId?: string;
  /** The agreed cross-reference value — omitted when the user cleared it. */
  Value?: string;
}

/* -------------------------------------------------------------------------- */
/* Detail-screen DTOs (shared endpoints — same API the EW detail uses)          */
/* -------------------------------------------------------------------------- */

/** GET /api/audit-logs?entityId= — one entry per lifecycle/action on the PMI. */
export interface PmiAuditTrailEntry {
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

/** GET /api/attachments/:entityId/projects/:projectId — files hanging off the PMI. */
export interface PmiAttachmentDto {
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

/** GET /api/project-emails/:id/conversations — the PMI's mail-thread summaries. */
export interface PmiConversationDto {
  conversationId: string;
  subject: string;
  body: string;
  senderEmail: string | null;
  timestampUtc: string;
  count: number | string;
}

/* -------------------------------------------------------------------------- */
/* PMI Quotations (/api/pmi-quotations)                                       */
/* -------------------------------------------------------------------------- */

export interface ConfirmPmiQuotationInput {
  projectAlertId: string;
  pmiId: string;
}

export interface ConfirmPmiQuotationResponseDto {
  quotationId: string;
}

export interface AcceptPmiQuotationInput {
  quotationId: string;
}

export interface RequestPmiQuotationRevisionInput {
  quotationId: string;
  subject: string;
  description: string;
  attachments?: File[];
}
