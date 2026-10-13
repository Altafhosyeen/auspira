import type { ApiProgrammeJsonData } from '@/components/module/project/second-step/programme-ingestion/types';

// Trimmed from a real programee alert: the backend sends `programme` as a JSON-encoded string,
// so this is the object it decodes to. Shared by the two mapper specs, so the programme they
// assert against is one definition rather than two that drift.
export const extract = (overrides: Partial<ApiProgrammeJsonData> = {}): ApiProgrammeJsonData => ({
  programmeId: '4920',
  programmeName: 'Cory Waste Transfer Station',
  programmeType: 'Accepted',
  revision: '04',
  status: '',
  overview: {
    dataDate: '2025-03-27',
    plannedCompletion: '2026-01-12',
    criticalActivities: { count: 44, description: '44 activities on the longest path.' },
    activities: { count: 317, description: '245 complete, 5 in progress, 67 not started.' },
  },
  keyDatesAndMilestones: {
    startingDate: '2024-05-20',
    contractAwardSubmissionDate: '',
    accessDate: '',
    plannedCompletion: '2026-01-12',
    sectionalKeyDates: [
      { name: 'Starting Date', date: '2025-03-27', reference: '3', status: 'completed' },
    ],
  },
  criticalPath: [
    {
      activityId: '6',
      activityName: 'Terminal Float',
      finishDate: '2026-01-12',
      totalFloatDays: 0,
      isDriving: true,
    },
  ],
  progressAndResources: {
    activitiesComplete: { completed: 245, total: 317, percentage: 77.3 },
    inProgress: 5,
    notStarted: 67,
    calendars: [],
    dateConstraints: { total: 0, constraints: [] },
  },
  programmeHealth: [],
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
  },
  ...overrides,
});

// The same programme once the backend has a baseline to measure it against.
export const compared = (overrides: Partial<ApiProgrammeJsonData> = {}): ApiProgrammeJsonData =>
  extract({
    keyDatesAndMilestones: {
      startingDate: '2024-05-20',
      contractAwardSubmissionDate: '',
      accessDate: '',
      plannedCompletion: '2027-03-14',
      sectionalKeyDates: [
        { name: 'Starting Date', date: '2025-03-27', reference: '3', status: 'completed' },
      ],
    },
    comparison: {
      enabled: true,
      baseline: {
        programmeId: '4880',
        revision: '03',
        dataDate: '2026-01-05',
        plannedCompletion: '2027-02-28',
      },
      changeSummary: {
        completionDeltaDays: 14,
        criticalPathDelta: 2,
        activitiesAdded: 3,
        activitiesRemoved: 1,
        activitiesMoved: 4,
      },
    },
    ...overrides,
  });
