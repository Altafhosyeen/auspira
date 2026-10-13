import { parseBackendDate } from '@/lib/utils';
import { PERSONA_COLORS } from './constants';
import type { ThreadAttachment } from './types';

/** Strip HTML tags + collapse whitespace into a one-line collapsed-message preview. */
export const toSnippet = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Outlook-style timestamp, e.g. "Wed 16/07/2026 14:32". */
export const formatSentAt = (iso: string): string => {
  const d = parseBackendDate(iso);
  return !d
    ? ''
    : d.toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

/** Sender initials for the avatar chip, e.g. "sarah.collins@x.com" → "SC". */
export const initialsOf = (email: string): string => {
  const local = (email.split('@')[0] ?? '').replace(/[^a-zA-Z.\-_ ]/g, '');
  const parts = local.split(/[.\-_ ]+/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0][0], parts[1][0]] : [local[0] ?? '?', local[1] ?? ''];
  return chars.join('').toUpperCase();
};

export const personaColor = (email: string): string => {
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PERSONA_COLORS[Math.abs(hash) % PERSONA_COLORS.length];
};

/**
 * The API returns attachments under `attachmentUrls`, but casing has been inconsistent elsewhere
 * in this app's responses — reads tolerantly across the known variants so the badge/list simply
 * don't render for messages carrying no (or unrecognised) attachment data, rather than throwing.
 */
export const getAttachments = (email: unknown): ThreadAttachment[] => {
  const raw =
    (email as any)?.attachmentUrls ??
    (email as any)?.AttachmentUrls ??
    (email as any)?.attachments ??
    (email as any)?.Attachments;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a: any) => ({
      url: String(a?.url ?? a?.Url ?? ''),
      name: String(a?.name ?? a?.Name ?? a?.fileName ?? a?.FileName ?? 'Attachment'),
      contentType: a?.contentType ?? a?.ContentType,
    }))
    .filter((a: ThreadAttachment) => a.url);
};
