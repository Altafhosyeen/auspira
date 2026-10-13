import {
  COMPENSATION_EVENT_ACTIVITY_PHRASES,
  COMPENSATION_EVENT_LEGACY_STATE_MAP,
  COMPENSATION_EVENT_REGISTER_STATES,
} from '../constants/compensation-event.constants';
import {
  COMPENSATION_EVENT_AUDIT_ACTIONS,
  COMPENSATION_EVENT_AUDIT_LABELS,
} from '../constants/compensation-event-audit.constants';
import type {
  CompensationEvent,
  CompensationEventActivity,
  CompensationEventAuditAction,
  CompensationEventAuditEntry,
  CompensationEventRegisterState,
  CompensationEventReplyCountdown,
  CompensationEventStatus,
} from '../types/compensation-event.types';
import { formatCurrency } from './compensation-event-currency.utils';
import { isNamed } from './compensation-event-preparer.utils';

const MS_PER_DAY = 86_400_000;

// Reply due dates are calendar dates (YYYY-MM-DD, parsed as UTC) — compare whole
// UTC days so the countdown does not shift with the viewer's timezone.
const utcDayIndex = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY;

export const formatCompensationAmount = (amount: number, currency?: string | null): string =>
  Number.isFinite(amount) ? formatCurrency(amount, currency) : DASH;

// Register cells show whole units only — "£48,400", not "£48,400.00".
export const formatQuoteValue = (amount: number, currency?: string | null): string =>
  Number.isFinite(amount) ? formatCurrency(amount, currency, { maximumFractionDigits: 0 }) : DASH;

export const sumCompensationAmounts = (events: Array<{ amount: number }>): number =>
  events.reduce((total, event) => total + event.amount, 0);

export interface CompensationEventRegisterSummary {
  totalQuotationValue: number;
  quotationCount: number;
  totalDurationImpactDays: number;
  eventCount: number;
  currency: string;
}

// Totals behind the register's summary strip. Each event's quoted value falls back to
// its notified `amount` until a quotation lands, matching what the QUOTE VALUE column
// shows; only events actually carrying a value/day figure count toward "N quotations".
export const summarizeCompensationEvents = (
  events: CompensationEvent[]
): CompensationEventRegisterSummary => {
  let totalQuotationValue = 0;
  let quotationCount = 0;
  let totalDurationImpactDays = 0;

  for (const event of events) {
    const quoteValue = event.quotedValue ?? event.amount;
    if (quoteValue !== undefined && quoteValue !== null) {
      totalQuotationValue += quoteValue;
      quotationCount += 1;
    }

    const days = event.quotedDays ?? event.timeImpactDays;
    if (days !== undefined && days !== null) {
      totalDurationImpactDays += days;
    }
  }

  return {
    totalQuotationValue,
    quotationCount,
    totalDurationImpactDays,
    eventCount: events.length,
    currency: events[0]?.currency ?? 'GBP',
  };
};

// Calendar-only values (a reply due date, a date raised) carry no meaningful time of
// day, so they are read in UTC — shifting them into the viewer's zone would slide the
// date itself across midnight.
const DETAIL_DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

// Instants (when an audit entry was logged, when a file landed) are real moments, so
// they are rendered in the viewer's own timezone.
const LOCAL_DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export const DASH = '—';

// A value only reads as an answer when it names something. The extractor leaves a field
// as its own empty scaffolding ("[]", "{}", "-") when the mail never filled it in, and
// that is no more an answer than a missing field is — both print the dash.
export const orDash = (value?: string | null): string => {
  const trimmed = value?.trim();
  return isNamed(trimmed) ? trimmed : DASH;
};

// Calendar dates are rendered as the design states them: "07 Jul 2024".
export const formatDetailDate = (isoDate?: string | null): string => {
  if (!isoDate) return DASH;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return DASH;

  return DETAIL_DATE_FORMAT.format(date);
};

// Renders the instant in the viewer's local timezone. Backend stamps are UTC (they
// carry a `Z`), so a stamp logged at 22:30 UTC reads 03:30 the next morning for a
// viewer in UTC+5 — the wall-clock time they actually experienced the event at.
export const formatLocalDate = (isoDate?: string | null): string => {
  if (!isoDate) return DASH;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return DASH;

  return LOCAL_DATE_FORMAT.format(date);
};

