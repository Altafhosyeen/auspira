import { parseBackendDate } from '@/lib/utils';

// ─── TYPES ───────────────────────────────────────────────────────────────────

/** Supported mailbox integrations. Add new providers here. */
export type MailboxProvider = 'outlook' | 'gmail' | 'auspira' | 'imap';

/** Classification assigned by the Contract Control Agent. */
export type MessageClass = 'EW' | 'CE' | 'PMI' | 'Other';

export type MessageUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

export interface QueueMessage {
  id: string;
  /** Internal message reference, e.g. "msg-3147". Optional — not present on every source. */
  msgRef?: string;
  sender: string;
  /** Recipient address(es). */
  recipient?: string;
  /** Sender role / direction label, e.g. "PM", "Supervisor", "in", "out". */
  meta?: string;
  time: string;
  subject: string;
  snippet: string;
  /** Raw source-provided type label, e.g. "warning". */
  type?: string;
  classification?: MessageClass;
  /** Agent confidence 0–100. Optional — not provided by every source. */
  confidence?: number;
  urgency?: MessageUrgency;
}

export interface MailboxSource {
  id: string;
  provider: MailboxProvider;
  name: string;
  /** Short uppercase descriptor under the name, e.g. "INBOUND · SENT ITEMS". */
  descriptor: string;
  /** e.g. "3 new · last 30 min". */
  status: string;
  messages: QueueMessage[];
}

// ─── PROVIDER + CLASSIFICATION STYLE MAPS ─────────────────────────────────────

