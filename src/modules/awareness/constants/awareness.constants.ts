import { APP_COLORS, APP_THEME } from '@/constants/app.theme';
import type { FilterTab } from '../types/awareness.types';

// Module-owned endpoint — the awareness/triage list over project alerts.
export const AWARENESS_ENDPOINTS = {
  LIST_BY_PROJECT: '/api/project-alerts/project/:projectId',
  BY_ID: '/api/project-alerts/:id',
  ACCEPT: '/api/early-warnings/accept',
  // Compensation Events have their own accept — it creates the CE from the alert.
  ACCEPT_COMPENSATION_EVENT: '/api/compensation-events/accept',
  NOT_ACCEPTED: '/api/project-alerts/:projectAlertId/not-accepted',
  DISCARD: '/api/project-alerts/:id',
} as const;

// Shared antd theme + palette (single source in src/constants/app.theme).
export const AWARENESS_PALETTE = APP_COLORS;
export const AWARENESS_THEME = APP_THEME;

export const AWARENESS_COPY = {
  title: 'All Awareness',
  banner:
    'View and manage compensation events across the project, including their current status, quotation value, time impact, response deadlines and applicable contract clauses.',
  searchPlaceholder: 'Search Signals…',
  showing: 'Showing',
  of: 'of',
  activities: 'activities',
  loadMore: 'Load More',
  // Three distinct empty states — the list is gated on a selected project, so a blank
  // table means "pick a project" far more often than it means "nothing matched".
  empty: {
    noProject: 'Select a project to view its awareness.',
    noSignals: 'No awareness have been raised on this project yet.',
    noMatches: 'No awareness match your filters.',
  },
  columns: {
    source: 'SOURCE',
    signal: 'SIGNAL',
    reference: 'REFERENCE NO.',
    route: 'SUGGESTED ROUTE',
    dueDate: 'DUE DATE',
    received: 'RECEIVED',
  },
} as const;

export const AWARENESS_FILTER_TABS: { key: FilterTab; label: string; count?: number }[] = [
  { key: 'all', label: 'All' },
  { key: 'early-warning', label: 'EW' },
  { key: 'pmi', label: 'PMI' },
  { key: 'compensation', label: 'CE' },
  { key: 'tq', label: 'TQ' },
];

// Compensation Event review (alertType 3) — the screen reads as a CE notice, not an
// Early Warning, so title, banner, assessment wording and actions all differ.
export const AWARENESS_CE_COPY = {
  title: 'Review - Compensation Event Email',
  // The alert's own title when it sent one, the generic heading otherwise.
  reviewTitle: (alertTitle?: string | null) =>
    alertTitle?.trim() ? `Review - ${alertTitle.trim()}` : 'Review - Compensation Event Email',
  clauseNumber: '61.3',
  banner:
    'This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project’s scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.',
  emailCard: 'Contractor Email - As Received',
  assessment: {
    title: 'AUSPIRA ASSESSMENT — WHAT WAS DETECTED',
    // Shown only when the extractor sent no precis of its own — never invents a finding.
    intro: 'Auspira has not recorded an assessment for this signal.',
    // The note prefixes whatever mitigation the extractor read out of the mail.
    notePrefix: 'Note: Mitigation identified:',
  },
  uploadDocuments: 'Upload Documents',
  upload: {
    button: 'Upload',
    view: 'View',
    remove: 'Remove',
    empty: 'No documents uploaded yet.',
    hint: 'PDF, Word or Excel only.',
    rejected: (name: string) =>
      `${name} was not added — only PDF, Word and Excel files are allowed.`,
    duplicate: (name: string) =>
      `${name} was not added — a file with that name is already uploaded.`,
  },
  clauseSection: 'Reason',
  // Names what the score is confidence *in* — the tier label reads "…likely a Compensation Event".
  confidenceSubject: 'Compensation Event',
  clausePlaceholder: 'Select Reason',
  comment: 'Comment',
  commentPlaceholder: 'Add a reason for not accepting...',
  actions: {
    discard: 'Discard',
    notAccepted: 'Not Accepted',
    clauseRequired: 'Select a reason before marking this event Not Accepted.',
    commentRequired: 'Add a comment before discarding.',
    // Shown on the locked row so the greyed-out buttons read as a closed window rather than
    // a broken screen.
    overdue: 'The time bar for this signal has expired — it can no longer be reviewed.',
    accepted: 'Accepted',
  },
} as const;

// The assessment card on the signal review screen. Shown for every alert type that screen
// handles, whenever the extractor read something out of the mail — the bullets it used to carry
// were invented Early Warning findings, and the backend sends the real ones on the payload.
export const AWARENESS_ASSESSMENT_COPY = {
  title: 'AUSPIRA ASSESSMENT — WHAT WAS DETECTED AND WHY',
  potentialImpacts: 'Potential impacts',
  keyDatesAffected: 'Key dates affected',
  proposedActions: 'Proposed actions',
  // The closing caveat. Auspira's reading is never the PM's decision, so this line is policy
  // copy no field on the alert carries — but the clause it cites is the alert's own
  // `clauseNumber`, not a literal, and drops out entirely when the alert names none.
  ewNote: (clause: string) =>
    `Note: Auspira cannot confirm this is a valid Early Warning${clause} — that is a contractual decision for you as PM.`,
  ewClause: (number: string) => ` under Clause ${number}`,
  genericNote:
    'Note: this is Auspira’s reading of the signal, not a contractual decision — that stays with you as PM.',
} as const;

// Popconfirm copy for the review decision rows. Every decision is one-way, so each button asks
// once before it runs. Titles name the record type; the description is the alert's own title.
export const AWARENESS_DECISION_CONFIRM = {
  discard: {
    title: (type: string) => `Discard this ${type}?`,
    okText: 'Discard',
  },
  confirm: {
    title: (type: string) => `Confirm this ${type}?`,
    okText: 'Confirm',
  },
  notAccepted: {
    title: 'Record as not accepted?',
    okText: 'Not Accepted',
  },
  accepted: {
    title: 'Accept as a Compensation Event?',
    okText: 'Accept',
  },
  cancelText: 'Cancel',
} as const;

// Evidence uploads are limited to the document types the assessment team can actually open.
// `accept` drives the file picker's filter; the extension list is the real gate, since a
// picker filter can be bypassed by drag-and-drop or "All files".
export const AWARENESS_CE_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const AWARENESS_CE_ALLOWED_UPLOAD_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
] as const;

// NEC4 Cl.61.3 tests the PM applies when deciding whether the event is a compensation
// event. Static until the backend serves a per-project clause list.
export const AWARENESS_CE_CLAUSE_OPTIONS = [
  'Arises from a fault of the Contractor',
  'Has not happened and is not expected to happen',
  'Has not been notified within the timescales set out in these conditions of contract',
  'Has no effect upon the Direct Costs, Completion or meeting a Key Date',
  'Is not one of the compensation events stated in the Contract',
] as const;
