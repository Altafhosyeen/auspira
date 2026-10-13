import dayjs from 'dayjs';
import type { ProjectEmail } from '@/components/contract/cross-reference-contract/EmailThreadModal/types';
import { parseBackendDate } from '@/lib/utils';
import type {
  DefectNoticeConversationDto,
  DefectNoticeThreadMessage,
} from '../types/defect-notice.types';

const DASH = '-';

/** Saves a fetched attachment blob — mirrors the PMI module's download helper. */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const formatDefectNoticeTimestamp = (isoDate?: string | null): string =>
  isoDate ? dayjs(isoDate).format('DD MMM YYYY, HH:mm') : DASH;

// A mock thread row has no real conversationId to fetch, so `EmailThreadModal` cannot load
// it — shape the row's own already-known content into a single-message `ProjectEmail` and
// hand it in as `fallbackMessages` instead, same approach the RFI/CE detail screens take.
export const toDefectNoticeFallbackEmail = (item: DefectNoticeThreadMessage): ProjectEmail => ({
  id: item.id,
  provider: 0,
  type: 'mail',
  userEmail: item.authorName,
  userId: item.authorName,
  timestampUtc: item.sentAt,
  subject: item.subject ?? '',
  body: item.body,
  conversationId: item.id,
  messageId: item.id,
  boxType: 0,
  senderEmail: item.authorName,
  ccEmails: null,
  toEmails: '—',
  source: '',
});

/* -------------------------------------------------------------------------- */
/* Email thread rows (shared conversations endpoint)                           */
/* -------------------------------------------------------------------------- */

/** Strips an email body down to a one-line preview — drops style blocks, tags and entities. */
const toSnippet = (html?: string | null): string =>
  (html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatThreadTime = (iso?: string): string => {
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

/** Normalises the shared conversation rows onto the thread-list view model. */
export const toDefectNoticeThreadMessages = (
  conversations: DefectNoticeConversationDto[]
): DefectNoticeThreadMessage[] => {
  if (!Array.isArray(conversations)) return [];
  return conversations
    .map((msg, index) => {
      const sender = msg.senderEmail || 'Unknown sender';
      const conversationId = msg.conversationId || undefined;
      return {
        id: conversationId ?? `thread-${index}`,
        conversationId,
        authorName: sender,
        subject: msg.subject || undefined,
        body: toSnippet(msg.body),
        sentAt: formatThreadTime(msg.timestampUtc),
      } as unknown as DefectNoticeThreadMessage;
    })
    .filter((message) => message.body !== '');
};
