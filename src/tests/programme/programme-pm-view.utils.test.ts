import { describe, expect, it } from 'vitest';
import {
  countClientObligations,
  countDatedSections,
  toClientObligationGroups,
  toPmViewContractDates,
  toPmViewKeyDates,
  toSectionalCompletions,
  toVarianceView,
} from '@/modules/programme/utils/programme-alert.utils';
import { compared, extract } from './programme-alert.fixtures';

// The view models the three table-driven tabs render — PM View, Variance and Client
// Obligations — all derived from the same submitted programme.

describe('toPmViewContractDates', () => {
  it('shows only the dates the extract actually carries, in reading order', () => {
    expect(toPmViewContractDates(extract())).toEqual([
      expect.objectContaining({ label: 'Planned Completion', date: '12 Jan 2026' }),
      expect.objectContaining({ label: 'Starting Date', date: '20 May 2024' }),
    ]);
  });

  // The data date is the point the schedule was progressed to, not a date the contract fixes,
  // and Extract & Check already reports it — so the tile strip does not repeat it.
  it('leaves the data date to the Extract & Check tab', () => {
    expect(toPmViewContractDates(extract()).map((tile) => tile.label)).not.toContain('Data Date');
  });

  it('leads with contract completion once a baseline exists', () => {
    expect(toPmViewContractDates(compared())[0]).toEqual({
      label: 'Completion Date',
      date: '28 Feb 2027',
      caption: expect.any(String),
    });
  });

  it('has no tiles for an absent extract', () => {
    expect(toPmViewContractDates(null)).toEqual([]);
  });
});

describe('toPmViewKeyDates', () => {
  it('maps each sectional key date with the reference it came from', () => {
    expect(
      toPmViewKeyDates(
        extract({
          keyDatesAndMilestones: {
            startingDate: '',
            contractAwardSubmissionDate: '',
            accessDate: '',
            plannedCompletion: '',
            sectionalKeyDates: [
              { name: 'Starting Date', date: '2025-03-27', reference: '3' },
              { name: 'Marine Piling Works Complete', date: '2025-10-06', reference: '179' },
            ],
          },
        })
      )
    ).toEqual([
      { label: 'Starting Date', reference: '3', date: '27 Mar 2025', dated: true },
      // Zero-padded day, matching the register table's own `DD MMM YYYY`.
      { label: 'Marine Piling Works Complete', reference: '179', date: '06 Oct 2025', dated: true },
    ]);
  });

  // The extract states no status per milestone, so the row's status is whether the revision
  // dated it — the one gap the key-dates listing can report on its own.
  it('reports a milestone the revision names without dating it as not dated', () => {
    const rows = toPmViewKeyDates(
      extract({
        keyDatesAndMilestones: {
          startingDate: '',
          contractAwardSubmissionDate: '',
          accessDate: '',
          plannedCompletion: '',
          sectionalKeyDates: [{ name: 'Marine Piling Works Complete', date: '', reference: '179' }],
        },
      })
    );

    expect(rows[0]).toEqual({
      label: 'Marine Piling Works Complete',
      reference: '179',
      date: '',
      dated: false,
    });
  });

  it('has no rows for an absent extract', () => {
    expect(toPmViewKeyDates(null)).toEqual([]);
  });
});

describe('toSectionalCompletions', () => {
  it('carries each section off the extract with the status the backend sent for it', () => {
    const rows = toSectionalCompletions(
      extract({
        keyDatesAndMilestones: {
          startingDate: '',
          contractAwardSubmissionDate: '',
          accessDate: '',
          plannedCompletion: '',
          sectionalKeyDates: [
            { name: 'Starting Date', date: '2025-03-27', reference: '3', status: 'completed' },
            { name: 'Marine Piling Works Complete', date: '', reference: '179' },
          ],
        },
      })
    );

    expect(rows).toEqual([
      {
        section: 'Starting Date',
        reference: '3',
        completionDate: '27 Mar 2025',
        dated: true,
        status: { label: 'Completed', tone: 'positive' },
      },
      // No date and no status on the revision, so the row reports the gap and the status cell
      // stays empty.
      {
        section: 'Marine Piling Works Complete',
        reference: '179',
        completionDate: '',
        dated: false,
        status: undefined,
      },
    ]);
    expect(countDatedSections(rows)).toBe(1);
  });

  it('reads the backend status off an undated section too', () => {
    const rows = toSectionalCompletions(
      extract({
        keyDatesAndMilestones: {
          startingDate: '',
          contractAwardSubmissionDate: '',
          accessDate: '',
          plannedCompletion: '',
          sectionalKeyDates: [
            { name: 'Marine Piling Works Complete', date: '', reference: '179', status: 'pending' },
          ],
        },
      })
    );

    expect(rows[0]).toMatchObject({
      completionDate: '',
      dated: false,
      status: { label: 'Pending', tone: 'warning' },
    });
  });

  // A status the backend adds after this mapping still shows — its own wording, on the neutral
  // tone — rather than vanishing from the column.
  it('renders an unmapped status from the raw wording', () => {
    const rows = toSectionalCompletions(
      extract({
        keyDatesAndMilestones: {
          startingDate: '',
          contractAwardSubmissionDate: '',
          accessDate: '',
          plannedCompletion: '',
          sectionalKeyDates: [
            {
              name: 'Marine Piling Works Complete',
              date: '2025-10-06',
              reference: '179',
              status: 'in progress',
            },
          ],
        },
      })
    );

    expect(rows[0].status).toEqual({ label: 'In Progress', tone: 'neutral' });
  });

  it('strips the control characters the extractor leaves in a section name', () => {
    const rows = toSectionalCompletions(
      extract({
        keyDatesAndMilestones: {
          startingDate: '',
          contractAwardSubmissionDate: '',
          accessDate: '',
          plannedCompletion: '',
          sectionalKeyDates: [{ name: 'Section\u0001 One', date: '2025-03-27', reference: '3' }],
        },
      })
    );

    expect(rows[0].section).toBe('Section One');
  });

  it('has no rows for an absent extract', () => {
    expect(toSectionalCompletions(null)).toEqual([]);
    expect(countDatedSections([])).toBe(0);
  });
});

