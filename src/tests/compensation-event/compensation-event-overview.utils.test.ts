import { describe, expect, it } from 'vitest';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  buildLifecycleSteps,
  formatDayCount,
  resolveClauseSummary,
  resolveDaysIncreased,
  resolveStatusMetric,
  withQuotationDetails,
} from '@/modules/compensation-event/utils/compensation-event-overview.utils';

describe('formatDayCount', () => {
  it('keeps a zero the record actually holds', () => {
    expect(formatDayCount(0)).toBe('0 Days');
  });

  it('singularises one day', () => {
    expect(formatDayCount(1)).toBe('1 Day');
    expect(formatDayCount(-1)).toBe('-1 Day');
  });

  it('dashes a missing figure', () => {
    expect(formatDayCount(null)).toBe('—');
    expect(formatDayCount(undefined)).toBe('—');
  });
});

describe('resolveDaysIncreased', () => {
  it('prefers the implemented figure once the record has settled', () => {
    expect(
      resolveDaysIncreased({ approvedTimeImpactDays: 77, quotedDays: 12, timeImpactDays: 5 })
    ).toBe(77);
  });

  it('falls back to the quoted figure before the estimate', () => {
    expect(resolveDaysIncreased({ quotedDays: 12, timeImpactDays: 5 })).toBe(12);
  });

  it('falls back to the estimate when nothing later exists', () => {
    expect(resolveDaysIncreased({ timeImpactDays: 5 })).toBe(5);
  });

  it('keeps a zero the record actually holds rather than falling through it', () => {
    expect(resolveDaysIncreased({ approvedTimeImpactDays: 0, timeImpactDays: 5 })).toBe(0);
  });

  it('has nothing to show when the record carries no day count at all', () => {
    expect(resolveDaysIncreased({})).toBeUndefined();
    expect(formatDayCount(resolveDaysIncreased({}))).toBe('—');
  });
});

describe('resolveClauseSummary', () => {
  it('drops a description that only echoes the number and title', () => {
    expect(
      resolveClauseSummary({
        clauseNumber: '60',
        clauseTitle: 'Compensation events',
        clauseDescription: '60 - Compensation events',
      })
    ).toEqual({ number: '60', title: 'Compensation events', description: '', additional: [] });
  });

  it('keeps a description that says something more', () => {
    const clause = resolveClauseSummary({
      clauseNumber: '60.1(12)',
      clauseTitle: 'Physical conditions',
      clauseDescription: 'Conditions an experienced contractor would have judged unlikely.',
      additionalClauses: ['61.3'],
    });

    expect(clause.description).toBe(
      'Conditions an experienced contractor would have judged unlikely.'
    );
    expect(clause.additional).toEqual(['61.3']);
  });

  it('tolerates a record with no clause at all', () => {
    expect(resolveClauseSummary({})).toEqual({
      number: '',
      title: '',
      description: '',
      additional: [],
    });
  });
});

describe('buildLifecycleSteps', () => {
  const baseEvent = {
    createdAt: '2026-07-07',
    quoteReceivedDate: null,
    finalizedOn: null,
    status: 'DRAFT',
  } as Parameters<typeof buildLifecycleSteps>[0];

  it('names the three stages after the dates the record carries', () => {
    expect(buildLifecycleSteps(baseEvent).map((step) => step.label)).toEqual([
      'Notified',
      'Quotation Submitted',
      'Implemented',
    ]);
  });

  it('passes only the stages whose date exists', () => {
    const steps = buildLifecycleSteps(baseEvent);

    expect(steps.map((step) => step.complete)).toEqual([true, false, false]);
    expect(steps.map((step) => step.date)).toEqual(['07 Jul 2026', '—', '—']);
  });

  it('passes every stage once all three dates are present', () => {
    const steps = buildLifecycleSteps({
      ...baseEvent,
      quoteReceivedDate: '2026-07-10',
      finalizedOn: '2026-07-16',
    });

    expect(steps.map((step) => step.complete)).toEqual([true, true, true]);
    expect(steps.map((step) => step.date)).toEqual(['07 Jul 2026', '10 Jul 2026', '16 Jul 2026']);
  });

  it('passes a later stage even when an earlier one is missing its date', () => {
    const steps = buildLifecycleSteps({ ...baseEvent, finalizedOn: '2026-07-16' });

    expect(steps.map((step) => step.complete)).toEqual([true, false, true]);
  });

  it('ignores the register state — the dates alone decide the rail', () => {
    const dated = {
      ...baseEvent,
      quoteReceivedDate: '2026-07-10',
      status: 'DISCARDED',
    } as Parameters<typeof buildLifecycleSteps>[0];

    expect(buildLifecycleSteps(dated).map((step) => step.complete)).toEqual([true, true, false]);
  });

  it('leaves a stage undated when its date is absent', () => {
    expect(buildLifecycleSteps({ ...baseEvent, createdAt: '' } as never)[0]).toMatchObject({
      complete: false,
      date: '—',
    });
  });
});

