export type CompensationEventDetailTabKey =
  | 'overview'
  | 'financials'
  | 'email-thread'
  | 'documents'
  | 'audit-trail';

export const COMPENSATION_EVENT_DETAIL_TABS: Array<{
  key: CompensationEventDetailTabKey;
  label: string;
}> = [
  { key: 'overview', label: 'Overview' },
  { key: 'financials', label: 'Financials' },
  { key: 'email-thread', label: 'Email Threads' },
  { key: 'documents', label: 'Documents' },
  { key: 'audit-trail', label: 'Audit Trail' },
];

export const COMPENSATION_EVENT_DETAIL_COPY = {
  title: 'Compensation Event Details',
  overviewBanner:
    'View and manage compensation events across the project, including their current status, quotation value, time impact, response deadlines and applicable contract clauses.',
  notFound: 'Compensation event not found.',
} as const;
