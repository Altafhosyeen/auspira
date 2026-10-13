import { describe, expect, it } from 'vitest';
import { QuotationStatus } from '@/constants/enum.constant';
import type { QuotationLine } from '@/modules/compensation-event/types/compensation-event-quotation.types';
import type { QuotationResponseDto } from '@/modules/compensation-event/types/compensation-event-quotation-api.types';
import {
  buildQuotationSummaryRows,
  formatQuotationDaysClaimed,
  getLineTotal,
  getQuotationSummary,
  getQuotationSummaryRowsTotal,
  setQuotationRowAmount,
  toContractorQuotation,
} from '@/modules/compensation-event/utils/compensation-event-quotation.utils';

// A category the contractor did not break down: no members, and the amount on the line.
const singleLine: QuotationLine[] = [
  {
    id: 'subcontract',
    category: 'other',
    label: 'Subcontract',
    description: 'specialist rock-breaking subcontractor',
    members: [],
    amount: 18300,
  },
];

const lines: QuotationLine[] = [
  {
    id: 'people',
    category: 'people',
    label: 'People',
    description: 'Additional plant operator, 4 weeks',
    members: [
      { id: 'a', name: 'John Smith', role: 'Commercial Manager', amount: 4000 },
      { id: 'b', name: 'Michael Patel', role: 'Planning Engineer', amount: 2400 },
    ],
  },
  {
    id: 'fee',
    category: 'fee',
    label: 'Fee',
    description: 'Fee % per Contract Data Part 2',
    members: [{ id: 'c', name: 'Emily Turner', role: 'Cost Engineer', amount: 1062 }],
  },
];

// GET /api/quotations/{id} — what the register's View Quotation link opens.
const quotationDto: QuotationResponseDto = {
  id: 'quotation-1',
  compensationEventId: 'event-1',
  ceReference: 'CE-0001',
  version: 2,
  isLatest: true,
  status: QuotationStatus.PendingReview,
  totalCost: 25300,
  currency: 'GBP',
  preparedBy: 'J. Whitfield, Contracts Manager',
  delayClaimedDays: 5,
  originalCompletionDate: '2026-09-01T00:00:00Z',
  revisedCompletionDate: '2026-09-06T00:00:00Z',
  supportingProgrammeReference: 'PROG-14',
  programmeNarrative: null,
  riskAllowance: 2300,
  riskAllowanceDescription: 'Residual ground-condition risk',
  createdOn: '2026-08-01T09:00:00Z',
  items: [
    { id: 'item-1', category: 'People', description: 'A. Mason', amount: 12000 },
    { id: 'item-2', category: 'People', description: 'B. Ruiz', amount: 8000 },
    { id: 'item-3', category: 'PlantAndMaterials', description: 'excavator hire', amount: 3000 },
  ],
};

describe('toContractorQuotation', () => {
  it('names the quotation by the compensation event it prices', () => {
    expect(toContractorQuotation(quotationDto).reference).toBe('CE-0001');
  });

  it('reads the allowance the contractor priced rather than starting at zero', () => {
    const quotation = toContractorQuotation(quotationDto);

    expect(quotation.riskAllowance).toBe(2300);
    expect(quotation.riskAllowanceDescription).toBe('Residual ground-condition risk');
  });

  it('leaves the allowance at zero when the response carries none', () => {
    const quotation = toContractorQuotation({
      ...quotationDto,
      riskAllowance: null,
      riskAllowanceDescription: null,
    });

    expect(quotation.riskAllowance).toBe(0);
    expect(quotation.riskAllowanceDescription).toBeUndefined();
  });

  it('groups the items by category, expanding only the ones broken down', () => {
    const { lines } = toContractorQuotation(quotationDto);

    expect(lines.map((line) => line.label)).toEqual(['People', 'Plant And Materials']);
    expect(getLineTotal(lines[0])).toBe(20000);
    // One item in the category, so it stays a plain priced line with no members.
    expect(lines[1].members).toHaveLength(0);
    expect(getLineTotal(lines[1])).toBe(3000);
  });

  it('splits the role out of the preparer the register folds into one field', () => {
    expect(toContractorQuotation(quotationDto).submittedBy).toEqual([
      {
        id: 'quotation-1',
        name: 'J. Whitfield',
        role: 'Contracts Manager',
        submittedAt: '2026-08-01T09:00:00Z',
      },
    ]);
  });

  it('reads preparer rows the column stored as JSON instead of printing the encoding', () => {
    expect(
      toContractorQuotation({
        ...quotationDto,
        preparedBy: '[{"name": "Altaf Hussain", "role": "Project Team"}]',
      }).submittedBy
    ).toEqual([
      {
        id: 'quotation-1-0',
        name: 'Altaf Hussain',
        role: 'Project Team',
        submittedAt: '2026-08-01T09:00:00Z',
      },
    ]);
  });

  it('falls back to the folded form when the field is not JSON', () => {
    expect(toContractorQuotation({ ...quotationDto, preparedBy: '{not json' }).submittedBy).toEqual(
      [
        {
          id: 'quotation-1',
          name: '{not json',
          role: '',
          submittedAt: '2026-08-01T09:00:00Z',
        },
      ]
    );
  });

  it('totals the lines and the allowance together', () => {
    const quotation = toContractorQuotation(quotationDto);

    expect(getQuotationSummary(quotation, quotation.riskAllowance)).toEqual({
      quotationTotal: 23000,
      riskAllowance: 2300,
      grandTotal: 25300,
    });
  });
  it('reads delayClaimedDays onto the model, so the assessment can open on it', () => {
    expect(toContractorQuotation(quotationDto).delayClaimedDays).toBe(5);
  });

  it('leaves the claimed delay undefined when the quotation claimed no time impact', () => {
    expect(
      toContractorQuotation({ ...quotationDto, delayClaimedDays: null }).delayClaimedDays
    ).toBeUndefined();
  });
});

