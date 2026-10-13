import { describe, expect, it } from 'vitest';
import type { ProjectAlert } from '@/hooks/modules/project-alerts';
import {
  buildQuotationRows,
  buildQuotationSummaryRows,
  getLineTotal,
  getQuotationSummaryRowsTotal,
  getQuotationTotal,
} from '@/modules/compensation-event/utils/compensation-event-quotation.utils';
import {
  getAlertQuotationReference,
  parseAlertQuotation,
  toContractorQuotationFromAlert,
} from '@/modules/compensation-event/utils/compensation-event-quotation-alert.utils';

// The quotation the extractor writes onto an alert, verbatim from a signal in the wild.
const ALERT_QUOTATION = {
  totalCost: 48558.0,
  currency: '£',
  preparedBy: 'J. Whitfield, Contracts Manager',
  delayClaimedDays: 12,
  originalCompletionDate: '2026-09-22T00:00:00Z',
  revisedCompletionDate: '2026-10-04T00:00:00Z',
  supportingProgrammeReference: 'Accepted Programme dated 3 March 2026',
  programmeNarrative: 'The event delayed access to the Pier 3 pile cap works by 12 working days.',
  items: [
    { category: 'People', description: 'plant operatives, banksman, supervision', amount: 8420.0 },
    {
      category: 'Equipment',
      description: 'rock breaker hire, excavator standing',
      amount: 11650.0,
    },
    { category: 'PlantAndMaterials', description: 'disposal of excavated rock', amount: 4980.0 },
    {
      category: 'Subcontract',
      description: 'specialist rock-breaking subcontractor',
      amount: 18300,
    },
    { category: 'Fee', description: '12% of Defined Cost', amount: 5208.0 },
  ],
};

const quotationAlert = {
  id: 'alert-1',
  title: 'Compensation Event Quotation Submission',
  createdOn: '2026-08-17T18:57:16.195896Z',
  overdueDateTime: null,
  compensationEventReference: 'CE-014 (not linked with any known Compensation Event in Auspira)',
  quotation: JSON.stringify(ALERT_QUOTATION),
} as unknown as ProjectAlert;

describe('parseAlertQuotation', () => {
  it('reads the items off the alert payload', () => {
    expect(parseAlertQuotation(quotationAlert.quotation)?.items).toHaveLength(5);
  });

  it('unwraps a payload nested under its own quotation key', () => {
    const raw = JSON.stringify({ quotation: ALERT_QUOTATION });

    expect(parseAlertQuotation(raw)?.totalCost).toBe(48558);
  });

  it('tolerates the PascalCase keys the extractor also sends', () => {
    const raw = JSON.stringify({
      Currency: '£',
      PreparedBy: 'A. Khan',
      Items: [{ Category: 'Fee', Description: '12% of Defined Cost', Amount: 5208 }],
    });

    expect(parseAlertQuotation(raw)).toMatchObject({
      currency: '£',
      preparedBy: 'A. Khan',
      items: [{ category: 'Fee', amount: 5208 }],
    });
  });

  it('is null when unset, unparseable or carrying nothing the extractor filled', () => {
    expect(parseAlertQuotation(null)).toBeNull();
    expect(parseAlertQuotation('not json')).toBeNull();
    expect(
      parseAlertQuotation(
        JSON.stringify({ totalCost: null, currency: '', preparedBy: [], items: [] })
      )
    ).toBeNull();
  });

  // A quotation mail routinely states its programme impact without pricing a single item.
  it('keeps a payload that priced no items but stated a programme impact', () => {
    const raw = JSON.stringify({
      totalCost: null,
      currency: '',
      preparedBy: [{ name: 'Altaf Hussain', role: '' }],
      delayClaimedDays: 7,
      items: [],
    });

    expect(parseAlertQuotation(raw)).toMatchObject({
      delayClaimedDays: 7,
      preparedBy: [{ name: 'Altaf Hussain' }],
      items: [],
    });
  });

  it('lower-camels the keys of preparer rows as well', () => {
    const raw = JSON.stringify({ PreparedBy: [{ Name: 'A. Khan', Role: 'QS' }] });

    expect(parseAlertQuotation(raw)?.preparedBy).toEqual([{ name: 'A. Khan', role: 'QS' }]);
  });
});

