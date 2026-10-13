import { describe, expect, it } from 'vitest';
import type {
  CompensationEvent,
  CompensationEventAuditEntry,
} from '@/modules/compensation-event/types/compensation-event.types';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  buildCompensationEventFinancials,
  buildRecentActivity,
  DASH,
  formatCompensationAmount,
  formatDetailDate,
  formatFileSize,
  formatOptionalQuoteValue,
  formatQuoteValue,
  formatRelativeTime,
  formatThreadTimestamp,
  formatTimeImpact,
  formatTimeImpactDays,
  formatVariancePercent,
  getReplyCountdown,
  orDash,
  resolveRegisterState,
  sumCompensationAmounts,
} from '@/modules/compensation-event/utils/compensation-event.utils';

const buildAuditEntry = (
  overrides: Partial<CompensationEventAuditEntry>
): CompensationEventAuditEntry => ({
  id: 'entry',
  action: 'CREATED',
  actorName: 'Sarah Price',
  actorRole: 'Contractor',
  actorParty: 'CONTRACTOR',
  isSender: false,
  details: 'Compensation event raised',
  occurredAt: '2024-07-07T09:15:00.000Z',
  ...overrides,
});

const buildEvent = (overrides: Partial<CompensationEvent>): CompensationEvent => ({
  id: 'id',
  reference: 'CE-001',
  title: 'Title',
  amount: 0,
  currency: 'GBP',
  status: 'DRAFT',
  eventDate: '2026-01-01',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('formatCompensationAmount', () => {
  it('formats an amount in GBP with thousands separators', () => {
    expect(formatCompensationAmount(1000, 'GBP')).toBe('£1,000.00');
  });

  it('formats an amount in EUR with decimals', () => {
    expect(formatCompensationAmount(250.5, 'EUR')).toBe('€250.50');
  });

  it('formats zero', () => {
    expect(formatCompensationAmount(0, 'GBP')).toBe('£0.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatCompensationAmount(99.999, 'GBP')).toBe('£100.00');
  });
});

describe('sumCompensationAmounts', () => {
  it('returns zero for an empty list', () => {
    expect(sumCompensationAmounts([])).toBe(0);
  });

  it('returns the single amount', () => {
    expect(sumCompensationAmounts([{ amount: 125.5 }])).toBe(125.5);
  });

  it('sums all amounts', () => {
    expect(sumCompensationAmounts([{ amount: 100 }, { amount: 250.5 }, { amount: 49.5 }])).toBe(
      400
    );
  });

  it('skips zero amounts without affecting the total', () => {
    expect(sumCompensationAmounts([{ amount: 0 }, { amount: 10 }, { amount: 0 }])).toBe(10);
  });
});

describe('formatQuoteValue', () => {
  it('drops the decimals the register does not show', () => {
    expect(formatQuoteValue(48400, 'GBP')).toBe('£48,400');
  });

  it('rounds part-units to whole units', () => {
    expect(formatQuoteValue(6119.6, 'GBP')).toBe('£6,120');
  });

  it('formats zero', () => {
    expect(formatQuoteValue(0, 'GBP')).toBe('£0');
  });
});

describe('formatTimeImpact', () => {
  it('signs a positive impact', () => {
    expect(formatTimeImpact(9)).toBe('+9 Days');
  });

  it('keeps the sign of a negative impact', () => {
    expect(formatTimeImpact(-2)).toBe('-2 Days');
  });

  it('renders zero without a sign', () => {
    expect(formatTimeImpact(0)).toBe('0 Days');
  });

  it('uses the singular unit for a single day', () => {
    expect(formatTimeImpact(1)).toBe('+1 Day');
    expect(formatTimeImpact(-1)).toBe('-1 Day');
  });

  it('falls back to the register dash when the impact is unknown', () => {
    expect(formatTimeImpact()).toBe('-');
    expect(formatTimeImpact(null)).toBe('-');
  });
});

describe('formatDetailDate', () => {
  it('formats a calendar date the way the detail screen states it', () => {
    expect(formatDetailDate('2024-07-07')).toBe('07 Jul 2024');
  });

  it('formats a timestamp without shifting the day', () => {
    expect(formatDetailDate('2024-07-16T23:30:00.000Z')).toBe('16 Jul 2024');
  });

  it('dashes missing and unparseable dates', () => {
    expect(formatDetailDate()).toBe(DASH);
    expect(formatDetailDate(null)).toBe(DASH);
    expect(formatDetailDate('nope')).toBe(DASH);
  });
});

describe('orDash', () => {
  it('returns the value when present', () => {
    expect(orDash('Build Co Construction Ltd.')).toBe('Build Co Construction Ltd.');
  });

  it('dashes empty, blank and missing values', () => {
    expect(orDash('')).toBe(DASH);
    expect(orDash('   ')).toBe(DASH);
    expect(orDash(undefined)).toBe(DASH);
    expect(orDash(null)).toBe(DASH);
  });

  it('dashes the extractor scaffolding a field is left as', () => {
    expect(orDash('[]')).toBe(DASH);
    expect(orDash('{}')).toBe(DASH);
    expect(orDash('[{}]')).toBe(DASH);
    expect(orDash('-')).toBe(DASH);
  });

  it('keeps a name the scaffolding characters appear inside', () => {
    expect(orDash('Smith-Jones (Contractor)')).toBe('Smith-Jones (Contractor)');
  });
});

describe('formatOptionalQuoteValue', () => {
  it('formats an amount', () => {
    expect(formatOptionalQuoteValue(17450, 'GBP')).toBe('£17,450');
  });

  it('formats zero rather than dashing it', () => {
    expect(formatOptionalQuoteValue(0, 'GBP')).toBe('£0');
  });

  it('dashes a missing amount', () => {
    expect(formatOptionalQuoteValue(null, 'GBP')).toBe(DASH);
    expect(formatOptionalQuoteValue(undefined, 'GBP')).toBe(DASH);
  });
});

describe('formatTimeImpactDays', () => {
  it('signs and pluralises a positive impact', () => {
    expect(formatTimeImpactDays(4)).toBe('+4 Days');
  });

  it('uses the singular for one day', () => {
    expect(formatTimeImpactDays(1)).toBe('+1 Day');
    expect(formatTimeImpactDays(-1)).toBe('-1 Day');
  });

  it('renders zero without a sign', () => {
    expect(formatTimeImpactDays(0)).toBe('0 Days');
  });

  it('dashes an unknown impact', () => {
    expect(formatTimeImpactDays(null)).toBe(DASH);
  });
});

describe('resolveRegisterState', () => {
  it('passes register states through', () => {
    expect(resolveRegisterState('QUOTATION_SUBMITTED')).toBe('QUOTATION_SUBMITTED');
  });

  it('folds legacy statuses into register states', () => {
    expect(resolveRegisterState('SUBMITTED')).toBe('QUOTATION_SUBMITTED');
    expect(resolveRegisterState('APPROVED')).toBe('IMPLEMENTED');
    expect(resolveRegisterState('PAID')).toBe('IMPLEMENTED');
    expect(resolveRegisterState('REJECTED')).toBe('REVISED_QUOTATION_TO_BE_SUBMITTED');
  });
});

describe('getReplyCountdown', () => {
  const now = new Date('2026-08-12T09:00:00.000Z');

  it('returns null without a due date', () => {
    expect(getReplyCountdown(undefined, now)).toBeNull();
    expect(getReplyCountdown(null, now)).toBeNull();
  });

  it('returns null for an unparseable date', () => {
    expect(getReplyCountdown('not-a-date', now)).toBeNull();
  });

  it('flags a due date in the past as overdue', () => {
    expect(getReplyCountdown('2026-08-10', now)).toEqual({ label: 'Overdue', tone: 'danger' });
  });

  it('flags today', () => {
    expect(getReplyCountdown('2026-08-12T23:00:00.000Z', now)).toEqual({
      label: 'Today',
      tone: 'danger',
    });
  });

  it('warns inside the last week', () => {
    expect(getReplyCountdown('2026-08-19', now)).toEqual({ label: '7d left', tone: 'warning' });
  });

  it('stays green beyond a week', () => {
    expect(getReplyCountdown('2026-08-26', now)).toEqual({ label: '14d left', tone: 'success' });
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-08-12T09:00:00.000Z');

  it('reports fresh timestamps as just now', () => {
    expect(formatRelativeTime('2026-08-12T08:59:30.000Z', now)).toBe('just now');
  });

  it('reports minutes', () => {
    expect(formatRelativeTime('2026-08-12T08:30:00.000Z', now)).toBe('30m ago');
  });

  it('reports hours', () => {
    expect(formatRelativeTime('2026-08-12T07:00:00.000Z', now)).toBe('2h ago');
  });

  it('reports days', () => {
    expect(formatRelativeTime('2026-08-11T07:00:00.000Z', now)).toBe('1d ago');
  });

  it('returns an empty string for an unparseable date', () => {
    expect(formatRelativeTime('nope', now)).toBe('');
  });
});

describe('buildRecentActivity', () => {
  const events = [
    buildEvent({ id: '1', reference: 'CE-001', updatedAt: '2026-08-10T09:00:00.000Z' }),
    buildEvent({
      id: '2',
      reference: 'CE-002',
      status: 'SUBMITTED',
      updatedAt: '2026-08-12T09:00:00.000Z',
    }),
    buildEvent({ id: '3', reference: 'CE-003', updatedAt: '2026-08-11T09:00:00.000Z' }),
  ];

  it('returns an empty list for no events', () => {
    expect(buildRecentActivity([])).toEqual([]);
  });

  it('orders by most recently updated', () => {
    expect(buildRecentActivity(events).map((item) => item.reference)).toEqual([
      'CE-002',
      'CE-003',
      'CE-001',
    ]);
  });

  it('falls back to the event itself when no audit trail is served', () => {
    expect(buildRecentActivity(events)[0]).toEqual({
      id: '2',
      reference: 'CE-002',
      summary: 'CE-002 — Title',
      occurredAt: '2026-08-12T09:00:00.000Z',
    });
  });

  it('reads actor sentences off the audit trail', () => {
    const activity = buildRecentActivity([
      buildEvent({
        id: '4',
        reference: 'CE-004',
        auditTrail: [
          buildAuditEntry({ id: 'a1', occurredAt: '2026-08-01T09:00:00.000Z' }),
          buildAuditEntry({
            id: 'a2',
            action: 'APPROVED',
            actorName: 'David Moore',
            occurredAt: '2026-08-02T09:00:00.000Z',
          }),
        ],
      }),
    ]);

    expect(activity.map((item) => item.summary)).toEqual([
      'David Moore approved CE-004',
      'Sarah Price raised CE-004',
    ]);
    expect(activity[0]?.actorName).toBe('David Moore');
  });

  it('respects the limit', () => {
    expect(buildRecentActivity(events, 2)).toHaveLength(2);
  });

  it('does not mutate the source list', () => {
    const source = [...events];
    buildRecentActivity(source);
    expect(source.map((event) => event.id)).toEqual(['1', '2', '3']);
  });
});

describe('formatVariancePercent', () => {
  it('renders a reduction with two decimals', () => {
    expect(formatVariancePercent(-4.120879)).toBe('-4.12%');
  });

  it('prefixes an increase with a plus sign', () => {
    expect(formatVariancePercent(3.5)).toBe('+3.50%');
  });

  it('renders no variance without a sign', () => {
    expect(formatVariancePercent(0)).toBe('0.00%');
  });
});

describe('buildCompensationEventFinancials', () => {
  it('derives the cost difference and its percentage from the final approved amount', () => {
    const financials = buildCompensationEventFinancials(
      buildEvent({ originalQuoteAmount: 18_200, finalApprovedAmount: 17_450 })
    );

    expect(financials.costDifference).toBe(-750);
    expect(financials.costDifferencePercent).toBeCloseTo(-4.1209, 4);
    expect(financials.isFinal).toBe(true);
  });

  it('falls back to the PM assessment while the event is not implemented', () => {
    const financials = buildCompensationEventFinancials(
      buildEvent({ originalQuoteAmount: 48_400, pmAssessmentAmount: 46_464 })
    );

    expect(financials.approvedCost).toBe(46_464);
    expect(financials.isFinal).toBe(false);
  });

  it('prefers the final approved amount over the PM assessment', () => {
    const financials = buildCompensationEventFinancials(
      buildEvent({ pmAssessmentAmount: 46_464, finalApprovedAmount: 45_000 })
    );

    expect(financials.approvedCost).toBe(45_000);
  });

  it('leaves the difference unset when either side is missing', () => {
    const financials = buildCompensationEventFinancials(
      buildEvent({ originalQuoteAmount: 18_200 })
    );

    expect(financials.costDifference).toBeNull();
    expect(financials.costDifferencePercent).toBeNull();
  });

  it('does not divide by a zero quote', () => {
    const financials = buildCompensationEventFinancials(
      buildEvent({ originalQuoteAmount: 0, finalApprovedAmount: 500 })
    );

    expect(financials.costDifference).toBe(500);
    expect(financials.costDifferencePercent).toBeNull();
  });

  it('falls back to the original time impact when no approved figure exists', () => {
    const financials = buildCompensationEventFinancials(buildEvent({ timeImpactDays: 6 }));

    expect(financials.originalTimeImpactDays).toBe(6);
    expect(financials.approvedTimeImpactDays).toBe(6);
  });

  it('keeps an approved time impact that differs from the original', () => {
    const financials = buildCompensationEventFinancials(
      buildEvent({ timeImpactDays: 6, approvedTimeImpactDays: 4 })
    );

    expect(financials.approvedTimeImpactDays).toBe(4);
  });
});

// Stamps land in the viewer's zone; vitest.config.ts pins the run to Asia/Karachi
// (UTC+5, no DST) so these expectations do not follow the machine running the suite.
describe('formatThreadTimestamp', () => {
  it('renders a morning stamp shifted into local time', () => {
    expect(formatThreadTimestamp('2024-07-07T09:15:00.000Z')).toBe('07 Jul 2024, 02:15 PM');
  });

  it('renders an afternoon stamp in 12-hour form', () => {
    expect(formatThreadTimestamp('2024-07-08T14:47:00.000Z')).toBe('08 Jul 2024, 07:47 PM');
  });

  it('renders midnight and midday as 12', () => {
    expect(formatThreadTimestamp('2024-07-08T19:05:00.000Z')).toBe('09 Jul 2024, 12:05 AM');
    expect(formatThreadTimestamp('2024-07-08T07:05:00.000Z')).toBe('08 Jul 2024, 12:05 PM');
  });

  it('dashes missing and unparseable stamps', () => {
    expect(formatThreadTimestamp(null)).toBe(DASH);
    expect(formatThreadTimestamp('nope')).toBe(DASH);
  });
});

describe('formatFileSize', () => {
  it('keeps one decimal on megabytes', () => {
    expect(formatFileSize(1_258_291)).toBe('1.2 MB');
  });

  it('drops the decimal on large whole units', () => {
    expect(formatFileSize(843_776)).toBe('824 KB');
    expect(formatFileSize(262_144)).toBe('256 KB');
  });

  it('reports bytes below a kilobyte', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('steps up to gigabytes', () => {
    expect(formatFileSize(2 * 1024 ** 3)).toBe('2 GB');
  });

  it('dashes missing and negative sizes', () => {
    expect(formatFileSize(null)).toBe(DASH);
    expect(formatFileSize(-1)).toBe(DASH);
  });
});
