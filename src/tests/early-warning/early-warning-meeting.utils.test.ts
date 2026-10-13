import { describe, expect, it } from 'vitest';
import type { MeetingDto } from '@/modules/early-warning/types/early-warning-api.types';
import {
  formatMeetingDate,
  formatMeetingDateTime,
  formatMeetingTime,
  getMeetingDtoStatus,
} from '@/modules/early-warning/utils/early-warning-meeting.utils';

describe('formatMeetingDateTime', () => {
  it('formats start and end time range with date', () => {
    const start = '2026-09-08T15:00:00';
    const end = '2026-09-08T16:00:00';
    const formatted = formatMeetingDateTime(start, end);
    expect(formatted).toBe('08 Sep 2026 · 15:00 - 16:00');
  });

  it('formats start time with 1 hour default duration when endIso is not provided', () => {
    const start = '2026-09-08T15:00:00';
    const formatted = formatMeetingDateTime(start);
    expect(formatted).toBe('08 Sep 2026 · 15:00 - 16:00');
  });

  it('returns em dash for null or undefined', () => {
    expect(formatMeetingDateTime(null)).toBe('—');
    expect(formatMeetingDateTime(undefined)).toBe('—');
    expect(formatMeetingDateTime('invalid-date')).toBe('—');
  });
});

describe('formatMeetingTime', () => {
  it('formats start and end time range', () => {
    const formatted = formatMeetingTime('2026-09-08T15:00:00', '2026-09-08T16:00:00');
    expect(formatted).toBe('15:00 - 16:00');
  });

  it('defaults to 1 hour after start time when end is omitted', () => {
    const formatted = formatMeetingTime('2026-09-08T15:00:00');
    expect(formatted).toBe('15:00 - 16:00');
  });

  it('returns em dash for invalid input', () => {
    expect(formatMeetingTime(null)).toBe('—');
    expect(formatMeetingTime(undefined)).toBe('—');
    expect(formatMeetingTime('invalid')).toBe('—');
  });
});

describe('formatMeetingDate', () => {
  it('formats date correctly', () => {
    expect(formatMeetingDate('2026-09-08T15:00:00')).toBe('08 Sep 2026');
  });

  it('returns em dash for invalid or missing date', () => {
    expect(formatMeetingDate(null)).toBe('—');
    expect(formatMeetingDate('')).toBe('—');
  });
});

describe('getMeetingDtoStatus', () => {
  it('returns Requested for meeting with future start time', () => {
    const futureMeeting: MeetingDto = {
      id: 'm1',
      subject: 'Review',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      timeZone: 'UTC',
      isOnlineMeeting: true,
    };
    expect(getMeetingDtoStatus(futureMeeting)).toBe('Requested');
  });
});
