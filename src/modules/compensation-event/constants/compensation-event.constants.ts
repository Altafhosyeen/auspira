import { CompensationEventStatus as CompensationEventStatusCode } from '@/constants/enum.constant';
import type {
  CompensationEventAuditAction,
  CompensationEventLegacyStatus,
  CompensationEventRegisterState,
  CompensationEventStatus,
  CompensationEventTone,
} from '../types/compensation-event.types';

// Module-owned endpoints — new features keep endpoints inside the module.
export const COMPENSATION_EVENT_ENDPOINTS = {
  LIST: '/api/compensation-events',
  LIST_BY_PROJECT: '/api/compensation-events/project/:projectId',
  LOOKUP_BY_PROJECT: '/api/compensation-events/project/:projectId/lookup',
  // Quoted value/days totalled across the project's accepted or assessed events —
  // the register's summary tiles, totalled by the backend rather than client-side.
  TOTALS_BY_PROJECT: '/api/compensation-events/project/:projectId/totals',
  BY_ID: '/api/compensation-events/:id',
  FINANCIAL: '/api/compensation-events/:id/financial',
  VERIFY_REFERENCE: '/api/compensation-events/verify-reference',
} as const;

// Accept/revision/proceed are keyed on the project alert the quotation arrived on, not
// the CE; the compensation-event lookup is the Quotation screen's read side.
export const QUOTATION_ENDPOINTS = {
  ACCEPT: '/api/quotations/accept',
  CONFIRM: '/api/quotations/confirm',
  REQUEST_REVISION: '/api/quotations/request-revision',
  PROCEED_WITH_ASSESSMENT: '/api/quotations/proceed-with-assessment',
  LIST_BY_COMPENSATION_EVENT: '/api/quotations/compensation-event/:compensationEventId',
  // One quotation with its nested items — what the register's View Quotation link opens.
  GET_BY_ID: '/api/quotations/:id',
} as const;

// The clause catalogue the notice form picks from — configured per project.
export const EVENT_CLAUSE_ENDPOINTS = {
  LIST_BY_PROJECT: '/api/event-clauses/project/:projectId',
} as const;

// Email threads are entity-agnostic on the backend; the Email Thread tab scopes them to
// a compensation event id. GET /api/project-emails/thread itself is shared, generic
// infra — reused directly from `@/hooks/modules/project` rather than duplicated here.
export const PROJECT_EMAIL_ENDPOINTS = {
  CONVERSATIONS_BY_ENTITY: '/api/project-emails/:entityId/conversations',
} as const;

// Attachments are entity-agnostic too — the Documents tab lists them for the CE entity
// and downloads each file through the shared download endpoint.
export const ATTACHMENT_ENDPOINTS = {
  LIST_BY_ENTITY: '/api/attachments/:entityId/projects/:projectId',
  DOWNLOAD: '/api/attachments/download',
} as const;

export const COMPENSATION_EVENT_REGISTER_STATES: CompensationEventRegisterState[] = [
  'DRAFT',
  'QUOTATION_TO_BE_SUBMITTED',
  'QUOTATION_SUBMITTED',
  'IMPLEMENTED',
  'REVISED_QUOTATION_TO_BE_SUBMITTED',
  'PROJECT_MANAGER_ASSESSMENT',
  'EXTENSION_OF_TIME_REQUESTED',
  'NOT_ACCEPTED',
  'DISCARDED',
];

export const COMPENSATION_EVENT_STATUS_LABELS: Record<CompensationEventStatus, string> = {
  DRAFT: 'Draft',
  QUOTATION_TO_BE_SUBMITTED: 'Quotation to be submitted',
  QUOTATION_SUBMITTED: 'Quotation submitted',
  IMPLEMENTED: 'Implemented',
  REVISED_QUOTATION_TO_BE_SUBMITTED: 'Revised quotation to be submitted',
  PROJECT_MANAGER_ASSESSMENT: 'Project manager assessment',
  EXTENSION_OF_TIME_REQUESTED: 'Extension of time requested',
  NOT_ACCEPTED: 'Not accepted',
  DISCARDED: 'Discarded',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAID: 'Paid',
};

export const COMPENSATION_EVENT_STATUS_COLORS: Record<CompensationEventStatus, string> = {
  DRAFT: 'default',
  QUOTATION_TO_BE_SUBMITTED: 'green',
  QUOTATION_SUBMITTED: 'orange',
  IMPLEMENTED: 'green',
  REVISED_QUOTATION_TO_BE_SUBMITTED: 'yellow',
  PROJECT_MANAGER_ASSESSMENT: 'blue',
  EXTENSION_OF_TIME_REQUESTED: 'purple',
  NOT_ACCEPTED: 'red',
  DISCARDED: 'default',
  SUBMITTED: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
  PAID: 'purple',
};

