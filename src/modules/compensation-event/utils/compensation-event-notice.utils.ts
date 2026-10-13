import dayjs, { type Dayjs } from 'dayjs';
import {
  NOTICE_DEADLINE_FORMAT,
  NOTICE_PROGRESS_STEPS,
  NOTICE_REPLY_PERIOD_DAYS,
} from '../constants/compensation-event-notice.constants';
import type {
  CompensationEventNoticeFormValues,
  NoticeProgress,
  NoticeProgressStep,
  NoticeTimeBar,
} from '../types/compensation-event-notice.types';

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const isStepComplete = (
  step: NoticeProgressStep,
  values: Partial<CompensationEventNoticeFormValues>
): boolean => step.fields.every((field) => hasValue(values[field]));

// Drives the Progress card. Steps the screen does not collect complete only once every
// field-bearing step does, so an empty form reads 0% rather than being credited for
// fields that are not there.
export const getNoticeProgress = (
  values: Partial<CompensationEventNoticeFormValues>,
  steps: NoticeProgressStep[] = NOTICE_PROGRESS_STEPS
): NoticeProgress => {
  if (!steps.length) return { percent: 0, currentStepIndex: 0, completedStepIndexes: [] };

  const collectedSteps = steps.filter((step) => step.fields.length > 0);
  const allCollectedComplete = collectedSteps.every((step) => isStepComplete(step, values));

  const completedStepIndexes = steps
    .map((step, index) =>
      (step.fields.length ? isStepComplete(step, values) : allCollectedComplete) ? index : -1
    )
    .filter((index) => index !== -1);

  const firstPending = steps.findIndex((_step, index) => !completedStepIndexes.includes(index));

  return {
    percent: Math.round((completedStepIndexes.length / steps.length) * 100),
    currentStepIndex: firstPending === -1 ? steps.length - 1 : firstPending,
    completedStepIndexes,
  };
};

/** Counts down to a deadline that is already known — the signal's own time bar. */
export const getTimeBarForDeadline = (
  deadline?: Dayjs | null,
  now: Dayjs = dayjs()
): NoticeTimeBar => {
  if (!deadline?.isValid?.()) return { daysRemaining: null, deadlineLabel: '' };

  const dueDay = deadline.startOf('day');

  return {
    daysRemaining: Math.max(dueDay.diff(now.startOf('day'), 'day'), 0),
    deadlineLabel: dueDay.format(NOTICE_DEADLINE_FORMAT),
  };
};

/** Counts down the reply window opened by the notice's issue date. */
export const getNoticeTimeBar = (
  dateIssued?: Dayjs | null,
  now: Dayjs = dayjs(),
  periodDays: number = NOTICE_REPLY_PERIOD_DAYS
): NoticeTimeBar => {
  if (!dateIssued?.isValid?.()) return { daysRemaining: null, deadlineLabel: '' };

  return getTimeBarForDeadline(dateIssued.startOf('day').add(periodDays, 'day'), now);
};

// A time bar only means something once a deadline exists to count down to — without one
// the tile can say nothing but "Not started", so the screens leave it out entirely.
export const isTimeBarRunning = (
  timeBar?: NoticeTimeBar
): timeBar is NoticeTimeBar & { daysRemaining: number } =>
  typeof timeBar?.daysRemaining === 'number';

export const formatDaysRemaining = (daysRemaining: number): string =>
  `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;

/** Recipient selects hold free-text tags; the payload takes one comma-separated string. */
export const joinRecipients = (recipients?: string[]): string | undefined => {
  const cleaned = (recipients ?? []).map((recipient) => recipient.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(', ') : undefined;
};
