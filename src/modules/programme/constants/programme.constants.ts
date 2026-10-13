import type {
  ExtractedFieldStatus,
  NonAcceptanceReason,
  ProgrammeStatusTone,
  VarianceDirection,
} from '../types/programme.types';

// Module-owned endpoints. Program Health reads the shared ProjectAlert by id (the record the
// Awareness "Open" action navigates with, ProjectAlertType.Programee = 8) and the programme
// health register the backend started serving under /api/programme.
export const PROGRAMME_ENDPOINTS = {
  GET_BY_ID: '/api/programme/:id',
  LIST_BY_PROJECT: '/api/programme/project/:projectId',
  SUMMARY_BY_PROJECT: '/api/programme/project/:projectId/summary',
  ACCEPT: '/api/programme/accept',
  // Shared endpoint — the same one the PMI, Defect Notice and Daily Site Report modules
  // download through. The stored `fileUrl` is a private blob, so it cannot be opened
  // directly; the bytes are fetched server-side off that URL and saved by the caller.
  DOWNLOAD_ATTACHMENT: '/api/attachments/download',
} as const;

// Tab keys/order mirror the Figma "Program Health" detail screen (node 9785:46020 —
// Programme Received tab of a 7-tab strip). The Programme Register tab is deliberately not
// here: the register has its own screen, and the detail is the review of one revision.
export const PROGRAMME_DETAIL_TABS = [
  { key: 'ProgrammeReceived', label: 'Programme Received' },
  { key: 'ExtractAndCheck', label: 'Extract & Check' },
  { key: 'PmView', label: 'PM View' },
  { key: 'Variance', label: 'Variance' },
  { key: 'ClientObligations', label: 'Client Obligations' },
  { key: 'AcceptReject', label: 'Accept / Reject' },
] as const;

export type ProgrammeDetailTabKey = (typeof PROGRAMME_DETAIL_TABS)[number]['key'];

export const PROGRAMME_DETAIL_COPY = {
  titlePrefix: 'The Programme Arrives',
  notFound: 'This program health alert could not be found.',
  accepted: 'Programme accepted',
  banner:
    'Two channels, one record. Whichever way the programme comes in, Auspira creates the same programme matter and starts the same clock — because the reply period runs from submission, not from when anyone opens the file.',
  raisedBy: 'Raised By',
  dueDate: 'Due Date',
  // Read off the stored record when the alert behind it cannot be joined — the card still has
  // to say which programme it is describing.
  programmeReference: 'Programme Reference',
  revision: 'Revision',
  attachments: 'Attachments',
  attachmentsCaption: 'Source file retained unaltered against the matter',
} as const;

// "Extract & Check" tab (Figma node 9785:46258). Every row is derived from the submitted
// programme: `rows` names the table's five lines, `severityLabels` titles the schedule-health
// severities the extract reports in lower case.
export const PROGRAMME_EXTRACT_COPY = {
  title: 'Extraction and health check',
  extractedTableColumns: { title: 'Title', valueFound: 'Value found', status: 'Status' },
  rows: {
    keyDates: 'Key dates',
    sectionalCompletionDates: 'Sectional completion dates',
    completionDate: 'Completion Date',
    plannedCompletion: 'Planned Completion',
    activities: 'Activities needing the Client',
  },
  emptyValue: '—',
  referencesLabel: 'Activities',
  revisionPrefix: 'Extracted from',
  revisionRecordFallback: 'Programme',
  revisionFallback: 'Extracted from the submitted programme',
  severityLabels: {
    error: 'Error',
    warning: 'Warning',
    critical: 'Critical',
    info: 'Info',
  } as Record<string, string>,
  healthCheckTitle: 'AI programme health check',
  healthCategoryFallback: 'Health check',
  flagsCount: (count: number) => `${count} Flag${count === 1 ? '' : 's'}`,
} as const;

export const EXTRACTED_FIELD_STATUS_LABELS: Record<ExtractedFieldStatus, string> = {
  high: 'High',
  review: 'Review',
  missing: 'Missing',
};

// Background/text pairs straight from the Figma fills — green/orange/red status pills.
export const EXTRACTED_FIELD_STATUS_COLORS: Record<
  ExtractedFieldStatus,
  { background: string; text: string }
> = {
  high: { background: '#E1FAEF', text: '#0CBE73' },
  review: { background: '#FFEACF', text: '#F9480F' },
  missing: { background: '#FEE7EA', text: '#F60C0B' },
};