describe('withQuotationDetails', () => {
  const event = {
    id: 'ce-1',
    contractorName: undefined,
    quoteReceivedDate: undefined,
    originalQuoteAmount: 5000,
  } as Parameters<typeof withQuotationDetails>[0];

  const quotation = (over: Record<string, unknown>) =>
    ({
      id: 'q',
      isLatest: false,
      preparedBy: null,
      totalCost: '0',
      createdOn: '2026-07-10',
      ...over,
    }) as never;

  it('leaves the event untouched when there are no quotations', () => {
    expect(withQuotationDetails(event, [])).toBe(event);
    expect(withQuotationDetails(event, undefined)).toBe(event);
  });

  it('fills contractor, quote date and quoted total from the quotation', () => {
    const resolved = withQuotationDetails(event, [
      quotation({ isLatest: true, preparedBy: 'Build Co Construction Ltd.', totalCost: '18200' }),
    ]);

    expect(resolved.contractorName).toBe('Build Co Construction Ltd.');
    expect(resolved.quoteReceivedDate).toBe('2026-07-10');
    expect(resolved.originalQuoteAmount).toBe(18200);
  });

  it('prices off the latest revision but dates off the first', () => {
    const resolved = withQuotationDetails(event, [
      quotation({ createdOn: '2026-07-10', totalCost: '18200' }),
      quotation({ isLatest: true, createdOn: '2026-07-20', totalCost: '21500' }),
    ]);

    expect(resolved.quoteReceivedDate).toBe('2026-07-10');
    expect(resolved.originalQuoteAmount).toBe(21500);
  });

  it('falls back to the newest revision when no row is flagged latest', () => {
    const resolved = withQuotationDetails(event, [
      quotation({ createdOn: '2026-07-10', totalCost: '18200' }),
      quotation({ createdOn: '2026-07-20', totalCost: '21500' }),
    ]);

    expect(resolved.originalQuoteAmount).toBe(21500);
  });

  it('decodes a JSON-encoded preparedBy into the contractor name', () => {
    const resolved = withQuotationDetails(event, [
      quotation({
        isLatest: true,
        preparedBy: '[{"name": "Altaf Hussain", "role": "Contractor"}]',
      }),
    ]);

    expect(resolved.contractorName).toBe('Altaf Hussain');
  });

  it('keeps only the name when the register folds a role into preparedBy', () => {
    const resolved = withQuotationDetails(event, [
      quotation({ isLatest: true, preparedBy: 'J. Whitfield, Contracts Manager' }),
    ]);

    expect(resolved.contractorName).toBe('J. Whitfield');
  });

  it('never overwrites a value the event already carries', () => {
    const resolved = withQuotationDetails({ ...event, contractorName: 'From the record' }, [
      quotation({ isLatest: true, preparedBy: 'From the quotation' }),
    ]);

    expect(resolved.contractorName).toBe('From the record');
  });

  it('keeps a company name whole when it carries a comma', () => {
    const resolved = withQuotationDetails({ ...event, contractorName: 'Smith, Jones & Co' }, [
      quotation({ isLatest: true, preparedBy: 'From the quotation' }),
    ]);

    expect(resolved.contractorName).toBe('Smith, Jones & Co');
  });

  // The extractor's empty scaffolding is no more a contractor than a missing field is,
  // whichever side it arrives on — the summary must show a dash, never "[]".
  it.each(['[]', '[{}]', '   '])('falls back past the placeholder %s on the record', (name) => {
    const resolved = withQuotationDetails({ ...event, contractorName: name }, [
      quotation({ isLatest: true, preparedBy: 'A. Hussain' }),
    ]);

    expect(resolved.contractorName).toBe('A. Hussain');
  });

  it('names no contractor when both sides are the empty encoding', () => {
    const resolved = withQuotationDetails({ ...event, contractorName: '[]' }, [
      quotation({ isLatest: true, preparedBy: '[]' }),
    ]);

    expect(resolved.contractorName).toBeUndefined();
  });
});

describe('resolveStatusMetric', () => {
  it('prints the register label for the state', () => {
    expect(resolveStatusMetric('IMPLEMENTED').label).toBe('Implemented');
    expect(resolveStatusMetric('QUOTATION_SUBMITTED').label).toBe('Quotation submitted');
  });

  it("prefers the backend's own statusName when it sent one", () => {
    expect(resolveStatusMetric('IMPLEMENTED', 'Closed out').label).toBe('Closed out');
  });

  it('falls back to the mapped label when statusName is blank', () => {
    expect(resolveStatusMetric('DRAFT', '   ').label).toBe('Draft');
  });
});
