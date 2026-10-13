/** Tab grouping for the cross-reference review (matches the data-point category). */
export type DataPointTab = 'quantitative' | 'qualitative' | 'date';

/** Toolbar sort options for the reference list/grid. */
export type SortOption = 'severity' | 'unresolved' | 'sources' | 'title';

/** Toolbar status-filter options; `resolved` overrides the underlying severity type. */
export type StatusFilter = 'all' | 'error' | 'warning' | 'passed' | 'resolved';

/** Reference list layout: card grid or the compact row list. */
export type ViewMode = 'grid' | 'list';

/** How a finding's evidence is presented in the card body. */
export type FindingPresentation = 'comparison' | 'missing';

/**
 * Email-resolution workflow state for a cross-reference finding. Lives here (not
 * in the contract module) so the shared drawer can render it without importing
 * from a module that already imports this one.
 */
export type WorkflowStatus = 'needs-action' | 'pending' | 'accepted';

/**
 * How the resolve buttons on a `comparison` finding are labelled.
 * - `value`  → button reads the source value, e.g. "Use £4,250,000.00".
 * - `letter` → button reads "Use Value A" / "Use Value B".
 */
export type ResolveLabelStyle = 'value' | 'letter';

/** The control shown at the top-right of a finding card header. */
export type FindingHeaderAction = 'chevron' | 'kebab' | 'none';

/** A single evidence value extracted from a document, shown as a value box in the card. */
export interface FindingValueSource {
  /** Document / section label, e.g. "FORM OF AGREEMENT". */
  docName: string;
  /** The extracted value, e.g. "£4,250,000.00". */
  value: string;
  /** Page reference shown top-right, e.g. "PAGE 1". */
  page: string;
  /** Clause / item reference shown under the value, e.g. "CL. 3.1". */
  clause: string;
  /** Optional short label for the resolve button, e.g. "Main St" → "Use Main St". Defaults to `value`. */
  resolveLabel?: string;
  /* --- Fields used by the source viewer dialog (eye action) --- */
  /** SAS URL of the source document (`projectDocumentUrl`), used as a fallback. */
  documentUrl?: string;
  /** Document id (`projectDocumentId`) — resolves the signed file URL from the documents endpoint. */
  projectDocumentId?: string;
  /** Raw 1-based page number the value was extracted from. */
  pageNumber?: number;
  /** Source document file name (`reference`), shown in the viewer metadata. */
  documentName?: string;
  /** Human-readable document family (e.g. "Conditions"), shown as "Source" in the source viewer. */
  documentTypeLabel?: string;
}

export interface Finding {
  id: string;
  title: string;
  type: 'error' | 'warning' | 'passed';
  /** Raw API status (`projectKeyStatus`) — drives the card's status border colour. */
  keyStatus?: ProjectKeyStatus;
  category: string;
  field?: string;
  /** Which data-point tab this finding belongs to. */
  tab: DataPointTab;
  /** Card body layout — side-by-side comparison or a missing/not-found notice. */
  presentation: FindingPresentation;
  /** Distinct document-type labels behind this finding — drives the toolbar's document filter. */
  associatedDocs: string[];
  /**
   * Distinct source-document names behind this finding, deduplicated exactly as the drawer's
   * rows are, so the card's "N docs" badge, its hover tooltip and the drawer always agree.
   */
  documents?: string[];
  /** Evidence values for the `comparison` presentation. */
  sources?: FindingValueSource[];
  /** Free-text guidance shown beneath the value boxes / notice. Can be a single string or array for bullet points. */
  description: string | string[];
  /** Status label for the `missing` presentation, e.g. "Missing", "Not Found". */
  statusLabel?: string;
  /** Page reference shown for a `missing` finding, e.g. "PAGE 56". */
  page?: string;
  /** Resolve-button labelling for a `comparison` finding. Defaults to `value`. */
  resolveLabelStyle?: ResolveLabelStyle;
  /** Header-right control. Defaults to `chevron` (or `kebab` for warnings). */
  headerAction?: FindingHeaderAction;
  /** The already-agreed value from the API (`ProjectCrossReference.value`), if resolved. */
  resolvedValue?: string;
  /** Whether this finding is flagged as the contract route in the API. */
  isContractRoute?: boolean;
  /** Outlook conversation id once a clarification email has been sent; `null` before. */
  conversationId?: string | null;
  /** Raw API error message (`ProjectCrossReference.errorMessage`), shown in the source viewer. */
  errorMessage?: string | null;
  /** The user who resolved this finding (`ProjectCrossReference.resolvedBy`), if resolved. */
  resolvedBy?: ResolvedByUser | null;
  /** When the finding was resolved (`ProjectCrossReference.resolvedAt`), ISO string. */
  resolvedAt?: string | null;
  /** Id of the PMI already raised from this finding; drives the "View PMI" card action. */
  projectManagerInstructionId?: string | null;
}