describe('buildQuotationSummaryRows', () => {
  it('states every priced item flat, with no category grouping over the top', () => {
    expect(buildQuotationSummaryRows(lines, 0)).toEqual([
      { key: 'quotation-amount', label: 'Quotation Amount', hint: expect.any(String), amount: 0 },
      { key: 'people-a', label: 'John Smith', hint: 'People', amount: 4000 },
      { key: 'people-b', label: 'Michael Patel', hint: 'People', amount: 2400 },
      { key: 'fee-c', label: 'Emily Turner', hint: 'Fee', amount: 1062 },
      { key: 'risk-allowance', label: 'Risk Allowance', hint: expect.any(String), amount: 0 },
    ]);
  });

  it('keys a member row the way setQuotationRowAmount resolves it, so an edit lands', () => {
    const [, row] = buildQuotationSummaryRows(lines, 0);
    const next = setQuotationRowAmount(lines, row.key, 5500);

    expect(next[0].members[0].amount).toBe(5500);
  });

  it('gives a category priced in one line a row of its own, keyed by the line', () => {
    const [, row] = buildQuotationSummaryRows(singleLine, 0);

    expect(row).toEqual({
      key: 'subcontract',
      label: 'Subcontract',
      hint: 'specialist rock-breaking subcontractor',
      amount: 18300,
    });
    expect(setQuotationRowAmount(singleLine, row.key, 20000)[0].amount).toBe(20000);
  });

  it('heads a row with the rate the contractor quoted, in brackets after the label', () => {
    const fee: QuotationLine[] = [
      {
        id: 'fee',
        category: 'fee',
        label: 'Fees',
        description: 'Fee at 3.5% per Contract Data Part 2',
        members: [],
        amount: 1598,
      },
    ];

    expect(buildQuotationSummaryRows(fee, 0)[1]).toEqual({
      key: 'fee',
      label: 'Fees (3.5%)',
      hint: 'Fee at 3.5% per Contract Data Part 2',
      amount: 1598,
    });
  });

  it('keeps the info hint beside a row whose rate already heads it', () => {
    const fee: QuotationLine[] = [
      { id: 'fee', category: 'fee', label: 'Fees', description: 'Fees 3.5 %', members: [] },
    ];

    expect(buildQuotationSummaryRows(fee, 0)[1]).toEqual({
      key: 'fee',
      label: 'Fees (3.5%)',
      hint: 'Fees 3.5 %',
      amount: 0,
    });
  });

  it('states a whole-number rate without trailing zeros', () => {
    const fee: QuotationLine[] = [
      { id: 'fee', category: 'fee', label: 'Fees', description: '10.00%', members: [] },
    ];

    expect(buildQuotationSummaryRows(fee, 0)[1].label).toBe('Fees (10%)');
  });

  it('leaves a line that quoted no rate exactly as the contractor labelled it', () => {
    expect(buildQuotationSummaryRows(singleLine, 0)[1].label).toBe('Subcontract');
  });

  it('leaves the hint off a row the contractor described with nothing', () => {
    const unnamed: QuotationLine[] = [
      { id: 'other', category: 'other', label: 'Other', description: '   ', members: [] },
    ];

    expect(buildQuotationSummaryRows(unnamed, 0)[1]).toEqual({
      key: 'other',
      label: 'Other',
      hint: undefined,
      amount: 0,
    });
  });

  // The quoted cost heads the card exactly as the quotation stated it, with the fee and
  // the allowance listed under it as further lines — every figure as the backend sent it.
  it('leads with the cost the quotation stated, unchanged', () => {
    const rows = buildQuotationSummaryRows(
      [
        {
          id: 'fee',
          category: 'fee',
          label: 'Fee',
          description: '10% fee',
          members: [],
          amount: 1350,
        },
      ],
      1500,
      14850
    );

    expect(rows.map((row) => [row.label, row.amount])).toEqual([
      ['Quotation Amount', 14850],
      ['Fee (10%)', 1350],
      ['Risk Allowance', 1500],
    ]);
  });

  // The fee and the allowance are added on top of the quoted cost, so the card's total
  // runs past the stated `totalCost` rather than back to it.
  it('totals the quoted cost, the fee and the allowance together', () => {
    const rows = buildQuotationSummaryRows(
      [
        {
          id: 'fee',
          category: 'fee',
          label: 'Fee',
          description: '10% fee',
          members: [],
          amount: 1350,
        },
      ],
      1500,
      14850
    );

    expect(getQuotationSummaryRowsTotal(rows)).toBe(17700);
  });

  // Fee figures are the backend's arithmetic now; the card states whatever it sends.
  it('states a fee at the figure the backend sent', () => {
    const rows = buildQuotationSummaryRows(
      [
        {
          id: 'fee',
          category: 'fee',
          label: 'Fee',
          description: 'Fee as agreed under the subcontract.',
          members: [],
          amount: 1350,
        },
      ],
      0,
      14850
    );

    expect(rows[1]).toMatchObject({ label: 'Fee', amount: 1350 });
  });

  // The card states the same three headline figures on every quotation, so a reader
  // never has to work out whether a missing line means nothing was priced or nothing
  // was sent. A figure the wire did not name reads as zero.
  it('states a base cost of zero when the quotation stated no total at all', () => {
    expect(buildQuotationSummaryRows(lines, 0)[0]).toMatchObject({
      key: 'quotation-amount',
      amount: 0,
    });
  });

  it('appends a priced risk allowance as its own last row', () => {
    const rows = buildQuotationSummaryRows(lines, 900);

    expect(rows).toHaveLength(5);
    expect(rows[4]).toMatchObject({ key: 'risk-allowance', amount: 900 });
  });

  it('states an allowance the contractor did not price as zero', () => {
    for (const allowance of [0, Number.NaN]) {
      const rows = buildQuotationSummaryRows(lines, allowance);

      expect(rows).toHaveLength(5);
      expect(rows[4]).toMatchObject({ key: 'risk-allowance', amount: 0 });
    }
  });
});

