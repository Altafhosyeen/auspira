import { describe, expect, it } from 'vitest';
import type { CompensationEventAssessment } from '@/modules/compensation-event/types/compensation-event-assessment.types';
import type {
  QuotationLine,
  QuotationTableRow,
} from '@/modules/compensation-event/types/compensation-event-quotation.types';
import {
  buildAssessedQuotationItems,
  formatAssessmentDays,
  formatAssessmentFigure,
  getAssessmentVariance,
  isAssessedRowEditable,
  parseEmphasis,
} from '@/modules/compensation-event/utils/compensation-event-assessment.utils';

// Stand-in fixture for the assessment utils — the screen itself reads the quotation
// off the signal and never uses these figures at runtime.
const assessmentFixture: CompensationEventAssessment = {
  reference: 'CE-004',
  currency: 'USD',
  lines: [
    {
      id: 'people',
      category: 'people',
      label: 'People',
      description: 'Additional plant operator, 4 weeks',
      members: [
        { id: 'people-js', name: 'John Smith', role: 'Commercial Manager', amount: 4000 },
        { id: 'people-mp', name: 'Michael Patel', role: 'Planning Engineer', amount: 2400 },
        { id: 'people-et', name: 'Emily Turner', role: 'Cost Engineer', amount: 2000 },
      ],
    },
    {
      id: 'equipment',
      category: 'equipment',
      label: 'Equipment',
      description: 'Piling rig - extended hire, night shift premium',
      members: [
        { id: 'equipment-js', name: 'John Smith', role: 'Commercial Manager', amount: 10000 },
        { id: 'equipment-mp', name: 'Michael Patel', role: 'Planning Engineer', amount: 7600 },
        { id: 'equipment-et', name: 'Emily Turner', role: 'Cost Engineer', amount: 5000 },
      ],
    },
    {
      id: 'fee',
      category: 'fee',
      label: 'Fee',
      description: 'Fee % per Contract Data Part 2',
      members: [
        { id: 'fee-js', name: 'John Smith', role: 'Commercial Manager', amount: 4000 },
        { id: 'fee-mp', name: 'Michael Patel', role: 'Planning Engineer', amount: 3500 },
        { id: 'fee-et', name: 'Emily Turner', role: 'Cost Engineer', amount: 2462 },
      ],
    },
  ],
  contractorClaim: { amount: 40962, days: 26 },
  pmAssessment: {
    amount: 38150,
    days: 22,
    note: 'overhead % queried; programme logic partly accepted',
  },
  basis: {
    lead: 'Defined Cost +',
    detail: 'Fee per Cl. 63.1; programme assessed against accepted critical path',
  },
  lateEarlyWarning: {
    riskLabel: 'Last Payment Check',
    rule: 'If an Early Warning that an experienced contractor should have given was **not given in time**, the PM assesses the CE as if the EW had been given on time. This can reduce the Contractor’s entitlement.',
    finding:
      'For CE-004: EW-015 was raised 27 Jun. The Thu 15:48 email shows informal awareness 3 days earlier. Auspira flagged this. PM determined the 3-day gap is immaterial - no reduction applied.',
  },
  comment:
    '3-day gap between informal awareness (Thu email) and formal EW-015 is minor and does not change the mitigation options that would have been available. No reduction.\nAssessment: $38,150/22 days.',
  timeBar: { daysRemaining: 7, deadlineLabel: '21 Aug 2026' },
};

describe('parseEmphasis', () => {
  it('marks the double-asterisk span as strong', () => {
    expect(parseEmphasis('was **not given in time**, the PM assesses')).toEqual([
      { text: 'was ', strong: false },
      { text: 'not given in time', strong: true },
      { text: ', the PM assesses', strong: false },
    ]);
  });

  it('returns a single plain segment when there is no emphasis', () => {
    expect(parseEmphasis('plain copy')).toEqual([{ text: 'plain copy', strong: false }]);
  });

  it('drops the empty segment when emphasis starts the string', () => {
    expect(parseEmphasis('**leading** rest')).toEqual([
      { text: 'leading', strong: true },
      { text: ' rest', strong: false },
    ]);
  });

  it('is empty for an empty string', () => {
    expect(parseEmphasis('')).toEqual([]);
  });

  it('keeps the clause rule readable end to end', () => {
    const segments = parseEmphasis(assessmentFixture.lateEarlyWarning.rule);

    expect(segments.filter((segment) => segment.strong)).toHaveLength(1);
    expect(segments.map((segment) => segment.text).join('')).not.toContain('**');
  });
});

describe('formatAssessmentDays', () => {
  it('pluralises above one', () => {
    expect(formatAssessmentDays(26)).toBe('26 days');
  });

  it('stays singular at one', () => {
    expect(formatAssessmentDays(1)).toBe('1 day');
  });

  it('handles zero', () => {
    expect(formatAssessmentDays(0)).toBe('0 days');
  });
});

