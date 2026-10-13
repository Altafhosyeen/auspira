import { describe, expect, it } from 'vitest';
import { COMPENSATION_EVENT_EXPORT_COPY } from '@/modules/compensation-event/constants/compensation-event.constants';
import type { CompensationEvent } from '@/modules/compensation-event/types/compensation-event.types';
import type { QuotationLine } from '@/modules/compensation-event/types/compensation-event-quotation.types';
import {
  buildAssessmentExportColumns,
  buildAssessmentExportRows,
  COMPENSATION_EVENT_EXPORT_COLUMNS,
} from '@/modules/compensation-event/utils/compensation-event-export.utils';

const eventFixture: CompensationEvent = {
  id: 'ce-1',
  reference: 'CE-004',
  title: 'Unforeseen ground conditions at Pier 3',
  amount: 48400,
  currency: '£',
  status: 'QUOTATION_SUBMITTED',
  eventDate: '2026-07-07',
  createdAt: '2026-07-08T09:15:00',
  updatedAt: '2026-07-08T09:15:00',
  direction: 'IN',
  parentEarlyWarningReference: 'EW-012',
  timeImpactDays: 12,
  replyDueDate: '2026-07-21',
  clauses: ['60.1(12)', '61.3'],
};

const cellsFor = (event: CompensationEvent) =>
  Object.fromEntries(
    COMPENSATION_EVENT_EXPORT_COLUMNS.map((column) => [column.header, column.value(event)])
  );

const linesFixture: QuotationLine[] = [
  {
    id: 'people',
    category: 'people',
    label: 'People',
    description: 'Additional plant operator, 4 weeks',
    members: [{ id: 'people-js', name: 'John Smith', role: 'Commercial Manager', amount: 4000 }],
  },
  {
    id: 'fee',
    category: 'fee',
    label: 'Fee',
    description: 'Contractor fee percentage',
    members: [],
    amount: 1200,
  },
];

describe('COMPENSATION_EVENT_EXPORT_COLUMNS', () => {
  it('writes the register row the table shows', () => {
    const cells = cellsFor(eventFixture);

    expect(cells.Reference).toBe('CE-004');
    expect(cells.State).toBe('Quotation submitted');
    expect(cells.Direction).toBe('Incoming');
    expect(cells['Parent EW']).toBe('EW-012');
    expect(cells['Quote Value']).toBe(48400);
    expect(cells.Clauses).toBe('60.1(12), 61.3');
    expect(cells['Duration (Days)']).toBe(12);
  });

  it('folds a bare currency symbol onto its ISO code', () => {
    expect(cellsFor(eventFixture).Currency).toBe('GBP');
  });

  it('maps a legacy status onto its register state label', () => {
    expect(cellsFor({ ...eventFixture, status: 'APPROVED' }).State).toBe('Implemented');
  });

  // Defaulting an unstated direction to "Outgoing" labelled every exported row outgoing,
  // since no response has ever carried the field — the register drops the chip on the
  // same row for the same reason.
  it('leaves the direction blank where the response stated none', () => {
    expect(cellsFor({ ...eventFixture, direction: undefined }).Direction).toBeUndefined();
  });

  it('still names a direction the response did state', () => {
    expect(cellsFor({ ...eventFixture, direction: 'IN' }).Direction).toBe('Incoming');
    expect(cellsFor({ ...eventFixture, direction: 'OUT' }).Direction).toBe('Outgoing');
  });

  it('writes dates as Date cells so Excel keeps them sortable, and blanks the ones that are absent', () => {
    const cells = cellsFor({ ...eventFixture, replyDueDate: null });

    expect(cells['Event Date']).toBeInstanceOf(Date);
    expect(cells['Raised On']).toBeInstanceOf(Date);
    expect(cells['Time Bar']).toBeNull();
  });
});

describe('buildAssessmentExportRows', () => {
  it('writes one row per priced item, then the figures under the table', () => {
    const rows = buildAssessmentExportRows(linesFixture, {
      total: 5200,
      days: 12,
      comment: '  Assessed on the revised programme.  ',
    });

    expect(rows.slice(0, 2)).toEqual([
      { category: 'People', description: 'John Smith - Commercial Manager', amount: 4000 },
      { category: 'Fee', description: 'Contractor fee percentage', amount: 1200 },
    ]);
    expect(rows.slice(2)).toEqual([
      { category: COMPENSATION_EVENT_EXPORT_COPY.assessedTotal, description: '', amount: 5200 },
      { category: COMPENSATION_EVENT_EXPORT_COPY.proposedDays, description: '12', amount: null },
      {
        category: COMPENSATION_EVENT_EXPORT_COPY.pmComment,
        description: 'Assessed on the revised programme.',
        amount: null,
      },
    ]);
  });

  it('leaves the days row blank until the PM has proposed one', () => {
    const rows = buildAssessmentExportRows([], { total: 0, days: null, comment: '' });

    expect(rows.map((row) => row.description)).toEqual(['', '', '']);
  });
});

describe('buildAssessmentExportColumns', () => {
  it('names the currency in the amount header and keeps the cells numeric', () => {
    const columns = buildAssessmentExportColumns('usd');

    expect(columns.map((column) => column.header)).toEqual([
      'Category',
      'Description',
      'Amount (USD)',
    ]);
    expect(columns[2].value({ category: 'People', description: '', amount: 4000 })).toBe(4000);
  });

  it('falls back to GBP when the quotation named no currency', () => {
    expect(buildAssessmentExportColumns(undefined)[2].header).toBe('Amount (GBP)');
  });
});
