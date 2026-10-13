import dayjs, { type Dayjs } from 'dayjs';
import {
  type AlertCompensationEventDetail,
  getPrimaryAlertEmail,
  type ProjectAlert,
  parseAlertCompensationEvent,
  parseImpactAssessment,
} from '@/hooks/modules/project-alerts';
import { toLocalDayjs } from '@/lib/utils';
import {
  ALERT_REPLY_PERIOD_DAYS,
  COMPENSATION_EVENT_NOTICE_COPY,
  COMPENSATION_EVENT_TYPE_LABELS,
  COMPENSATION_EVENT_TYPE_VALUES,
  type CompensationEventTypeValue,
  DESCRIPTION_MAX_LENGTH,
} from '../constants/compensation-event-notice.constants';
import type {
  CompensationEventNoticeFormValues,
  EarlyWarningNoticeSource,
} from '../types/compensation-event-notice.types';
import type { EventClauseOption } from '../types/event-clause.types';
import { formatCurrency } from './compensation-event-currency.utils';

const { signalDetails } = COMPENSATION_EVENT_NOTICE_COPY.documents;

// "a@x.com, b@x.com" / "a@x.com; b@x.com" -> tags for the CC/BCC selects.
const splitRecipients = (value?: string | null): string[] =>
  value
    ? value
        .split(/[,;]/)
        .map((recipient) => recipient.trim())
        .filter(Boolean)
    : [];

// The textareas cap input at DESCRIPTION_MAX_LENGTH; setFieldsValue bypasses that cap,
// so alert text is clamped here rather than submitting a body the form would have refused.
const clamp = (value?: string | null): string | undefined => {
  const text = value?.trim();
  if (!text) return undefined;
  return text.length > DESCRIPTION_MAX_LENGTH ? text.slice(0, DESCRIPTION_MAX_LENGTH) : text;
};

// The alert's impact assessment is three separate fields; the notice has one "proposed
// effect" box, so they are stacked into a single labelled block the PM can edit down.
const toProposedEffect = (alert: ProjectAlert): string | undefined => {
  const impact = parseImpactAssessment(alert.impactAssessment);
  if (!impact) return undefined;

  const parts = [
    impact.potentialImpacts && `Potential impacts: ${impact.potentialImpacts}`,
    impact.keyDatesAffected && `Key dates affected: ${impact.keyDatesAffected}`,
    impact.proposedActions && `Proposed actions: ${impact.proposedActions}`,
  ].filter(Boolean);

  return clamp(parts.join('\n\n'));
};

/** Clause numbers as written in the option list — e.g. "60.1(12)". */
const CLAUSE_NUMBER_RE = /\d{1,3}\.\d+\s*\(\s*\d+\s*\)/;

// A clause head with no sub-clause — "60", "61.3" — all the extractor quotes when the
// mail names the parent clause.
const CLAUSE_HEAD_RE = /\d{1,3}(?:\.\d+)*/;

// Options read "60.1(1) - PM changes Works Information"; the number is what identifies them.
const optionClauseNumber = (option: EventClauseOption): string =>
  option.value.split(' - ')[0].replace(/\s+/g, '');

// The alert carries a free-text clause sentence, the select carries catalogue entries —
// they only line up on the clause number, so that is what is matched on.
export const matchClauseOption = (
  clauseDescription?: string | null,
  options: EventClauseOption[] = []
): string | undefined => {
  const text = clauseDescription ?? '';

  const number = text.match(CLAUSE_NUMBER_RE)?.[0].replace(/\s+/g, '');
  if (number) {
    const match = options.find((option) =>
      `${option.label} ${option.value}`.replace(/\s+/g, '').includes(number)
    );
    if (match) return match.value;
  }

  // "60 - Compensation events" names the parent clause only, so it has to match a
  // catalogue number outright — `includes` would read it as a prefix of "60.1(1)".
  const head = text.match(CLAUSE_HEAD_RE)?.[0];
  if (!head) return undefined;

  return options.find((option) => optionClauseNumber(option) === head)?.value;
};

