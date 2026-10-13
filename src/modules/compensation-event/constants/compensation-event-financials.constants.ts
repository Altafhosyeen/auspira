export const COMPENSATION_EVENT_FINANCIAL_LABELS = {
  originalQuote: 'Original Quote',
  approvedCost: 'Approved Cost',
  difference: 'Difference',
  // Figma spells this "Cost Diffrence" — kept verbatim to match the source design.
  costDifference: 'Cost Diffrence',
  fees: 'Fees',
  riskAllowance: 'Risk Allowance',
  timeImpact: 'Time Impact',
  originalTimeImpact: 'Original Time Impact',
  approvedTimeImpact: 'Approved Time Impact',
} as const;

export const COMPENSATION_EVENT_FINANCIALS_COPY = {
  outcomeTitle: 'Financial Outcome',
  noData: 'No financial information is available for this compensation event.',
  viewFullQuotationLabel: '',
} as const;
