import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import {
  COMPENSATION_EVENT_TYPE,
  NOTICE_PROGRESS_STEPS,
} from '@/modules/compensation-event/constants/compensation-event-notice.constants';
import type { CompensationEventNoticeFormValues } from '@/modules/compensation-event/types/compensation-event-notice.types';
import {
  formatDaysRemaining,
  getNoticeProgress,
  getNoticeTimeBar,
  joinRecipients,
} from '@/modules/compensation-event/utils/compensation-event-notice.utils';

const basicDetails: Partial<CompensationEventNoticeFormValues> = {
  to: ['david.thompson@employer.test'],
  from: 'Sarah Mitchell',
  role: "Employer's Project Manager",
  dateIssued: dayjs('2026-07-29'),
};

const eventInformation: Partial<CompensationEventNoticeFormValues> = {
  compensationEventType: COMPENSATION_EVENT_TYPE.EARLY_WARNING,
  relevantContractClause: '60.1(1) - PM changes Works Information',
  descriptionOfEvent: 'The Project Manager changed the Works Information.',
  proposedEffect: 'Two extra weeks of preliminaries.',
};

describe('getNoticeProgress', () => {
  it('reports nothing complete for an empty form', () => {
    expect(getNoticeProgress({})).toEqual({
      percent: 0,
      currentStepIndex: 0,
      completedStepIndexes: [],
    });
  });

  it('completes only the filled step and points at the next one', () => {
    const progress = getNoticeProgress(basicDetails);

    expect(progress.completedStepIndexes).toEqual([0]);
    expect(progress.currentStepIndex).toBe(1);
    expect(progress.percent).toBe(25);
  });

  it('does not credit a step with a blank or whitespace-only value', () => {
    const progress = getNoticeProgress({ ...basicDetails, role: '   ' });

    expect(progress.completedStepIndexes).toEqual([]);
    expect(progress.percent).toBe(0);
  });

  it('does not credit a step whose recipient list is empty', () => {
    const progress = getNoticeProgress({ ...basicDetails, to: [] });

    expect(progress.completedStepIndexes).toEqual([]);
    expect(progress.percent).toBe(0);
  });

  it('completes the uncollected steps once every collected step is done', () => {
    const progress = getNoticeProgress({ ...basicDetails, ...eventInformation });

    expect(progress.completedStepIndexes).toEqual(
      NOTICE_PROGRESS_STEPS.map((_step, index) => index)
    );
    expect(progress.percent).toBe(100);
    expect(progress.currentStepIndex).toBe(NOTICE_PROGRESS_STEPS.length - 1);
  });

  it('treats empty recipient lists as unset', () => {
    expect(getNoticeProgress({ ...basicDetails, ...eventInformation, bcc: [] }).percent).toBe(100);
    expect(getNoticeProgress({}, [{ title: 'Recipients', fields: ['bcc'] }]).percent).toBe(0);
    expect(
      getNoticeProgress({ bcc: ['a@b.com'] }, [{ title: 'Recipients', fields: ['bcc'] }]).percent
    ).toBe(100);
  });

  it('handles an empty step list without dividing by zero', () => {
    expect(getNoticeProgress(basicDetails, [])).toEqual({
      percent: 0,
      currentStepIndex: 0,
      completedStepIndexes: [],
    });
  });
});

describe('getNoticeTimeBar', () => {
  it('has no countdown until a date is issued', () => {
    expect(getNoticeTimeBar()).toEqual({ daysRemaining: null, deadlineLabel: '' });
    expect(getNoticeTimeBar(dayjs('not-a-date'))).toEqual({
      daysRemaining: null,
      deadlineLabel: '',
    });
  });

  it('counts the reply window from the issue date', () => {
    const timeBar = getNoticeTimeBar(dayjs('2026-08-07'), dayjs('2026-08-14T09:30:00'));

    expect(timeBar.daysRemaining).toBe(7);
    expect(timeBar.deadlineLabel).toBe('21 Aug 2026');
  });

  it('floors an elapsed window at zero rather than going negative', () => {
    expect(getNoticeTimeBar(dayjs('2026-01-01'), dayjs('2026-03-01')).daysRemaining).toBe(0);
  });
});

describe('formatDaysRemaining', () => {
  it('singularises a one-day window', () => {
    expect(formatDaysRemaining(1)).toBe('1 day remaining');
    expect(formatDaysRemaining(0)).toBe('0 days remaining');
    expect(formatDaysRemaining(7)).toBe('7 days remaining');
  });
});

describe('joinRecipients', () => {
  it('drops blanks and joins the rest', () => {
    expect(joinRecipients(['a@b.com', '  ', 'c@d.com'])).toBe('a@b.com, c@d.com');
  });

  it('returns undefined when nothing is left', () => {
    expect(joinRecipients()).toBeUndefined();
    expect(joinRecipients([])).toBeUndefined();
    expect(joinRecipients(['   '])).toBeUndefined();
  });
});