// Clock stamps read "09:15 AM" — built by hand so the meridiem casing does not
// drift with the runtime's ICU data.
export const formatClockTime = (isoDate?: string | null): string => {
  if (!isoDate) return DASH;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return DASH;

  const hours = date.getHours();
  const hour12 = String(hours % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hour12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
};

// Date and time must come off the same zone, or a stamp that crosses midnight locally
// would print the UTC date beside the local time.
export const formatThreadTimestamp = (isoDate?: string | null): string => {
  const time = formatClockTime(isoDate);
  return time === DASH ? DASH : `${formatLocalDate(isoDate)}, ${time}`;
};

// Thread messages come through as raw email HTML — strip markup/entities down to
// plain text so the row reads like a message, not a dump of the source markup.
export const stripEmailHtml = (html?: string | null): string =>
  (html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null || bytes < 0) return DASH;

  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  // Whole units above 100 lose the decimal the design only shows on small values.
  const rounded = unit === 0 || value >= 100 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded} ${FILE_SIZE_UNITS[unit]}`;
};

// The audit search matches on everything the row actually shows.
export const filterAuditEntries = (
  entries: CompensationEventAuditEntry[],
  term?: string,
  actions?: CompensationEventAuditAction[]
): CompensationEventAuditEntry[] => {
  const needle = term?.trim().toLowerCase();

  return entries.filter((entry) => {
    if (actions?.length && !actions.includes(entry.action)) return false;
    if (!needle) return true;

    return [
      entry.actorName,
      entry.actorRole ?? '',
      COMPENSATION_EVENT_AUDIT_LABELS[entry.action],
      entry.details,
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
};

// The Filters dropdown only offers the actions the table actually holds — listing the
// whole enum would show options that can never match a row. Order follows the enum.
export const getAuditActionOptions = (
  entries: CompensationEventAuditEntry[]
): CompensationEventAuditAction[] => {
  const present = new Set(entries.map((entry) => entry.action));
  return COMPENSATION_EVENT_AUDIT_ACTIONS.filter((action) => present.has(action));
};

export const sortAuditEntries = (
  entries: CompensationEventAuditEntry[]
): CompensationEventAuditEntry[] =>
  [...entries].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

// "Sarah Price (Contractor)" → "SP"; the role suffix never reaches the avatar.
export const getPersonInitials = (name?: string | null): string =>
  (name ?? '')
    .replace(/\(.*?\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

export const formatOptionalQuoteValue = (amount: number | null | undefined, currency: string) =>
  amount === undefined || amount === null ? DASH : formatQuoteValue(amount, currency);

export const formatTimeImpactDays = (days?: number | null): string => {
  if (days === undefined || days === null) return DASH;
  const suffix = Math.abs(days) === 1 ? 'Day' : 'Days';
  return `${days > 0 ? '+' : ''}${days} ${suffix}`;
};

export const formatVariancePercent = (percent: number): string =>
  `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;

export interface CompensationEventFinancials {
  originalQuote: number | null;
  approvedCost: number | null;
  costDifference: number | null;
  costDifferencePercent: number | null;
  /** When the quotation was submitted — dates the Original Quote figure. */
  submittedOn: string | null;
  /** The final quotation amount including fee and allowance. */
  quotationAmount: number | null;
  // Only the financial-summary endpoint carries these — built off the CE record alone
  // they stay null and the tiles render a dash.
  fees: number | null;
  riskAllowance: number | null;
  originalTimeImpactDays: number | null;
  approvedTimeImpactDays: number | null;
  /** The assessed days minus the quoted days — the API's `differenceInDays` magnitude. */
  differenceInDays: number | null;
  isFinal: boolean;
  /** Whether the assessed cost is above the quoted cost — drives the variance card's arrow/tint. */
  isIncreased: boolean | null;
  /** Drives the Time Impact tile's arrow/tint; null wherever the API has not said which way the days moved. */
  isDaysIncreased: boolean | null;
}