describe('getAlertQuotationReference', () => {
  it("drops the extractor's note about its own match", () => {
    expect(getAlertQuotationReference(quotationAlert)).toBe('CE-014');
  });

  it('is empty when the alert names no reference', () => {
    expect(getAlertQuotationReference({} as ProjectAlert)).toBe('');
  });

  // The extractor writes every key it looked for, so a CE quotation arrives with
  // `pmiReference` present but blank — the CE reference behind it still has to be read.
  it('reads past a reference the extractor wrote as an empty string', () => {
    const alert = {
      pmiReference: '',
      compensationEventReference: 'CE-0027',
    } as ProjectAlert;

    expect(getAlertQuotationReference(alert)).toBe('CE-0027');
  });

  it('reads past a reference the extractor wrote as whitespace', () => {
    const alert = {
      pmiReference: '   ',
      compensationEventReference: 'CE-0027',
    } as ProjectAlert;

    expect(getAlertQuotationReference(alert)).toBe('CE-0027');
  });

  it('still prefers a PMI reference the extractor actually named', () => {
    const alert = {
      pmiReference: 'PMI-003',
      compensationEventReference: 'CE-0027',
    } as ProjectAlert;

    expect(getAlertQuotationReference(alert)).toBe('PMI-003');
  });
});

describe('toContractorQuotationFromAlert', () => {
  const quotation = toContractorQuotationFromAlert(quotationAlert);

  it('groups the items by category', () => {
    expect(quotation?.lines.map((line) => line.label)).toEqual([
      'People',
      'Equipment',
      'Plant And Materials',
      'Subcontract',
      'Fee',
    ]);
  });

  it('leaves a category priced in one line without members, carrying its own amount', () => {
    const [people] = quotation?.lines ?? [];

    expect(people.members).toEqual([]);
    expect(people.description).toBe('plant operatives, banksman, supervision');
    expect(getLineTotal(people)).toBe(8420);
  });

  it('totals to the quoted cost', () => {
    expect(getQuotationTotal(quotation?.lines ?? [])).toBe(ALERT_QUOTATION.totalCost);
  });

  it('folds the symbol currency onto a code Intl accepts', () => {
    expect(quotation?.currency).toBe('GBP');
  });

  it('splits the preparer into a name and a role', () => {
    expect(quotation?.submittedBy).toEqual([
      {
        id: 'alert-1',
        name: 'J. Whitfield',
        role: 'Contracts Manager',
        submittedAt: quotationAlert.createdOn,
      },
    ]);
  });

  it('builds the programme impact off the payload dates', () => {
    expect(quotation?.programmeImpact).toEqual([
      { label: 'Delay claimed', value: '12 calendar days' },
      { label: 'Revised completion', value: '04 Oct 2026 (was 22 Sep 2026)' },
      {
        label: 'Supporting docs',
        value: `${ALERT_QUOTATION.supportingProgrammeReference}, ${ALERT_QUOTATION.programmeNarrative}`,
      },
    ]);
  });

  it('is undefined when the alert carries no quotation', () => {
    expect(toContractorQuotationFromAlert({ id: 'a' } as ProjectAlert)).toBeUndefined();
  });
});

