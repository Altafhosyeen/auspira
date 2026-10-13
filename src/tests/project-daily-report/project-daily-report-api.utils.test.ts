import { describe, expect, it } from 'vitest';
import {
  projectDailyReportStatusLabel,
  projectDailyReportStatusTone,
} from '@/modules/project-daily-report/constants/project-daily-report.constants';
import {
  type DailySiteReportResponseDto,
  DailySiteReportStatus,
} from '@/modules/project-daily-report/types/project-daily-report.types';
import {
  formatProjectDailyReportDate,
  toProjectDailyReport,
  toProjectDailyReportListParams,
  toProjectDailyReportListResponse,
} from '@/modules/project-daily-report/utils/project-daily-report-api.utils';

const dto = (overrides: Partial<DailySiteReportResponseDto> = {}): DailySiteReportResponseDto => ({
  id: 'a1b2',
  projectId: 'p1',
  reference: 'PDR-024',
  raisedBy: 'David Thompson',
  title: 'Minor access restriction at Grid Line 4',
  description: 'Access to Grid Line 4 was restricted for part of the shift.',
  dateRaised: '2026-08-20T09:30:00Z',
  progressPercentage: 63,
  status: 0,
  ...overrides,
});

describe('toProjectDailyReport', () => {
  it('maps the DTO onto a register row', () => {
    const row = toProjectDailyReport(dto());

    expect(row).toMatchObject({
      id: 'a1b2',
      reference: 'PDR-024',
      title: 'Minor access restriction at Grid Line 4',
      submittedByName: 'David Thompson',
      raisedAt: '20 Aug 2026',
      progress: 63,
      statusCode: 0,
      description: 'Access to Grid Line 4 was restricted for part of the shift.',
    });
  });

  // The mapper carries the code; naming it is `projectDailyReportStatusLabel`'s job.
  it('carries the status code through untouched', () => {
    expect(toProjectDailyReport(dto({ status: DailySiteReportStatus.Discarded })).statusCode).toBe(
      1
    );
    expect(toProjectDailyReport(dto({ status: '0' })).statusCode).toBe(0);
  });

  it('leaves the status unset rather than defaulting it to a code', () => {
    expect(toProjectDailyReport(dto({ status: null })).statusCode).toBeUndefined();
    expect(toProjectDailyReport(dto({ status: undefined })).statusCode).toBeUndefined();
  });

  it('reads progress from either a number or a numeric string', () => {
    expect(toProjectDailyReport(dto({ progressPercentage: 12 })).progress).toBe(12);
    expect(toProjectDailyReport(dto({ progressPercentage: '88.5' })).progress).toBe(88.5);
  });

  // A NaN would reach the percentage cell and print "NaN%".
  it('falls back to zero for unreadable progress', () => {
    expect(toProjectDailyReport(dto({ progressPercentage: null })).progress).toBe(0);
    expect(toProjectDailyReport(dto({ progressPercentage: 'n/a' })).progress).toBe(0);
  });

  it('does not invent fields the DTO has no source for', () => {
    const row = toProjectDailyReport(dto());

    expect(row).not.toHaveProperty('submittedByRole');
    expect(row).not.toHaveProperty('weather');
    expect(row).not.toHaveProperty('workforceCount');
    expect(row).not.toHaveProperty('reportReference');
  });

  // The tabs key their attachments read off the project, which the detail route serves but
  // the register list needs too — a row without it silently loses its Documents tab.
  it('carries the project id through for the attachments read', () => {
    expect(toProjectDailyReport(dto({ projectId: 'project-7' })).projectId).toBe('project-7');
  });

  it('tolerates a missing raisedBy and description', () => {
    const row = toProjectDailyReport(
      dto({ raisedBy: undefined as unknown as string, description: null })
    );

    expect(row.submittedByName).toBe('');
    expect(row.description).toBeUndefined();
  });
});

describe('projectDailyReportStatusLabel', () => {
  it('names each status the backend enum declares', () => {
    expect(projectDailyReportStatusLabel(DailySiteReportStatus.Accepted)).toBe('Accepted');
    expect(projectDailyReportStatusLabel(DailySiteReportStatus.Discarded)).toBe('Discarded');
  });

  // A code the enum does not declare still renders, so a row is never blanked or mislabelled.
  it('falls back to the code for a value the enum does not name', () => {
    expect(projectDailyReportStatusLabel(7)).toBe('Status 7');
  });

  it('gives the two declared statuses their own tones', () => {
    expect(projectDailyReportStatusTone(DailySiteReportStatus.Accepted)).toBe('info');
    expect(projectDailyReportStatusTone(DailySiteReportStatus.Discarded)).toBe('danger');
    expect(projectDailyReportStatusTone(7)).toBe('neutral');
  });
});

describe('formatProjectDailyReportDate', () => {
  it('formats an ISO timestamp as the register shows it', () => {
    expect(formatProjectDailyReportDate('2026-08-20T09:30:00Z')).toBe('20 Aug 2026');
  });

  it('returns an empty string for missing or unparseable values', () => {
    expect(formatProjectDailyReportDate(null)).toBe('');
    expect(formatProjectDailyReportDate(undefined)).toBe('');
    expect(formatProjectDailyReportDate('not-a-date')).toBe('');
  });
});

describe('toProjectDailyReportListResponse', () => {
  it('reads the total from meta and maps every item', () => {
    const result = toProjectDailyReportListResponse({
      meta: { totalCount: '3' },
      items: [dto(), dto({ id: 'b2', reference: 'PDR-023' })],
    });

    expect(result.count).toBe(3);
    expect(result.items.map((row) => row.reference)).toEqual(['PDR-024', 'PDR-023']);
  });

  it('reads an empty page rather than throwing on a null body', () => {
    expect(toProjectDailyReportListResponse({ meta: null, items: null })).toEqual({
      count: 0,
      items: [],
    });
  });
});

describe('toProjectDailyReportListParams', () => {
  it('maps onto the endpoint own Skip/Top/Term/IncludeAll', () => {
    expect(
      toProjectDailyReportListParams({ skip: 10, top: 5, includeAll: true, term: ' crane ' })
    ).toEqual({ Skip: 10, Top: 5, Term: 'crane', IncludeAll: true });
  });

  it('leaves the term undefined when it is empty', () => {
    expect(toProjectDailyReportListParams({ term: '   ' }).Term).toBeUndefined();
    expect(toProjectDailyReportListParams()).toEqual({
      Skip: undefined,
      Top: undefined,
      Term: undefined,
      IncludeAll: undefined,
    });
  });
});
