import { describe, expect, it } from 'vitest';
import { ProjectAlertStatus } from '@/constants';
import {
  programmeHealthLabel,
  programmeStatusFilterOptions,
  programmeStatusLabel,
  programmeStatusTone,
  programmeVarianceTone,
} from '@/modules/programme/constants/programme.constants';
import type {
  ProgrammeAlertDetail,
  ProgrammeHealthResponseDto,
  ProgrammeHealthSummaryDto,
} from '@/modules/programme/types/programme.types';
import {
  formatProgrammeRegisterDate,
  matchBySourceIds,
  programmeFileName,
  recordedProgrammeDecision,
  toProgrammeListParams,
  toProgrammeReceivedView,
  toProgrammeRegisterListResponse,
  toProgrammeRegisterRow,
} from '@/modules/programme/utils/programme-api.utils';

const dto = (overrides: Partial<ProgrammeHealthSummaryDto> = {}): ProgrammeHealthSummaryDto => ({
  id: 'a1b2',
  reference: 'PRG-004',
  completionDate: '2027-02-28T00:00:00Z',
  variance: '-14 days',
  health: 2,
  raisedBy: 'James Whitmore',
  raisedAt: '2026-09-11T08:15:00Z',
  status: 1,
  fileUrl: 'https://example.test/prg-004.pdf',
  ...overrides,
});

// The register-side record — what GET /api/programme/{id} answers with once a programme has
// been accepted. Carries no title, which is why the received card needs its own fallback.
const record = (
  overrides: Partial<ProgrammeHealthResponseDto> = {}
): ProgrammeHealthResponseDto => ({
  id: 'a1b2',
  projectId: 'p1',
  projectEmailId: 'mail-1',
  reference: 'PRG-004',
  version: 3,
  json: null,
  fileUrl: 'https://example.test/prg-004.pdf',
  conversationId: 'conv-1',
  createdOn: '2026-09-11T08:15:00Z',
  ...overrides,
});

// The signal the programme arrived on, trimmed to the fields the received card reads.
const alert = (overrides: Partial<ProgrammeAlertDetail> = {}): ProgrammeAlertDetail =>
  ({
    id: 'alert-1',
    projectId: 'p1',
    title: 'Programme C32-1 revision 04',
    description: 'The Contractor submits revision 04 of the programme.',
    overdueDateTime: '2026-09-25T08:15:00Z',
    createdOn: '2026-09-11T08:15:00Z',
    alertStatus: ProjectAlertStatus.UnReviewed,
    ...overrides,
  }) as ProgrammeAlertDetail;

describe('formatProgrammeRegisterDate', () => {
  it('renders an ISO date-time as the register display date', () => {
    expect(formatProgrammeRegisterDate('2026-09-11T08:15:00Z')).toBe('11 Sep 2026');
  });

  it('passes a string it cannot parse through verbatim', () => {
    expect(formatProgrammeRegisterDate('Q1 2027')).toBe('Q1 2027');
  });

  it('blanks an absent date rather than printing a placeholder', () => {
    expect(formatProgrammeRegisterDate(null)).toBe('');
    expect(formatProgrammeRegisterDate(undefined)).toBe('');
  });
});

describe('toProgrammeRegisterRow', () => {
  it('maps the summary DTO onto a register row', () => {
    expect(toProgrammeRegisterRow(dto())).toEqual({
      id: 'a1b2',
      reference: 'PRG-004',
      completionDate: '28 Feb 2027',
      variance: '-14 days',
      healthCode: 2,
      raisedBy: 'James Whitmore',
      raisedAt: '11 Sep 2026',
      statusCode: 1,
      fileUrl: 'https://example.test/prg-004.pdf',
    });
  });

  // The DTO types both codes as `int32 | string`, so a code that arrives as a string still
  // has to land as a number the tone/label lookup can key on.
  it('reads a code from either a number or a numeric string', () => {
    expect(toProgrammeRegisterRow(dto({ status: '0', health: '3' }))).toMatchObject({
      statusCode: 0,
      healthCode: 3,
    });
  });

  it('leaves an absent code undefined rather than defaulting it', () => {
    const row = toProgrammeRegisterRow(dto({ status: null, health: undefined }));
    expect(row.statusCode).toBeUndefined();
    expect(row.healthCode).toBeUndefined();
  });

  it('falls back to empty strings for the text columns', () => {
    const row = toProgrammeRegisterRow(
      dto({ variance: null, raisedBy: null, fileUrl: null, completionDate: null })
    );
    expect(row).toMatchObject({ variance: '', raisedBy: '', completionDate: '' });
    expect(row.fileUrl).toBeUndefined();
  });
});

