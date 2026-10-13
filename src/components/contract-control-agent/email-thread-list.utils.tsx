import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { parseBackendDate } from '@/lib/utils';
import { isInboundEmail } from './action-queue.data';

/** Strips an email body down to a one-line preview: drops `<style>` blocks, tags and entities,
 *  then collapses whitespace. Used by every thread-list row across the app. */
export const toSnippet = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const formatSentAt = (iso: string): string => {
  const d = parseBackendDate(iso);
  return !d
    ? iso || ''
    : d.toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export const initialsOf = (email: string): string => {
  const local = (email.split('@')[0] ?? '').replace(/[^a-zA-Z.\-_ ]/g, '');
  const parts = local.split(/[.\-_ ]+/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0][0], parts[1][0]] : [local[0] ?? '?', local[1] ?? ''];
  return chars.join('').toUpperCase();
};

export type EmailDirection = 'in' | 'out';

const normalizeEmail = (value?: string | null): string => value?.trim().toLowerCase() ?? '';

/** Where a quoted reply starts — an "On … wrote:" / "Original Message" separator, or the
 *  blockquote wrappers Outlook and Gmail wrap the quoted trailer in. */
const QUOTED_REPLY_MARKERS = [
  /<blockquote/i,
  /gmail_quote/i,
  /-{2,}\s*original message\s*-{2,}/i,
  /\bon\b[^\n]{0,120}\bwrote:/i,
  /\bfrom:[^\n]{0,200}\bsent:/i,
];

/** A reply quotes the whole message it answers, so anything below the quote separator is
 *  the *other* party's text — scanning it for our own platform marker would read every
 *  contractor reply to an Auspira-generated notice as outbound. Only the part the sender
 *  actually wrote counts. */
const authoredBody = (body?: string | null): string => {
  if (!body) return '';
  const quoteStart = QUOTED_REPLY_MARKERS.reduce((earliest, marker) => {
    const index = body.search(marker);
    return index >= 0 && index < earliest ? index : earliest;
  }, body.length);
  return body.slice(0, quoteStart);
};

/** Platform-generated mail (CE notices, EW registrations, RRM invites) stamps a literal
 *  "[Source:Auspira]" marker into the body it sends. */
const hasPlatformMarker = (body?: string | null): boolean =>
  /\[\s*source\s*:\s*auspira\s*\]/i.test(authoredBody(body));

/** Direction, resolved from the most trustworthy signal available:
 *
 *  1. Sender vs. the mailbox the message was read from (`accountEmail`) — mail sent from the
 *     connected account is outbound, mail from anyone else is inbound. This is the only signal
 *     that stays correct whichever provider the mailbox is connected through.
 *  2. The "[Source:Auspira]" marker the platform stamps into mail it generates.
 *  3. The backend's `boxType` flag (1 = received) via `isInboundEmail`.
 *  4. Nothing known — default to inbound rather than showing no direction at all.
 *
 *  `source` is deliberately NOT a top-level override: it names the mailbox integration
 *  ("outlook" | "gmail" | "auspira" | "imap"), so a project whose mailbox is connected
 *  *through* Auspira stamps "auspira" on received mail too, which read every row as
 *  outbound. It still breaks the tie inside `isInboundEmail` when nothing better is known. */
export const emailDirection = (msg: {
  boxType?: number | string | null;
  source?: string | null;
  body?: string | null;
  senderEmail?: string | null;
  accountEmail?: string | null;
}): EmailDirection => {
  const sender = normalizeEmail(msg.senderEmail);
  const account = normalizeEmail(msg.accountEmail);
  if (sender && account) return sender === account ? 'out' : 'in';
  if (hasPlatformMarker(msg.body)) return 'out';
  if (msg.boxType === null || msg.boxType === undefined) return 'in';
  return isInboundEmail(msg.boxType, msg.source) ? 'in' : 'out';
};

const PERSONA_COLORS = ['#0078d4', '#038387', '#8764b8', '#ca5010', '#498205', '#c239b3'] as const;

export const personaColor = (email: string): string => {
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PERSONA_COLORS[Math.abs(hash) % PERSONA_COLORS.length];
};

// Fixed hex, not the shared badge-success/badge-info design tokens: those tokens are also
// used for unrelated statuses across Early Warning, Compensation Event, etc., so retuning
// them there must not shift what Inbound/Outbound looks like.
export const EMAIL_DIRECTION_COLORS = {
  in: { background: '#D1FAE5', text: '#059669' },
  out: { background: '#DBEAFE', text: '#1E40AF' },
} as const;

/** `size="md"` (default) matches the full-width thread list (`EarlyWarningThreadsPanel`);
 *  `size="sm"` is for tighter spaces like a sidebar card. */
export const DirectionIcon = ({
  direction,
  size = 'md',
}: {
  direction: EmailDirection;
  size?: 'sm' | 'md';
}) => {
  const inbound = direction === 'in';
  const boxClass = size === 'md' ? 'mt-0.5 h-6 w-6' : 'h-5 w-5';
  const glyphClass = size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';
  const colors = EMAIL_DIRECTION_COLORS[direction];
  return (
    <span
      title={inbound ? 'Inbound email' : 'Outbound email'}
      className={`flex shrink-0 items-center justify-center rounded-full ${boxClass}`}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      {inbound ? <ArrowDownLeft className={glyphClass} /> : <ArrowUpRight className={glyphClass} />}
    </span>
  );
};
