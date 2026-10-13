// Copy for the Overview tab — every string is driven by a field the compensation-event
// record actually serves, so nothing on the tab is invented for the design.
export const COMPENSATION_EVENT_OVERVIEW_COPY = {
  metricsTitle: 'Key Summary',
  summaryTitle: 'CE Summary',
  lifecycleTitle: 'Lifecycle',
  lifecycleDiscarded: 'Discarded',
} as const;

export const COMPENSATION_EVENT_OVERVIEW_METRIC_LABELS = {
  originalQuote: 'Original Quote (cost)',
  daysIncreased: 'Days Increased',
  status: 'Status',
} as const;

export const COMPENSATION_EVENT_OVERVIEW_SUMMARY_LABELS = {
  implementedQuotation: 'Implemented Quotation',
  reference: 'CE Reference',
  type: 'CE Type',
  contractor: 'Contractor',
  raisedBy: 'Raised By',
} as const;
