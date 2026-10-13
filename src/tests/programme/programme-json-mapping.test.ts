import { describe, expect, it } from 'vitest';
import { mapProgrammeJson } from '@/components/module/project/second-step/programme-ingestion/mapProgrammeJson';
import type { ApiProgrammeJsonData } from '@/components/module/project/second-step/programme-ingestion/types';
import {
  countClientObligations,
  toClientObligationGroups,
  toHealthCheck,
  toPmViewContractDates,
  toPmViewKeyDates,
  toProgrammeExtract,
  toVarianceView,
} from '@/modules/programme/utils/programme-alert.utils';

const payload = {
  programmeId: '6264',
  programmeName: 'C-167 Denton Wharf Redevelopment - Rev05 - 06 05 2026 Submission',
  programmeType: 'Accepted',
  revision: '',
  status: '',
  header: { class: '', submissionNumber: 0, baselineReference: '', description: '' },
  overview: {
    dataDate: '2025-09-19',
    plannedCompletion: '2026-08-05',
    criticalActivities: { count: 6, description: '6 activities on the longest path.' },
    activities: { count: 104, description: '2 complete, 0 in progress, 102 not started.' },
  },
  keyDatesAndMilestones: {
    startingDate: '2025-08-29',
    contractAwardSubmissionDate: '',
    accessDate: '',
    plannedCompletion: '2026-08-05',
    sectionalKeyDates: [
      {
        name: 'Contract award and acceptance',
        date: '2025-09-19',
        reference: 'C-167-DWR-1010',
      },
      { name: 'Starting Date', date: '2025-09-19', reference: 'C-167-DWR-1000' },
      {
        name: 'Access Date - undertake surveys only (AD1)',
        date: '2025-11-25',
        reference: 'C-167-DWR-1060',
      },
    ],
  },
  criticalPath: [
    {
      activityId: 'C-167-DWR-1520',
      activityName: 'Access Date - remainder of the works (AD2)',
      finishDate: '2026-05-13',
      totalFloatDays: 0.0,
      isDriving: true,
    },
    {
      activityId: 'C-167-DWR-1330',
      activityName: 'All River Works Licenses discharged',
      finishDate: '2026-03-26',
      totalFloatDays: 0.0,
      isDriving: true,
    },
    {
      activityId: 'C-167-DWR-1360',
      activityName: 'Period before which all River Works Licenses must be discharged',
      finishDate: '2026-05-12',
      totalFloatDays: 0.0,
      isDriving: true,
    },
  ],
  progressAndResources: {
    activitiesComplete: { completed: 2, total: 104, percentage: 1.9 },
    inProgress: 0,
    notStarted: 102,
    calendars: [{ name: 'Standard', count: 104 }],
    dateConstraints: {
      total: 32,
      constraints: [
        { type: 'As Late as Possible', count: 14 },
        { type: 'Start On or After', count: 11 },
        { type: 'Mandatory Finish', count: 7 },
      ],
    },
  },
  programmeHealth: [
    {
      severity: 'Warning',
      title: 'Open-Ended Activities',
      description:
        '1 activity/activities have no successor logic and are not finish milestones, which may affect the critical path.',
      references: ['C-167-DWR-3020'],
    },
    {
      severity: 'Warning',
      title: 'Activities Without Predecessors',
      description:
        '2 activity/activities have no predecessor logic, which may indicate a dangling start.',
      references: ['C-167-DWR-1300', 'C-167-DWR-3000'],
    },
    {
      severity: 'Warning',
      title: 'Hard Constraints on Critical Path',
      description:
        '1 critical activity/activities have date constraints applied, which may be masking float.',
      references: ['C-167-DWR-1520'],
    },
  ],
  comparison: {
    enabled: false,
    baseline: { programmeId: '', revision: '', dataDate: '', plannedCompletion: '' },
    changeSummary: {
      completionDeltaDays: 0,
      criticalPathDelta: 0,
      activitiesAdded: 0,
      activitiesRemoved: 0,
      activitiesMoved: 0,
    },
    movedActivities: [],
    addedActivities: [],
    removedActivities: [],
    criticalPathChange: { newlyCritical: [], stillCritical: [], noLongerCritical: [] },
    reconciliation: [],
  },
  aiProgrammeHealthCheck: {
    title: 'AI programme health check',
    flagCount: null,
    checks: [],
  },
  variance: {
    title: 'Variance',
    clauses: [],
    summary: '',
    programmeStatus: '',
    dates: {
      completionDate: '',
      plannedCompletion: '2026-08-05',
      variance: { days: null, display: '' },
    },
    terminalFloat: { days: null, display: '', owner: '', note: '' },
    rows: [],
  },
  obligations: {
    title: 'Client obligations',
    summary:
      'The Employer/Client is obligated to provide site access by the stated access dates and ensure compliance with starting and completion dates, coordinating with the Contractor and others as required.',
    clauses: ['30.1', '33.1', '30.2'],
    sections: [
      {
        title: 'Access and Possession',
        obligations: [
          {
            description: 'Provide access to the site by the stated access date.',
            clauseNumber: '33.1',
            owner: 'Employer',
            dueDate: 'Access Date - undertake surveys only (AD1) (C-167-DWR-1060): 2025-11-25',
          },
          {
            description: 'Provide access to the site by the stated access date.',
            clauseNumber: '33.1',
            owner: 'Client',
            dueDate: 'Access Date - remainder of the works (AD2) (C-167-DWR-1520): 2026-05-13',
          },
        ],
      },
      {
        title: 'Starting and Completion Dates',
        obligations: [
          {
            description:
              'Ensure the Contractor does not start before the starting date and complies with access arrangements.',
            clauseNumber: '30.1',
            owner: 'Project Manager',
            dueDate: 'Starting Date (C-167-DWR-1000): 2025-09-19',
          },
          {
            description: 'Complete the work by the contractual Completion Date.',
            clauseNumber: '30.2',
            owner: 'Project Manager',
            dueDate: 'Completion Date (C-167-DWR-1960): 2026-07-14',
          },
        ],
      },
    ],
  },
} satisfies ApiProgrammeJsonData;

