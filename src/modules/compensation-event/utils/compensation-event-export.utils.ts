import { parseBackendDate, type XlsxColumn } from '@/lib/utils';
import {
  COMPENSATION_EVENT_EXPORT_COPY,
  COMPENSATION_EVENT_STATUS_LABELS,
} from '../constants/compensation-event.constants';
import type { CompensationEvent } from '../types/compensation-event.types';
import type { QuotationLine } from '../types/compensation-event-quotation.types';
import { resolveRegisterState } from './compensation-event.utils';
import { buildAssessedQuotationItems } from './compensation-event-assessment.utils';
import { toCurrencyCode } from './compensation-event-currency.utils';

// A real Date reaches Excel as a sortable date cell; anything unparseable is written
// through as the raw string rather than dropped.
const toDateCell = (value?: string | null) => {
  if (!value) return null;
  return parseBackendDate(value) ?? value;
};

// The register's own columns, plus the fields the table only had room to badge — the
// export is meant to be the full record of an event, not a screenshot of the row.
// `id` is deliberately not a column.
export const COMPENSATION_EVENT_EXPORT_COLUMNS: XlsxColumn<CompensationEvent>[] = [
  { header: 'Reference', width: 16, value: (event) => event.reference },
  { header: 'Subject', width: 52, value: (event) => event.title },
  // An event the response stated no direction for exports blank rather than as
  // "Outgoing" — the register leaves the chip off the same row for the same reason.
  {
    header: 'Direction',
    width: 12,
    value: (event) => {
      if (!event.direction) return undefined;
      return event.direction === 'IN' ? 'Incoming' : 'Outgoing';
    },
  },
  { header: 'Parent EW', width: 14, value: (event) => event.parentEarlyWarningReference },
  {
    header: 'State',
    width: 14,
    value: (event) =>
      COMPENSATION_EVENT_STATUS_LABELS[resolveRegisterState(event.status)] ?? event.status,
  },
  // Numeric so the column sums in Excel; the currency travels in its own column.
  {
    header: 'Quote Value',
    width: 14,
    value: (event) => (Number.isFinite(event.amount) ? event.amount : null),
  },
  { header: 'Currency', width: 10, value: (event) => toCurrencyCode(event.currency) },
  { header: 'Duration (Days)', width: 15, value: (event) => event.timeImpactDays ?? null },
  { header: 'Time Bar', width: 14, value: (event) => toDateCell(event.replyDueDate) },
  { header: 'Clauses', width: 22, value: (event) => event.clauses?.join(', ') },
  { header: 'Event Date', width: 14, value: (event) => toDateCell(event.eventDate) },
  { header: 'Raised On', width: 14, value: (event) => toDateCell(event.createdAt) },
];

export interface AssessmentExportRow {
  category: string;
  description: string;
  amount: number | null;
}

// The assessed lines exactly as the PM left them on screen — `buildAssessedQuotationItems`
// is the same flattening the implement call sends, so the workbook and the wire agree.
// The three trailing rows carry the figures that sit under the table.
export const buildAssessmentExportRows = (
  lines: QuotationLine[],
  {
    total,
    days,
    comment,
    quotationAmount,
    riskAllowance,
  }: {
    total: number;
    days: number | null;
    comment: string;
    quotationAmount?: number | null;
    riskAllowance?: number | null;
  }
): AssessmentExportRow[] => [
  ...buildAssessedQuotationItems(lines, { quotationAmount, riskAllowance }).map((item) => ({
    category: item.category,
    description: item.description,
    amount: item.amount,
  })),
  { category: COMPENSATION_EVENT_EXPORT_COPY.assessedTotal, description: '', amount: total },
  {
    category: COMPENSATION_EVENT_EXPORT_COPY.proposedDays,
    description: days === null ? '' : String(days),
    amount: null,
  },
  {
    category: COMPENSATION_EVENT_EXPORT_COPY.pmComment,
    description: comment.trim(),
    amount: null,
  },
];

// The amount header names the currency, since the cells stay numeric so they add up.
export const buildAssessmentExportColumns = (
  currency?: string | null
): XlsxColumn<AssessmentExportRow>[] => [
  { header: 'Category', width: 26, value: (row) => row.category },
  { header: 'Description', width: 60, value: (row) => row.description },
  { header: `Amount (${toCurrencyCode(currency)})`, width: 16, value: (row) => row.amount },
];
