import type { ProjectEmail } from '@/components/contract/cross-reference-contract/EmailThreadModal/types';
import { emailDirection } from '@/components/contract-control-agent/email-thread-list.utils';
import type {
  CompensationEventThreadMessage,
  CompensationEventThreadParty,
} from '../types/compensation-event.types';
import type {
  EntityConversationDto,
  ProjectEmailMessageDto,
} from '../types/project-email-api.types';
import { stripEmailHtml } from './compensation-event.utils';

// Which party wrote the message, resolved by the app-wide `emailDirection` rule so the party
// on a row can never disagree with the Inbound/Outbound badge next to it: mail received into
// the project mailbox is the contractor's, mail the mailbox itself sent is the PM/system's.
// Pass `message` wherever it is known — sender-vs-mailbox is a far stronger signal than the
// `boxType`/`source` pair, which this backend stamps inconsistently.
export const resolveThreadAuthorParty = (
  boxType: ProjectEmailMessageDto['boxType'],
  source?: string | null,
  message?: { body?: string | null; senderEmail?: string | null; accountEmail?: string | null }
): CompensationEventThreadParty =>
  emailDirection({ boxType, source, ...message }) === 'in' ? 'CONTRACTOR' : 'PM';

// Parallel per-conversation fetches can race and settle more than once during
// background refetches; keep the latest copy of each message id and drop the rest.
const dedupeMessages = (messages: ProjectEmailMessageDto[]): ProjectEmailMessageDto[] => [
  ...new Map(messages.map((message) => [message.id, message])).values(),
];

// The tab has no per-conversation grouping, so every conversation's messages flatten
// into one newest-first timeline.
export const toCompensationEventThreadMessages = (
  messages: ProjectEmailMessageDto[]
): CompensationEventThreadMessage[] =>
  dedupeMessages(messages)
    .sort((a, b) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())
    .map((message) => ({
      id: message.id,
      authorName: message.senderEmail || message.userEmail || 'Unknown sender',
      authorParty: resolveThreadAuthorParty(message.boxType, message.source, {
        body: message.body,
        senderEmail: message.senderEmail,
        accountEmail: message.userEmail,
      }),
      recipientName: message.toEmails || '—',
      subject: message.subject || '(no subject)',
      body: stripEmailHtml(message.body),
      sentAt: message.timestampUtc,
      conversationId: message.conversationId,
      boxType: message.boxType,
      source: message.source,
      accountEmail: message.userEmail,
    }));

// What the Email Thread tab actually renders: the shared project-emails endpoint is the source
// of truth, and the event's own `thread` only stands in while that has nothing. Shared with the
// detail page so the tab's count badge can never disagree with the list underneath it.
export const resolveCompensationEventThread = (
  messages: ProjectEmailMessageDto[],
  fallback?: CompensationEventThreadMessage[]
): CompensationEventThreadMessage[] =>
  messages.length ? toCompensationEventThreadMessages(messages) : (fallback ?? []);

// The Email Thread tab's list source — one row per conversation summary, same shape and
// lazy-fetch pattern as the Early Warning thread panel (`EarlyWarningThreadsPanel` +
// `useGetEarlyWarningConversations`): the summary is enough to render the row, and the
// full per-message thread only loads once it's clicked, via `EmailThreadModal`. This
// avoids eagerly fetching + flattening every conversation's full thread just to show a list.
export const toCompensationEventThreadFromConversations = (
  conversations: EntityConversationDto[]
): CompensationEventThreadMessage[] =>
  [...conversations]
    .sort((a, b) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())
    .map((conversation) => ({
      id: conversation.conversationId,
      authorName: conversation.senderEmail || 'Unknown sender',
      authorParty:
        emailDirection({ body: conversation.body, senderEmail: conversation.senderEmail }) === 'in'
          ? 'CONTRACTOR'
          : 'PM',
      recipientName: '—',
      subject: conversation.subject || '(no subject)',
      body: stripEmailHtml(conversation.body),
      sentAt: conversation.timestampUtc,
      conversationId: conversation.conversationId,
    }));

export const resolveCompensationEventConversationThread = (
  conversations: EntityConversationDto[],
  fallback?: CompensationEventThreadMessage[]
): CompensationEventThreadMessage[] =>
  conversations.length
    ? toCompensationEventThreadFromConversations(conversations)
    : (fallback ?? []);

// EmailThreadModal only ever renders `ProjectEmail` shapes. A thread row with no
// conversationId has nothing to fetch, so shape its own already-known content into a
// single-message `ProjectEmail` the modal can show directly via `fallbackMessages`.
export const toFallbackProjectEmail = (item: CompensationEventThreadMessage): ProjectEmail => ({
  id: item.id,
  provider: 0,
  type: 'mail',
  userEmail: item.authorName,
  userId: item.authorName,
  timestampUtc: item.sentAt,
  subject: item.subject,
  body: item.body,
  conversationId: item.id,
  messageId: item.id,
  boxType: item.authorParty === 'CONTRACTOR' ? 1 : 0,
  senderEmail: item.authorName,
  ccEmails: null,
  toEmails: item.recipientName,
  source: '',
});