describe('getQuotationSummaryRowsTotal', () => {
  it('sums the rows, so the card total can never contradict the lines above it', () => {
    expect(getQuotationSummaryRowsTotal(buildQuotationSummaryRows(lines, 900))).toBe(8362);
  });

  // The headline rows always state a figure now, so a quotation that priced nothing
  // totals zero rather than nothing at all. An empty row set still has no total: that
  // is no quotation rather than a quotation for nothing.
  it('totals a quotation that priced nothing as zero', () => {
    const unpriced = buildQuotationSummaryRows(
      [{ id: 'other', category: 'other', label: 'Other', description: '', members: [] }],
      0
    );

    expect(getQuotationSummaryRowsTotal(unpriced)).toBe(0);
  });

  it('is null when there is not one row to total', () => {
    expect(getQuotationSummaryRowsTotal([])).toBeNull();
  });

  it('counts a priced row even when another named no figure', () => {
    expect(
      getQuotationSummaryRowsTotal([
        { key: 'a', label: 'A', amount: null },
        { key: 'b', label: 'B', amount: 250 },
      ])
    ).toBe(250);
  });
});

describe('formatQuotationDaysClaimed', () => {
  it('states the claimed delay in days', () => {
    expect(formatQuotationDaysClaimed(7)).toBe('7 days');
  });

  it('says a single day in the singular', () => {
    expect(formatQuotationDaysClaimed(1)).toBe('1 day');
  });

  it('reads a claim of zero days as a claim, not as an absent one', () => {
    expect(formatQuotationDaysClaimed(0)).toBe('0 days');
  });

  // Undefined means the quotation claimed no time impact at all, which the card words
  // rather than printing as "0 days".
  it('words a quotation that claimed no time impact', () => {
    expect(formatQuotationDaysClaimed(undefined)).toBe('Not claimed');
    expect(formatQuotationDaysClaimed(null)).toBe('Not claimed');
    expect(formatQuotationDaysClaimed(Number.NaN)).toBe('Not claimed');
  });

  it('reads the figure the DTO carried, so the card states what the contractor claimed', () => {
    expect(formatQuotationDaysClaimed(toContractorQuotation(quotationDto).delayClaimedDays)).toBe(
      '5 days'
    );
  });
});