describe('formatAssessmentFigure', () => {
  it('joins the amount and the duration', () => {
    expect(formatAssessmentFigure({ amount: 40962, days: 26 }, 'USD')).toBe('$40,962 · 26 days');
  });
});

describe('getAssessmentVariance', () => {
  it('reports the reduction the PM applied', () => {
    expect(
      getAssessmentVariance(assessmentFixture.contractorClaim, assessmentFixture.pmAssessment)
    ).toEqual({ amount: -2812, days: -4 });
  });

  it('is zero when the assessment matches the claim', () => {
    const figure = { amount: 1000, days: 5 };
    expect(getAssessmentVariance(figure, figure)).toEqual({ amount: 0, days: 0 });
  });
});

describe('assessmentFixture', () => {
  it('claims exactly what its lines add up to', () => {
    const total = assessmentFixture.lines
      .flatMap((line) => line.members)
      .reduce((sum, member) => sum + member.amount, 0);

    expect(total).toBe(assessmentFixture.contractorClaim.amount);
  });

  it("seeds the Comment card with the PM's note", () => {
    expect(assessmentFixture.comment).toContain('3-day gap');
  });
});

describe('isAssessedRowEditable', () => {
  const groupRow = (children?: QuotationTableRow[]): QuotationTableRow => ({
    key: 'people',
    isGroup: true,
    item: 'People',
    description: 'plant operatives, banksman, supervision',
    amount: 8420,
    children,
  });

  it('leaves a broken-down category to its members', () => {
    expect(
      isAssessedRowEditable(
        groupRow([
          { key: 'people-a', isGroup: false, item: 'John Smith', description: '', amount: 4000 },
        ])
      )
    ).toBe(false);
  });

  it('edits a category the contractor priced in one line', () => {
    expect(isAssessedRowEditable(groupRow())).toBe(true);
  });

  it('edits a member row', () => {
    expect(
      isAssessedRowEditable({
        key: 'people-a',
        isGroup: false,
        item: 'John Smith',
        description: 'Commercial Manager',
        amount: 4000,
      })
    ).toBe(true);
  });
});

describe('buildAssessedQuotationItems', () => {
  it('sends one item per member of a broken-down category', () => {
    expect(buildAssessedQuotationItems([assessmentFixture.lines[0]])).toEqual([
      { category: 'People', description: 'John Smith - Commercial Manager', amount: 4000 },
      { category: 'People', description: 'Michael Patel - Planning Engineer', amount: 2400 },
      { category: 'People', description: 'Emily Turner - Cost Engineer', amount: 2000 },
    ]);
  });

  // The quoted cost and the allowance are rows of the card, not priced lines, so they are
  // absent from `lines` — but the backend prices off `items`, so both have to travel or
  // the breakdown would not add up to the assessed total the PM saw.
  it('sends the assessed quoted cost and allowance ahead of the priced lines', () => {
    const items = buildAssessedQuotationItems([assessmentFixture.lines[0]], {
      quotationAmount: 14850,
      riskAllowance: 1500,
    });

    expect(items.slice(0, 2)).toEqual([
      { category: 'QuotationAmount', description: 'Quotation Amount', amount: 14850 },
      { category: 'RiskAllowance', description: 'Risk Allowance', amount: 1500 },
    ]);
    expect(items).toHaveLength(5);
  });

  // A PM who priced neither has nothing to send for them, which is not the same as zero.
  it('sends no card rows when neither was assessed', () => {
    expect(buildAssessedQuotationItems([assessmentFixture.lines[0]])).toHaveLength(3);
  });

  it('sends an assessed zero, which is a figure the PM chose', () => {
    const items = buildAssessedQuotationItems([], { quotationAmount: 0, riskAllowance: 0 });

    expect(items).toEqual([
      { category: 'QuotationAmount', description: 'Quotation Amount', amount: 0 },
      { category: 'RiskAllowance', description: 'Risk Allowance', amount: 0 },
    ]);
  });

  it('sends a category the contractor priced in one line as a single item', () => {
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

    expect(buildAssessedQuotationItems(singleLine)).toEqual([
      {
        category: 'Subcontract',
        description: 'specialist rock-breaking subcontractor',
        amount: 18300,
      },
    ]);
  });

  it('keeps the member name when the PM left the description empty', () => {
    const line: QuotationLine[] = [
      {
        id: 'fee',
        category: 'fee',
        label: 'Fee',
        description: '',
        members: [{ id: 'fee-a', name: 'Fee per Cl. 63.1', role: '', amount: 2462 }],
      },
    ];

    expect(buildAssessedQuotationItems(line)).toEqual([
      { category: 'Fee', description: 'Fee per Cl. 63.1', amount: 2462 },
    ]);
  });

  it('prices an unpriced single line at zero rather than dropping it', () => {
    const line: QuotationLine[] = [
      { id: 'other', category: 'other', label: 'Other', description: 'tbc', members: [] },
    ];

    expect(buildAssessedQuotationItems(line)).toEqual([
      { category: 'Other', description: 'tbc', amount: 0 },
    ]);
  });
});
