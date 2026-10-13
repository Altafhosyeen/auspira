import type { EarlyWarningImpact, EarlyWarningRegisterStatus } from '../types/early-warning.types';

// Module-owned endpoints — new features keep endpoints inside the module.
export const EARLY_WARNING_ENDPOINTS = {
  REGISTER: '/api/early-warnings',
  LIST_BY_PROJECT: '/api/early-warnings/project/:projectId',
  LOOKUP_BY_PROJECT: '/api/early-warnings/project/:projectId/lookup',
  BY_ID: '/api/early-warnings/:id',
  VERIFY_REFERENCE: '/api/early-warnings/verify-reference',
  PROJECT_ATTACHMENTS: '/api/attachments/:entityId/projects/:projectId',
  DOWNLOAD_ATTACHMENT: '/api/attachments/download',
  AUDIT_TRAIL: '/api/audit-logs',
  CONVERSATIONS: '/api/project-emails/:id/conversations',
  MITIGATION_AGREED: '/api/early-warnings/:id/mitigation-agreed',
  CLOSE: '/api/early-warnings/close',
  RRM_DETAIL: '/api/risk-reduction-meetings/:riskReductionMeetingId',
  RRM_BY_EARLY_WARNING: '/api/risk-reduction-meetings/early-warning/:earlyWarningId',
  RRM_AGREED_ACTION_COMPLETE:
    '/api/risk-reduction-meetings/agreed-actions/:agreedActionId/complete',
  AGREED_ACTIONS_BY_EW: '/api/agreed-actions/:earlyWarningId',
  MEETING_ACTIONS: '/api/meeting-actions',

  MEETING_ACTIONS_BY_MEETING: '/api/meeting-actions/meeting/:meetingId',
  MEETING_ACTION_BY_ID: '/api/meeting-actions/:meetingActionId',
  MEETING_ACTION_COMPLETE: '/api/meeting-actions/:meetingActionId/complete',
  MEETINGS: '/api/meetings',
  MEETINGS_BY_EARLY_WARNING: '/api/meetings/list/:entityId',
  MEETING_BY_ID: '/api/meetings/:meetingId',
  PROJECT_USERS_LOOKUP: '/api/project-user/:id/users/lookup',
} as const;

export const EARLY_WARNING_STATUS_LABELS: Record<EarlyWarningRegisterStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  NOT_ACCEPTED: 'Not Accepted',
  DISCARD: 'Discard',
};

// antd Tag preset colors — rendered as outlined pills per the register design.
export const EARLY_WARNING_STATUS_COLORS: Record<EarlyWarningRegisterStatus, string> = {
  OPEN: 'blue',
  CLOSED: 'green',
  NOT_ACCEPTED: 'red',
  DISCARD: 'default',
};

export const EARLY_WARNING_IMPACT_LABELS: Record<EarlyWarningImpact, string> = {
  DELAY: 'Delay To Completion',
  KEY_DATE: 'Key Date Impact',
  COST: 'Cost Increase',
  PERFORMANCE: 'Performance Impairment',
};

/** Impact checkbox values as the form stores them; maps onto the four API booleans. */
export const EARLY_WARNING_IMPACT_TYPE_OPTIONS = [
  { label: EARLY_WARNING_IMPACT_LABELS.DELAY, value: 'delay' },
  { label: EARLY_WARNING_IMPACT_LABELS.KEY_DATE, value: 'key-date' },
  { label: EARLY_WARNING_IMPACT_LABELS.COST, value: 'cost' },
  { label: EARLY_WARNING_IMPACT_LABELS.PERFORMANCE, value: 'performance' },
];

export const EARLY_WARNING_REGISTER_COPY = {
  title: 'Early Warning Register',
  clauseBadge: 'NEC4 Cl. 15.1',
  banner:
    "This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project's scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.",
  searchPlaceholder: 'Search EWs...',
  allStatusLabel: 'All Status',
  raiseLabel: 'Raise EW manually',
  exportLabel: 'Export to Excel',
  tabActive: 'Active',
  tabArchived: 'Archived',
  tabDiscarded: 'Discarded',
  columnArchivedOn: 'Archived On',
  columnDiscardedOn: 'Discarded On',
  columnReason: 'Reason',
  showingLabel: 'Showing',
  ofLabel: 'of',
  loadMoreLabel: 'Load More',
} as const;