describe('toProgrammeRegisterListResponse', () => {
  it('reads the count from meta and maps every item', () => {
    const result = toProgrammeRegisterListResponse({
      meta: { totalCount: '2' },
      items: [dto(), dto({ id: 'c3d4', reference: 'PRG-003' })],
    });

    expect(result.count).toBe(2);
    expect(result.items.map((row) => row.reference)).toEqual(['PRG-004', 'PRG-003']);
  });

  it('handles a page with no items', () => {
    expect(toProgrammeRegisterListResponse({ meta: { totalCount: 0 }, items: null })).toEqual({
      count: 0,
      items: [],
    });
  });
});

describe('toProgrammeListParams', () => {
  it('sends the API its own capitalised query keys', () => {
    expect(toProgrammeListParams({ skip: 10, top: 20, term: 'PRG', includeAll: true })).toEqual({
      Skip: 10,
      Top: 20,
      Term: 'PRG',
      IncludeAll: true,
    });
  });

  it('drops a whitespace-only term rather than sending an empty search', () => {
    expect(toProgrammeListParams({ term: '   ' }).Term).toBeUndefined();
  });
});

describe('programme status and health codes', () => {
  it('maps the confirmed status enum labels and tones', () => {
    expect(programmeStatusLabel(2)).toBe('Not Accepted');
    expect(programmeStatusTone(2)).toBe('negative');
  });

  it('maps the confirmed health enum and keeps unknown codes safe', () => {
    expect(programmeHealthLabel(0)).toBe('On Track');
    expect(programmeHealthLabel(3)).toBe('Health 3');
  });

  it('builds the filter from the codes on the page, deduped and sorted', () => {
    expect(
      programmeStatusFilterOptions([{ statusCode: 2 }, { statusCode: 1 }, { statusCode: 2 }])
    ).toEqual([
      { value: 1, label: 'Accepted' },
      { value: 2, label: 'Not Accepted' },
    ]);
  });

  it('leaves an unset status out of the filter rather than offering a blank option', () => {
    expect(programmeStatusFilterOptions([{ statusCode: undefined }, {}])).toEqual([]);
  });
});

describe('matchBySourceIds', () => {
  const source = { conversationId: 'conv-1', projectEmailId: 'mail-1' };

  it('matches on the conversation id, the pair the record and its alert share', () => {
    const candidates = [{ id: 'r1', conversationId: 'conv-1', projectEmailId: null }];
    expect(matchBySourceIds(candidates, source)?.id).toBe('r1');
  });

  it('matches on the project-email id when the conversation id differs', () => {
    const candidates = [{ id: 'r2', conversationId: 'conv-9', projectEmailId: 'mail-1' }];
    expect(matchBySourceIds(candidates, source)?.id).toBe('r2');
  });

  it('leaves the match undefined when nothing shares a source id', () => {
    const candidates = [{ id: 'r3', conversationId: 'conv-9', projectEmailId: 'mail-9' }];
    expect(matchBySourceIds(candidates, source)).toBeUndefined();
  });

  it('does not match a null id against a null id', () => {
    const candidates = [{ id: 'r4', conversationId: null, projectEmailId: null }];
    expect(
      matchBySourceIds(candidates, { conversationId: null, projectEmailId: null })
    ).toBeUndefined();
  });

  it('handles the null items array the paged endpoints return', () => {
    expect(matchBySourceIds(null, source)).toBeUndefined();
  });
});

describe('programmeFileName', () => {
  it('reads the name off the storage URL, dropping the SAS query string', () => {
    expect(
      programmeFileName(
        'PRG-004',
        'https://auspira.blob.core.windows.net/programmes/PRG-004.pdf?sv=2021&sig=abc'
      )
    ).toBe('PRG-004.pdf');
  });

  it('decodes a percent-encoded segment', () => {
    expect(programmeFileName('PRG-004', 'https://x.test/files/Rev%2003%20Programme.xer')).toBe(
      'Rev 03 Programme.xer'
    );
  });

  it('names the file after the reference when the URL carries no segment', () => {
    expect(programmeFileName('PRG-004', '')).toBe('PRG-004.pdf');
    expect(programmeFileName('PRG-004', undefined)).toBe('PRG-004.pdf');
  });

  it('falls back to a generic name for a row with no reference either', () => {
    expect(programmeFileName(undefined, undefined)).toBe('programme.pdf');
  });
});

describe('recordedProgrammeDecision', () => {
  const row = (id: string, statusCode?: number) =>
    toProgrammeRegisterRow(dto({ id, status: statusCode }));

  it('names the decision once the register reports the revision accepted', () => {
    expect(recordedProgrammeDecision([row('r1', 1)], 'r1')).toBe('Accepted');
  });

  it('leaves an open revision undecided rather than naming a status', () => {
    expect(recordedProgrammeDecision([row('r1', 0)], 'r1')).toBeUndefined();
  });

  it('only reports the row for this record', () => {
    const rows = [row('r1', 0), row('r2', 1)];
    expect(recordedProgrammeDecision(rows, 'r1')).toBeUndefined();
    expect(recordedProgrammeDecision(rows, 'r2')).toBe('Accepted');
  });

  it('stays undecided when the record has no register row or no id', () => {
    expect(recordedProgrammeDecision([row('r1', 1)], 'missing')).toBeUndefined();
    expect(recordedProgrammeDecision([row('r1', 1)], undefined)).toBeUndefined();
    expect(recordedProgrammeDecision(null, 'r1')).toBeUndefined();
  });
});

