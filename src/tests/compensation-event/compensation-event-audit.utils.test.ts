import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { CompensationEventAuditEntry } from '@/modules/compensation-event/types/compensation-event.types';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  DASH,
  filterAuditEntries,
  formatClockTime,
  formatThreadTimestamp,
  getPersonInitials,
  sortAuditEntries,
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

describe('getPersonInitials', () => {
  it('ignores the role suffix', () => {
    expect(getPersonInitials('Sarah Price (Contractor)')).toBe('SP');
    expect(getPersonInitials('David Moore (PM)')).toBe('DM');
  });

  it('uses at most the first two words', () => {
    expect(getPersonInitials('Ada Beatrice Clarke')).toBe('AB');
  });

  it('handles a single name', () => {
    expect(getPersonInitials('Ada')).toBe('A');
  });

  it('returns an empty string for missing names', () => {
    expect(getPersonInitials('   ')).toBe('');
    expect(getPersonInitials(null)).toBe('');
  });
});

// The formatters read the viewer's zone, so the suite pins one: without it these
// assertions would pass or fail depending on the machine running them.
describe('audit timestamps render in the viewer timezone', () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'Asia/Karachi'; // UTC+5, no DST
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  describe('formatClockTime', () => {
    it('shifts a UTC stamp into local time', () => {
      expect(formatClockTime('2024-07-16T04:30:00.000Z')).toBe('09:30 AM');
      expect(formatClockTime('2024-07-16T16:30:00.000Z')).toBe('09:30 PM');
    });

    it('renders midnight and midday as 12', () => {
      expect(formatClockTime('2024-07-16T19:05:00.000Z')).toBe('12:05 AM');
      expect(formatClockTime('2024-07-16T07:05:00.000Z')).toBe('12:05 PM');
    });

    it('dashes missing and unparseable stamps', () => {
      expect(formatClockTime(null)).toBe(DASH);
      expect(formatClockTime('nope')).toBe(DASH);
    });
  });

  describe('formatThreadTimestamp', () => {
    it('keeps the date and time on the same side of midnight', () => {
      // 22:30 UTC is already the next day locally — the date must roll with the clock.
      expect(formatThreadTimestamp('2024-07-16T22:30:00.000Z')).toBe('17 Jul 2024, 03:30 AM');
    });

    it('renders a same-day stamp unshifted in date', () => {
      expect(formatThreadTimestamp('2024-07-16T09:15:00.000Z')).toBe('16 Jul 2024, 02:15 PM');
    });

    it('dashes missing and unparseable stamps', () => {
      expect(formatThreadTimestamp(null)).toBe(DASH);
      expect(formatThreadTimestamp('nope')).toBe(DASH);
    });
  });
});

describe('sortAuditEntries', () => {
  const entries = [
    buildAuditEntry({ id: 'a', occurredAt: '2024-07-07T09:15:00.000Z' }),
    buildAuditEntry({ id: 'b', occurredAt: '2024-07-16T16:30:00.000Z' }),
    buildAuditEntry({ id: 'c', occurredAt: '2024-07-14T10:05:00.000Z' }),
  ];

  it('orders newest first', () => {
    expect(sortAuditEntries(entries).map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the source list', () => {
    sortAuditEntries(entries);
    expect(entries.map((entry) => entry.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('filterAuditEntries', () => {
  const entries = [
    buildAuditEntry({ id: 'a', action: 'CREATED', actorName: 'Sarah Price' }),
    buildAuditEntry({
      id: 'b',
      action: 'LOCKED',
      actorName: 'System',
      actorRole: null,
      details: 'Compensation event locked',
    }),
    buildAuditEntry({
      id: 'c',
      action: 'IMPLEMENTED',
      actorName: 'David Moore',
      actorRole: 'Project Manager',
      details: 'Approved & implemented',
    }),
  ];

  const ids = (result: CompensationEventAuditEntry[]) => result.map((entry) => entry.id);

  it('returns everything without a term or actions', () => {
    expect(filterAuditEntries(entries)).toHaveLength(3);
  });

  it('matches on the actor name', () => {
    expect(ids(filterAuditEntries(entries, 'sarah'))).toEqual(['a']);
  });

  it('matches on the action label rather than the enum', () => {
    expect(ids(filterAuditEntries(entries, 'created'))).toEqual(['a']);
  });

  it('matches on the role and the details', () => {
    expect(ids(filterAuditEntries(entries, 'project manager'))).toEqual(['c']);
    expect(ids(filterAuditEntries(entries, 'locked'))).toEqual(['b']);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(ids(filterAuditEntries(entries, '  SYSTEM  '))).toEqual(['b']);
  });

  it('narrows to the selected actions', () => {
    expect(ids(filterAuditEntries(entries, undefined, ['LOCKED']))).toEqual(['b']);
  });

  it('applies the term and the actions together', () => {
    expect(filterAuditEntries(entries, 'sarah', ['LOCKED'])).toEqual([]);
  });

  it('returns nothing when the term matches no row', () => {
    expect(filterAuditEntries(entries, 'zzz')).toEqual([]);
  });
});
