import { parseBackendDate } from '@/lib/utils';

export interface EarlyWarningTimeBar {
  /** Whole days from today until the deadline — null when undated. */
  daysRemaining: number | null;
  /** Display label, e.g. "21 Aug 2026" — '' when undated. */
  deadlineLabel: string;
}

const DEADLINE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

export const formatDaysRemaining = (days: number): string =>
  `${days} ${days === 1 ? 'day' : 'days'} remaining`;

// Counts down to a known deadline — mirrors the compensation-event `getTimeBarForDeadline`.
// The deadline is per-record (project alert / meeting), not a global time-bar lookup.
export const getTimeBarForDeadline = (deadline?: string | null): EarlyWarningTimeBar => {
  const due = parseBackendDate(deadline);
  if (!due) return { daysRemaining: null, deadlineLabel: '' };

  const startOfDue = new Date(due);
  startOfDue.setHours(0, 0, 0, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const days = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);

  return {
    daysRemaining: Math.max(days, 0),
    deadlineLabel: due.toLocaleDateString('en-GB', DEADLINE_FORMAT),
  };
};
