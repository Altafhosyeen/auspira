import type { NoticeTimeBar } from './compensation-event-notice.types';

// 'other' covers categories the API returns that don't fold onto the Figma taxonomy.
export type QuotationLineCategory = 'people' | 'equipment' | 'fee' | 'other';

export interface QuotationMember {
  id: string;
  name: string;
  role: string;
  amount: number;
}

export interface QuotationLine {
  id: string;
  category: QuotationLineCategory;
  label: string;
  description: string;
  // The line total is the sum of its members, see `getLineTotal`.
  members: QuotationMember[];
  // Only set for a line with no members: the wire sends one amount per category, so a
  // category the contractor did not break down has nowhere else to carry its total.
  amount?: number;
}

export interface ProgrammeImpactEntry {
  label: string;
  value: string;
}

// A row of the Submitted By table — `submittedAt` carries the time as well as the date.
export interface QuotationSubmission {
  id: string;
  name: string;
  role: string;
  submittedAt: string;
}

export interface ContractorQuotation {
  reference: string;
  submittedOn: string;
  currency: string;
  lines: QuotationLine[];
  riskAllowance: number;
  // What the contingency was priced for, when the quotation said — the allowance card
  // reads it under its own title.
  riskAllowanceDescription?: string;
  programmeImpact: ProgrammeImpactEntry[];
  // The delay the contractor claimed, as a number rather than the sentence the programme
  // card prints — the PM's assessment starts from this figure. Undefined when the
  // quotation claimed no time impact at all, which is not the same as claiming zero.
  delayClaimedDays?: number;
  submittedBy: QuotationSubmission[];
  timeBar: NoticeTimeBar;
  // The total the quotation stated outright. Only used when it priced no lines to add up
  // — a mail can claim a figure without breaking it down, and often claims neither.
  declaredTotal?: number;
}

// Both totals are null when the quotation named no figure at all, which reads as a dash
// on screen rather than as a quotation for nothing.
export interface QuotationSummary {
  quotationTotal: number | null;
  riskAllowance: number;
  grandTotal: number | null;
}

/** Body for POST /api/quotations/confirm — links the alert's quotation to a compensation event. */
export interface ConfirmQuotationInput {
  projectAlertId: string;
  compensationEventId: string;
}

// Body for POST /api/quotations/accept — the backend's AcceptQuotationDto only reads
// `quotationId`; the rest is UI-side context sent along but not consumed by the wire.
export interface AcceptQuotationInput {
  // Absent when the screen acting on the quotation has no alert of its own (e.g. the
  // register's read-only detail view, opened by quotation id rather than by signal).
  projectAlertId?: string;
  // The confirmed quotation's own id — the id /api/quotations/confirm handed back, not the
  // compensation event's id or the reference the mail merely claimed.
  quotationId: string;
  // The clause the linked compensation event cites — read off that event, not the alert.
  clauseNumber?: string;
  clauseTitle?: string;
  clauseDescription?: string;
}

// Body for POST /api/quotations/request-revision — multipart, per the live Swagger
// contract: the backend's RequestQuotationRevisionDto only reads `quotationId`/
// `subject`/`description`/`attachments`. There is no recipient list — the backend
// resolves who the request goes to on its own. `projectAlertId` and the clause fields
// are UI-side context only, carried for parity with the other quotation mutations.
export interface RequestQuotationRevisionInput {
  projectAlertId?: string;
  quotationId: string;
  subject: string;
  description: string;
  attachments?: File[];
  clauseNumber?: string;
  clauseTitle?: string;
  clauseDescription?: string;
}

// One line of the flat summary card — the quotation stated flat, item by item, with no
// category grouping over the top. `amount` is null when the quotation named the line but
// priced nothing against it, which reads as a dash rather than as a free item.
export interface QuotationSummaryRow {
  key: string;
  label: string;
  /** Read on hover from the info icon beside the label — omitted when the line had none. */
  hint?: string;
  amount: number | null;
}

// Flattened shape the antd tree Table renders — group rows carry `children`, member
// rows do not, which is what makes antd draw them as expandable descendants.
export interface QuotationTableRow {
  key: string;
  isGroup: boolean;
  item: string;
  description: string;
  amount: number;
  category?: QuotationLineCategory;
  children?: QuotationTableRow[];
}