export const CLASS_STYLE: Record<MessageClass, React.CSSProperties> = {
  EW: { backgroundColor: '#ede9fe', color: '#6d28d9', borderColor: 'transparent' },
  CE: { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: 'transparent' },
  PMI: { backgroundColor: '#ffedd5', color: '#c2410c', borderColor: 'transparent' },
  Other: { backgroundColor: '#f1f5f9', color: '#64748b', borderColor: 'transparent' },
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

export const MAILBOX_SOURCES: MailboxSource[] = [
  {
    id: 'outlook',
    provider: 'outlook',
    name: 'Outlook ingest',
    descriptor: 'INBOUND · SENT ITEMS',
    status: '3 new · last 30 min',
    messages: [
      {
        id: 'm1',
        msgRef: 'msg-3147',
        sender: 'K. Patel',
        meta: 'PM',
        time: '11:42',
        subject: 'Crane availability for Week 32',
        snippet:
          'Following our site walk yesterday — we have a concern about the tower-crane swing radius affecting the Pier 4 deck pour...',
        classification: 'EW',
        confidence: 94,
        urgency: 'HIGH',
      },
      {
        id: 'm2',
        msgRef: 'msg-3148',
        sender: 'M. Reeves',
        meta: 'Supervisor',
        time: '10:11',
        subject: 'RE: Programme revision for Week 30',
        snippet: 'Could you confirm the access date for the eastern abutment area is still 14 Jul?',
        classification: 'Other',
        confidence: 71,
      },
      {
        id: 'm3',
        msgRef: 'msg-3149',
        sender: 'S. Chen',
        meta: 'Procurement',
        time: '09:23',
        subject: 'PMI-031 issued — change of cladding spec',
        snippet:
          'Please find attached the formal instruction to change the cladding to brushed-zinc cassette panels...',
        classification: 'PMI',
        confidence: 97,
      },
    ],
  },
  {
    id: 'auspira',
    provider: 'auspira',
    name: 'Auspira mailbox',
    descriptor: 'MESSAGES IN · OUT',
    status: '2 new · last 30 min',
    messages: [
      {
        id: 'a1',
        msgRef: 'msg-A842',
        sender: 'Auspira mailbox',
        meta: 'in',
        time: '12:04',
        subject: 'Permit-to-load delay — Pier 4',
        snippet:
          'From subcontractor: we will not be able to load Pier 4 reinforcement on the 18th due to traffic-management approval...',
        classification: 'EW',
        confidence: 88,
        urgency: 'HIGH',
      },
      {
        id: 'a2',
        msgRef: 'msg-A843',
        sender: 'Auspira mailbox',
        meta: 'out',
        time: '08:55',
        subject: 'EWN-022 issued (this morning)',
        snippet:
          'We notified the PM of a potential weather-related risk to the deck-pour window between 16–19 Jul...',
        classification: 'EW',
        confidence: 99,
      },
    ],
  },
];

// ─── API SHAPE + MAPPER ───────────────────────────────────────────────────────

/** A single email as returned by GET /api/project-emails. */
export interface ProjectEmail {
  id: string;
  provider: number;
  type: string;
  userEmail: string;
  userId: string;
  timestampUtc: string;
  subject: string;
  body: string;
  conversationId: string;
  messageId: string;
  boxType: number;
  senderEmail: string;
  ccEmails: string | null;
  toEmails: string | null;
  source: string;
  attachmentUrls?: { url: string; name: string; contentType?: string }[];
}

/** A source group as returned by GET /api/project-emails. */
export interface ProjectEmailSource {
  source: string;
  emails: ProjectEmail[];
}

/**
 * Backend mail-direction convention: `boxType` 1 = received, anything else = sent.
 * The backend is inconsistent about value types on enum-like fields, so normalize
 * (a numeric string "1" must still read as received) instead of a strict compare.
 *
 * `source` overrides `boxType` when it says "Auspira": those emails are generated and sent by
 * the platform itself (RRM invites, CE notifications, …), yet the backend still stamps them
 * `boxType` 1 — so an Auspira-sourced email always reads as sent/outbound. Compared
 * case-insensitively since the backend is loose about casing on enum-like strings.
 */
export const isInboundEmail = (
  boxType: number | string | null | undefined,
  source?: string | null
): boolean => {
  if (source?.trim().toLowerCase() === 'auspira') return false;
  return Number(boxType) === 1;
};

const SOURCE_TO_PROVIDER: Record<string, MailboxProvider> = {
  auspira: 'auspira',
  outlook: 'outlook',
  gmail: 'gmail',
  imap: 'imap',
};

const TYPE_TO_CLASS: Record<string, MessageClass> = {
  warning: 'EW',
  'early-warning': 'EW',
  ew: 'EW',
  ce: 'CE',
  'compensation-event': 'CE',
  pmi: 'PMI',
  instruction: 'PMI',
};

/** Strip HTML tags + collapse whitespace into a short plain-text snippet. */
const toSnippet = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatTime = (iso: string): string => {
  const d = parseBackendDate(iso);
  return !d
    ? ''
    : d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
};

/** Map the project-emails API response into the MailboxSource[] shape the cards render. */
export const mapProjectEmailsToSources = (data?: ProjectEmailSource[]): MailboxSource[] => {
  if (!Array.isArray(data)) return [];

  return data
    .filter((group) => Array.isArray(group.emails) && group.emails.length > 0)
    .map((group) => {
      const key = group.source?.toLowerCase() ?? '';
      const provider: MailboxProvider = SOURCE_TO_PROVIDER[key] ?? 'imap';

      return {
        id: group.source || provider,
        provider,
        name: `${group.source} mailbox`,
        descriptor: 'MESSAGES IN · OUT',
        status: `${group.emails.length} message${group.emails.length === 1 ? '' : 's'}`,
        messages: group.emails.map((email) => ({
          id: email.id,
          sender: email.senderEmail || email.userEmail || 'Unknown',
          recipient: email.toEmails ?? undefined,
          meta: isInboundEmail(email.boxType, email.source) ? 'in' : 'out',
          time: formatTime(email.timestampUtc),
          subject: email.subject || '(no subject)',
          snippet: toSnippet(email.body || ''),
          type: email.type || undefined,
          classification: email.type ? TYPE_TO_CLASS[email.type.toLowerCase()] : undefined,
        })),
      };
    });
};

export interface QueueStat {
  label: string;
  value: string;
  hint: string;
}

export const QUEUE_STATS: QueueStat[] = [
  {
    label: 'SAMPLE TODAY',
    value: '23 messages',
    hint: '14 outlook · 9 Auspira · 5 routed as EW',
  },
  {
    label: 'AWARENESS DATES LOGGED',
    value: '5 today',
    hint: 'Each starts a Cl. 61.3 8-week clock',
  },
  {
    label: 'PROJECT CONTEXT',
    value: 'SUB-2026-014',
    hint: 'NEC4 ECS · Option C target cost',
  },
];