export const hasCompensationEventFinancialData = (
  financials: CompensationEventFinancials
): boolean =>
  financials.originalQuote !== null ||
  financials.approvedCost !== null ||
  financials.costDifference !== null ||
  financials.costDifferencePercent !== null ||
  financials.originalTimeImpactDays !== null ||
  financials.approvedTimeImpactDays !== null;

// Until a CE is implemented the PM assessment is the working approved figure —
// the final approved amount only exists once the assessment is locked.
export const buildCompensationEventFinancials = (
  event: CompensationEvent
): CompensationEventFinancials => {
  const originalQuote = event.originalQuoteAmount ?? null;
  const approvedCost = event.finalApprovedAmount ?? event.pmAssessmentAmount ?? null;
  const costDifference =
    originalQuote === null || approvedCost === null ? null : approvedCost - originalQuote;

  return {
    originalQuote,
    approvedCost,
    costDifference,
    costDifferencePercent:
      costDifference === null || !originalQuote ? null : (costDifference / originalQuote) * 100,
    fees: null,
    riskAllowance: null,
    submittedOn: event.quoteReceivedDate ?? null,
    quotationAmount: null,
    originalTimeImpactDays: event.timeImpactDays ?? null,
    approvedTimeImpactDays: event.approvedTimeImpactDays ?? event.timeImpactDays ?? null,
    differenceInDays: null,
    isFinal: event.finalApprovedAmount !== undefined && event.finalApprovedAmount !== null,
    isIncreased: costDifference === null ? null : costDifference > 0,
    // Only the financial endpoint reports the day direction, so the CE record alone
    // leaves the tile neutral.
    isDaysIncreased: null,
  };
};

// The register spells the unit out, singular on ±1 — the em-dash placeholder the
// detail panels use would break the table's hyphen convention, so keep the hyphen here.
export const formatTimeImpact = (days?: number | null): string => {
  if (days === undefined || days === null) return '-';
  const suffix = Math.abs(days) === 1 ? 'Day' : 'Days';
  return `${days > 0 ? '+' : ''}${days} ${suffix}`;
};

export const resolveRegisterState = (
  status: CompensationEventStatus
): CompensationEventRegisterState =>
  COMPENSATION_EVENT_REGISTER_STATES.includes(status as CompensationEventRegisterState)
    ? (status as CompensationEventRegisterState)
    : COMPENSATION_EVENT_LEGACY_STATE_MAP[
        status as keyof typeof COMPENSATION_EVENT_LEGACY_STATE_MAP
      ];

// Clause 62.3 reply window — red once it lands, amber inside a week, green beyond.
export const getReplyCountdown = (
  replyDueDate?: string | null,
  now: Date = new Date()
): CompensationEventReplyCountdown | null => {
  if (!replyDueDate) return null;

  const dueDate = new Date(replyDueDate);
  if (Number.isNaN(dueDate.getTime())) return null;

  const daysLeft = utcDayIndex(dueDate) - utcDayIndex(now);
  if (daysLeft < 0) return { label: 'Overdue', tone: 'danger' };
  if (daysLeft === 0) return { label: 'Today', tone: 'danger' };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, tone: 'warning' };
  return { label: `${daysLeft}d left`, tone: 'success' };
};

export const formatRelativeTime = (isoDate: string, now: Date = new Date()): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const elapsedMinutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (elapsedMinutes < 1) return 'just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return `${Math.floor(elapsedHours / 24)}d ago`;
};

// The feed reads "<actor> <phrase> <reference>" off the audit trail. Events served
// without one still contribute a row, attributed to nobody.
const toActivity = (event: CompensationEvent): CompensationEventActivity[] =>
  event.auditTrail?.length
    ? event.auditTrail.map((entry) => ({
        id: entry.id,
        reference: event.reference,
        actorName: entry.actorName,
        summary: `${entry.actorName} ${COMPENSATION_EVENT_ACTIVITY_PHRASES[entry.action]} ${event.reference}`,
        occurredAt: entry.occurredAt,
      }))
    : [
        {
          id: event.id,
          reference: event.reference,
          summary: `${event.reference} — ${event.title}`,
          occurredAt: event.updatedAt,
        },
      ];

export const buildRecentActivity = (
  events: CompensationEvent[],
  limit = 4
): CompensationEventActivity[] =>
  events
    .flatMap(toActivity)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
