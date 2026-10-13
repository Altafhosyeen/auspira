import type { EntityLifecycleEntry } from '@/constants/enum.constant';

// Wire shapes for /api/compensation-events, mirroring the backend DTOs exactly.
// The UI never consumes these directly — `toCompensationEvent` maps them onto the
// module's domain model first.

/** Numeric fields come back as number or string depending on the serialiser. */
export type ApiNumber = number | string;

export interface CompensationEventResponseDto {
  id: string;
  projectId: string;
  reference: string;
  title: string;
  clauseNumber: string;
  clauseTitle: string;
  clauseDescription: string;
  additionalClauseReferences: string | null;
  type: number;
  description: string;
  proposedEffectDescription: string;
  estimatedValue: ApiNumber;
  estimatedDays: ApiNumber;
  currency: string;
  isQuotationRequired: boolean;
  requiresPmDecision: boolean;
  isRaisedManually: boolean;
  implementedValue: ApiNumber | null;
  implementedDays: ApiNumber | null;
  implementedOn: string | null;
  earlyWarningReference: string | null;
  earlyWarningId: string | null;
  raisedBy: string | null;
  notes: string | null;
  /** Short standalone blurb the register/detail banners show — distinct from `description`. */
  summary?: string | null;
  status: ApiNumber;
  statusName: string | null;
  createdOn: string;
  updatedOn: string | null;
  /** Set once a quotation exists for the event — absent on older responses. */
  quotationId?: string | null;
  /** The contractor's submitted quote — absent until a quotation exists for the event. */
  quotedValue?: ApiNumber | null;
  quotedDays?: ApiNumber | null;
  /** When the contractor's quotation landed — dates the Quotation stage of the lifecycle. */
  quotationSubmittedOn?: string | null;
  /** When the PM's assessment was recorded against the quotation. */
  assessmentOn?: string | null;
  /** When the PM requested a revised quotation. */
  revisionRequestedOn?: string | null;
  /** One entry per `CeLifecycleStage`, with its progress and occurrence date. */
  lifecycle?: EntityLifecycleEntry[] | null;
}

/** GET /api/compensation-events/project/:projectId/totals — the register summary tiles. */
export interface CompensationEventTotalsResponseDto {
  totalQuotedValue: ApiNumber;
  totalQuotedDays: ApiNumber;
}

/** GET /api/compensation-events/{id}/financial — the final quotation's financial summary. */
export interface CompensationEventFinancialResponseDto {
  quotationId: string;
  /** When the quotation was submitted — dates the Quote figures on the tab. */
  submittedOn?: string | null;
  quotedTotalCost: ApiNumber;
  quotedClaimDays: ApiNumber;
  assessedTotalCost: ApiNumber | null;
  assessedClaimDays: ApiNumber | null;
  differenceInCost: ApiNumber | null;
  differenceInDays: ApiNumber | null;
  // Direction of differenceInCost — the API sends the magnitude only, so this says whether the assessed cost increased vs the quote.
  isIncreased?: boolean | null;
  // Direction of differenceInDays, on the same terms as isIncreased.
  isDaysIncreased?: boolean | null;
  /** Fee percentage applied on top of the assessed cost, in currency. */
  fees?: ApiNumber | null;
  /** Risk allowance carried by the final quotation, in currency. */
  riskAllowance?: ApiNumber | null;
  /** The final quotation amount including fee and allowance. */
  quotationAmount?: ApiNumber | null;
}

export interface CompensationEventPageResultDto {
  meta: { totalCount: ApiNumber };
  items: CompensationEventResponseDto[];
}

/** GET /api/compensation-events/project/{projectId}/lookup — id/reference/title only. */
export interface CompensationEventLookupResponse {
  id: string;
  reference: string;
  title: string;
}

/** antd Select shape for the lookup: the CE id, labelled "<reference> - <title>". */
export interface CompensationEventLookupOption {
  label: string;
  value: string;
  /** The reference on its own — for pickers too narrow to carry the whole label. */
  reference: string;
}

export interface VerifyCompensationEventReferenceResult {
  referenceId: string;
  /** `true` when the reference is free to use on this project. */
  isAvailable: boolean;
}

/** Query params for GET /api/compensation-events/project/{projectId}. */
export interface CompensationEventProjectListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
  /** Backend `CompensationEventStatus` codes — the register's multi-select state filter. */
  statuses?: number[];
}

/** GET /api/attachments/{entityId}/projects/{projectId} — every attachment on an entity. */
export interface AttachmentResponseDto {
  id: string;
  projectId: string;
  entityId: string;
  entityType: number;
  fileName: string;
  fileExtension: string;
  /** Blob storage URL — passed to GET /api/attachments/download to fetch the bytes. */
  filePath: string;
  fileSizeBytes: number;
  fileSizeMb: number;
  uploadedAt: string;
  role: number;
  uploadedByName: string;
  isEmailAttachment: boolean;
}

// Multipart payload for POST /api/compensation-events. Keys are PascalCase to bind
// to the backend DTO, and attachments ride along in the same request.
export interface CreateCompensationEventNoticeInput {
  projectId: string;
  reference: string;
  title: string;
  clauseNumber: string;
  clauseTitle: string;
  clauseDescription: string;
  additionalClauseReferences?: string;
  type: number;
  description: string;
  proposedEffectDescription: string;
  estimatedValue: number;
  estimatedDays: number;
  currency: string;
  isQuotationRequired: boolean;
  requiresPmDecision?: boolean;
  projectAlertId?: string;
  earlyWarningReference?: string;
  earlyWarningId?: string;
  raisedBy: string;
  notes?: string;
  subject: string;
  to: string;
  cc?: string;
  bcc?: string;
  attachments?: File[];
  projectName?: string;
  projectReference?: string;
}
