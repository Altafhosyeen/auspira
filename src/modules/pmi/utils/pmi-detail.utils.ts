import {
  buildLifecycleStepsFromStages,
  toLifecycleStageStates,
} from '@/components/shared/detail-lifecycle-rail';
import type { EmailThreadListItem } from '@/components/shared/EmailThreadList';
import { type EntityLifecycleEntry, PmiLifecycleStage } from '@/constants/enum.constant';
import { parseBackendDate } from '@/lib/utils';
import { PMI_DETAIL_COPY, PMI_TYPE_LABELS } from '../constants/pmi.constants';
import type { PmiConversationDto, ProjectManagerInstructionResponseDto } from '../types/pmi.types';

/* -------------------------------------------------------------------------- */
/* View models                                                                 */
/* -------------------------------------------------------------------------- */

export interface PmiSummaryRow {
  label: string;
  /** `details` renders relaxed; `value` renders bold. Default `value`. */
  variant?: 'details' | 'value';
  value?: string;
}

export interface PmiLifecycleStep {
  key: string;
  label: string;
  date: string;
  complete: boolean;
}

export type { LifecycleStageState as PmiLifecycleStageState } from '@/components/shared/detail-lifecycle-rail';

export interface PmiThreadMessage {
  id: string;
  conversationId?: string;
  subject?: string;
  sender: string;
  initials: string;
  time: string;
  body: string;
  timestampUtc?: string;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

const formatDate = (value?: string | null): string => {
  const date = parseBackendDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value?: string | null): string => {
  const date = parseBackendDate(value);
  if (!date) return '';
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

/* -------------------------------------------------------------------------- */
/* PMI Summary rows                                                            */
/* -------------------------------------------------------------------------- */

// The design's "Quotation Required" flag: the DTO carries no explicit boolean, so it is
// derived from whether a quotation has been raised against the instruction.
const quotationRequired = (record: ProjectManagerInstructionResponseDto): string =>
  record.quotationId || record.quotationSubmittedOn ? 'YES' : 'NO';

// The row only ever means to say "yes, a quotation is available" — so it is shown solely
// when one has actually been raised against the instruction, never to announce "NO".
const proposesQuotation = (record: ProjectManagerInstructionResponseDto): boolean =>
  quotationRequired(record) === 'YES';

const referenceClause = (record: ProjectManagerInstructionResponseDto): string => {
  if (record.clauseNumber && record.clauseTitle) {
    return `Clause ${record.clauseNumber} - ${record.clauseTitle}`;
  }
  if (record.clauseNumber) return `Clause ${record.clauseNumber}`;
  if (record.otherClauseReference) return record.otherClauseReference;
  return '—';
};

export const toSummaryRows = (record: ProjectManagerInstructionResponseDto): PmiSummaryRow[] => {
  const rows: PmiSummaryRow[] = [
    { label: PMI_DETAIL_COPY.summary.reference, value: record.reference },
    {
      label: PMI_DETAIL_COPY.summary.dateRaised,
      value: formatDate(record.dateIssued) || record.dateIssued,
    },
  ];

  if (proposesQuotation(record)) {
    rows.push({
      label: PMI_DETAIL_COPY.summary.quotationRequired,
      value: quotationRequired(record),
    });
  }

  rows.push(
    {
      label: PMI_DETAIL_COPY.summary.type,
      value: PMI_TYPE_LABELS[Number(record.type ?? 0)] ?? 'Other',
    },
    { label: PMI_DETAIL_COPY.summary.referenceClause, value: referenceClause(record) },
    { label: PMI_DETAIL_COPY.summary.instructionTitle, value: record.title },
    {
      label: PMI_DETAIL_COPY.summary.instructionDetails,
      value: record.details,
      variant: 'details',
    }
  );
  return rows;
};

/* -------------------------------------------------------------------------- */
/* Lifecycle rail                                                              */
/* -------------------------------------------------------------------------- */

// The PMI's four lifecycle stages, labelled as the design spells them. Stage state comes
// straight from the record's `lifecycle[]` entries via the shared mapper.
const PMI_STAGE_LABELS: Record<number, string> = {
  [PmiLifecycleStage.Raised]: PMI_DETAIL_COPY.lifecycle.raised,
  [PmiLifecycleStage.QuotationSubmitted]: PMI_DETAIL_COPY.lifecycle.quotationSubmitted,
  [PmiLifecycleStage.RevisionRequested]: PMI_DETAIL_COPY.lifecycle.revisionRequested,
  [PmiLifecycleStage.Implemented]: PMI_DETAIL_COPY.lifecycle.implemented,
};

export const toLifecycleSteps = (
  lifecycle: EntityLifecycleEntry[] | null | undefined
): PmiLifecycleStep[] => {
  const stages = [
    PmiLifecycleStage.Raised,
    PmiLifecycleStage.QuotationSubmitted,
    PmiLifecycleStage.RevisionRequested,
    PmiLifecycleStage.Implemented,
  ];
  const states = toLifecycleStageStates(lifecycle, stages);
  return buildLifecycleStepsFromStages(states, PMI_STAGE_LABELS, formatDate);
};

/* -------------------------------------------------------------------------- */
/* Email thread rows                                                           */
/* -------------------------------------------------------------------------- */

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

/** Normalises the shared conversation rows onto the thread-list view model. */
export const toThreadMessages = (conversations: PmiConversationDto[]): PmiThreadMessage[] => {
  if (!Array.isArray(conversations)) return [];
  return conversations
    .map((msg, index) => {
      const sender = msg.senderEmail || 'Unknown sender';
      const conversationId = msg.conversationId || undefined;
      const subject = msg.subject || undefined;
      const rawTimestamp = msg.timestampUtc;
      return {
        id: conversationId ?? `thread-${index}`,
        conversationId,
        subject,
        sender,
        initials: initialsOf(sender),
        time: formatTime(rawTimestamp),
        body: toSnippet(msg.body),
        timestampUtc: rawTimestamp,
      };
    })
    .filter((message) => message.body !== '');
};

/** Maps the PMI thread view model onto the shared email list row shape. */
export const toEmailThreadListItems = (messages: PmiThreadMessage[]): EmailThreadListItem[] =>
  messages.map((m) => ({
    id: m.id,
    senderEmail: m.sender,
    subject: m.subject ?? '',
    body: m.body,
    timestampUtc: m.timestampUtc || m.time,
  }));

/* -------------------------------------------------------------------------- */
/* Detail header badge                                                         */
/* -------------------------------------------------------------------------- */

/** Whole days from now until a date — negative once it has passed, null when undated. */
export const daysUntil = (value?: string | null): number | null => {
  const due = parseBackendDate(value);
  if (!due) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDue = new Date(due);
  startOfDue.setHours(0, 0, 0, 0);
  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
};

/** Humanised response deadline, e.g. "Due 24 Aug 2026 · 3 days left". */
export const toResponseDeadline = (value?: string | null): string | undefined => {
  const due = formatDate(value);
  if (!due) return undefined;
  const days = daysUntil(value);
  if (days === null) return `Due ${due}`;
  if (days < 0)
    return `Due ${due} · ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return `Due ${due} · due today`;
  return `Due ${due} · ${days} day${days === 1 ? '' : 's'} left`;
};

export { formatDate, formatDateTime };
