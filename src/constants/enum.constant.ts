/**
 * Central registry of all shared numeric enums used across the app.
 *
 * Enum definitions live here as the single source of truth. Feature files that
 * also ship helper functions / label maps (e.g. `document.type.code.ts`,
 * `status.constant.ts`, `secoundry-option.constant.ts`) re-export their enum
 * from this file so existing import paths keep working.
 */

/* -------------------------------------------------------------------------- */
/* Contract documents                                                         */
/* -------------------------------------------------------------------------- */

/** `ContractDocumentType` numeric codes returned by the backend. */
export enum ContractDocumentType {
  FormOfAgreement = 1,
  ContractDataPart1 = 2,
  ContractDataPart2 = 3,
  Conditions = 4,
  ZClauses = 5,
  WorksInfo = 6,
  SiteInfo = 7,
  PricingDocument = 8,
  BillOfQuantities = 9,
  Primavera = 10,
  InsuranceCertificate = 11,
  CERegister = 12,
  A1 = 13,
  B1 = 14,
  C1 = 15,
  C2 = 16,
  C3 = 17,
  D1 = 18,
  D2 = 19,
  D3 = 20,
  E1 = 21,
  F1 = 22,
  Hsqe = 23,
}

/* -------------------------------------------------------------------------- */
/* Early Warning lifecycle                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Position of an Early Warning in its NEC4 Cl. 15 lifecycle. Mirrors `EwLifecycleStage`.
 *
 * Member *names* matter as well as their values: the audit-trail endpoint reports a stage as its
 * enum name ("EarlyWarningMeeting"), which `early-warning-detail.map.ts` matches against
 * `EwLifecycleStage[stage]` — so these must stay spelled exactly as the backend spells them.
 */
export enum EwLifecycleStage {
  Detected = 1,
  Registered = 2,
  EarlyWarningMeeting = 3,
  LinkToCE = 4,
  Close = 5,
}

/** Progress of a single lifecycle stage. Mirrors `EwLifecycleStatus`. */
export enum EwLifecycleStatus {
  NotStarted = 0,
  Pending = 1,
  Completed = 2,
}

/** Audit trail event type for an Early Warning. Mirrors `EarlyWarningAuditActionType`. */
export enum EarlyWarningAuditActionType {
  Created = 1,
  Detected = 2,
  LifecycleCompleted = 3,
  MitigationAgreed = 4,
}

/* -------------------------------------------------------------------------- */
/* PMI / CE lifecycle                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Stage of a Project Manager's Instruction in its lifecycle. Mirrors `PmiLifecycleStage`.
 * Stages arrive pre-populated on the detail record as `lifecycle[]` entries.
 */
export enum PmiLifecycleStage {
  Raised = 1,
  QuotationSubmitted = 2,
  RevisionRequested = 3,
  Implemented = 4,
}

/**
 * Stage of a Compensation Event in its lifecycle. Mirrors `CeLifecycleStage`.
 * Same `lifecycle[]` shape as the PMI record carries.
 */
export enum CeLifecycleStage {
  Raised = 1,
  QuotationSubmitted = 2,
  RevisionRequested = 3,
  Assessed = 4,
  Implemented = 5,
}

/**
 * The `lifecycle[]` entry carried on PMI / CE detail records — one row per stage with
 * its progress and, once reached, when it happened. `status` mirrors `EwLifecycleStatus`.
 */
export interface EntityLifecycleEntry {
  stage: number;
  status: number;
  occurredAt: string | null;
}

/* -------------------------------------------------------------------------- */
/* Shared audit log                                                           */
/* -------------------------------------------------------------------------- */

/**
 * `AuditActionType` — the action recorded against any entity on the shared
 * `/api/audit-logs?entityId=` trail (Early Warnings, Compensation Events, ...).
 *
 * Swagger types the field as a bare `integer` and publishes no name mapping;
 * these members mirror the backend `AuditActionType` declaration. 1-5 are the
 * block `EarlyWarningAuditActionType` above already documents — the two trails
 * share one backend enum, so a CE `Created` / `Detected` row carries the same
 * ordinals.
 *
 * Only a subset carries a UI label today; the rest are resolved from the row's
 * `details` wording — see `resolveAuditAction` in the compensation-event module.
 */
export enum AuditActionType {
  Created = 1,
  /** EW/CE raised from source data. */
  Detected = 2,
  LifecycleCompleted = 3,
  MitigationAgreed = 4,
  RiskReductionMeetingInviteSent = 5,
  Updated = 6,
  StatusChanged = 7,
  Locked = 8,
  Unlocked = 9,
  DocumentUploaded = 10,
  EvidenceAdded = 11,
  DecisionRecorded = 12,
  Reviewed = 13,
  Approved = 14,
  RevisionRequested = 15,
  Rejected = 16,
  /** Logged as "Quotation assessed and compensation event implemented". */
  Implemented = 17,
  Closed = 18,
  CommentAdded = 19,
  Accepted = 20,
  Confirm = 21,
  NotAccepted = 22,
  Discarded = 23,
}

/* -------------------------------------------------------------------------- */
/* User / entity status                                                       */
/* -------------------------------------------------------------------------- */

/** Generic entity status (users, invitations, etc.). */
export enum Status {
  Unknown = 0,
  Pending = 1,
  Active = 2,
  InActive = 3,
  Invited = 4,
  Deleted = 5,
  Rejected = 6,
  Suspended = 7,
}

/* -------------------------------------------------------------------------- */
/* NEC main options                                                           */
/* -------------------------------------------------------------------------- */