// "PM View" tab (Figma node 9785:46543). The contract dates and the key dates both come off
// `keyDatesAndMilestones`; each tile carries the reading that produced it.
export const PROGRAMME_PM_VIEW_COPY = {
  title: 'What the PM sees',
  contractDatesTitle: 'Contract Dates',
  contractDates: {
    completionDate: 'Completion Date',
    plannedCompletion: 'Planned Completion',
    startingDate: 'Starting Date',
    accessDate: 'Access Date',
    contractAwardSubmissionDate: 'Contract Award Submission',
  },
  contractDateCaptions: {
    completionDate: 'Contract completion, as reported in the variance assessment.',
    plannedCompletion: "The Contractor's own forecast completion in this revision.",
    startingDate: 'The starting date named in the submitted programme.',
    accessDate: 'The access date the Client is to give the Contractor.',
    contractAwardSubmissionDate: 'The contract award submission date on the programme.',
  },
  // The dedicated sectional table. Straight off `sectionalKeyDates`, listing each section against
  // its date and the status the backend now sends for it.
  sectionalTitle: 'Sectional Completions',
  sectionalCount: (dated: number, total: number) => `${dated} of ${total} dated`,
  sectionalColumns: {
    section: 'Section',
    reference: 'Reference',
    completionDate: 'Completion date',
    status: 'Status',
  },
} as const;

// The per-section status the extract now sends on each sectional key date, mapped to the pill
// the table renders. A value with no mapping is rendered from the raw text on the neutral tone,
// so a status the backend adds later is never dropped on the floor.
export const PROGRAMME_SECTIONAL_STATUS_VIEW: Record<
  string,
  { label: string; tone: ProgrammeStatusTone }
> = {
  completed: { label: 'Completed', tone: 'positive' },
  pending: { label: 'Pending', tone: 'warning' },
};

// Status pill palette shared by the table-driven tabs — green for holding, red for
// slippage, amber for an open action, grey for one not yet picked up. The first three
// reuse the Extract & Check fills so the tabs stay consistent.
export const PROGRAMME_STATUS_COLORS: Record<
  ProgrammeStatusTone,
  { background: string; text: string }
> = {
  positive: EXTRACTED_FIELD_STATUS_COLORS.high,
  negative: EXTRACTED_FIELD_STATUS_COLORS.missing,
  warning: EXTRACTED_FIELD_STATUS_COLORS.review,
  neutral: { background: '#EDEEF0', text: '#667085' },
};

// "Variance" tab (Figma node 9785:46837). The figures come off the submitted programme: the
// baseline comparison for the dates strip, and the critical path for the float position.
export const PROGRAMME_VARIANCE_COPY = {
  title: 'Variance',
  dates: {
    completionDate: 'Completion Date',
    plannedCompletion: 'Planned Completion',
    variance: 'Variance',
  },
  terminalFloatLabel: 'Terminal float',
  floatBasis: 'Based on critical path activity',
  finishLabel: 'finish',
  noFloatNote: 'This revision names no terminal float on its critical path.',
  changeNotes: {
    completionChange: 'Completion change',
    criticalPathChange: 'Critical path change',
    activitiesAdded: 'Activities added',
    activitiesRemoved: 'Activities removed',
    activitiesMoved: 'Activities moved',
  },
  changeNoteCaption: 'Measured against the accepted baseline.',
} as const;

// The terminal-float banner is green when the Contractor is ahead and red when behind —
// same two tones as the PM View pills, at a softer weight for a full-width band. Which one
// applies follows the extracted programme, not a user selection.
export const VARIANCE_BANNER_COLORS: Record<
  VarianceDirection,
  { background: string; text: string }
> = {
  ahead: { background: '#D7F7E7', text: '#0CBE73' },
  behind: { background: '#FEE7EA', text: '#F60C0B' },
};

// "Client Obligations" tab — one table per `obligations.sections` entry, listing what the
// Client owes the programme and the clause each item rests on.
export const PROGRAMME_CLIENT_OBLIGATIONS_COPY = {
  title: 'Client obligations',
  untitledSection: 'Obligations',
  count: (count: number) => `${count} obligation${count === 1 ? '' : 's'}`,
  columns: {
    description: 'Obligation',
    clauseNumber: 'Clause',
    owner: 'Owner',
    dueDate: 'Due',
  },
} as const;

// "Accept / Reject" tab — the PM's Cl. 31.3 decision on the submitted programme. The clauses
// the decision itself rests on, and the four grounds the contract gives for not accepting.
export const PROGRAMME_ACCEPT_REJECT_CLAUSES = ['31.3', '13.4'];

export const PROGRAMME_NON_ACCEPTANCE_GROUNDS: NonAcceptanceReason[] = [
  {
    key: 'not-practicable',
    label: "The Contractor's plans which it shows are not practicable",
  },
  {
    key: 'missing-information',
    label: 'It does not show the information which the contract requires',
  },
  {
    key: 'not-realistic',
    label: "It does not represent the Contractor's plans realistically",
  },
  {
    key: 'scope-non-compliance',
    label: 'It does not comply with the Scope',
  },
];

