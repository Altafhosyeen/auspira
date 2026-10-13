import type { NoticeProgressStep } from '../types/compensation-event-notice.types';

export const COMPENSATION_EVENT_NOTICE_COPY = {
  header: {
    title: 'Register Compensation Event',
    preview: 'Preview',
    moreActions: 'More actions',
  },
  banner:
    'This notice is to inform about an event that has occurred or is expected to occur, which may affect the project progress, cost, or completion date. The event is considered a potential compensation event under NEC4 Clause 61.3',
  sections: {
    basicDetails: 'Basic Details',
    eventInformation: 'Event Information',
    uploadDocuments: 'Upload Documents',
  },
  labels: {
    to: 'To',
    from: 'From',
    bcc: 'BCC',
    cc: 'CC',
    role: 'Role',
    dateIssued: 'Date Issued',
    compensationEventType: 'Compensation Event Type',
    relevantContractClause: 'Relevant Contract Clause',
    descriptionOfEvent: 'Description of Event',
    proposedEffect: 'Proposed Effect on Defined Cost and Time',
  },
  placeholders: {
    to: 'Add recipients',
    from: 'Sender email address',
    bcc: 'Add BCC recipients',
    cc: 'Add CC recipients',
    role: "Employer's Project Manager",
    compensationEventType: 'Select the event type',
    relevantContractClause: 'Select the relevant clause',
    descriptionOfEvent: 'Describe the event that has happened or is expected to happen...',
    proposedEffect:
      'Describe the event will affect the Defined Cost and / or the Completion Date under NEC3...',
  },
  clauseHint: '',
  clauseEmpty: 'No contract clauses are configured for this project.',
  upload: {
    button: 'Upload',
    view: 'View',
    replace: 'Replace',
    remove: 'Remove',
    empty: 'No documents uploaded yet.',
  },
  documents: {
    title: 'Documents & Communication',
    timeBar: {
      label: 'Time Bar',
      deadlinePrefix: 'Deadline -',
    },
    emailThread: {
      title: 'Email Thread',
      body: 'View related email conversations and communications.',
      action: 'View',
    },
    attachments: {
      title: 'Attachment',
      body: 'View and download all related attachments.',
      action: 'View',
    },
    // The extracted signal detail tile — everything the CE payload carries that the notice
    // form has no field for, so the PM can still see what the mail was read as.
    signalDetails: {
      title: 'Extracted Details',
      raisedBy: 'Raised by',
      type: 'Type',
      estimatedValue: 'Estimated value',
      estimatedDays: 'Estimated time',
      day: 'day',
      days: 'days',
      pmDecision: 'Project Manager decision required',
      quotation: 'Quotation required',
    },
  },
  progress: {
    label: 'Progress',
  },
  actions: {
    spreadSheet: 'Submit',
    confirmTitle: 'Issue this Compensation Event notice?',
  },
  messages: {
    prefilledFromSignal:
      'Prefilled from the signal you accepted — check every field before submitting. Role still needs filling in.',
    noAttachments: 'The email thread carries no attachments.',
    attachmentUnavailable: 'This file cannot be downloaded yet.',
    downloadFailed: 'Download failed. Please try again.',
    noProject: 'Select a project before submitting the notice.',
    submitted: 'Compensation event notice submitted.',
    submitFailed: 'Could not submit the compensation event notice.',
  },
} as const;

// The Figma frame keeps four progress steps but only collects the first two; the rest
// stay pending until this screen (or a later one) gains fields for them.
export const NOTICE_PROGRESS_STEPS: NoticeProgressStep[] = [
  {
    title: 'Basic Details',
    fields: ['to', 'from', 'role', 'dateIssued'],
  },
  {
    title: 'Event Information',
    fields: [
      'compensationEventType',
      'relevantContractClause',
      'descriptionOfEvent',
      'proposedEffect',
    ],
  },
  { title: 'Impact & Requirements', fields: [] },
  { title: 'Review & Submit', fields: [] },
];

// NEC4 Cl.62.3 — the Project Manager replies within two weeks. Swap this for the
// backend's own time bar once the API serves one.
export const NOTICE_REPLY_PERIOD_DAYS = 14;

// The signal carries its own time bar in `overdueDateTime`; when the backend left it null
// the window is counted as a week from the day the alert was raised.
export const ALERT_REPLY_PERIOD_DAYS = 7;

export const NOTICE_DEADLINE_FORMAT = 'DD MMM YYYY';

export const NOTICE_DATE_FORMAT = 'DD-MMM-YYYY';

// Mirrors the backend `CompensationEventType` enum — the wire contract for the create
// payload's `Type`, and the source of the Event Information type select.
export const COMPENSATION_EVENT_TYPE = {
  CONTRACTOR_NOTIFICATION: 1,
  EARLY_WARNING: 2,
  PROJECT_MANAGER_INSTRUCTION: 3,
  MANUAL: 4,
} as const;

export type CompensationEventTypeValue =
  (typeof COMPENSATION_EVENT_TYPE)[keyof typeof COMPENSATION_EVENT_TYPE];

export const COMPENSATION_EVENT_TYPE_VALUES = Object.values(
  COMPENSATION_EVENT_TYPE
) as CompensationEventTypeValue[];

// Display labels for the wire values above — read by the type select and by the signal
// detail tile, which prints the type the extractor decided on.
export const COMPENSATION_EVENT_TYPE_LABELS: Record<number, string> = {
  [COMPENSATION_EVENT_TYPE.CONTRACTOR_NOTIFICATION]: 'Contractor Notification',
  [COMPENSATION_EVENT_TYPE.EARLY_WARNING]: 'Early Warning',
  [COMPENSATION_EVENT_TYPE.PROJECT_MANAGER_INSTRUCTION]: "Project Manager's Instruction",
  [COMPENSATION_EVENT_TYPE.MANUAL]: 'Manual',
};

// The type select is a fixed enum lookup — no endpoint serves it, so the options are the
// enum itself and the picked value goes straight onto the payload's `Type`.
export const COMPENSATION_EVENT_TYPE_OPTIONS = COMPENSATION_EVENT_TYPE_VALUES.map((value) => ({
  label: COMPENSATION_EVENT_TYPE_LABELS[value],
  value,
}));

export const ROLE_OPTIONS = [
  "Employer's Project Manager",
  "Contractor's Representative",
  'Supervisor',
  'Adjudicator',
].map((value) => ({ label: value, value }));

export const DESCRIPTION_MAX_LENGTH = 2000;