// Legacy API values fold into the register vocabulary for display.
export const COMPENSATION_EVENT_LEGACY_STATE_MAP: Record<
  CompensationEventLegacyStatus,
  CompensationEventRegisterState
> = {
  SUBMITTED: 'QUOTATION_SUBMITTED',
  APPROVED: 'IMPLEMENTED',
  REJECTED: 'REVISED_QUOTATION_TO_BE_SUBMITTED',
  PAID: 'IMPLEMENTED',
};

export const COMPENSATION_EVENT_STATE_TONES: Record<
  CompensationEventRegisterState,
  CompensationEventTone
> = {
  DRAFT: 'neutral',
  QUOTATION_TO_BE_SUBMITTED: 'success',
  QUOTATION_SUBMITTED: 'warning',
  IMPLEMENTED: 'success',
  REVISED_QUOTATION_TO_BE_SUBMITTED: 'warning',
  PROJECT_MANAGER_ASSESSMENT: 'warning',
  EXTENSION_OF_TIME_REQUESTED: 'warning',
  NOT_ACCEPTED: 'danger',
  DISCARDED: 'neutral',
};

// The backend's numeric `status` (CompensationEventStatus in enum.constant.ts) is the
// authoritative source — the register state and display label are both derived from it,
// so the table stops guessing at raw `statusName` wording (e.g. code 5 is always
// QuotationRequested, whatever text the API happens to send alongside it).
export const COMPENSATION_EVENT_STATUS_CODE_TO_STATE: Record<
  CompensationEventStatusCode,
  CompensationEventRegisterState
> = {
  [CompensationEventStatusCode.Draft]: 'DRAFT',
  [CompensationEventStatusCode.AwaitingPMDecision]: 'PROJECT_MANAGER_ASSESSMENT',
  [CompensationEventStatusCode.NotAccepted]: 'NOT_ACCEPTED',
  [CompensationEventStatusCode.Accepted]: 'QUOTATION_TO_BE_SUBMITTED',
  [CompensationEventStatusCode.QuotationRequested]: 'QUOTATION_TO_BE_SUBMITTED',
  [CompensationEventStatusCode.QuotationInProgress]: 'QUOTATION_TO_BE_SUBMITTED',
  [CompensationEventStatusCode.QuotationSubmitted]: 'QUOTATION_SUBMITTED',
  [CompensationEventStatusCode.UnderAssessment]: 'PROJECT_MANAGER_ASSESSMENT',
  [CompensationEventStatusCode.RevisionRequested]: 'REVISED_QUOTATION_TO_BE_SUBMITTED',
  [CompensationEventStatusCode.Implemented]: 'IMPLEMENTED',
  [CompensationEventStatusCode.Closed]: 'IMPLEMENTED',
  [CompensationEventStatusCode.Discard]: 'DISCARDED',
};

// "QuotationRequested" -> "Quotation Requested" — splits on a lower→upper boundary and on
// a run of caps followed by a Titlecase word, so an acronym like "PM" stays one word
// ("AwaitingPMDecision" -> "Awaiting PM Decision").
const splitPascalCase = (value: string): string =>
  value.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

export const COMPENSATION_EVENT_STATUS_CODE_LABELS: Record<CompensationEventStatusCode, string> =
  Object.fromEntries(
    Object.entries(CompensationEventStatusCode)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([name, code]) => [code, splitPascalCase(name)])
  ) as Record<CompensationEventStatusCode, string>;

// The register's Filters dropdown lists the backend's own CompensationEventStatus values
// and nothing else, so a picked filter is exactly one status code rather than a UI grouping
// that fans out to several. Ordered by the enum's own numbering.
export const COMPENSATION_EVENT_STATUS_FILTER_CODES: CompensationEventStatusCode[] = Object.values(
  CompensationEventStatusCode
).filter((value): value is CompensationEventStatusCode => typeof value === 'number');

export const COMPENSATION_EVENT_STATUS_OPTIONS = COMPENSATION_EVENT_REGISTER_STATES.map(
  (state) => ({
    label: COMPENSATION_EVENT_STATUS_LABELS[state],
    value: state,
  })
);