export const PROGRAMME_ACCEPT_REJECT_COPY = {
  title: 'Accept / Reject',
  reasonsTitle: 'Reasons for not accepting — select all that apply',
  accept: 'Accept programme',
  notifyNonAcceptance: 'Notify non-acceptance',
  justificationPlaceholder: 'State why this applies...',
  // Non-acceptance has to cite a ground, so the reject action stays shut until one is ticked.
  notifyDisabledHint: 'Select at least one reason to notify non-acceptance',
  // Accepting while grounds are ticked would contradict the decision being recorded.
  acceptDisabledHint: 'Clear the selected reasons to accept the programme',
  // Every cited ground carries its own justification into the notification.
  justificationRequiredHint: 'Justify every selected reason to notify non-acceptance',
  selectionSummary: (count: number) =>
    `${count} reason${count === 1 ? '' : 's'} selected. Each needs its own justification before the notification can issue.`,
  // Shown in place of the actions once the decision is already on the register — accepting
  // again would overwrite a decision the PM has already made.
  decisionRecorded: (decision: string) =>
    `Decision recorded — ${decision}. The accept and non-acceptance actions are closed for this revision; the outcome is on the Programme Register.`,
} as const;

// The detail tabs lay their tables out by hand rather than with an antd Table, so each table
// supplies its own empty state — the same treatment the register tables get from `emptyText`.
// A card that renders only its header reads as a broken screen, not an empty one.
export const PROGRAMME_TAB_EMPTY_COPY = {
  extractedFields: {
    title: 'No values extracted',
    description: 'Contract values read off the submitted programme will appear here.',
  },
  // An empty health check is the good outcome, not a missing one — hence the success tone.
  healthCheck: {
    title: 'No health issues found',
    description: 'The health check has nothing to flag on this revision.',
  },
  contractDates: {
    title: 'No contract dates',
    description: 'Dates taken from the accepted programme will appear here.',
  },
  sectionalCompletions: {
    title: 'No sectional completions',
    description: 'Sections named in this revision will be listed here against their dates.',
  },
  obligations: {
    title: 'No client obligations',
    description: 'Obligations the Client owes against this programme will appear here.',
  },
  varianceNotes: {
    title: 'No float or damages notes',
    description: 'Notes explaining the float and any damages position will appear here.',
  },
} as const;

// "Programme Register" — every revision submitted on this project, newest first. The register
// is served by GET /api/programme/project/{projectId}/summary, so the list screen and the
// detail tab both render straight off the API.

// Mirrors the backend `ProgrammeHealthStatus` enum. Named here because the decision the Accept /
// Reject tab records is a status on the stored record, not a field on the record itself.
export const PROGRAMME_HEALTH_STATUS = {
  Open: 0,
  Accepted: 1,
  NotAccepted: 2,
  Discard: 3,
} as const;

// Backend enums from ProgrammeHealthStatus and ProgrammeHealthCheck.
export const PROGRAMME_STATUS_LABELS: Record<number, string> = {
  0: 'Open',
  1: 'Accepted',
  2: 'Not Accepted',
  3: 'Discarded',
};

export const PROGRAMME_STATUS_TONES: Record<number, ProgrammeStatusTone> = {
  0: 'warning',
  1: 'positive',
  2: 'negative',
  3: 'neutral',
};

// The lifecycle tag on the Programme Received card, off the alert's own `alertStatus`. Not to
// be confused with PROGRAMME_STATUS_LABELS above — that is the stored programme record's
// decision (Open/Accepted/NotAccepted/Discard), this is where the *signal* stands. `Unknown` is
// deliberately absent: a code the backend has not named is noise on a heading, so it gives no
// tag rather than a "Unknown" one.
export const PROGRAMME_ALERT_STATUS_LABELS: Record<number, string> = {
  1: 'Reviewed',
  2: 'Unreviewed',
  3: 'Dismissed',
  4: 'Registered',
  5: 'In Progress',
  6: 'Closed',
  7: 'Overdue',
  8: 'Excepted',
};

// Amber while the signal still wants the PM's attention, red once it is overdue, green once it
// has been promoted into a register, grey once it has settled without one.
export const PROGRAMME_ALERT_STATUS_TONES: Record<number, ProgrammeStatusTone> = {
  1: 'neutral',
  2: 'warning',
  3: 'neutral',
  4: 'positive',
  5: 'warning',
  6: 'neutral',
  7: 'negative',
  8: 'positive',
};

/** Alert status code → tag label, or undefined for one nothing has named. */
export const programmeAlertStatusLabel = (code?: number | null): string | undefined =>
  code === null || code === undefined ? undefined : PROGRAMME_ALERT_STATUS_LABELS[code];

