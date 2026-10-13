import { describe, expect, it } from 'vitest';
import type { ProjectAlert, ProjectAlertEmail } from '@/hooks/modules/project-alerts';
import { COMPOSE_EMAIL_DEFAULTS } from '@/modules/compensation-event/constants/compensation-event-email.constants';
import { CONTRACTOR_QUOTATION_COPY } from '@/modules/compensation-event/constants/compensation-event-quotation.constants';
import type { ContractorQuotation } from '@/modules/compensation-event/types/compensation-event-quotation.types';
import {
  buildQuotationRevisionEmail,
  extractEmailAddress,
  fillEmailTokens,
  getRecipientInitials,
  isEmailAddress,
  parseRecipientList,
  splitRecipients,
  toPlainText,
} from '@/modules/compensation-event/utils/compensation-event-email.utils';

describe('isEmailAddress', () => {
  it('accepts a well-formed address', () => {
    expect(isEmailAddress('jhon.doe@contractor.com')).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isEmailAddress('  jhon.doe@contractor.com  ')).toBe(true);
  });

  it.each(['jhon.doe', 'jhon.doe@', '@contractor.com', 'jhon doe@contractor.com', ''])(
    'rejects %j',
    (value) => {
      expect(isEmailAddress(value)).toBe(false);
    }
  );
});

describe('getRecipientInitials', () => {
  it('builds initials from a dotted local part', () => {
    expect(getRecipientInitials('jhon.doe@contractor.com')).toBe('JD');
  });

  it('handles underscore and hyphen separators', () => {
    expect(getRecipientInitials('michael_smith@contractor.com')).toBe('MS');
    expect(getRecipientInitials('emily-turner@contractor.com')).toBe('ET');
  });

  it('falls back to the first two characters when there is no separator', () => {
    expect(getRecipientInitials('sarah@contractor.com')).toBe('S');
  });

  it('handles a value that is not an address', () => {
    expect(getRecipientInitials('Sarah Mitchell')).toBe('SM');
  });
});

describe('splitRecipients', () => {
  it('separates valid addresses from the rest', () => {
    expect(splitRecipients(['a@b.com', 'nope', 'c@d.co.uk'])).toEqual({
      valid: ['a@b.com', 'c@d.co.uk'],
      invalid: ['nope'],
    });
  });

  it('drops blank entries entirely', () => {
    expect(splitRecipients(['', '   ', 'a@b.com'])).toEqual({ valid: ['a@b.com'], invalid: [] });
  });
});

describe('toPlainText', () => {
  it('strips tags and turns block ends into newlines', () => {
    expect(toPlainText('<p>Dear Contractor,</p><p>Regards,<br />Auspira Team</p>')).toBe(
      'Dear Contractor,\nRegards,\nAuspira Team'
    );
  });

  it('decodes non-breaking spaces', () => {
    expect(toPlainText('<p>a&nbsp;b</p>')).toBe('a b');
  });

  it('is empty for markup with no text', () => {
    expect(toPlainText('<p><br /></p>')).toBe('');
  });
});

describe('COMPOSE_EMAIL_DEFAULTS', () => {
  it('seeds only the body — the sender fills in recipients and subject', () => {
    expect(COMPOSE_EMAIL_DEFAULTS.to).toEqual([]);
    expect(COMPOSE_EMAIL_DEFAULTS.cc).toEqual([]);
    expect(COMPOSE_EMAIL_DEFAULTS.bcc).toEqual([]);
    expect(COMPOSE_EMAIL_DEFAULTS.subject).toBe('');
    expect(toPlainText(COMPOSE_EMAIL_DEFAULTS.body)).not.toBe('');
  });
});

describe('extractEmailAddress', () => {
  it('reads the address out of a display-name header', () => {
    expect(extractEmailAddress('Alex Reid <alex@contractor.com>')).toBe('alex@contractor.com');
  });

  it('leaves a bare address alone', () => {
    expect(extractEmailAddress('  alex@contractor.com ')).toBe('alex@contractor.com');
  });
});