// The clause text the select is matched against — the CE payload names the clause outright,
// so it beats the alert's free-text sentence when the extractor filled it in.
export const getAlertClauseSource = (alert: ProjectAlert): string | undefined => {
  const event = parseAlertCompensationEvent(alert.compensationEvent);
  const fromEvent = [event?.clauseNumber, event?.clauseTitle].filter(Boolean).join(' - ');
  return fromEvent || event?.clauseDescription || alert.clauseDescription || undefined;
};

// The clause the extracted CE names ("60" + "Compensation events"), shaped like a catalogue
// entry. Only the payload's own two fields feed it — the free-text sentence is a sentence,
// not a clause label, so it would make a nonsense option.
export const toAlertClauseOption = (alert: ProjectAlert): EventClauseOption | undefined => {
  const event = parseAlertCompensationEvent(alert.compensationEvent);
  const label = [event?.clauseNumber, event?.clauseTitle].filter(Boolean).join(' - ');
  return label ? { label, value: label } : undefined;
};

// The signal's clause appended to the project's catalogue, so a clause the catalogue does
// not carry can still be shown and submitted. A catalogue entry for the same number wins —
// it is the project's own wording, and two options for one clause would only confuse.
export const withAlertClauseOption = (
  options: EventClauseOption[] = [],
  alertOption?: EventClauseOption
): EventClauseOption[] => {
  if (!alertOption) return options;

  const number = optionClauseNumber(alertOption);
  return options.some((option) => optionClauseNumber(option) === number)
    ? options
    : [...options, alertOption];
};

// The extractor writes the CE type as the raw enum integer; anything it left unset or
// outside the enum leaves the select empty rather than seeding a type nobody chose.
const toNoticeEventType = (type?: number): CompensationEventTypeValue | undefined =>
  COMPENSATION_EVENT_TYPE_VALUES.includes(type as CompensationEventTypeValue)
    ? (type as CompensationEventTypeValue)
    : undefined;

// Best-effort mapping of the originating signal onto the notice form. Only fields with a
// genuine source on the alert are set — reference number and role have nothing to map from
// and stay for the user to fill in. Communication details mirror the alert email:
// From = its sender, To = who it was sent to, CC = its CC list.
export const toNoticeInitialValues = (
  alert: ProjectAlert
): Partial<CompensationEventNoticeFormValues> => {
  const primaryEmail = getPrimaryAlertEmail(alert);
  const dateIssued = toLocalDayjs(alert.createdOn);
  // The extracted CE draft — present on alerts raised from a compensation event mail, and the
  // only source for the proposed effect when the alert carries no impact assessment.
  const event: AlertCompensationEventDetail | null = parseAlertCompensationEvent(
    alert.compensationEvent
  );

  return {
    to: splitRecipients(primaryEmail?.emailTo),
    // An alert built straight from the extractor has no email rows, so the CE's raiser stands in.
    from: primaryEmail?.emailSender?.trim() || event?.raisedBy || undefined,
    cc: splitRecipients(primaryEmail?.emailCc),
    dateIssued: dateIssued.isValid() ? dateIssued : undefined,
    compensationEventType: toNoticeEventType(event?.type),
    descriptionOfEvent: clamp(
      alert.description ?? event?.clauseDescription ?? primaryEmail?.emailBody
    ),
    proposedEffect: clamp(event?.proposedEffectDescription) ?? toProposedEffect(alert),
  };
};

// ─── EARLY WARNING → CE ──────────────────────────────────────────────────────

// Titles are headlines, not sentences ("Ground conditions - slippage 8 days"). `buildNoticeTitle`
// cuts the register subject at a sentence break, so the title is terminated here or the
// description that follows it would be read as part of the same sentence.
const asSentence = (text: string): string => (/[.!?]$/.test(text) ? text : `${text}.`);