/** NEC main option (A–F) as the 0-based numeric code the backend returns. */
export enum MainOptionCode {
  A = 0,
  B = 1,
  C = 2,
  D = 3,
  E = 4,
  F = 5,
}

/* -------------------------------------------------------------------------- */
/* NEC secondary options                                                      */
/* -------------------------------------------------------------------------- */

/** NEC secondary option clauses (W/X/Y codes) as numeric values. */
export enum SecondaryOptions {
  None = 0,

  // Dispute resolution
  W1 = 1,
  W2 = 2,

  // Core X options
  X1 = 3,
  X2 = 4,
  X3 = 5,
  X4 = 6,
  X5 = 7,
  X6 = 8,
  X7 = 9,
  X8 = 10,
  X9 = 11,
  X10 = 12,
  X11 = 13,
  X12 = 14,
  X13 = 15,
  X14 = 16,
  X15 = 17,
  X16 = 18,
  X17 = 19,
  X18 = 20,
  X19 = 21,
  X20 = 22,
  X21 = 23,
  X22 = 24,

  // UK specific
  YUK1 = 25,
  YUK2 = 26,
}

/* -------------------------------------------------------------------------- */
/* Cross-reference review (project stage 3)                                   */
/* -------------------------------------------------------------------------- */

/**
 * Data-point category returned as `category` / `projectKeyCategory`.
 * Maps to the review UI's data-point tab.
 */
export enum ProjectKeyCategory {
  None = 0,
  Quantitative = 2,
  Qualitative = 3,
  Date = 4,
}

/**
 * Resolution state of a cross-reference check (`projectKeyStatus`).
 * - `None`        → nothing extracted / not evaluated
 * - `Passed`      → all documents agree
 * - `Warning`     → soft mismatch, review advised
 * - `Failed`      → conflicting values across documents (blocking)
 * - `NeedsReview` → flagged for manual review
 * - `Resolved`    → conflict resolved by a user
 */
export enum ProjectKeyStatus {
  None = 0,
  Passed = 1,
  Warning = 2,
  Failed = 3,
  NeedsReview = 4,
  Resolved = 5,
}

export enum CheckType {
  None = 0,
  Consistency = 1,
  Existence = 2,
  Both = 3,
}

/* -------------------------------------------------------------------------- */
/* Project alerts                                                             */
/* -------------------------------------------------------------------------- */

/** Suggested route for a project alert. Mirrors `ProjectAlertType`. */
export enum ProjectAlertType {
  Unknown = 0,
  EarlyWarning = 1,
  PMI = 2,
  CompensationEvent = 3,
  Meeting = 4,
  Quotation = 5,
  DefectNotice = 6,
  DailySiteReport = 7,
  Programee = 8,
}

/** Lifecycle status of a project alert. Mirrors `ProjectAlertStatus`. */
export enum ProjectAlertStatus {
  Unknown = 0,
  Reviewed = 1,
  UnReviewed = 2,
  Dismissed = 3,
  Registered = 4,
  InProgress = 5,
  Closed = 6,
  Overdue = 7,
  Excepted = 8,
}

/** Origin system/channel a project alert was ingested from. Mirrors `ProjectAlertSource`. */
export enum ProjectAlertSource {
  Unknown = 0,
  Email = 1,
  DailySiteReport = 2,
  Weather = 3,
  PMI = 4,
}

/* -------------------------------------------------------------------------- */
/* Compensation events                                                        */
/* -------------------------------------------------------------------------- */

/** How a Compensation Event came into being. Mirrors `CompensationEventType`. */
export enum CompensationEventType {
  ContractorNotification = 1,
  EarlyWarning = 2,
  ProjectManagerInstruction = 3,
  Manual = 4,
}

export enum EarlyWarningStatus {
  Open = 0,

  Closed = 1,

  NotAccepted = 2,

  Discard = 3,
}

export enum CompensationEventStatus {
  Draft = 1,

  AwaitingPMDecision = 2,

  NotAccepted = 3,

  Accepted = 4,

  QuotationRequested = 5,

  QuotationInProgress = 6,

  QuotationSubmitted = 7,

  UnderAssessment = 8,

  RevisionRequested = 9,

  Implemented = 10,

  Closed = 11,

  Discard = 12,
}

/* --------------------------- ContractEntityType --------------------------- */

/** The backend's single numbering for "which register does this record belong to" — it stamps
 *  these values on project tasks (`entityType`), clause catalogue entries and contract records
 *  alike. Note PMI is 2 and Compensation Event is 3, not the other way round. */
export enum ContractEntityType {
  Unknown = 0,

  EarlyWarning = 1,

  PMI = 2,

  CompensationEvent = 3,

  Quotation = 4,

  PmAssessment = 5,

  Notification = 6,

  Project = 7,

  Other = 8,
}
export enum QuotationStatus {
  PendingReview = 1,

  Accepted = 2,

  NotAccepted = 3,

  RevisionRequested = 4,

  ProceededWithAssessment = 5,
}

export enum CompensationEventStages {
  Unknown = 0,
  ReviewQuotation = 1,
  ImplementCE = 2,
  CloseCE = 3,
}

/* -------------------------------------------------------------------------- */
/* Project-scoped user role                                                  */
/* -------------------------------------------------------------------------- */

/** A user's role on a single project (`projectRole`). Mirrors the backend `ProjectRole` enum. */
export enum ProjectRole {
  None = 0,
  Supervisor = 1,
  Contractor = 2,
  Observer = 3,
  ProjectManager = 4,
}
