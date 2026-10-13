import { describe, expect, it } from 'vitest';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  compareClauseNumbers,
  resolveClauseChip,
  resolveRegisterClauseChip,
  toClauseNumber,
  toClauseNumbers,
} from '@/modules/compensation-event/utils/compensation-event-clause.utils';

describe('toClauseNumber', () => {
  it('reads the number off a catalogue label, whichever dash it was written with', () => {
    expect(toClauseNumber('60.1(1) - PM changes Works Information')).toBe('60.1(1)');
    expect(toClauseNumber('60 – Compensation events')).toBe('60');
  });

  it('drops the record\u2019s own "Cl." decoration', () => {
    expect(toClauseNumber('Cl. 62')).toBe('62');
    expect(toClauseNumber('Clause 63.1')).toBe('63.1');
  });

  it('refuses prose, so the chip never passes a sentence off as a reference', () => {
    expect(toClauseNumber('The Contractor did not give an early warning')).toBeUndefined();
    expect(toClauseNumber('')).toBeUndefined();
    expect(toClauseNumber(null)).toBeUndefined();
  });
});

describe('toClauseNumbers', () => {
  it('collects the primary clause and the extras, deduped', () => {
    expect(
      toClauseNumbers({
        clauseNumber: '62',
        clauses: ['62', '63'],
        additionalClauses: ['63', '61.3'],
      })
    ).toEqual(['62', '63', '61.3']);
  });

  it('falls back to the number the description names when no field holds one', () => {
    expect(toClauseNumbers({ clauseDescription: '60 - Compensation events' })).toEqual(['60']);
  });
});

describe('compareClauseNumbers', () => {
  it('orders by segment rather than as text', () => {
    expect(['60.1(12)', '61.3', '60.1(2)', '60'].sort(compareClauseNumbers)).toEqual([
      '60',
      '60.1(2)',
      '60.1(12)',
      '61.3',
    ]);
  });
});

describe('resolveClauseChip', () => {
  it('labels the clauses and names the record on hover', () => {
    expect(
      resolveClauseChip({
        reference: 'CE-004',
        clauseNumber: '62',
        clauseTitle: 'Quotations',
        clauseDescription: 'Cost, time and programme impact',
        additionalClauses: ['63'],
      })
    ).toEqual({
      label: 'CL.62 / 63',
      lines: ['CE-004 – Cost, time and programme impact'],
    });
  });

  it('shows the description as the record states it, echo of the title included', () => {
    expect(
      resolveClauseChip({
        reference: 'CE-004',
        clauseNumber: '60',
        clauseTitle: 'Compensation events',
        clauseDescription: '60 - Compensation events',
      })
    ).toEqual({ label: 'CL.60', lines: ['CE-004 – 60 - Compensation events'] });
  });

  it('falls back to the clause title when the record carries no description', () => {
    expect(
      resolveClauseChip({
        reference: 'CE-004',
        clauseNumber: '60',
        clauseTitle: 'Compensation events',
      })
    ).toEqual({ label: 'CL.60', lines: ['CE-004 – Compensation events'] });

    expect(
      resolveClauseChip({
        reference: 'CE-004',
        clauseNumber: '60',
        clauseTitle: 'Compensation events',
        clauseDescription: '   ',
      })
    ).toEqual({ label: 'CL.60', lines: ['CE-004 – Compensation events'] });
  });

  it('counts the clauses past the third rather than crowding the title', () => {
    expect(
      resolveClauseChip({
        clauseNumber: '60',
        additionalClauses: ['61', '62', '63', '64'],
      })?.label
    ).toBe('CL.60 / 61 / 62 +2');
  });

  it('drops the chip when the record cites no clause at all', () => {
    expect(resolveClauseChip({ reference: 'CE-004' })).toBeUndefined();
    expect(resolveClauseChip(undefined)).toBeUndefined();
  });
});

describe('resolveRegisterClauseChip', () => {
  it('stands for every clause the register\u2019s events sit under, in clause order', () => {
    expect(
      resolveRegisterClauseChip([
        { reference: 'CE-002', clauseNumber: '63', clauseTitle: 'Assessing' },
        { reference: 'CE-001', clauseNumber: '62', clauseTitle: 'Quotations' },
      ])
    ).toEqual({
      label: 'CL.62 / 63',
      lines: ['CL.62 – Quotations', 'CL.63 – Assessing'],
    });
  });

  it('gives an extra clause its number only — the wording belongs to the primary one', () => {
    expect(
      resolveRegisterClauseChip([
        { clauseNumber: '62', clauseTitle: 'Quotations', additionalClauses: ['61.3'] },
      ])
    ).toEqual({ label: 'CL.61.3 / 62', lines: ['CL.61.3', 'CL.62 – Quotations'] });
  });

  it('drops the chip on an empty register rather than inventing clauses', () => {
    expect(resolveRegisterClauseChip([])).toBeUndefined();
    expect(resolveRegisterClauseChip([{ reference: 'CE-001' }])).toBeUndefined();
  });
});