// The EW's three risk fields stacked into the notice's single "proposed effect" box, labelled
// the same way the signal prefill stacks its impact assessment.
const toEarlyWarningProposedEffect = (
  earlyWarning: EarlyWarningNoticeSource
): string | undefined => {
  const parts = [
    earlyWarning.potentialImpacts?.trim() &&
      `Potential impacts: ${earlyWarning.potentialImpacts.trim()}`,
    earlyWarning.keyDatesAffected?.trim() &&
      `Key dates affected: ${earlyWarning.keyDatesAffected.trim()}`,
    earlyWarning.proposedActions?.trim() &&
      `Proposed actions: ${earlyWarning.proposedActions.trim()}`,
  ].filter(Boolean);

  return clamp(parts.join('\n\n'));
};

// The EW carried onto the notice form when a CE is raised off it. The two records stay separate —
// this only saves the PM retyping what the EW already says, and everything seeded here is editable.
// The EW's own reference and clause are not form fields: they ride the create payload as the link
// back to the EW.
export const toEarlyWarningNoticeInitialValues = (
  earlyWarning: EarlyWarningNoticeSource
): Partial<CompensationEventNoticeFormValues> => ({
  // The Early Warning was raised by the other party, so it becomes the notice recipient list
  // and stays out of the sender field unless the user changes it manually.
  to: earlyWarning.raisedBy?.trim() ? [earlyWarning.raisedBy.trim()] : undefined,
  // The notice is issued now — the EW's own date is when the risk was first flagged, which is
  // not the date the time bar runs from.
  dateIssued: dayjs(),
  descriptionOfEvent: clamp(
    [
      earlyWarning.title?.trim() && asSentence(earlyWarning.title.trim()),
      earlyWarning.description?.trim(),
    ]
      .filter(Boolean)
      .join('\n\n')
  ),
  proposedEffect: toEarlyWarningProposedEffect(earlyWarning),
});

// The signal's reply deadline for the Time Bar: the backend's `overdueDateTime` when it set
// one, otherwise a week from when the alert was raised — a null time bar must still count
// down rather than reading "No deadline".
export const getAlertDeadline = (alert?: ProjectAlert | null): Dayjs | null => {
  if (!alert) return null;

  const overdue = toLocalDayjs(alert.overdueDateTime);
  if (alert.overdueDateTime && overdue.isValid()) return overdue;

  const raisedOn = toLocalDayjs(alert.createdOn);
  return raisedOn.isValid() ? raisedOn.add(ALERT_REPLY_PERIOD_DAYS, 'day') : null;
};

// The CE payload's leftovers — type, money, time and the two decision flags. None of them
// has a field on the notice form, so they are printed as read-only lines in the side rail
// instead of being silently dropped. Empty list => the tile is not rendered at all.
export const getAlertEventDetailLines = (alert: ProjectAlert): string[] => {
  const event = parseAlertCompensationEvent(alert.compensationEvent);
  if (!event) return [];

  const lines: string[] = [];

  if (event.raisedBy) lines.push(`${signalDetails.raisedBy}: ${event.raisedBy}`);

  const typeLabel =
    event.type === undefined ? undefined : COMPENSATION_EVENT_TYPE_LABELS[event.type];
  if (typeLabel) lines.push(`${signalDetails.type}: ${typeLabel}`);

  if (event.estimatedValue !== undefined) {
    lines.push(
      `${signalDetails.estimatedValue}: ${formatCurrency(event.estimatedValue, event.currency)}`
    );
  }

  if (event.estimatedDays !== undefined) {
    const unit = event.estimatedDays === 1 ? signalDetails.day : signalDetails.days;
    lines.push(`${signalDetails.estimatedDays}: ${event.estimatedDays} ${unit}`);
  }

  if (event.requiresPMDecision) lines.push(signalDetails.pmDecision);
  if (event.isQuotationRequired) lines.push(signalDetails.quotation);

  return lines;
};