describe('parseRecipientList', () => {
  it('splits on commas and semicolons across every value it is given', () => {
    expect(parseRecipientList('a@x.com, Bob <b@x.com>', 'c@x.com; d@x.com')).toEqual([
      'a@x.com',
      'b@x.com',
      'c@x.com',
      'd@x.com',
    ]);
  });

  it('drops what the compose modal would refuse to send', () => {
    expect(parseRecipientList('Site Team, a@x.com')).toEqual(['a@x.com']);
  });

  it('dedupes case-insensitively', () => {
    expect(parseRecipientList('A@x.com', 'a@x.com')).toEqual(['A@x.com']);
  });

  it('is empty for nothing at all', () => {
    expect(parseRecipientList(null, undefined, '')).toEqual([]);
  });
});

describe('fillEmailTokens', () => {
  it('fills the tokens it knows', () => {
    expect(fillEmailTokens('for {reference} by {deadline}', { reference: 'CE-804' })).toBe(
      'for CE-804 by {deadline}'
    );
  });
});

describe('buildQuotationRevisionEmail', () => {
  const alertEmail: ProjectAlertEmail = {
    id: 'email-1',
    projectAlertId: 'alert-1',
    projectEmailId: null,
    missingInformation: null,
    description: null,
    confidencePercentage: 90,
    emailTo: 'pm@auspira.com',
    emailCc: 'commercial@auspira.com; Site Team',
    emailSubject: 'Quotation for CE-804',
    emailSender: 'Alex Reid <alex@contractor.com>',
    emailBody: null,
  };

  const alert = { projectAlertEmails: [alertEmail] } as ProjectAlert;

  const quotation = {
    reference: 'CE-804',
    submittedOn: '2026-08-17T09:00:00Z',
    currency: 'GBP',
    lines: [
      {
        id: 'people',
        category: 'people',
        label: 'People',
        description: 'plant operatives',
        members: [],
        amount: 8420,
      },
    ],
    riskAllowance: 0,
    programmeImpact: [],
    submittedBy: [],
    timeBar: { daysRemaining: 4, deadlineLabel: '24 Aug 2026' },
  } satisfies ContractorQuotation;

  it('replies to whoever sent the quotation and keeps its Cc list', () => {
    const defaults = buildQuotationRevisionEmail({ alert, quotation, reference: 'CE-804' });

    expect(defaults.to).toEqual(['alex@contractor.com']);
    expect(defaults.cc).toEqual(['commercial@auspira.com']);
  });

  it('replies on the thread rather than opening a new subject', () => {
    expect(buildQuotationRevisionEmail({ alert, quotation }).subject).toBe(
      'Re: Quotation for CE-804'
    );
  });

  it('does not prefix a subject that is already a reply', () => {
    const replied = {
      ...alert,
      projectAlertEmails: [{ ...alertEmail, emailSubject: 'RE: Quotation for CE-804' }],
    };

    expect(buildQuotationRevisionEmail({ alert: replied, quotation }).subject).toBe(
      'RE: Quotation for CE-804'
    );
  });

  it('names what the request is for when the mail carried no subject', () => {
    const untitled = {
      ...alert,
      projectAlertEmails: [{ ...alertEmail, emailSubject: null }],
    };

    expect(buildQuotationRevisionEmail({ alert: untitled, quotation }).subject).toBe(
      `${CONTRACTOR_QUOTATION_COPY.revisionEmail.subject} - CE-804`
    );
  });

  it('quotes the submitted total and the reply deadline in the body', () => {
    const { body = '' } = buildQuotationRevisionEmail({ alert, quotation, reference: 'CE-804' });

    expect(body).toContain('CE-804');
    expect(body).toContain('17 Aug 2026');
    expect(body).toContain('£8,420');
    expect(body).toContain('24 Aug 2026');
  });

  it('falls back to the mail recipients when the signal names no sender', () => {
    const unsigned = {
      ...alert,
      projectAlertEmails: [{ ...alertEmail, emailSender: null }],
    };

    expect(buildQuotationRevisionEmail({ alert: unsigned, quotation }).to).toEqual([
      'pm@auspira.com',
    ]);
  });

  it('still drafts a body when there is no signal and no quotation', () => {
    const defaults = buildQuotationRevisionEmail({});

    expect(defaults.to).toEqual([]);
    expect(defaults.subject).toBe(CONTRACTOR_QUOTATION_COPY.revisionEmail.subject);
    expect(defaults.body).toContain(CONTRACTOR_QUOTATION_COPY.revisionEmail.unnamedEvent);
  });
});
