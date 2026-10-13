import {
  DailySiteReportStatus,
  type ProjectDailyReportTone,
} from '../types/project-daily-report.types';

// Module-owned endpoints — new features keep endpoints inside the module, the same rule the
// Defect Notice and PMI modules follow. The four detail-tab routes are the shared endpoints
// every other detail screen reads, keyed on this record's id.
export const PROJECT_DAILY_REPORT_ENDPOINTS = {
  LIST_BY_PROJECT: '/api/daily-site-reports/project/:projectId',
  BY_ID: '/api/daily-site-reports/:id',
  ACCEPT: '/api/daily-site-reports/accept',
  AUDIT_TRAIL: '/api/audit-logs',
  PROJECT_ATTACHMENTS: '/api/attachments/:entityId/projects/:projectId',
  DOWNLOAD_ATTACHMENT: '/api/attachments/download',
  CONVERSATIONS: '/api/project-emails/:entityId/conversations',
} as const;

export const PROJECT_DAILY_REPORT_COPY = {
  title: 'Daily Site Report Register',
  exportLabel: 'Export',
  searchPlaceholder: 'Search by user, action or details...',
  filterLabel: 'Filter by Status',
  clearAllLabel: 'Clear all',
  clearAllDisabledReason: 'There is nothing to clear yet.',
} as const;

// Upper case, like the Defect Notice and Compensation Event registers — every CCA/OCA
// register header is read as one table style, not one per screen.
export const PROJECT_DAILY_REPORT_COLUMNS = {
  reference: 'DSR REF',
  title: 'TITLE',
  submittedBy: 'RAISED BY',
  raisedAt: 'RAISED AT',
  progress: 'PROGRESS',
  status: 'STATUS',
  action: 'ACTION',
} as const;

// Every status a report can hold, per `DailySiteReportStatus` — the filter offers these.
export const PROJECT_DAILY_REPORT_STATUSES: DailySiteReportStatus[] = [
  DailySiteReportStatus.Accepted,
  DailySiteReportStatus.Discarded,
];

/** Status code → display label, per the register design. */
export const PROJECT_DAILY_REPORT_STATUS_LABELS: Record<number, string> = {
  [DailySiteReportStatus.Accepted]: 'Accepted',
  [DailySiteReportStatus.Discarded]: 'Discarded',
};

/** Status code → badge tone. */
export const PROJECT_DAILY_REPORT_STATUS_TONES: Record<number, ProjectDailyReportTone> = {
  [DailySiteReportStatus.Accepted]: 'info',
  [DailySiteReportStatus.Discarded]: 'danger',
};

/** Status code → display label, falling back to the code for a value the enum does not name. */
export const projectDailyReportStatusLabel = (code: number): string =>
  PROJECT_DAILY_REPORT_STATUS_LABELS[code] ?? `Status ${code}`;

/** Status code → badge tone, neutral for a value the enum does not name. */
export const projectDailyReportStatusTone = (code: number): ProjectDailyReportTone =>
  PROJECT_DAILY_REPORT_STATUS_TONES[code] ?? 'neutral';

// Progress at or above this reads as on-track (green); below it reads as behind (red).
// A single threshold, so the register never colours two adjacent rows by different rules.
export const PROJECT_DAILY_REPORT_PROGRESS_ON_TRACK_THRESHOLD = 61;

export const PROJECT_DAILY_REPORT_EXPORT_COPY = {
  registerSheetName: 'Daily Site Report Register',
  registerFileSuffix: 'Daily-Site-Report-Register',
  fileTimestampFormat: 'DD MMM YYYY HH-mm',
  fileNameFallback: 'project',
  empty: 'There are no daily site reports to export.',
  failed: 'Could not export the register. Please try again.',
} as const;

// The design labels these "Email Thrad" / "Audit Trial"; both are typos for Thread/Trail and
// are corrected here rather than carried into the product.
export const PROJECT_DAILY_REPORT_DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'email-thread', label: 'Email Threads' },
  { key: 'document', label: 'Documents' },
  { key: 'audit-trail', label: 'Audit Trail' },
] as const;

export type ProjectDailyReportDetailTabKey =
  (typeof PROJECT_DAILY_REPORT_DETAIL_TABS)[number]['key'];

export const PROJECT_DAILY_REPORT_DETAIL_COPY = {
  title: 'Daily Site Report Details',
  notFound: 'This daily site report could not be found.',
  overviewBanner:
    "This notice informs stakeholders of an event that has occurred or is expected to occur and may impact the project's scope, cost, schedule, or quality. The event requires assessment to determine its potential impact and necessary action.",
  summaryTitle: 'DSR Summary',
  reportReference: 'Report Reference',
  submittedBy: 'Submitted By',
  status: 'Status',
  documentTitle: 'Documents',
  emailThreadTitle: 'Email Threads',
  auditTrailTitle: 'Audit Trail',
} as const;
