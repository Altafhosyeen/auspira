import type { DefectNoticeStatusValue, DefectNoticeTone } from '../types/defect-notice.types';
import { DefectNoticeStatus } from '../types/defect-notice.types';

// Module-owned endpoints — new features keep endpoints inside the module (same rule
// the PMI module's constants follow).
export const DEFECT_NOTICE_ENDPOINTS = {
  LIST_BY_PROJECT: '/api/defect-notices/project/:projectId',
  BY_ID: '/api/defect-notices/:id',
  CLOSE: '/api/defect-notices/close',
  REGISTER: '/api/defect-notices',
  ACCEPT: '/api/defect-notices/accept',
  // Detail-screen support — shared endpoints, same API the PMI/EW detail uses.
  AUDIT_TRAIL: '/api/audit-logs',
  PROJECT_ATTACHMENTS: '/api/attachments/:entityId/projects/:projectId',
  DOWNLOAD_ATTACHMENT: '/api/attachments/download',
  CONVERSATIONS: '/api/project-emails/:id/conversations',
  MEETINGS_BY_ENTITY: '/api/meetings/list/:entityId',
  CREATE_MEETING: '/api/meetings/defect-notice',
} as const;

export const DEFECT_NOTICE_REGISTER_COPY = {
  title: 'Defect Notice Register',
  addLabel: 'Add DN',
  exportLabel: 'Export',
  searchPlaceholder: 'Search by user, action or details...',
  filterLabel: 'Filter by Status',
  addMeetingRequestLabel: 'Add Meeting Request',
  tableEmptyTitle: 'No defect notices yet',
  tableEmptyDescription: 'Defects notified under the contract will appear here once raised.',
} as const;

// Upper case, like the Compensation Event and Request For Information registers —
// the three register headers are read as one table style, not three.
export const DEFECT_NOTICE_REGISTER_COLUMNS = {
  reference: 'DN REF',
  title: 'TITLE',
  raisedBy: 'RAISED BY',
  raisedAt: 'RAISED AT',
  dueDate: 'DUE DATE',
  status: 'STATUS',
} as const;

// The statuses a notice can actually hold in this app: accepting a signal opens one, and
// closing settles it. Not Accepted and Discard stay on the label/tone maps below so a
// record that ever arrives carrying one still renders, but neither is offered as a filter —
// there is no screen that puts a notice into either state.
export const DEFECT_NOTICE_REGISTER_STATUSES: DefectNoticeStatus[] = [
  DefectNoticeStatus.Open,
  DefectNoticeStatus.Closed,
];

/** Status code → display label, per the register design. */
export const DEFECT_NOTICE_STATUS_LABELS: Record<DefectNoticeStatusValue, string> = {
  [DefectNoticeStatus.Open]: 'Open',
  [DefectNoticeStatus.Closed]: 'Closed',
  [DefectNoticeStatus.NotAccepted]: 'Not Accepted',
  [DefectNoticeStatus.Discard]: 'Discarded',
};

/** Status code → badge tone. */
export const DEFECT_NOTICE_STATUS_TONES: Record<DefectNoticeStatusValue, DefectNoticeTone> = {
  [DefectNoticeStatus.Open]: 'info',
  [DefectNoticeStatus.Closed]: 'neutral',
  [DefectNoticeStatus.NotAccepted]: 'warning',
  [DefectNoticeStatus.Discard]: 'danger',
};

export const DEFECT_NOTICE_CLAUSE_OPTIONS = [
  { label: 'Cl. 17.1', value: 'Cl. 17.1' },
  { label: 'Cl. 43.1', value: 'Cl. 43.1' },
  { label: 'Cl. 44.1', value: 'Cl. 44.1' },
];

// What each clause actually says, keyed by the bare number so a value stored as "Cl. 17.1",
// "Clause 17.1" or "17.1" all resolve. Feeds the header pill's tooltip, which every other
// register explains its clause through rather than restating the number.
export const DEFECT_NOTICE_CLAUSE_DESCRIPTIONS: Record<string, string> = {
  '17.1': 'The Contractor notifies the Project Manager of a defect found in the works.',
  '43.1':
    'The Contractor corrects a defect whether or not the Supervisor has notified it, within the defect correction period.',
  '44.1':
    'The Contractor and the Project Manager may propose to the other that the Scope is changed so that a defect does not have to be corrected.',
};

export const DEFECT_NOTICE_EXPORT_COPY = {
  registerSheetName: 'Defect Notice Register',
  registerFileSuffix: 'Defect-Notice-Register',
  fileTimestampFormat: 'DD MMM YYYY HH-mm',
  fileNameFallback: 'project',
  empty: 'There are no defect notices to export.',
  failed: 'Could not export the register. Please try again.',
} as const;

// Keys are stable identifiers; the labels and their order follow the defect-notice design,
// which reads the record's own trail first and leaves Meetings at the end. The plural
// labels match the other detail screens' wording for the same tabs.
export const DEFECT_NOTICE_DETAIL_TABS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Email', label: 'Email Threads' },
  { key: 'Document', label: 'Documents' },
  { key: 'Audit Trial', label: 'Audit Trail' },
  { key: 'Meetings', label: 'Meetings' },
] as const;

export type DefectNoticeDetailTabKey = (typeof DEFECT_NOTICE_DETAIL_TABS)[number]['key'];

export const DEFECT_NOTICE_DETAIL_COPY = {
  titlePrefix: 'Defect Notice Details',
  notFound: 'This defect notice could not be found.',
  overviewBanner:
    'View and manage defect notices across the project, including their current status, correction progress, response deadlines and applicable contract clauses.',
  summaryTitle: 'DN Summary',
  referenceNumber: 'DN Reference',
  // Named for the register column the same address fills, so a reader matches the two up.
  raisedBy: 'Raised By',
  referenceClause: 'Reference Clause(s)',
  defectTitle: 'Defect Title',
  defectDescription: 'Defect Description',
} as const;

export const DEFECT_NOTICE_FORM_COPY = {
  title: 'Create Defect Notice',
  contractTag: 'NEC4 ECC',
  banner:
    "This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project's scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.",
  basicDetailsTitle: 'Basic Details',
  informationTitle: 'Information',
  uploadTitle: 'Upload Documents',
  to: 'To',
  cc: 'CC',
  bcc: 'BCC',
  ccPlaceholder: 'Add CC recipients',
  bccPlaceholder: 'Add BCC recipients',
  defectTitle: 'Defect Title',
  defectTitlePlaceholder: 'Add Title',
  defectDescription: 'Defect Description',
  defectDescriptionPlaceholder: 'Provide a clear, detailed description of the instruction',
  clauseReference: 'Clause Reference',
  uploadAction: 'Upload',
  submit: 'Notify',
  confirmTitle: 'Notify this Defect Notice?',
  submitted: 'The defect notice has been submitted.',
  submitFailed: 'Could not submit the defect notice. Please try again.',
} as const;
