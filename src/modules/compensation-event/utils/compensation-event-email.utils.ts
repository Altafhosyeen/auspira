import dayjs from 'dayjs';
import { getPrimaryAlertEmail, type ProjectAlert } from '@/hooks/modules/project-alerts';
import {
  CONTRACTOR_QUOTATION_COPY,
  QUOTATION_SUBMITTED_DATE_FORMAT,
} from '../constants/compensation-event-quotation.constants';
import type { ComposeEmailDefaults } from '../types/compensation-event-email.types';
import type { ContractorQuotation } from '../types/compensation-event-quotation.types';
import { getPersonInitials } from './compensation-event.utils';
import { formatQuotationAmount, getQuotationSummary } from './compensation-event-quotation.utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailAddress = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

// "jhon.doe@contractor.com" → "JD". Falls back to the raw text for a plain name chip.
export const getRecipientInitials = (recipient: string): string => {
  const localPart = recipient.split('@')[0] ?? '';
  const spaced = localPart.replace(/[._-]+/g, ' ');
  return getPersonInitials(spaced) || recipient.slice(0, 2).toUpperCase();
};

export const splitRecipients = (recipients: string[]): { valid: string[]; invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const recipient of recipients) {
    const trimmed = recipient.trim();
    if (!trimmed) continue;
    (isEmailAddress(trimmed) ? valid : invalid).push(trimmed);
  }

  return { valid, invalid };
};

// The editor stores HTML; the plain-text form is what a required-body check needs.
export const toPlainText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

// "Alex Reid <alex@contractor.com>" -> "alex@contractor.com"; a bare address is left alone.
export const extractEmailAddress = (value: string): string => {
  const angled = value.match(/<([^>]+)>/);
  return (angled?.[1] ?? value).trim();
};

// "a@x.com, Bob <b@x.com>; c@x.com" -> the addresses, deduped case-insensitively. Only
// real addresses survive: the compose modal refuses to send while a chip is not one, so a
// name the extractor wrote into the header would block the send it was meant to seed.
export const parseRecipientList = (...values: (string | null | undefined)[]): string[] => {
  const seen = new Set<string>();

  return values
    .flatMap((value) => value?.split(/[,;]/) ?? [])
    .map((entry) => extractEmailAddress(entry))
    .filter((address) => {
      if (!isEmailAddress(address) || seen.has(address.toLowerCase())) return false;
      seen.add(address.toLowerCase());
      return true;
    });
};

// `{token}` -> its value; an unknown token is left as written rather than blanked, so a
// typo in the copy shows up on screen instead of silently dropping a sentence.
export const fillEmailTokens = (template: string, tokens: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key) => tokens[key] ?? match);

// Values are interpolated into the editor's HTML, so they are escaped on the way in.
const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toParagraphs = (lines: string[]): string =>
  lines.map((line) => `<p>${line}</p>`).join('<p><br /></p>');

const copy = CONTRACTOR_QUOTATION_COPY.revisionEmail;

// The revision request is a reply to the mail the quotation arrived on, so it is addressed
// back to whoever sent it, keeps that mail's Cc list, and quotes what was submitted. Every
// field is a starting point — the PM edits all of them before sending.
export const buildQuotationRevisionEmail = ({
  alert,
  quotation,
  reference,
}: {
  alert?: ProjectAlert;
  quotation?: ContractorQuotation;
  reference?: string;
}): ComposeEmailDefaults => {
  const email = alert ? getPrimaryAlertEmail(alert) : undefined;

  // The sender is the contractor who quoted; an alert with no sender on it falls back to
  // whoever the mail was addressed to.
  const to = parseRecipientList(email?.emailSender);
  const namedEvent = reference?.trim() || quotation?.reference?.trim();
  const submittedOn = dayjs(quotation?.submittedOn);
  // Null when the quotation priced nothing — the sentence quoting a figure is then left
  // out rather than asking the contractor to revise a total of zero.
  const total = quotation
    ? getQuotationSummary(quotation, quotation.riskAllowance).grandTotal
    : null;

  const subject = email?.emailSubject?.trim();
  const body = toParagraphs(
    [
      copy.greeting,
      fillEmailTokens(copy.intro, {
        reference: escapeHtml(namedEvent || copy.unnamedEvent),
      }),
      total !== null && submittedOn.isValid()
        ? fillEmailTokens(copy.quoted, {
            submittedOn: submittedOn.format(QUOTATION_SUBMITTED_DATE_FORMAT),
            total: escapeHtml(formatQuotationAmount(total, quotation?.currency)),
          })
        : '',
      [
        copy.request,
        quotation?.timeBar.deadlineLabel
          ? fillEmailTokens(copy.deadline, {
              deadline: escapeHtml(quotation.timeBar.deadlineLabel),
            })
          : '',
      ]
        .filter(Boolean)
        .join(' '),
      copy.closing,
      copy.signOff,
    ].filter(Boolean)
  );

  return {
    to: to.length ? to : parseRecipientList(email?.emailTo),
    cc: parseRecipientList(email?.emailCc),
    // A reply keeps the thread's subject; only a mail with no subject of its own is named
    // after what the request is for.
    subject: subject
      ? `${/^re:/i.test(subject) ? '' : copy.replyPrefix}${subject}`
      : [copy.subject, namedEvent].filter(Boolean).join(' - '),
    body,
  };
};