export const EARLY_WARNING_REGISTER_FORM_COPY = {
  title: 'Create Early Warning',
  clauseBadge: 'NEC4 Cl. 15.1',
  banner:
    "This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project's scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.",
  prefillBanner:
    "Auspira has pre-filled fields from the contractor's email and attachments. Review, complete any gaps, then save.",
  sections: {
    projectContract: 'Project Contract',
    communicationDetails: 'Communication Details',
    earlyWarningMatter: 'Early Warning Matter',
    earlyWarningDetails: 'Early Warning Details',
    impactAssessment: 'Impact Assessment',
    uploadDocuments: 'Upload Documents',
    documentsAndCommunication: 'Documents & Communication',
  },
  labels: {
    ewReference: 'EW Reference',
    autoRef: 'Auto-ref:',
    date: 'Date',
    projectName: 'Project Name',
    contractReference: 'Contract Reference',
    to: 'To',
    from: 'From',
    raisedBy: 'Raised By',
    cc: 'CC',
    bcc: 'BCC',
    subject: 'Subject',
    riskTitle: 'Risk Title',
    descriptionOfMatter: 'Description of Matter',
    riskDescription: 'Risk Description',
    potentialImpact: 'Potential Impact',
    proposedMitigationActions: 'Proposed Mitigation Actions',
    keyDatesAffected: 'Key Dates Affected',
    keyDatesPlaceholder: 'Describe key dates affected by this matter...',
    dateRaised: 'Date Raised',
    source: 'Source',
    timeImpact: 'Time Impact',
    costImpact: 'Cost Impact',
    impactTypes: 'Impact Types',
    firstAction: 'First action after registering',
    timeBar: 'Time Bar',
    daysRemaining: 'days remaining',
    deadline: 'Deadline',
    emailThread: 'Email Thread',
    emailThreadHint: 'View related email conversations and communications.',
    view: 'View',
    attachment: 'Attachment',
    attachmentHint: 'View and download all related attachments.',
    download: 'Download',
    upload: 'Upload',
    replace: 'Replace',
    preview: 'Preview',
    noDocuments: 'No documents uploaded yet.',
  },
  firstActionOptions: ['Schedule Risk Reduction Meeting (Cl. 15.4)'],
  actions: {
    register: 'Register',
    notify: 'Notify',
  },
} as const;

export const DATE_RAISED_DISPLAY_FORMAT = 'DD/MM/YYYY';

// Keys stay as-is (matched elsewhere against `activeTab`); only the label shown on the
// tab strip is corrected to match the CE/PDR wording — "Email Threads" / "Documents" /
// "Audit Trail" (the design's own "Trial" is a typo for Trail, corrected here rather than
// carried into the product).
export const EARLY_WARNING_DETAIL_TABS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Email', label: 'Email Threads' },
  { key: 'Meetings', label: 'Meetings' },
  { key: 'Document', label: 'Documents' },
  { key: 'Audit Trial', label: 'Audit Trail' },
] as const;

export type EarlyWarningDetailTab = (typeof EARLY_WARNING_DETAIL_TABS)[number]['key'];

export const EARLY_WARNING_DETAIL_COPY = {
  riskSummary: 'EW Summary',
  lifecycle: 'Lifecycle',
  evidenceAndThread: 'Evidence & Thread',
  viewAll: 'View All',
  loadMore: 'Load More',
  documentsAndCommunication: 'Documents & Communication',
  started: 'Started',
  rrmDue: 'RRM due',
  daysRemaining: 'days remaining',
  actions: {
    close: 'Risk resolved → close EW',
    update: 'Mitigation agreed → update EW',
    createCe: 'CE trigger identified → link / create CE',
  },
} as const;

export const EARLY_WARNING_CLOSE_OR_LINK_COPY = {
  title: 'Close Early Warning or Link to CE',
  close: {
    title: 'Close Early Warning',
    body: (ref: string) =>
      `The risk has been mitigated or is no longer a concern. ${ref} will be marked closed. No CE is created. Evidence pack sealed.`,
    reason: 'Closure Reason',
    reasonOptions: ['Risk mitigated - actions agreed and implemented'],
    notes: 'Closure Notes',
    notesPlaceholder: 'Summaries how this risk was resolved…',
    submit: (ref: string) => `Close ${ref}`,
  },
  link: {
    title: 'Link / Create Compensation Event',
    body: (ref: string) =>
      `A PM instruction or CE trigger has been identified. Create a linked CE. ${ref} and the CE remain separate records. The EW stays as evidence context.`,
    rule: (ref: string) =>
      `Rule: EW and CE are always separate records. The CE links back to ${ref} for evidence context. Do not merge them.`,
    triggerType: 'CE Trigger Type',
    triggerOptions: ['Cl. 60.1(1) - PM instruction changing Works Information'],
    reference: 'CE Reference',
    referencePlaceholder: 'CE-004 (auto-assigned)',
    submit: (ref: string, ceRef?: string) => `Create ${ceRef || 'CE'} linked to ${ref}`,
  },
} as const;