export interface CrossReferenceMetrics {
  total: number;
  errors: number;
  warnings: number;
  passed: number;
}

/* ------------------------------------------------------------------ */
/* API shapes — GET /api/project-cross-references/{projectId}/unresolved/groups */
/* ------------------------------------------------------------------ */

// ProjectKeyCategory & ProjectKeyStatus enums live in the central
// constants/enum.constant.ts; re-exported here so local imports keep working.
export { ProjectKeyCategory, ProjectKeyStatus } from '@/constants/enum.constant';

import type { ProjectKeyCategory, ProjectKeyStatus } from '@/constants/enum.constant';

/**
 * The user who resolved a cross-reference conflict, embedded on a resolved
 * `ProjectCrossReference`. Only the fields the UI renders are typed; the backend
 * sends the full user record.
 */
export interface ResolvedByUser {
  id: string;
  email: string;
  fullName: string;
  jobTitle: string | null;
}

/** A single value extracted for a cross-reference key, from one document. */
export interface ProjectCrossReferenceKeyValue {
  id: string;
  value: string;
  page: number;
  reference: string;
  /** `ContractDocumentType` numeric code. */
  documentType: number;
  projectDocumentId: string;
  /** SAS URL of the source document, used by the source viewer dialog. */
  projectDocumentUrl?: string;
  projectCrossReferenceId: string;
}

/** One cross-reference check for a single data-point key. */
export interface ProjectCrossReference {
  id: string;
  projectKeyCategory: ProjectKeyCategory;
  checkType: number;
  projectKeyStatus: ProjectKeyStatus;
  key: string;
  label: string;
  /** The agreed value once the conflict is resolved; `null` while still unresolved. */
  value: string | null;
  /** Backend casing varies ("Error" / "error" / "ERROR"); compare case-insensitively. */
  errorType: string | null;
  errorMessage: string | null;
  description: string;
  isContractRoute: boolean;
  /** Conversation id of the clarification email thread; `null` until one is sent. */
  conversationId?: string | null;
  /** User who resolved the conflict; `null` while unresolved. */
  resolvedBy: ResolvedByUser | null;
  /** When the conflict was resolved (ISO string); `null` while unresolved. */
  resolvedAt: string | null;
  /** Id of the PMI raised from this conflict's agreed value; `null` until one is created. */
  projectManagerInstructionId?: string | null;
  projectCrossReferenceKeyValues: ProjectCrossReferenceKeyValue[];
}

/** Cross-reference checks grouped by data-point category (top-level response item). */
export interface ProjectCrossReferenceGroup {
  category: ProjectKeyCategory;
  projectCrossReferences: ProjectCrossReference[];
}

/* ------------------------------------------------------------------ */
/* API shape — GET /api/project-cross-references/{projectCrossReferenceId}/audit-trail */
/* ------------------------------------------------------------------ */

/**
 * A single logged action against a cross-reference (email sent, value changed,
 * resolved, etc.). The API sends no display label, so `actionType` (a PascalCase
 * string like `VerificationEmailSent`) is humanized for the timeline UI.
 */
export interface AuditTrailEntry {
  id: string;
  projectCrossReferenceId: string;
  actionType: string;
  performedBy: string;
  performedByUserFullName: string;
  /** ISO timestamp. */
  createdOn: string;
  previousValue: string | null;
  newValue: string | null;
  details: string;
  recipientEmail: string | null;
  conversationId: string | null;
}
