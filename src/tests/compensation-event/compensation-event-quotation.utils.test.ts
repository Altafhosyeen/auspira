import { describe, expect, it } from 'vitest';
import type {
  ContractorQuotation,
  QuotationLine,
} from '@/modules/compensation-event/types/compensation-event-quotation.types';
import {
  buildQuotationRows,
  formatQuotationAmount,
  getLineTotal,
  getMemberTint,
  getQuotationGroupKeys,
  getQuotationSummary,
  getQuotationTotal,
  getTotalWithRiskAllowance,
  isQuotationRowBoxed,
  setQuotationMemberAmount,
  setQuotationRowAmount,
  setQuotationRowDescription,
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

// Stand-in quotation for the summary utils — the screen reads the quotation off the
// signal at runtime, these figures only back the tests. Sums to $34,762.
const quotationFixture: ContractorQuotation = {
  reference: 'CE -0014',
  submittedOn: '2026-07-15',
  currency: 'USD',
  riskAllowance: 4098,
  timeBar: { daysRemaining: 7, deadlineLabel: '21 Aug 2026' },
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
        { id: 'fee-js', name: 'John Smith', role: 'Commercial Manager', amount: 1500 },
        { id: 'fee-mp', name: 'Michael Patel', role: 'Planning Engineer', amount: 1200 },
        { id: 'fee-et', name: 'Emily Turner', role: 'Cost Engineer', amount: 1062 },
      ],
    },
  ],
  programmeImpact: [
    { label: 'Delay claimed', value: '26 calendar days to Section 1 Completion' },
    { label: 'Revised completion', value: '9 Sep 2026 (was 14 Aug)' },
    { label: 'Supporting docs', value: 'DW-PRG-0042, accepted programme logic narrative' },
  ],
  submittedBy: [
    {
      id: 'submitted-js',
      name: 'John Smith',
      role: 'Commercial Manager',
      submittedAt: '2026-07-15T14:32:00',
    },
  ],
};

describe('getLineTotal', () => {
  it('sums the members of a line', () => {
    expect(getLineTotal(lines[0])).toBe(6400);
  });

  it('is zero for a line with no members', () => {
    expect(getLineTotal({ ...lines[0], members: [] })).toBe(0);
  });
});

describe('getQuotationTotal', () => {
  it('sums every line', () => {
    expect(getQuotationTotal(lines)).toBe(7462);
  });

  it('is zero for an empty quotation', () => {
    expect(getQuotationTotal([])).toBe(0);
  });

  it('matches the mock quotation line items', () => {
    expect(getQuotationTotal(quotationFixture.lines)).toBe(34762);
  });
});

describe('getTotalWithRiskAllowance', () => {
  it('adds the allowance to the quotation total', () => {
    expect(getTotalWithRiskAllowance(lines, 1000)).toBe(8462);
  });

  it('ignores a non-finite allowance rather than producing NaN', () => {
    expect(getTotalWithRiskAllowance(lines, Number.NaN)).toBe(7462);
  });
});

describe('formatQuotationAmount', () => {
  it('is a dash for a figure the quotation never named', () => {
    expect(formatQuotationAmount(null, 'USD')).toBe('—');
    expect(formatQuotationAmount(undefined, 'USD')).toBe('—');
  });

  it('renders whole dollars with a thousands separator', () => {
    expect(formatQuotationAmount(40962, 'USD')).toBe('$40,962');
  });

  // Rounding every figure to whole units left a card whose rows did not add up to their
  // own total — a 7.26 fee printed as 7 beside a 73.26 total — so pence are kept wherever
  // the contractor actually quoted them.
  it('keeps the pence a quotation priced in', () => {
    expect(formatQuotationAmount(4097.6, 'USD')).toBe('$4,097.60');
    expect(formatQuotationAmount(7.26, 'GBP')).toBe('£7.26');
  });
});

describe('buildQuotationRows', () => {
  const rows = buildQuotationRows(lines);

  it('emits one group row per line carrying the derived total', () => {
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ key: 'people', isGroup: true, amount: 6400 });
  });

  it('nests members as non-group children with unique keys', () => {
    expect(rows[0].children).toHaveLength(2);
    expect(rows[0].children?.[0]).toMatchObject({
      key: 'people-a',
      isGroup: false,
      item: 'John Smith',
      description: 'Commercial Manager',
      amount: 4000,
    });
  });

  it('leaves member rows without a children key so antd draws them as leaves', () => {
    expect(rows[0].children?.[0]).not.toHaveProperty('children');
  });
});

describe('getQuotationGroupKeys', () => {
  it('returns every line id', () => {
    expect(getQuotationGroupKeys(lines)).toEqual(['people', 'fee']);
  });
});

