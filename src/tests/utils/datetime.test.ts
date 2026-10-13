import { describe, expect, it } from 'vitest';
import {
  normalizeBackendTimestamp,
  parseBackendDate,
  toLocalDayjs,
} from '@/lib/utils/datetime';

describe('normalizeBackendTimestamp', () => {
  it('stamps an offsetless date-time as UTC', () => {
    expect(normalizeBackendTimestamp('2026-08-27T00:55:00')).toBe('2026-08-27T00:55:00Z');
    expect(normalizeBackendTimestamp('2026-08-27T00:55')).toBe('2026-08-27T00:55Z');
    expect(normalizeBackendTimestamp('2026-08-27T00:55:00.808')).toBe('2026-08-27T00:55:00.808Z');
  });

  it('accepts a space separator in place of the T', () => {
    expect(normalizeBackendTimestamp('2026-08-27 00:55:00')).toBe('2026-08-27T00:55:00Z');
  });

  it('leaves an already-stamped timestamp untouched', () => {
    expect(normalizeBackendTimestamp('2026-08-27T00:55:00Z')).toBe('2026-08-27T00:55:00Z');
    expect(normalizeBackendTimestamp('2026-08-27T00:55:00+05:30')).toBe('2026-08-27T00:55:00+05:30');
    expect(normalizeBackendTimestamp('2026-08-27T00:55:00-04:00')).toBe('2026-08-27T00:55:00-04:00');
  });

  it('pins a bare calendar date to local midnight, not UTC midnight', () => {
    // `new Date('2026-08-27')` is UTC midnight, which renders as the 26th west of Greenwich.
    expect(normalizeBackendTimestamp('2026-08-27')).toBe('2026-08-27T00:00:00');
    expect(parseBackendDate('2026-08-27')?.getDate()).toBe(27);
    expect(parseBackendDate('2026-08-27')?.getMonth()).toBe(7);
  });

  it('passes through anything it does not recognise', () => {
    expect(normalizeBackendTimestamp('not a date')).toBe('not a date');
  });
});

describe('parseBackendDate', () => {
  it('reads an offsetless date-time as the same instant as its stamped form', () => {
    expect(parseBackendDate('2026-08-27T00:55:00')?.getTime()).toBe(
      Date.parse('2026-08-27T00:55:00Z')
    );
  });

  it('returns null for missing or unparseable input', () => {
    expect(parseBackendDate(null)).toBeNull();
    expect(parseBackendDate(undefined)).toBeNull();
    expect(parseBackendDate('')).toBeNull();
    expect(parseBackendDate('not a date')).toBeNull();
  });
});

describe('toLocalDayjs', () => {
  it('matches parseBackendDate for a naive UTC timestamp', () => {
    expect(toLocalDayjs('2026-08-27T00:55:00').valueOf()).toBe(
      Date.parse('2026-08-27T00:55:00Z')
    );
  });

  it('yields an invalid Dayjs — never "now" — for missing input', () => {
    expect(toLocalDayjs(null).isValid()).toBe(false);
    expect(toLocalDayjs(undefined).isValid()).toBe(false);
    expect(toLocalDayjs('').isValid()).toBe(false);
  });
});
