import { describe, expect, it } from 'vitest';
import {
  toExtractedFields,
  toHealthCheck,
  toProgrammeComparison,
  toProgrammeExtract,
  toProgrammeRevisionLabel,
} from '@/modules/programme/utils/programme-alert.utils';
import { compared, extract } from './programme-alert.fixtures';

// What the extract itself says — decoding the alert's JSON-encoded programme and mapping the
// rows the Extract & Check tab renders. The PM View view models live in the sibling spec.

describe('toProgrammeExtract', () => {
  it('decodes the JSON-encoded programme the alert sends', () => {
    expect(toProgrammeExtract(JSON.stringify(extract()))?.programmeId).toBe('4920');
  });

  it('accepts an object as well, so a stored record feeds the same mapper', () => {
    expect(toProgrammeExtract(extract())?.programmeName).toBe('Cory Waste Transfer Station');
  });

  it('returns null for anything that is not a programme', () => {
    expect(toProgrammeExtract('not json')).toBeNull();
    expect(toProgrammeExtract('')).toBeNull();
    expect(toProgrammeExtract(null)).toBeNull();
    expect(toProgrammeExtract(undefined)).toBeNull();
  });
});

describe('toProgrammeRevisionLabel', () => {
  it('names the stored record by its reference and version', () => {
    expect(toProgrammeRevisionLabel({ reference: 'PRG-004', version: 3 })).toBe('PRG-004 — Rev 3');
  });

  it('leaves the version off a record whose version the API omits', () => {
    expect(toProgrammeRevisionLabel({ reference: 'PRG-004', version: null })).toBe('PRG-004');
  });

  it('reads the revision off the extract when nothing is stored yet', () => {
    expect(toProgrammeRevisionLabel(undefined, extract())).toBe('Extracted from Rev 04');
    expect(toProgrammeRevisionLabel(undefined, extract({ revision: 'Rev 04' }))).toBe(
      'Extracted from Rev 04'
    );
  });

  it('falls back to the programme name and then to generic copy', () => {
    expect(toProgrammeRevisionLabel(undefined, extract({ revision: '' }))).toBe(
      'Extracted from Cory Waste Transfer Station'
    );
    expect(toProgrammeRevisionLabel(null, null)).toBe('Extracted from the submitted programme');
  });
});

describe('toProgrammeComparison', () => {
  it('is null while the programme carries no baseline', () => {
    expect(toProgrammeComparison(extract())).toBeNull();
    expect(toProgrammeComparison(null)).toBeNull();
  });

  it('reads the deltas and the baseline completion off an enabled comparison', () => {
    expect(toProgrammeComparison(compared())).toEqual({
      completionDeltaDays: 14,
      criticalPathDelta: 2,
      activitiesAdded: 3,
      activitiesRemoved: 1,
      activitiesMoved: 4,
      baselinePlannedCompletion: '2027-02-28',
    });
  });
});

describe('toExtractedFields', () => {
  it('counts the key dates, sectional dates and figures off the extract', () => {
    expect(toExtractedFields(extract())).toEqual([
      { title: 'Key dates', valueFound: '2 of 4 present', status: 'review' },
      { title: 'Sectional completion dates', valueFound: '1 of 1 sections dated', status: 'high' },
      // No baseline, so there is no contract-side completion to report — not a wrong date.
      { title: 'Completion Date', valueFound: '—', status: 'missing' },
      { title: 'Planned Completion', valueFound: '12 Jan 2026', status: 'high' },
      {
        title: 'Activities needing the Client',
        valueFound: '245 complete, 5 in progress, 67 not started.',
        status: 'high',
      },
    ]);
  });

  it('reports the baseline completion once a comparison exists', () => {
    expect(toExtractedFields(compared())[2]).toEqual({
      title: 'Completion Date',
      valueFound: '28 Feb 2027',
      status: 'high',
    });
  });

  // The Completion Date is the contract-side date the variance assessment measured against; the
  // planned completion below it is the Contractor's own forecast, so the two can differ.
  it('reads the Completion Date off the variance assessment, not the forecast', () => {
    const rows = toExtractedFields(
      extract({ variance: { dates: { completionDate: '2025-12-01' } } })
    );

    expect(rows[2]).toEqual({
      title: 'Completion Date',
      valueFound: '01 Dec 2025',
      status: 'high',
    });
    expect(rows[3]).toEqual({
      title: 'Planned Completion',
      valueFound: '12 Jan 2026',
      status: 'high',
    });
  });

  it('marks every row missing when there is no extract to read', () => {
    expect(toExtractedFields(null).map((row) => row.status)).toEqual([
      'missing',
      'missing',
      'missing',
      'missing',
      'missing',
    ]);
    expect(toExtractedFields(null)[0].valueFound).toBe('0 of 4 present');
    expect(toExtractedFields(null)[3].valueFound).toBe('—');
  });

  it('reports a fully dated programme as high on the key dates', () => {
    const full = extract({
      keyDatesAndMilestones: {
        startingDate: '2024-05-20',
        contractAwardSubmissionDate: '2024-05-01',
        accessDate: '2024-05-10',
        plannedCompletion: '2026-01-12',
        sectionalKeyDates: [],
      },
    });

    expect(toExtractedFields(full)[0]).toMatchObject({
      valueFound: '4 of 4 present',
      status: 'high',
    });
  });

  it('flags a section the revision names without dating it', () => {
    const undated = extract({
      keyDatesAndMilestones: {
        startingDate: '2024-05-20',
        contractAwardSubmissionDate: '',
        accessDate: '',
        plannedCompletion: '2026-01-12',
        sectionalKeyDates: [
          { name: 'Starting Date', date: '2025-03-27', reference: '3' },
          { name: 'Marine Piling Works Complete', date: '', reference: '179' },
        ],
      },
    });

    expect(toExtractedFields(undated)[1]).toEqual({
      title: 'Sectional completion dates',
      valueFound: '1 of 2 sections dated',
      status: 'review',
    });
  });
});

describe('toHealthCheck', () => {
  it('reads the AI check off the alert and honours its own flag count', () => {
    const view = toHealthCheck(
      {
        flagCount: 2,
        checks: [{ category: 'Scope', finding: 'Method statement absent', note: 'Cl. 31.2' }],
      },
      extract()
    );

    expect(view.title).toBe('AI programme health check');
    expect(view.flagCount).toBe(2);
    expect(view.flags).toEqual([
      { category: 'Scope', finding: 'Method statement absent', note: 'Cl. 31.2' },
    ]);
  });

  it("falls back to the programme's own schedule health when there is no AI check", () => {
    const view = toHealthCheck(
      null,
      extract({
        programmeHealth: [
          {
            severity: 'warning',
            title: 'Open-Ended Activities',
            description: '2 activity/activities have no successor logic.',
            references: ['169', '6'],
          },
        ],
      })
    );

    expect(view.flagCount).toBe(1);
    expect(view.flags[0]).toEqual({
      category: 'Warning',
      finding: 'Open-Ended Activities',
      note: '2 activity/activities have no successor logic. Activities: 169, 6',
    });
  });

  it('reports no flags rather than a phantom count when neither source has one', () => {
    expect(toHealthCheck(null, extract())).toEqual({
      title: 'AI programme health check',
      flagCount: 0,
      flags: [],
    });
  });
});
