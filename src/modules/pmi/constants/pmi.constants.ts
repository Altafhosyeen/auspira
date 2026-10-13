// Module-owned endpoints — new features keep endpoints inside the module.
export const PMI_ENDPOINTS = {
  LIST_BY_PROJECT: '/api/project-manager-instructions/project/:projectId',
  LOOKUP_BY_PROJECT: '/api/project-manager-instructions/lookup/project/:projectId',
  BY_ID: '/api/project-manager-instructions/:id',
  REGISTER: '/api/project-manager-instructions',
  QUOTATIONS_BY_PMI: '/api/pmi-quotations/project-manager-instruction/:pmiId',
  // Detail-screen support — shared endpoints, same API the Early Warning detail uses.
  AUDIT_TRAIL: '/api/audit-logs',
  PROJECT_ATTACHMENTS: '/api/attachments/:entityId/projects/:projectId',
  DOWNLOAD_ATTACHMENT: '/api/attachments/download',
  CONVERSATIONS: '/api/project-emails/:id/conversations',
} as const;

export const PMI_QUOTATION_ENDPOINTS = {
  CONFIRM: '/api/pmi-quotations/confirm',
  ACCEPT: '/api/pmi-quotations/accept',
  REQUEST_REVISION: '/api/pmi-quotations/request-revision',
  BY_PMI: '/api/pmi-quotations/project-manager-instruction/:pmiId',
} as const;

/** Status code → uppercase label, per the PMI register design. Unknown (0) is skipped. */
export const PMI_STATUS_LABELS: Record<number, string> = {
  1: 'OPEN',
  2: 'IMPLEMENTED',
  3: 'QUOTATION REVISION REQUESTED',
  4: 'QUOTATION IN PROGRESS',
};

/** Status code → antd Tag preset color, per the PMI register design. */
export const PMI_STATUS_COLORS: Record<number, string> = {
  1: 'blue',
  2: 'green',
  3: 'orange',
  4: 'gold',
};

/** PMI type code → display label (the PMI Selection made when registering). */
export const PMI_TYPE_LABELS: Record<number, string> = {
  0: 'Change the Scope or a Key Date',
  1: 'Proposed instruction',
  2: 'Stop work notice',
  3: 'Other',
};

/** PMI type code → antd Tag preset color, for the legend and column chips. */
export const PMI_TYPE_COLORS: Record<number, string> = {
  0: 'blue',
  1: 'green',
  2: 'orange',
  3: 'default',
};

/** PMI type code → short marker shown in the TYPE column (full text lives in the legend). */
export const PMI_TYPE_LEGEND_CODES: Record<number, string> = {
  0: 'CS',
  1: 'PI',
  2: 'SW',
  3: 'O',
};

export const PMI_REGISTER_COPY = {
  title: "Project Manager's Instruction Register",
  clauseBadge: 'NEC4 Cl. 15.1',
  searchPlaceholder: 'Search by user, action or details...',
  filterLabel: 'Filter by Status',
  allStatusLabel: 'All Status',
  addLabel: 'Add PMI',
  exportLabel: 'Export',
  showingLabel: 'Showing',
  ofLabel: 'of',
  activitiesLabel: 'activities',
  loadMoreLabel: 'Load More',
  tableEmptyTitle: 'No project manager instructions yet',
  tableEmptyDescription:
    'PMIs issued on this project will appear here, with their clause tags and status.',
} as const;

/** Detail-screen tabs, in the order the design's tab strip shows them. */
export const PMI_DETAIL_TABS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Email Thread', label: 'Email Thread' },
  { key: 'Attachment', label: 'Attachment' },
  { key: 'Compensation Event', label: 'Compensation Event' },
  { key: 'Audit Trial', label: 'Audit Trial' },
] as const;

export type PmiDetailTabKey = (typeof PMI_DETAIL_TABS)[number]['key'];

export const PMI_DETAIL_COPY = {
  title: "Project Manager's Instruction Details",
  overviewBanner:
    "View the project manager's instruction, including the clause it is issued under, the details instructed, the contractor's response deadline and any linked compensation event.",
  summaryTitle: 'PMI Summary',
  lifecycleTitle: 'Lifecycle',
  auditTitle: 'Audit Trial',
  documentsTitle: 'Documents / Attachments',
  emailTitle: 'Email Threads',
  auditEmpty: 'No audit activity yet',
  documentsEmpty: 'No documents uploaded yet.',
  threadEmptyTitle: 'No email threads yet',
  threadNoMatches: 'No matching email threads',
  threadEmptyDescription:
    'Messages linked to this project manager instruction will appear here once they arrive.',
  noCompensationEvent: 'No compensation event is linked to this instruction yet.',
  viewCompensationEvent: 'View Compensation Event',
  showingLabel: 'Showing',
  ofLabel: 'of',
  activitiesLabel: 'activities',
  loadMoreLabel: 'Load More',
  downloadLabel: 'Download',
  // PMI Summary rows.
  summary: {
    reference: 'PMI Reference',
    dateRaised: 'Date Raised',
    quotationRequired: 'Quotation Required',
    type: 'Type',
    referenceClause: 'Reference Clause(s)',
    instructionTitle: 'Instruction Title',
    instructionDetails: 'Instruction Details',
  },
  // Lifecycle steps, in the order the backend's `PmiLifecycleStage` enum defines them.
  lifecycle: {
    raised: 'Raised',
    quotationSubmitted: 'Quotation Submitted',
    revisionRequested: 'Revision Requested',
    implemented: 'Implemented',
  },
} as const;