describe('toVarianceView', () => {
  it('reports the float off the critical path and no variance without a baseline', () => {
    const view = toVarianceView(extract());

    expect(view.direction).toBeUndefined();
    expect(view.dates).toEqual([
      { label: 'Completion Date', value: '—' },
      { label: 'Planned Completion', value: '12 Jan 2026' },
      { label: 'Variance', value: '—', tone: undefined },
    ]);
    expect(view.terminalFloatTitle).toBe('Terminal float — 0.0 day(s)');
    expect(view.terminalFloatNote).toBe(
      "Based on critical path activity 'Terminal Float' (finish 12 Jan 2026)."
    );
    expect(view.notes).toEqual([]);
  });

  it('measures a late completion as behind and tints it red', () => {
    const view = toVarianceView(compared());

    expect(view.direction).toBe('behind');
    expect(view.dates).toEqual([
      { label: 'Completion Date', value: '28 Feb 2027' },
      { label: 'Planned Completion', value: '14 Mar 2027' },
      { label: 'Variance', value: '+14 days', tone: 'negative' },
    ]);
    expect(view.notes.map((note) => note.value)).toEqual(['+14 days', '+2 days', '3', '1', '4']);
  });

  it('reads an early completion as ahead', () => {
    const view = toVarianceView(
      compared({
        comparison: {
          enabled: true,
          baseline: {
            programmeId: '4880',
            revision: '03',
            dataDate: '2026-01-05',
            plannedCompletion: '2027-03-14',
          },
          changeSummary: {
            completionDeltaDays: -7,
            criticalPathDelta: 0,
            activitiesAdded: 0,
            activitiesRemoved: 0,
            activitiesMoved: 0,
          },
        },
      })
    );

    expect(view.direction).toBe('ahead');
    expect(view.dates[2]).toMatchObject({ value: '-7 days', tone: 'positive' });
  });

  it('stays neutral when the comparison measures no movement', () => {
    const view = toVarianceView(
      compared({
        comparison: {
          enabled: true,
          baseline: { programmeId: '4880', revision: '03', dataDate: '', plannedCompletion: '' },
          changeSummary: {
            completionDeltaDays: 0,
            criticalPathDelta: 0,
            activitiesAdded: 0,
            activitiesRemoved: 0,
            activitiesMoved: 0,
          },
        },
      })
    );

    expect(view.direction).toBeUndefined();
    expect(view.dates[2]).toMatchObject({ value: '0 days', tone: undefined });
  });

  it('states the default float copy for an absent extract', () => {
    const view = toVarianceView(null);

    expect(view.notes).toEqual([]);
    expect(view.terminalFloatTitle).toBe('Terminal float');
    expect(view.terminalFloatNote).toBe(
      'This revision names no terminal float on its critical path.'
    );
  });
});

describe('toClientObligationGroups', () => {
  it('keeps the titled sections that hold obligations', () => {
    const groups = toClientObligationGroups({
      sections: [
        {
          title: 'Access and Possession',
          obligations: [
            {
              description: 'Provide access to the site by the stated access date.',
              clauseNumber: '33.1',
              owner: 'Employer',
              dueDate: 'Access Date (4)',
            },
          ],
        },
      ],
    });

    expect(groups).toEqual([
      {
        section: 'Access and Possession',
        rows: [
          {
            description: 'Provide access to the site by the stated access date.',
            clauseNumber: '33.1',
            owner: 'Employer',
            dueDate: 'Access Date (4)',
          },
        ],
      },
    ]);
    expect(countClientObligations(groups)).toBe(1);
  });

  it('names an untitled section and drops one with no obligations', () => {
    const groups = toClientObligationGroups({
      sections: [{ title: '', obligations: [] }, { obligations: [{ description: 'Give access' }] }],
    });

    expect(groups).toEqual([
      {
        section: 'Obligations',
        rows: [{ description: 'Give access', clauseNumber: '', owner: '', dueDate: '' }],
      },
    ]);
  });

  it('has no groups for an absent assessment', () => {
    expect(toClientObligationGroups(null)).toEqual([]);
    expect(countClientObligations([])).toBe(0);
  });
});
