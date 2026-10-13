import { describe, expect, it } from 'vitest';
import type { ProjectEmailMessageDto } from '@/modules/compensation-event/types/project-email-api.types';
import {
  resolveThreadAuthorParty,
  toCompensationEventThreadMessages,
} from '@/modules/compensation-event/utils/project-email.utils';

const buildMessage = (overrides: Partial<ProjectEmailMessageDto> = {}): ProjectEmailMessageDto => ({
  id: 'msg-1',
  provider: 1,
  type: 'email',
  userEmail: 'pm@auspira.com',
  userId: 'user-1',
  timestampUtc: '2026-07-01T10:00:00Z',
  subject: 'Re: CE-2024-015',
  body: '<p>Body</p>',
  conversationId: 'conv-1',
  messageId: 'message-1',
  boxType: 1,
  senderEmail: 'contractor@site.com',
  ccEmails: null,
  toEmails: 'pm@auspira.com',
  source: 'outlook',
  ...overrides,
});

describe('resolveThreadAuthorParty', () => {
  it('reads boxType 1 as received from the contractor', () => {
    expect(resolveThreadAuthorParty(1, 'outlook')).toBe('CONTRACTOR');
    expect(resolveThreadAuthorParty('1', 'gmail')).toBe('CONTRACTOR');
  });

  it('reads any other boxType as sent by the PM', () => {
    expect(resolveThreadAuthorParty(0, 'outlook')).toBe('PM');
    expect(resolveThreadAuthorParty(2, 'imap')).toBe('PM');
  });

  it('always reads an Auspira-sourced email as sent, even with boxType 1', () => {
    expect(resolveThreadAuthorParty(1, 'Auspira')).toBe('PM');
    expect(resolveThreadAuthorParty(1, 'AUSPIRA')).toBe('PM');
  });
});

describe('toCompensationEventThreadMessages', () => {
  it('maps sender, direction, recipients, subject, body and timestamp', () => {
    const [message] = toCompensationEventThreadMessages([buildMessage()]);

    expect(message).toEqual({
      id: 'msg-1',
      authorName: 'contractor@site.com',
      authorParty: 'CONTRACTOR',
      recipientName: 'pm@auspira.com',
      subject: 'Re: CE-2024-015',
      body: 'Body',
      sentAt: '2026-07-01T10:00:00Z',
      conversationId: 'conv-1',
      boxType: 1,
      source: 'outlook',
      accountEmail: 'pm@auspira.com',
    });
  });

  it('reads mail the connected mailbox sent as the PM, whatever boxType says', () => {
    const [message] = toCompensationEventThreadMessages([
      buildMessage({ senderEmail: 'pm@auspira.com', boxType: 1 }),
    ]);

    expect(message.authorParty).toBe('PM');
  });

  it('reads mail from anyone else as the contractor, even on an Auspira-connected mailbox', () => {
    const [message] = toCompensationEventThreadMessages([
      buildMessage({ senderEmail: 'contractor@site.com', source: 'auspira', boxType: 0 }),
    ]);

    expect(message.authorParty).toBe('CONTRACTOR');
  });

  it('falls back to a placeholder when the subject is blank', () => {
    const [message] = toCompensationEventThreadMessages([buildMessage({ subject: '' })]);

    expect(message.subject).toBe('(no subject)');
  });

  it('strips markup out of the raw email body', () => {
    const [message] = toCompensationEventThreadMessages([
      buildMessage({
        body: '<style>.x{color:red}</style><p>Please see&nbsp;attached.</p><p>Regards,<br>Sam</p>',
      }),
    ]);

    expect(message.body).toBe('Please see attached. Regards, Sam');
  });

  it('falls back to the account email when there is no sender, and a dash with no recipient', () => {
    const [message] = toCompensationEventThreadMessages([
      buildMessage({ senderEmail: null, toEmails: null }),
    ]);

    expect(message.authorName).toBe('pm@auspira.com');
    expect(message.recipientName).toBe('—');
  });

  it('sorts newest first', () => {
    const messages = toCompensationEventThreadMessages([
      buildMessage({ id: 'older', timestampUtc: '2026-07-01T09:00:00Z' }),
      buildMessage({ id: 'newer', timestampUtc: '2026-07-02T09:00:00Z' }),
    ]);

    expect(messages.map((message) => message.id)).toEqual(['newer', 'older']);
  });

  it('drops duplicate ids from overlapping conversation fetches, keeping one copy', () => {
    const messages = toCompensationEventThreadMessages([buildMessage(), buildMessage()]);

    expect(messages).toHaveLength(1);
  });
});