describe('programmeVarianceTone', () => {
  it('tints by the sign the variance string carries', () => {
    expect(programmeVarianceTone('+2 days')).toBe('positive');
    expect(programmeVarianceTone('2 days')).toBe('positive');
    expect(programmeVarianceTone('-14 days')).toBe('negative');
    expect(programmeVarianceTone('-5')).toBe('negative');
    expect(programmeVarianceTone('5')).toBe('positive');
    expect(programmeVarianceTone('0 days')).toBe('neutral');
    expect(programmeVarianceTone('0')).toBe('neutral');
    expect(programmeVarianceTone('')).toBe('neutral');
  });

  // The summary API sends the magnitude unsigned and puts the direction in the wording, so
  // reading the number alone would tint a 205-day slip green.
  it('tints the register wording by its direction, not the number’s sign', () => {
    expect(programmeVarianceTone('205 day(s) behind programme')).toBe('negative');
    expect(programmeVarianceTone('205 day(s) ahead of programme')).toBe('positive');
    expect(programmeVarianceTone('0 days — on programme')).toBe('neutral');
  });
});

describe('toProgrammeReceivedView', () => {
  it('reads the whole card off the signal when the alert was found', () => {
    const view = toProgrammeReceivedView({
      alert: alert(),
      email: { emailSender: 'james@contractor.test', emailSubject: 'Programme Rev 04' },
      record: record(),
    });

    expect(view.heading).toBe('Programme C32-1 revision 04');
    // Rendered in the viewer's zone — the suite pins TZ to Asia/Karachi, so 08:15Z reads as 01:15 PM.
    expect(view.received).toBe('Received 11 Sep 2026, 01:15 PM');
    expect(view.status).toEqual({ label: 'Unreviewed', tone: 'warning' });
    expect(view.rows).toEqual([
      {
        label: 'Raised By',
        value: 'james@contractor.test',
        caption: 'Via email — Programme Rev 04',
      },
      {
        label: 'Due Date',
        value: '25 Sep 2026',
        caption: 'The Contractor submits revision 04 of the programme.',
      },
    ]);
  });

  it('falls back to the raiser title when the alert has no email rows', () => {
    const view = toProgrammeReceivedView({ alert: alert({ description: null }) });

    expect(view.rows[0]).toEqual({
      label: 'Raised By',
      value: 'Programme C32-1 revision 04',
      caption: undefined,
    });
    // No description to explain the due date, so the row keeps the date alone.
    expect(view.rows[1]).toEqual({
      label: 'Due Date',
      value: '25 Sep 2026',
      caption: undefined,
    });
  });

  it('names the stored record when its signal cannot be joined', () => {
    const view = toProgrammeReceivedView({
      record: record(),
      revisionLabel: 'PRG-004 — Rev 3',
    });

    expect(view.heading).toBe('PRG-004 — Rev 3');
    expect(view.received).toBe('Received 11 Sep 2026, 01:15 PM');
    // A stored record carries no signal, so there is no lifecycle left to report.
    expect(view.status).toBeUndefined();
    expect(view.rows).toEqual([
      { label: 'Programme Reference', value: 'PRG-004' },
      { label: 'Revision', value: 'Rev 3' },
    ]);
  });

  it('drops the revision row for a record the API did not version', () => {
    const view = toProgrammeReceivedView({ record: record({ version: null }) });

    expect(view.rows).toEqual([{ label: 'Programme Reference', value: 'PRG-004' }]);
  });

  it('leaves the heading empty rather than the whole card when neither has a title', () => {
    const view = toProgrammeReceivedView({ record: record({ reference: '' }) });

    expect(view.heading).toBe('');
    expect(view.rows).toEqual([{ label: 'Revision', value: 'Rev 3' }]);
  });

  it('reports the registered signal as settled, not still awaiting a reply', () => {
    const view = toProgrammeReceivedView({
      alert: alert({ alertStatus: ProjectAlertStatus.Registered }),
    });

    expect(view.status).toEqual({ label: 'Registered', tone: 'positive' });
  });

  it('tints an overdue signal red', () => {
    const view = toProgrammeReceivedView({
      alert: alert({ alertStatus: ProjectAlertStatus.Overdue }),
    });

    expect(view.status).toEqual({ label: 'Overdue', tone: 'negative' });
  });

  it('gives no tag for a status the backend has not named', () => {
    const view = toProgrammeReceivedView({
      alert: alert({ alertStatus: ProjectAlertStatus.Unknown }),
    });

    expect(view.status).toBeUndefined();
  });
});