describe('programme JSON payload mapping', () => {
  it('parses the JSON-encoded extract the alert and register both carry', () => {
    const parsed = toProgrammeExtract(JSON.stringify(payload));

    expect(parsed?.programmeId).toBe('6264');
    expect(parsed?.header?.submissionNumber).toBe(0);
    expect(parsed?.variance?.dates?.plannedCompletion).toBe('2026-08-05');
    expect(parsed?.obligations?.clauses).toEqual(['30.1', '33.1', '30.2']);
    expect(parsed?.aiProgrammeHealthCheck?.title).toBe('AI programme health check');
    expect(parsed?.comparison?.criticalPathChange).toEqual({
      newlyCritical: [],
      stillCritical: [],
      noLongerCritical: [],
    });
  });

  it('maps identity, overview, key dates, critical path and progress panels', () => {
    const mapped = mapProgrammeJson(payload);

    expect(mapped.meta).toEqual({
      name: 'C-167 Denton Wharf Redevelopment - Rev05 - 06 05 2026 Submission',
      type: 'Accepted',
      programmeId: '6264',
      revision: '',
      status: '',
    });
    expect(mapped.stats.map((stat) => stat.label)).toEqual([
      'Data Date',
      'Starting Date',
      'Planned Completion',
      'Critical Activities',
      'Total Activities',
    ]);
    expect(mapped.stats[0].value).toBe('19 Sept 2025');
    expect(mapped.stats[3]).toMatchObject({ value: '6', noteAccent: true });
    expect(mapped.keyDates).toHaveLength(3);
    expect(mapped.keyDates[2]).toEqual({
      label: 'Access Date - undertake surveys only (AD1)',
      value: '25 Nov 2025',
      citation: 'C-167-DWR-1060',
    });
    expect(mapped.criticalPath[0]).toEqual({
      activityId: 'C-167-DWR-1520',
      name: 'Access Date - remainder of the works (AD2)',
      finish: '13 May 2026',
      totalFloat: '0d',
    });
    expect(mapped.progress).toEqual([
      expect.objectContaining({
        label: 'Activities complete',
        value: '2 / 104',
        valueAccent: '1.9%',
      }),
      { label: 'In progress', value: '0', citation: '' },
      { label: 'Not started', value: '102', citation: '' },
      { label: 'Calendar · Standard', value: '104 activities', citation: '' },
      { label: 'Date constraints', value: '32', citation: '' },
      { label: 'Constraint · As Late as Possible', value: '14', citation: '' },
      { label: 'Constraint · Start On or After', value: '11', citation: '' },
      { label: 'Constraint · Mandatory Finish', value: '7', citation: '' },
    ]);
    expect(mapped.healthAlerts).toHaveLength(3);
    expect(mapped.healthAlerts[0]).toMatchObject({
      severity: 'warning',
      title: 'Open-Ended Activities',
      citation: 'C-167-DWR-3020',
    });
    expect(mapped.comparison).toBeNull();
  });

  it('reads the health check, obligations, PM dates and variance from the extract', () => {
    const extract = toProgrammeExtract(payload);

    const health = toHealthCheck(null, extract);
    expect(health.title).toBe('AI programme health check');
    expect(health.flagCount).toBe(3);
    expect(health.flags).toHaveLength(3);
    expect(health.flags[0]).toMatchObject({
      category: 'Warning',
      finding: 'Open-Ended Activities',
    });

    const obligations = toClientObligationGroups(extract?.obligations);
    expect(obligations).toHaveLength(2);
    expect(countClientObligations(obligations)).toBe(4);
    expect(obligations[0].rows[0].dueDate).toContain('C-167-DWR-1060');

    // The data date the payload carries is reported by Extract & Check, not repeated as a tile.
    expect(toPmViewContractDates(extract)).toEqual([
      expect.objectContaining({ label: 'Planned Completion', date: '05 Aug 2026' }),
      expect.objectContaining({ label: 'Starting Date', date: '29 Aug 2025' }),
    ]);
    expect(toPmViewKeyDates(extract)).toHaveLength(3);
    // Every milestone this revision lists is dated, so the key-dates table reads "Dated" down
    // the column rather than leaving rows undated.
    expect(toPmViewKeyDates(extract).every((row) => row.dated)).toBe(true);

    const variance = toVarianceView(extract);
    expect(variance.dates).toEqual([
      { label: 'Completion Date', value: '—' },
      { label: 'Planned Completion', value: '05 Aug 2026' },
      { label: 'Variance', value: '—', tone: undefined },
    ]);
    expect(variance.direction).toBeUndefined();
    expect(variance.terminalFloatTitle).toBe('Terminal float');
    expect(variance.terminalFloatNote).toBe(
      'This revision names no terminal float on its critical path.'
    );
  });
});