describe('isQuotationRowBoxed', () => {
  const rows = buildQuotationRows(lines);

  it('boxes a category priced in one line whatever the expanded keys say', () => {
    const [row] = buildQuotationRows(singleLine);

    expect(isQuotationRowBoxed(row, ['subcontract'])).toBe(true);
  });

  it('boxes a group that is collapsed', () => {
    expect(isQuotationRowBoxed(rows[0], ['fee'])).toBe(true);
  });

  it('leaves an expanded group in the table', () => {
    expect(isQuotationRowBoxed(rows[0], ['people'])).toBe(false);
  });

  it('never boxes a member row', () => {
    const [member] = rows[0].children ?? [];

    expect(isQuotationRowBoxed(member, [])).toBe(false);
  });
});

describe('getMemberTint', () => {
  it('is stable for the same name', () => {
    expect(getMemberTint('John Smith')).toBe(getMemberTint('John Smith'));
  });

  it('always resolves to a defined tint', () => {
    for (const name of ['John Smith', 'Michael Patel', 'Emily Turner', '']) {
      expect(getMemberTint(name)).toHaveProperty('color');
    }
  });
});

describe('getQuotationSummary', () => {
  it('derives both totals from the lines and the current allowance', () => {
    expect(getQuotationSummary(quotationFixture, 4098)).toEqual({
      quotationTotal: 34762,
      riskAllowance: 4098,
      grandTotal: 38860,
    });
  });

  it('tracks an edited allowance', () => {
    expect(getQuotationSummary(quotationFixture, 0).grandTotal).toBe(34762);
  });

  it('falls back to the stated total when the quotation priced no lines', () => {
    const quotation = { ...quotationFixture, lines: [], declaredTotal: 1200 };

    expect(getQuotationSummary(quotation, 300)).toEqual({
      quotationTotal: 1200,
      riskAllowance: 300,
      grandTotal: 1500,
    });
  });

  // A dash on screen — a quotation that named no figure did not quote zero.
  it('reports no total when the quotation named neither lines nor a figure', () => {
    const quotation = { ...quotationFixture, lines: [], declaredTotal: undefined };

    expect(getQuotationSummary(quotation, 0)).toEqual({
      quotationTotal: null,
      riskAllowance: 0,
      grandTotal: null,
    });
  });
});

describe('setQuotationMemberAmount', () => {
  it('reprices only the member the row key names', () => {
    const next = setQuotationMemberAmount(lines, 'people-b', 3000);

    expect(getLineTotal(next[0])).toBe(7000);
    expect(next[0].members[0].amount).toBe(4000);
    expect(next[1]).toEqual(lines[1]);
  });

  it('leaves the lines untouched when no member matches', () => {
    expect(setQuotationMemberAmount(lines, 'people', 999)).toEqual(lines);
  });

  it('does not mutate the lines it was given', () => {
    setQuotationMemberAmount(lines, 'people-a', 1);

    expect(lines[0].members[0].amount).toBe(4000);
  });
});

describe('setQuotationRowDescription', () => {
  it('edits the line description for a group key', () => {
    const next = setQuotationRowDescription(lines, 'people', 'Night shift cover');

    expect(next[0].description).toBe('Night shift cover');
    expect(next[0].members).toEqual(lines[0].members);
  });

  it('edits the member role for a member key', () => {
    const next = setQuotationRowDescription(lines, 'people-b', 'Senior Planner');

    expect(next[0].members[1].role).toBe('Senior Planner');
    expect(next[0].description).toBe(lines[0].description);
  });

  it('leaves the lines untouched when no row matches', () => {
    expect(setQuotationRowDescription(lines, 'missing', 'x')).toEqual(lines);
  });
});

describe('setQuotationRowAmount', () => {
  it('reprices a category the contractor priced in one line', () => {
    const next = setQuotationRowAmount(singleLine, 'subcontract', 19000);

    expect(next[0].amount).toBe(19000);
    expect(getLineTotal(next[0])).toBe(19000);
  });

  it('reprices the member a member key names', () => {
    const next = setQuotationRowAmount(lines, 'people-b', 3000);

    expect(getLineTotal(next[0])).toBe(7000);
    expect(next[1]).toEqual(lines[1]);
  });

  it('leaves a broken-down line to the sum of its members', () => {
    expect(setQuotationRowAmount(lines, 'people', 999)).toEqual(lines);
  });

  it('does not mutate the lines it was given', () => {
    setQuotationRowAmount(singleLine, 'subcontract', 1);

    expect(singleLine[0].amount).toBe(18300);
  });
});