// Shape of the clause chip every workflow header prints — the numbers themselves are read
// off the record, never written here.
export const COMPENSATION_EVENT_CLAUSE_CHIP = {
  prefix: 'CL.',
  separator: ' / ',
  // Sits between a reference and the clause it names: "CE-004 – Cost and time impact".
  detailSeparator: ' – ',
  // Past this the chip stops naming clauses and counts them, so the title keeps its room.
  maxLabelClauses: 3,
  maxTooltipLines: 6,
  moreSuffix: ' +',
  ariaLabel: 'Contract clauses',
} as const;

export const COMPENSATION_EVENT_REGISTER_COPY = {
  title: 'Compensation Event Register',
  addLabel: 'Add CE',
  exportLabel: 'Export',
  allLabel: 'All',
  description:
    'View and manage compensation events across the project, including their current status, quotation value, time impact, response deadlines and applicable contract clauses.',
  searchPlaceholder: 'Search by status reference or subject...',
  filtersLabel: 'Filters',
  clearAllLabel: 'Clear all',
  clearAllDisabledReason: 'There is nothing to clear yet.',
  loadMoreLabel: 'Load More',
  viewQuotationLabel: 'View Quotation',
  quotationMenuAriaLabel: 'View quotations',
  quotationMenuSendFormResponseLabel: 'View Quotation',
  activityTitle: 'Recent Activity',
  viewAllLabel: 'View all',
  noteFollowUp:
    'Clicking it opens the next screen - the CE Detail with quote history and decision state.',
} as const;

// Recent Activity reads "<actor> <phrase> <reference>", so each phrase carries its own
// connector — the ones that read as a verb on the CE itself need none, the rest end in
// "for"/"on"/"to".
export const COMPENSATION_EVENT_ACTIVITY_PHRASES: Record<CompensationEventAuditAction, string> = {
  CREATED: 'raised',
  DETECTED: 'detected',
  LIFECYCLE_COMPLETED: 'completed the lifecycle for',
  MITIGATION_AGREED: 'agreed mitigation for',
  RISK_REDUCTION_MEETING_INVITE_SENT: 'sent a meeting invite for',
  UPDATED: 'updated',
  STATUS_CHANGED: 'changed the status of',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  DOCUMENT_UPLOADED: 'uploaded a document for',
  EVIDENCE_ADDED: 'added evidence for',
  DECISION_RECORDED: 'recorded a decision on',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REVISION_REQUESTED: 'requested a revision to',
  REJECTED: 'rejected',
  IMPLEMENTED: 'implemented',
  CLOSED: 'closed',
  COMMENT_ADDED: 'commented on',
  ACCEPTED: 'accepted',
  CONFIRMED: 'confirmed',
  NOT_ACCEPTED: 'did not accept',
  DISCARDED: 'discarded',
};

// Register summary strip — Total Quotation Value and Total Duration Impact tiles above
// the toolbar/table. `quotations`/`events` are pluralised at render time from a count.
export const COMPENSATION_EVENT_REGISTER_SUMMARY_COPY = {
  quotationValueLabel: 'Total Quotation Value',
  quotationValueSubtitle: 'Combined value of compensation event quotations',
  quotationCountSuffix: (count: number) => `${count} quotation${count === 1 ? '' : 's'}`,
  durationImpactLabel: 'Total Duration Impact',
  durationImpactSubtitle: 'Combined impact on the project programme',
  durationCountSuffix: (count: number) =>
    `Across ${count} compensation event${count === 1 ? '' : 's'}`,
} as const;

export const COMPENSATION_EVENT_REGISTER_COLUMNS = {
  refAndSubject: 'CE REF',
  subject: 'TITLE',
  parentEarlyWarning: 'PARENT EW',
  state: 'STATUS',
  raisedAt: 'RAISED AT',
  quoteValue: 'QUOTE VALUE',
  timeImpact: 'DURATION',
  reply: 'TIME BAR',
  clauses: 'CLAUSES',
  action: 'ACTION',
} as const;

// Excel export — the register's workbook and the labels the PM Assessment sheet
// puts under its priced rows. The timestamp keeps repeat exports from overwriting
// each other in the browser's downloads folder.
export const COMPENSATION_EVENT_EXPORT_COPY = {
  registerSheetName: 'Compensation Events',
  registerFileSuffix: 'CE-Register',
  assessmentSheetName: 'PM Assessment',
  assessmentFileSuffix: 'PM-Assessment',
  fileTimestampFormat: 'DD MMM YYYY HH-mm',
  fileNameFallback: 'project',
  assessedTotal: 'Assessed total',
  proposedDays: 'Proposed time impact (days)',
  pmComment: 'PM comment',
  empty: 'There are no compensation events to export.',
  failed: 'Could not export the register. Please try again.',
} as const;
