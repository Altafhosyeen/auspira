import type {
  RequestForInformationStatus,
  RequestForInformationTone,
} from '../types/request-for-information.types';

// Module-owned endpoints — new features keep endpoints inside the module.
export const REQUEST_FOR_INFORMATION_ENDPOINTS = {
  LIST: '/api/rfis',
  LIST_BY_PROJECT: '/api/rfis/project/:projectId',
  BY_ID: '/api/rfis/:id',
  VERIFY_REFERENCE: '/api/rfis/verify-reference',
} as const;

// The backend RFI API is not live yet — the register falls back to
// `MOCK_REQUEST_FOR_INFORMATION_LIST` whenever a call errors or comes back empty, so the
// screen stays navigable during development. Flip off the moment the real API ships.
export const USE_MOCK_REQUEST_FOR_INFORMATION = true;

export const REQUEST_FOR_INFORMATION_REGISTER_STATUSES: RequestForInformationStatus[] = [
  'OPEN',
  'CLOSED',
];

export const REQUEST_FOR_INFORMATION_STATUS_LABELS: Record<RequestForInformationStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
};

export const REQUEST_FOR_INFORMATION_STATUS_TONES: Record<
  RequestForInformationStatus,
  RequestForInformationTone
> = {
  OPEN: 'info',
  CLOSED: 'neutral',
};

export const REQUEST_FOR_INFORMATION_STATUS_OPTIONS = REQUEST_FOR_INFORMATION_REGISTER_STATUSES.map(
  (status) => ({
    label: REQUEST_FOR_INFORMATION_STATUS_LABELS[status],
    value: status,
  })
);

export const REQUEST_FOR_INFORMATION_REGISTER_COPY = {
  title: 'RFI Register',
  bannerTitle: 'Request For Information Register',
  bannerDescription:
    'View and manage requests for information across the project, including their current status, due dates, issue dates and the party who raised them.',
  addLabel: 'Add RFI',
  exportLabel: 'Export',
  searchPlaceholder: 'Search by user, action or details...',
  filtersLabel: 'Filters',
  clearAllLabel: 'Clear all',
  clearAllDisabledReason: 'There is nothing to clear yet.',
  actionMenuAriaLabel: 'Row actions',
  createPmiLabel: 'Create PMI',
} as const;

export const REQUEST_FOR_INFORMATION_REGISTER_COLUMNS = {
  refAndTitle: 'RFI REF',
  raisedBy: 'RAISED BY',
  dueDate: 'DUE DATE',
  dateIssued: 'DATE ISSUED',
  status: 'STATUS',
  action: 'ACTION',
} as const;

export const REQUEST_FOR_INFORMATION_EXPORT_COPY = {
  registerSheetName: 'RFI Register',
  registerFileSuffix: 'RFI-Register',
  fileTimestampFormat: 'DD MMM YYYY HH-mm',
  fileNameFallback: 'project',
  empty: 'There are no information requests to export.',
  failed: 'Could not export the register. Please try again.',
} as const;

export const REQUEST_FOR_INFORMATION_FORM_COPY = {
  title: 'Create Request For Information',
  banner:
    'This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project’s scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.',
  basicDetailsTitle: 'Basic Details',
  requestDetailsTitle: 'Request For Information',
  rfiDetailsTitle: 'RFI Details',
  uploadTitle: 'Upload Documents',
  to: 'To',
  from: 'From',
  bcc: 'BCC',
  cc: 'CC',
  role: 'Role',
  dateIssued: 'Date Issued',
  projectName: 'Project Name',
  raisedTo: 'Raised To',
  rfiSubject: 'RFI Subject',
  rfiSubjectPlaceholder: 'Brief title of the Technical query...',
  rfiDetails: 'RFI Details',
  rfiDetailsPlaceholder: 'Provide a detailed description of the technical query...',
  drawingReferences: 'Drawing References',
  specificationReferences: 'Specification References',
  otherReferences: 'Other References',
  referencesPlaceholder: 'Drawing numbers, revisions etc.',
  proposedSolution: 'Proposed Solution (if any)',
  proposedSolutionPlaceholder: 'If you have a proposed solution, please describe it here...',
  responseRequiredBy: 'Response Required By',
  bccPlaceholder: 'Add BCC recipients',
  ccPlaceholder: 'Add CC recipients',
  uploadAction: 'Upload',
  submit: 'Create RFI',
  confirmTitle: 'Create this RFI?',
  submitted: 'The request for information has been submitted.',
  submitFailed: 'Could not submit the request. Please try again.',
} as const;

export const REQUEST_FOR_INFORMATION_DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'email-thread', label: 'Email Thread' },
  { key: 'document', label: 'Document' },
  { key: 'audit-trail', label: 'Audit Trail' },
] as const;

export type RequestForInformationDetailTabKey =
  (typeof REQUEST_FOR_INFORMATION_DETAIL_TABS)[number]['key'];

// The clause an RFI is raised under: NEC4 17.1 covers ambiguities and inconsistencies in
// the documents, which is what a request for information queries. Held here so the register,
// the detail header and the mocks all name it once.
export const REQUEST_FOR_INFORMATION_CLAUSE = {
  number: '17.1',
  description:
    'The Contractor or the Project Manager notifies the other as soon as either becomes aware of an ambiguity or inconsistency in or between the documents which are part of the contract.',
} as const;

export const REQUEST_FOR_INFORMATION_DETAIL_COPY = {
  titlePrefix: 'Request For Information Details',
  notFound: 'This request for information could not be found.',
  overviewBanner:
    'This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project’s scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.',
  descriptionTitle: 'Description',
  summaryTitle: 'RFI Summary',
  referenceNumber: 'TQ Reference',
  raisedBy: 'Raised By',
  raisedTo: 'Raised To',
  governingClause: 'Governing Clause',
  lifecycleTitle: 'Lifecycle',
} as const;

// The Lifecycle rail on the RFI detail screen. A step is reached once the record holds
// its date; `CLOSED` records complete every step, `OPEN` records stop at "Open".
export const REQUEST_FOR_INFORMATION_LIFECYCLE_STEPS = [
  { key: 'initiated', label: 'Initiated' },
  { key: 'open', label: 'Open' },
  { key: 'respond', label: 'Respond' },
  { key: 'close', label: 'Close' },
] as const;