// The shape a quotation mail that priced nothing arrives in: a programme impact, a named
// preparer, and not a single item.
describe('toContractorQuotationFromAlert for an un-itemised quotation', () => {
  const alert = {
    id: 'alert-2',
    createdOn: '2026-08-19T18:59:00.100532Z',
    compensationEventReference: '',
    quotation: JSON.stringify({
      totalCost: null,
      currency: '',
      preparedBy: [{ name: 'Altaf Hussain', role: '' }],
      delayClaimedDays: 7,
      originalCompletionDate: '2026-07-14T00:00:00Z',
      revisedCompletionDate: '2026-07-21T00:00:00Z',
      supportingProgrammeReference: '',
      programmeNarrative: 'One week of delay to the programme.',
      items: [],
      riskAllowance: null,
    }),
  } as ProjectAlert;
  const quotation = toContractorQuotationFromAlert(alert);

  it('is read off the alert rather than dropped for having no items', () => {
    expect(quotation).toBeDefined();
    expect(quotation?.lines).toEqual([]);
  });

  it('keeps the preparer rows the extractor already split into name and role', () => {
    expect(quotation?.submittedBy).toEqual([
      { id: 'alert-2-0', name: 'Altaf Hussain', role: '', submittedAt: alert.createdOn },
    ]);
  });

  it('still reports the programme impact the mail stated', () => {
    expect(quotation?.programmeImpact).toEqual([
      { label: 'Delay claimed', value: '7 calendar days' },
      { label: 'Revised completion', value: '21 Jul 2026 (was 14 Jul 2026)' },
      { label: 'Supporting docs', value: 'One week of delay to the programme.' },
    ]);
  });
});

describe('buildQuotationRows for a line with no members', () => {
  const rows = buildQuotationRows(toContractorQuotationFromAlert(quotationAlert)?.lines ?? []);

  it('leaves the group a leaf so the table draws it as a plain row', () => {
    expect(rows[0]).toMatchObject({ isGroup: true, item: 'People', amount: 8420 });
    expect(rows[0].children).toBeUndefined();
  });
});

describe('toContractorQuotationFromAlert carries the claimed delay as a number', () => {
  it('reads the delayClaimedDays the extractor wrote onto the model', () => {
    expect(toContractorQuotationFromAlert(quotationAlert)?.delayClaimedDays).toBe(12);
  });
});

// A signal in the wild whose extractor itemised only the fee and the allowance, stating
// the cost they were applied to nowhere but the quotation's own total. The card has to
// total to that £14,850 rather than to the £2,850 it broke out.
describe('a quotation that stated its total without itemising the cost behind it', () => {
  const alert = {
    id: 'alert-3',
    createdOn: '2026-07-15T00:00:00Z',
    compensationEventReference: 'CE -0014',
    quotation: JSON.stringify({
      compensationEvent: null,
      quotation: {
        totalCost: 14850.0,
        currency: '£',
        preparedBy: [{ name: 'Contractor', role: '' }],
        delayClaimedDays: 14,
        items: [
          {
            category: 'RiskAllowance',
            description: 'Risk allowance included as identified in the quotation.',
            amount: 1500.0,
          },
          {
            category: 'Fee',
            description: 'Fee of £1,350 representing 10% applied to the cost before fee.',
            amount: 1350.0,
          },
          {
            category: 'totalCost',
            description: 'Total quoted cost for the compensation event.',
            amount: 14850.0,
          },
        ],
        riskAllowance: 1500.0,
        riskAllowanceDescription: 'Risk allowance included as identified in the quotation.',
      },
    }),
  } as unknown as ProjectAlert;

  const quotation = toContractorQuotationFromAlert(alert);
  const rows = buildQuotationSummaryRows(
    quotation?.lines ?? [],
    quotation?.riskAllowance ?? 0,
    quotation?.declaredTotal
  );

  // The allowance has a row of its own and the total is not a priced work item, so
  // neither category is folded into the lines as one.
  it('prices the fee alone, leaving the allowance and the total off the lines', () => {
    expect(quotation?.lines.map((line) => line.label)).toEqual(['Fee']);
  });

  // The fee's own wording names the rate it was struck at, so the row heads with it.
  it('states the quoted cost, the fee and the allowance, in that order', () => {
    expect(rows.map((row) => [row.label, row.amount])).toEqual([
      ['Quotation Amount', 14850],
      ['Fee (10%)', 1350],
      ['Risk Allowance', 1500],
    ]);
  });

  it('totals the quoted cost, the fee and the allowance together', () => {
    expect(getQuotationSummaryRowsTotal(rows)).toBe(17700);
  });
});
