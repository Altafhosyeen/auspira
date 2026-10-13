import { describe, expect, it } from 'vitest';
import type { ProjectAlert } from '@/hooks/modules/project-alerts';
import {
  getAlertDeadline,
  matchClauseOption,
  toAlertClauseOption,
  toEarlyWarningNoticeInitialValues,
  toNoticeInitialValues,
  withAlertClauseOption,
} from '@/modules/compensation-event/utils/compensation-event-notice-prefill.utils';

// Stands in for the clauses the backend returns for a project.
const clauseOptions = [
  '60.1(1) - PM changes Works Information',
  '60.1(12) - Physical conditions within the Site not reasonably foreseeable',
].map((label) => ({ label, value: label }));

const alert = {
  id: 'alert-1',
  title: 'Ground conditions differ from the site information',
  description: 'The contractor reports rock below 2m that the site information does not show.',
  createdOn: '2026-07-29T09:15:00',
  clauseDescription: 'Clause 60.1(12) — physical conditions within the Site.',
  impactAssessment: JSON.stringify({
    potentialImpacts: 'Two week delay to the foundations.',
    keyDatesAffected: 'Sectional completion 12 Sep 2026.',
    proposedActions: 'Re-sequence the piling works.',
  }),
  projectAlertEmails: [
    {
      id: 'email-1',
      emailSender: 'site@contractor.com',
      emailTo: 'pm@employer.com',
      emailCc: 'qs@employer.com; commercial@employer.com',
      emailSubject: 'Unexpected ground conditions',
      emailBody: 'We hit rock this morning.',
    },
  ],
} as unknown as ProjectAlert;

describe('toNoticeInitialValues', () => {
  it('mirrors the alert email onto the communication fields', () => {
    const values = toNoticeInitialValues(alert);

    expect(values.from).toBe('site@contractor.com');
    expect(values.to).toEqual(['pm@employer.com']);
    expect(values.cc).toEqual(['qs@employer.com', 'commercial@employer.com']);
    expect(values.dateIssued?.isValid()).toBe(true);
  });

  it('stacks the impact assessment into the proposed effect', () => {
    expect(toNoticeInitialValues(alert).proposedEffect).toBe(
      [
        'Potential impacts: Two week delay to the foundations.',
        'Key dates affected: Sectional completion 12 Sep 2026.',
        'Proposed actions: Re-sequence the piling works.',
      ].join('\n\n')
    );
  });

  it('falls back to the email body when the alert carries no description', () => {
    const values = toNoticeInitialValues({ ...alert, description: null });
    expect(values.descriptionOfEvent).toBe('We hit rock this morning.');
  });

  it('leaves every field unset for an alert with no email and no impact', () => {
    const values = toNoticeInitialValues({
      ...alert,
      description: null,
      impactAssessment: null,
      createdOn: '',
      projectAlertEmails: [],
    });

    expect(values).toEqual({
      to: [],
      from: undefined,
      cc: [],
      dateIssued: undefined,
      descriptionOfEvent: undefined,
      proposedEffect: undefined,
    });
  });
});

describe('toEarlyWarningNoticeInitialValues', () => {
  it('puts the early warning raiser into the recipient list', () => {
    const values = toEarlyWarningNoticeInitialValues({
      id: 'ew-1',
      projectId: 'project-1',
      reference: 'EW-0001',
      raisedBy: 'altafhosyeen@gmail.com',
      title: 'Early Warning: Programme and Cost Risk',
      description: 'A risk has been identified.',
      dateRaised: '2026-08-29T06:27:55.342053Z',
      potentialImpacts: 'Cost increase',
      proposedActions: 'Mitigate risk',
      keyDatesAffected: 'Completion Date',
    });

    expect(values.to).toEqual(['altafhosyeen@gmail.com']);
    expect(values.from).toBeUndefined();
  });
});

describe('matchClauseOption', () => {
  it('matches the catalogue entry on the clause number', () => {
    expect(matchClauseOption(alert.clauseDescription, clauseOptions)).toBe(
      '60.1(12) - Physical conditions within the Site not reasonably foreseeable'
    );
  });

  it('returns nothing when the sentence carries no clause number', () => {
    expect(matchClauseOption('A possible compensation event.', clauseOptions)).toBeUndefined();
  });

  it('returns nothing when no option carries the number', () => {
    expect(
      matchClauseOption('Clause 60.1(12)', [{ label: '60.1(1) - x', value: '60.1(1) - x' }])
    ).toBeUndefined();
  });

  it('matches a parent clause the catalogue carries outright', () => {
    expect(
      matchClauseOption('60 - Compensation events', [
        ...clauseOptions,
        { label: '60 - Compensation events', value: '60 - Compensation events' },
      ])
    ).toBe('60 - Compensation events');
  });

  it('does not read a parent clause as a prefix of a sub-clause', () => {
    expect(matchClauseOption('60 - Compensation events', clauseOptions)).toBeUndefined();
  });
});

// The extracted CE as the backend sends it — wrapped alongside its quotation.
const clauseAlert = {
  ...alert,
  compensationEvent: JSON.stringify({
    compensationEvent: {
      clauseNumber: '60',
      clauseTitle: 'Compensation events',
      clauseDescription: 'Clause 60 - Compensation events: Delay caused by unforeseen works',
      type: 1,
    },
    quotation: null,
  }),
} as ProjectAlert;

describe('toAlertClauseOption', () => {
  it("builds the option from the payload's clause number and title", () => {
    expect(toAlertClauseOption(clauseAlert)).toEqual({
      label: '60 - Compensation events',
      value: '60 - Compensation events',
    });
  });

  it('has no option when the payload names no clause', () => {
    expect(toAlertClauseOption(alert)).toBeUndefined();
  });
});

describe('withAlertClauseOption', () => {
  const alertOption = { label: '60 - Compensation events', value: '60 - Compensation events' };

  it('appends a clause the catalogue does not carry', () => {
    expect(withAlertClauseOption(clauseOptions, alertOption)).toEqual([
      ...clauseOptions,
      alertOption,
    ]);
  });

  it("keeps the project's own entry for the same clause number", () => {
    const catalogue = [{ label: '60 - Compensation events (project)', value: '60 - x' }];
    expect(withAlertClauseOption(catalogue, alertOption)).toEqual(catalogue);
  });

  it('leaves the catalogue untouched without an alert clause', () => {
    expect(withAlertClauseOption(clauseOptions, undefined)).toEqual(clauseOptions);
  });
});

describe('getAlertDeadline', () => {
  it("uses the alert's own time bar when the backend set one", () => {
    const deadline = getAlertDeadline({
      ...alert,
      overdueDateTime: '2026-08-20T00:00:00',
    });

    expect(deadline?.format('YYYY-MM-DD')).toBe('2026-08-20');
  });

  it('counts a week from the raised date when the time bar is null', () => {
    const deadline = getAlertDeadline({ ...alert, overdueDateTime: null });

    expect(deadline?.format('YYYY-MM-DD')).toBe('2026-08-05');
  });

  it('has no deadline without an alert', () => {
    expect(getAlertDeadline(null)).toBeNull();
  });
});
