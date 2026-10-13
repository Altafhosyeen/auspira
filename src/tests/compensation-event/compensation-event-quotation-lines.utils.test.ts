import { describe, expect, it } from 'vitest';
import {
  buildQuotationLines,
  buildQuotationSummaryRows,
  findQuotationAmountItem,
  findRiskAllowanceItem,
  getQuotationSummaryRowsTotal,
} from '@/modules/compensation-event/utils/compensation-event-quotation.utils';

// Which wire categories become priced lines, and which are left to the rows the card
// builds for them. Kept apart from the summary suite so neither runs past the 500-line cap.
describe('buildQuotationLines', () => {
  // The extractor has labelled the quoted cost `totalCost` and, more recently,
  // `QuotationAmount`. Both name the figure the card already heads itself with, so
  // neither may become a priced line — one that did would render the row twice and
  // count it twice in the total.
  it('leaves the quoted cost off the lines under either of its names', () => {
    const byOldName = buildQuotationLines([
      { id: '1', category: 'totalCost', description: 'Total quoted cost.', amount: 14850 },
      { id: '2', category: 'Fees', description: 'Fees', amount: 1350 },
    ]);
    const byNewName = buildQuotationLines([
      { id: '1', category: 'QuotationAmount', description: 'Quotation Amount', amount: 14850 },
      { id: '2', category: 'Fees', description: 'Fees', amount: 1350 },
    ]);

    expect(byOldName.map((line) => line.label)).toEqual(['Fees']);
    expect(byNewName.map((line) => line.label)).toEqual(['Fees']);
  });

  it('leaves the risk allowance off the lines, since it has a row of its own', () => {
    const lines = buildQuotationLines([
      { id: '1', category: 'RiskAllowance', description: 'Risk Allowance', amount: 1500 },
      { id: '2', category: 'Fees', description: 'Fees', amount: 1350 },
    ]);

    expect(lines.map((line) => line.label)).toEqual(['Fees']);
  });
});

// The payload as the extractor now sends it: every item named the way the card heads it.
describe('a quotation whose items are named as the card heads them', () => {
  const lines = buildQuotationLines([
    { id: '1', category: 'RiskAllowance', description: 'Risk Allowance', amount: 1500 },
    { id: '2', category: 'Fees', description: 'Fees', amount: 1350 },
    { id: '3', category: 'QuotationAmount', description: 'Quotation Amount', amount: 14850 },
  ]);
  const rows = buildQuotationSummaryRows(lines, 1500, 14850);

  it('states each figure once, in the order the frame draws them', () => {
    expect(rows.map((row) => [row.label, row.amount])).toEqual([
      ['Quotation Amount', 14850],
      ['Fees', 1350],
      ['Risk Allowance', 1500],
    ]);
  });

  it('totals the three rows it shows', () => {
    expect(getQuotationSummaryRowsTotal(rows)).toBe(17700);
  });
});

// Once the quotation is persisted the register re-sums `totalCost` to cover every item it
// stored, so reading that back as the quoted cost inflated the row on every reload — the
// figure climbed 14,850 -> 17,700 -> 20,550 as the PM confirmed and revisited the screen.
describe('findQuotationAmountItem', () => {
  const items = [
    { category: 'RiskAllowance', amount: 1500 },
    { category: 'Fees', amount: 1350 },
    { category: 'QuotationAmount', amount: 14850 },
  ];

  it('reads the quoted cost off the item that names it', () => {
    expect(findQuotationAmountItem(items)).toBe(14850);
  });

  it('reads it under the name the extractor used before', () => {
    expect(findQuotationAmountItem([{ category: 'totalCost', amount: 14850 }])).toBe(14850);
  });

  it('finds none where no item names the quoted cost', () => {
    expect(findQuotationAmountItem([{ category: 'Fees', amount: 1350 }])).toBeNull();
    expect(findQuotationAmountItem([])).toBeNull();
  });

  // The stated cost stays put however the payload's own total is summed.
  it('holds the row steady against a total that already covers every item', () => {
    const lines = buildQuotationLines(
      items.map((item, index) => ({ ...item, id: String(index), description: item.category }))
    );
    const rows = buildQuotationSummaryRows(lines, 1500, findQuotationAmountItem(items));

    expect(rows[0]).toMatchObject({ key: 'quotation-amount', amount: 14850 });
    expect(getQuotationSummaryRowsTotal(rows)).toBe(17700);
  });
});

// CE-0023 arrived priced at 33.00 on its own RiskAllowance item while the DTO's top-level
// `riskAllowance` still carried a 1,500 default, so the card read an allowance 45x the one
// the contractor quoted and totalled 1,540 against a payload that stated 73.26.
describe('findRiskAllowanceItem', () => {
  const items = [
    { category: 'RiskAllowance', amount: 33 },
    { category: 'Fees', amount: 7.26 },
    { category: 'QuotationAmount', amount: 33 },
  ];

  it('reads the allowance off the item that prices it', () => {
    expect(findRiskAllowanceItem(items)).toBe(33);
  });

  it('finds none where no item prices an allowance', () => {
    expect(findRiskAllowanceItem([{ category: 'Fees', amount: 7.26 }])).toBeNull();
    expect(findRiskAllowanceItem([])).toBeNull();
  });

  // The card's rows have to add back up to the total the payload states for itself.
  it('totals the card to the figure the payload states', () => {
    const lines = buildQuotationLines(
      items.map((item, index) => ({ ...item, id: String(index), description: item.category }))
    );
    const rows = buildQuotationSummaryRows(
      lines,
      findRiskAllowanceItem(items) ?? 0,
      findQuotationAmountItem(items)
    );

    expect(rows[0]).toMatchObject({ key: 'quotation-amount', amount: 33 });
    expect(rows.at(-1)).toMatchObject({ key: 'risk-allowance', amount: 33 });
    expect(getQuotationSummaryRowsTotal(rows)).toBeCloseTo(73.26, 2);
  });
});
