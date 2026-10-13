import type { EmailThreadListItem } from '@/components/shared/EmailThreadList';
import { parseBackendDate } from '@/lib/utils';
import type { EarlyWarningConversationDto } from '../types/early-warning-api.types';

export interface ThreadMessage {
  id: string;
  conversationId?: string;
  subject?: string;
  sender: string;
  initials: string;
  /** Who the mail was addressed to / handled by, when the endpoint provides it. */
  handler?: string;
  time: string;
  body: string;
  /** Optional corner tag rendered atop the row, e.g. "EW Trigger". */
  tag?: string;
  timestampUtc?: string;
  boxType?: number | string | null;
  source?: string | null;
  accountEmail?: string | null;
}

/** Strips an email body down to a one-line preview — drops style blocks, tags and entities. */
const toSnippet = (html?: string | null): string =>
  (html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatTime = (iso?: string): string => {
  const date = parseBackendDate(iso);
  if (!date) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const initialsOf = (email?: string): string => {
  const local = (email?.split('@')[0] ?? '').replace(/[^a-zA-Z.\-_ ]/g, '');
  const parts = local.split(/[.\-_ ]+/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0][0], parts[1][0]] : [local[0] ?? '?'];
  return chars.join('').toUpperCase();
};

/** Normalises the loose conversation rows onto the thread-list view model. */
export const toThreadMessages = (conversations: EarlyWarningConversationDto[]): ThreadMessage[] => {
  if (!Array.isArray(conversations)) return [];
  return conversations
    .map((msg, index) => {
      const sender = (msg.senderEmail as string) || 'Unknown sender';
      const receiver = msg.receivedBy as string | undefined;
      const conversationId = (msg.conversationId as string) || undefined;
      const subject = (msg.subject as string) || undefined;
      const rawTimestamp = (msg.timestampUtc || msg.sentAt || '') as string;
      return {
        id: conversationId ?? `thread-${index}`,
        conversationId,
        subject,
        sender,
        initials: initialsOf(sender),
        handler: receiver,
        time: formatTime(rawTimestamp),
        body: toSnippet(msg.body as string | null | undefined),
        timestampUtc: rawTimestamp,
        boxType: msg.boxType as number | string | null | undefined,
        source: msg.source as string | null | undefined,
        accountEmail: (msg.userEmail || msg.accountEmail) as string | null | undefined,
      };
    })
    .filter((message) => message.body !== '');
};

/** Maps the EW thread view model onto the shared email list row shape. */
export const toEmailThreadListItems = (messages: ThreadMessage[]): EmailThreadListItem[] =>
  messages.map((m) => ({
    id: m.id,
    senderEmail: m.sender,
    subject: m.subject ?? '',
    body: m.body,
    timestampUtc: m.timestampUtc || m.time,
    boxType: m.boxType,
    source: m.source,
    accountEmail: m.accountEmail ?? m.handler,
  }));