/** Alert status code → tag tone, neutral for one nothing has assigned a meaning to. */
export const programmeAlertStatusTone = (code?: number | null): ProgrammeStatusTone =>
  (code === null || code === undefined ? undefined : PROGRAMME_ALERT_STATUS_TONES[code]) ??
  'neutral';

export const PROGRAMME_HEALTH_LABELS: Record<number, string> = {
  0: 'On Track',
  1: 'At Risk',
  2: 'Behind',
};

export const PROGRAMME_HEALTH_TONES: Record<number, ProgrammeStatusTone> = {
  0: 'positive',
  1: 'warning',
  2: 'negative',
};

/** Status code → display label, falling back to the code for a value the API does not name. */
export const programmeStatusLabel = (code: number): string =>
  PROGRAMME_STATUS_LABELS[code] ?? `Status ${code}`;

/** Status code → pill tone, neutral for a value the API does not name. */
export const programmeStatusTone = (code: number): ProgrammeStatusTone =>
  PROGRAMME_STATUS_TONES[code] ?? 'neutral';

/** True once the register reports the revision as accepted — the Cl. 31.3 decision is recorded. */
export const isProgrammeAccepted = (code?: number): boolean =>
  code === PROGRAMME_HEALTH_STATUS.Accepted;

/** Health code → display label, falling back to the code for an unnamed indicator. */
export const programmeHealthLabel = (code: number): string =>
  PROGRAMME_HEALTH_LABELS[code] ?? `Health ${code}`;

/** Health code → pill tone, neutral for an unnamed indicator. */
export const programmeHealthTone = (code: number): ProgrammeStatusTone =>
  PROGRAMME_HEALTH_TONES[code] ?? 'neutral';

// The register's status filter is built from the codes actually present in the fetched page,
// since no enum exists to enumerate them from. Sorted so the options never reorder mid-session.
export const programmeStatusFilterOptions = (rows: { statusCode?: number }[]) => {
  const codes = [...new Set(rows.map((row) => row.statusCode))]
    .filter((code): code is number => code !== undefined)
    .sort((a, b) => a - b);

  return codes.map((code) => ({ value: code, label: programmeStatusLabel(code) }));
};

// Evaluates variance days: behind tints red, ahead tints green, no measured movement is
// neutral. The rule is the sign of the movement — days < 0 is behind, days > 0 is ahead — but
// the summary API reports the magnitude unsigned and carries the direction in the wording
// ("205 day(s) behind programme"), so the wording is read first: keying off the number alone
// would tint a 205-day slip green. A signed number is still honoured when one is sent.
export const programmeVarianceTone = (variance: string): ProgrammeStatusTone => {
  if (!variance) return 'neutral';
  const trimmed = variance.trim();
  const lowered = trimmed.toLowerCase();

  if (/\bbehind\b/.test(lowered)) return 'negative';
  if (/\bahead\b/.test(lowered)) return 'positive';

  const match = trimmed.match(/([+-]?\s*\d+(?:\.\d+)?)/);
  if (match) {
    const days = parseFloat(match[1].replace(/\s+/g, ''));
    if (days < 0) return 'negative';
    if (days > 0) return 'positive';
    return 'neutral';
  }
  if (trimmed.startsWith('-')) return 'negative';
  if (trimmed.startsWith('+')) return 'positive';
  return 'neutral';
};

export const PROGRAMME_REGISTER_COPY = {
  title: 'Programme Register',
  searchPlaceholder: 'Search by reference, user or details...',
  filterLabel: 'Filter by Status',
  clearAll: 'Clear all',
  clearAllDisabledReason: 'There is nothing to clear yet.',
  empty: 'No programme revisions match the current search or filters.',
  emptyStateTitle: 'No programme revisions yet',
  emptyStateDescription:
    'Programmes accepted from an awareness signal will appear here once stored.',
  download: 'Download the submitted programme',
  noFile: 'No file is attached to this revision',
  exportLabel: 'Export',
  columns: {
    reference: 'PRG REF',
    completionDate: 'COMPLETION DATE',
    variance: 'VARIANCE',
    health: 'HEALTH',
    raisedBy: 'RAISED BY',
    raisedAt: 'RAISED AT',
    status: 'STATUS',
    action: 'ACTION',
  },
} as const;

export const PROGRAMME_REGISTER_EXPORT_COPY = {
  registerSheetName: 'Programme Register',
  registerFileSuffix: 'Programme-Register',
  fileTimestampFormat: 'DD MMM YYYY HH-mm',
  fileNameFallback: 'project',
  empty: 'There are no programme revisions to export.',
  failed: 'Could not export the register. Please try again.',
} as const;
