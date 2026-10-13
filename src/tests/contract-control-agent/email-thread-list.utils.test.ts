import { describe, expect, it } from 'vitest';
import { emailDirection } from '@/components/contract-control-agent/email-thread-list.utils';

const PLATFORM_NOTICE =
  '[Source:Auspira] A new Compensation Event has been raised with reference CE-0987.';

describe('emailDirection', () => {
  describe('sender vs. the connected mailbox — the strongest signal', () => {
    it('reads mail sent by the mailbox itself as outbound', () => {
      expect(
        emailDirection({
          senderEmail: 'altaf@auspira.ai',
          accountEmail: 'altaf@auspira.ai',
          boxType: 1,
        })
      ).toBe('out');
    });

    it('reads mail from anyone else as inbound', () => {
      expect(
        emailDirection({
          senderEmail: 'contractor@site.com',
          accountEmail: 'altaf@auspira.ai',
          boxType: 0,
        })
      ).toBe('in');
    });

    it('compares addresses case- and whitespace-insensitively', () => {
      expect(
        emailDirection({ senderEmail: ' Altaf@Auspira.AI ', accountEmail: 'altaf@auspira.ai' })
      ).toBe('out');
    });

    it('outranks a mailbox connected through Auspira, which stamps every row "auspira"', () => {
      expect(
        emailDirection({
          senderEmail: 'contractor@site.com',
          accountEmail: 'altaf@auspira.ai',
          source: 'auspira',
          boxType: 1,
        })
      ).toBe('in');
    });
  });

  describe('the platform marker, when the mailbox is unknown', () => {
    it('reads a message the platform generated as outbound', () => {
      expect(emailDirection({ body: PLATFORM_NOTICE, boxType: 1 })).toBe('out');
    });

    it('ignores the marker inside a quoted reply — the reply is the contractor\u2019s', () => {
      const reply = `Dear Altaf, we accept the assessment.\n\nOn 22 Aug 2026 Auspira wrote:\n> ${PLATFORM_NOTICE}`;
      expect(emailDirection({ body: reply, boxType: 1 })).toBe('in');
    });

    it('ignores the marker inside an Outlook quoted trailer', () => {
      const reply = `Please see attached.<blockquote>${PLATFORM_NOTICE}</blockquote>`;
      expect(emailDirection({ body: reply, boxType: 1 })).toBe('in');
    });

    it('ignores the marker below an "Original Message" separator', () => {
      const reply = `Noted, thanks.\n-----Original Message-----\n${PLATFORM_NOTICE}`;
      expect(emailDirection({ body: reply, boxType: 1 })).toBe('in');
    });
  });

  describe('the boxType flag, when nothing better is known', () => {
    it('reads boxType 1 as received', () => {
      expect(emailDirection({ boxType: 1, source: 'outlook' })).toBe('in');
      expect(emailDirection({ boxType: '1', source: 'gmail' })).toBe('in');
    });

    it('reads any other boxType as sent', () => {
      expect(emailDirection({ boxType: 0, source: 'outlook' })).toBe('out');
      expect(emailDirection({ boxType: 2, source: 'imap' })).toBe('out');
    });

    it('still lets an Auspira source break the tie on a boxType-1 row', () => {
      expect(emailDirection({ boxType: 1, source: 'Auspira' })).toBe('out');
    });

    it('defaults to inbound when the row carries no boxType at all', () => {
      expect(emailDirection({ body: 'Dear Project Manager, please find our quotation.' })).toBe(
        'in'
      );
    });
  });

  it('does not treat a lone sender or a lone mailbox as a comparison', () => {
    expect(emailDirection({ senderEmail: 'contractor@site.com', boxType: 0 })).toBe('out');
    expect(emailDirection({ accountEmail: 'altaf@auspira.ai', boxType: 1 })).toBe('in');
  });
});
