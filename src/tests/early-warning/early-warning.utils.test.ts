import { describe, expect, it } from 'vitest';
import type { EarlyWarning } from '@/modules/early-warning/types/early-warning.types';
import {
  daysRemaining,
  matchesSearchTerm,
  matchesStatus,
} from '@/modules/early-warning/utils/early-warning.utils';

const ew = (overrides: Partial<EarlyWarning> = {}): EarlyWarning => ({
  id: 'ew1',
  reference: 'EW-001',
  title: 'Late drawings',
  source: 'Manual raise',
  raisedOn: '31 Jul 2026',
  raisedBy: 'Alice',
  raisedAt: null,
  impacts: [],
  status: 'OPEN',
  dueDate: null,
  dueOverdue: false,
  closed: false,
  closedAt: null,
  closingReason: null,
  closedBy: null,
  ...overrides,
});

describe('matchesStatus', () => {
  it('keeps every row when no status is picked (All Status)', () => {
    expect(matchesStatus(ew(), undefined)).toBe(true);
    expect(matchesStatus(ew({ status: 'CLOSED' }), undefined)).toBe(true);
  });

  it('filters rows by the selected register status', () => {
    expect(matchesStatus(ew(), 'OPEN')).toBe(true);
    expect(matchesStatus(ew({ status: 'CLOSED' }), 'OPEN')).toBe(false);
    expect(matchesStatus(ew({ status: 'CLOSED' }), 'CLOSED')).toBe(true);
  });
});

describe('daysRemaining', () => {
  it('counts whole days until the deadline and goes negative after it', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 86_400_000);
    const past = new Date(now.getTime() - 2 * 86_400_000);
    expect(daysRemaining(future.toISOString())).toBe(7);
    expect(daysRemaining(past.toISOString())).toBe(-2);
  });

  it('returns null for missing or unparseable dates', () => {
    expect(daysRemaining(null)).toBeNull();
    expect(daysRemaining('not-a-date')).toBeNull();
  });
});

describe('matchesSearchTerm', () => {
  it('matches case-insensitively across reference, title and people', () => {
    const row = ew();
    expect(matchesSearchTerm(row, 'ew-0')).toBe(true);
    expect(matchesSearchTerm(row, 'DRAWINGS')).toBe(true);
    expect(matchesSearchTerm(row, 'alice')).toBe(true);
    expect(matchesSearchTerm(row, 'nothing-matches')).toBe(false);
  });
});
