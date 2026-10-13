import { getAttachments } from '@/components/contract/cross-reference-contract/EmailThreadModal/utils';
import type { AuditLogEntry } from '@/hooks/modules/audit-log';
import {
  COMPENSATION_EVENT_AUDIT_ACTION_BY_ORDINAL,
  COMPENSATION_EVENT_AUDIT_ACTIONS,
} from '../constants/compensation-event-audit.constants';
import {
  COMPENSATION_EVENT_TYPE,
  COMPENSATION_EVENT_TYPE_VALUES,
  type CompensationEventTypeValue,
} from '../constants/compensation-event-notice.constants';
import type {
  CompensationEvent,
  CompensationEventAuditAction,
  CompensationEventAuditEntry,
  CompensationEventEvidenceFile,
  CompensationEventEvidenceKind,
  CompensationEventListResponse,
} from '../types/compensation-event.types';
import type {
  ApiNumber,
  AttachmentResponseDto,
  CompensationEventFinancialResponseDto,
  CompensationEventLookupOption,
  CompensationEventLookupResponse,
  CompensationEventPageResultDto,
  CompensationEventResponseDto,
  CreateCompensationEventNoticeInput,
} from '../types/compensation-event-api.types';
import type { CompensationEventNoticeFormValues } from '../types/compensation-event-notice.types';
import type { CompensationEventFinancials } from './compensation-event.utils';
import { DEFAULT_CURRENCY_CODE, toCurrencyCode } from './compensation-event-currency.utils';
import { joinRecipients } from './compensation-event-notice.utils';
import {
  resolveCompensationEventRegisterState,
  resolveCompensationEventStatusLabel,
} from './compensation-event-status.utils';

export const toNumber = (value: ApiNumber | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export {
  resolveApiStatus,
  resolveCompensationEventRegisterState,
  resolveCompensationEventStatusLabel,
} from './compensation-event-status.utils';

// `additionalClauseReferences` is free text — "60.1(2), 60.1(4); 61.3" and the like.
export const splitClauseReferences = (references?: string | null): string[] =>
  (references ?? '')
    .split(/[,;]/)
    .map((clause) => clause.trim())
    .filter(Boolean);

// The DTO carries one primary clause plus a free-text list of extras.
export const resolveApiClauses = (dto: CompensationEventResponseDto): string[] =>
  [dto.clauseNumber?.trim(), ...splitClauseReferences(dto.additionalClauseReferences)].filter(
    (clause): clause is string => !!clause
  );

// The extension drives the row's icon and tone; anything outside the known catalogue
// falls back to a generic FILE chip rather than crashing the map lookups.
const EXTENSION_KINDS: Record<string, CompensationEventEvidenceKind> = {
  pdf: 'PDF',
  xlsx: 'XLSX',
  xls: 'XLSX',
  doc: 'DOCX',
  docx: 'DOCX',
  zip: 'ZIP',
  rar: 'ZIP',
  '7z': 'ZIP',
  png: 'IMAGE',
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  gif: 'IMAGE',
  svg: 'IMAGE',
  webp: 'IMAGE',
  bmp: 'IMAGE',
  tif: 'IMAGE',
  tiff: 'IMAGE',
};

export const resolveEvidenceKind = (extension?: string | null): CompensationEventEvidenceKind =>
  EXTENSION_KINDS[(extension ?? '').toLowerCase()] ?? 'FILE';

export const toEvidenceFile = (dto: AttachmentResponseDto): CompensationEventEvidenceFile => ({
  id: dto.id,
  name: dto.fileName,
  kind: resolveEvidenceKind(dto.fileExtension),
  sizeBytes: dto.fileSizeBytes,
  uploadedAt: dto.uploadedAt,
  filePath: dto.filePath,
  uploadedByName: dto.uploadedByName,
});

// A file name is the only extension the conversation endpoint gives — the content type it
// also returns is the mail's MIME string ("application/pdf"), not the icon catalogue's key.
const getFileExtension = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1) : '';
};

type ConversationEmail = {
  timestampUtc: string;
  senderEmail?: string | null;
  userEmail?: string | null;
  attachmentUrls?: Array<{ url: string; name: string; contentType?: string | null }>;
};

type ConversationAttachment = {
  url: string;
  name: string;
  contentType?: string | null;
  fileExtension?: string | null;
  fileSizeBytes?: number | null;
};

// A mail attachment carries no uploader or stamp of its own — who sent it and when is a
// property of the message it rode in on, so the thread is indexed by url and each file
// reads its sender and stamp off that message. Size does come down with the attachment, so
// it is read straight off the summary and left unset only when the field is absent.
export const toConversationEvidenceFiles = (
  attachments: ConversationAttachment[],
  messages?: ConversationEmail[]
): CompensationEventEvidenceFile[] => {
  const messageByUrl = new Map<string, ConversationEmail>();
  for (const message of messages ?? []) {
    for (const attachment of getAttachments(message)) {
      if (!messageByUrl.has(attachment.url)) messageByUrl.set(attachment.url, message);
    }
  }

  return attachments.map((attachment) => {
    const message = messageByUrl.get(attachment.url);

    return {
      // The storage url is what download is keyed on, so it doubles as the row's identity.
      id: attachment.url,
      name: attachment.name,
      // The summary names the extension outright on newer payloads; the file name is the
      // fallback for the ones that only carry a MIME content type.
      kind: resolveEvidenceKind(attachment.fileExtension || getFileExtension(attachment.name)),
      sizeBytes: attachment.fileSizeBytes,
      uploadedAt: message?.timestampUtc,
      filePath: attachment.url,
      uploadedByName: message?.senderEmail || message?.userEmail || undefined,
    };
  });
};

export const toCompensationEvent = (dto: CompensationEventResponseDto): CompensationEvent => {
  const estimatedValue = toNumber(dto.estimatedValue) ?? 0;
  const implementedValue = toNumber(dto.implementedValue);
  const implementedDays = toNumber(dto.implementedDays);

  return {
    id: dto.id,
    projectId: dto.projectId,
    reference: dto.reference,
    title: dto.title,
    description: dto.description || undefined,
    summary: dto.summary?.trim() || undefined,
    amount: estimatedValue,
    currency: toCurrencyCode(dto.currency),
    status: resolveCompensationEventRegisterState(dto.status, dto.statusName),
    eventDate: dto.createdOn,
    createdAt: dto.createdOn,
    updatedAt: dto.updatedOn ?? dto.createdOn,
    parentEarlyWarningReference: dto.earlyWarningReference ?? undefined,
    parentEarlyWarningId: dto.earlyWarningId ?? undefined,
    timeImpactDays: toNumber(dto.estimatedDays),
    clauses: resolveApiClauses(dto),
    quotationId: dto.quotationId ?? undefined,
    quotedValue: toNumber(dto.quotedValue),
    quotedDays: toNumber(dto.quotedDays),
    raisedByName: dto.raisedBy ?? undefined,
    typeValue: toNumber(dto.type) ?? undefined,
    statusName: resolveCompensationEventStatusLabel(dto.status, dto.statusName),
    clauseNumber: dto.clauseNumber?.trim() || undefined,
    clauseTitle: dto.clauseTitle?.trim() || undefined,
    clauseDescription: dto.clauseDescription?.trim() || undefined,
    additionalClauses: splitClauseReferences(dto.additionalClauseReferences),
    proposedEffect: dto.proposedEffectDescription?.trim() || undefined,
    isQuotationRequired: dto.isQuotationRequired,
    requiresPmDecision: dto.requiresPmDecision,
    isRaisedManually: dto.isRaisedManually,
    notes: dto.notes?.trim() || undefined,
    originalQuoteAmount: estimatedValue,
    finalApprovedAmount: implementedValue,
    approvedTimeImpactDays: implementedDays,
    quoteReceivedDate: dto.quotationSubmittedOn ?? null,
    decisionDate: dto.implementedOn,
    finalizedOn: dto.implementedOn,
    assessmentOn: dto.assessmentOn ?? null,
    lifecycle: dto.lifecycle ?? undefined,
  };
};

// GET /api/compensation-events/{id}/financial reads onto the same shape the Financials
// tab already builds client-side from the CE record, so the tab needs no UI changes —
// only a more authoritative source for the numbers once the final quotation exists.
export const toCompensationEventFinancials = (
  dto: CompensationEventFinancialResponseDto
): CompensationEventFinancials => {
  const originalQuote = toNumber(dto.quotedTotalCost);
  const approvedCost = toNumber(dto.assessedTotalCost);
  const rawDifference =
    toNumber(dto.differenceInCost) ??
    (originalQuote === null || approvedCost === null ? null : approvedCost - originalQuote);

  // The API sends differenceInCost as a magnitude, not a signed delta — isIncreased is
  // the authoritative direction, so re-sign the value against it rather than trusting
  // whatever sign happened to come through on the field.
  const costDifference =
    rawDifference === null || dto.isIncreased === undefined || dto.isIncreased === null
      ? rawDifference
      : dto.isIncreased
        ? Math.abs(rawDifference)
        : -Math.abs(rawDifference);
  const isIncreased = dto.isIncreased ?? (costDifference === null ? null : costDifference > 0);

  // The API is the only authority on the day direction — it is read straight off
  // isDaysIncreased rather than inferred from the day figures.
  const isDaysIncreased = dto.isDaysIncreased ?? null;

  return {
    originalQuote,
    approvedCost,
    costDifference,
    costDifferencePercent:
      costDifference === null || !originalQuote ? null : (costDifference / originalQuote) * 100,
    fees: toNumber(dto.fees),
    riskAllowance: toNumber(dto.riskAllowance),
    submittedOn: dto.submittedOn ?? null,
    quotationAmount: toNumber(dto.quotationAmount),
    originalTimeImpactDays: toNumber(dto.quotedClaimDays),
    approvedTimeImpactDays: toNumber(dto.assessedClaimDays),
    differenceInDays: toNumber(dto.differenceInDays),
    isFinal: approvedCost !== null,
    isIncreased,
    isDaysIncreased,
  };
};

const TITLE_MAX_LENGTH = 120;

// The notice form has no title field, so the register subject is the opening of the
// description — cut on a sentence break where there is one.
export const buildNoticeTitle = (description = ''): string => {
  const text = description.trim().replace(/\s+/g, ' ');
  if (text.length <= TITLE_MAX_LENGTH) return text;

  const sentenceEnd = text.slice(0, TITLE_MAX_LENGTH).lastIndexOf('. ');
  return sentenceEnd > 40
    ? text.slice(0, sentenceEnd + 1)
    : `${text.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`;
};

// Clause options read "60.1(1) - PM changes Works Information".
export const splitContractClause = (clause = ''): { number: string; title: string } => {
  const [number, ...rest] = clause.split(' - ');
  return { number: (number ?? '').trim(), title: rest.join(' - ').trim() };
};

// Takes `unknown` because the value comes straight off the form; anything outside the
// enum (an untouched field, for one) falls back to the default the API accepts.
export const resolveNoticeTypeValue = (type?: unknown): CompensationEventTypeValue =>
  COMPENSATION_EVENT_TYPE_VALUES.includes(type as CompensationEventTypeValue)
    ? (type as CompensationEventTypeValue)
    : COMPENSATION_EVENT_TYPE.CONTRACTOR_NOTIFICATION;

// The DTO has no fields for the role or the issue date, so they are preserved as notes
// rather than dropped on submit.
const buildNoticeNotes = (values: CompensationEventNoticeFormValues): string | undefined =>
  [
    values.role ? `Role: ${values.role}` : '',
    values.dateIssued ? `Date issued: ${values.dateIssued.format('YYYY-MM-DD')}` : '',
  ]
    .filter(Boolean)
    .join(' | ') || undefined;

// Impact & Requirements is not on the notice screen, so the cost/time fields the DTO
// still requires go out at zero until a screen collects them.
const NOTICE_DEFAULT_IMPACT = { estimatedValue: 0, estimatedDays: 0, isQuotationRequired: false };

export interface CompensationEventNoticeContext {
  projectId: string;
  /** Set when the notice was raised from a signal — links the CE back to that alert. */
  projectAlertId?: string;
  // Set when the notice was raised off an Early Warning ("CE trigger identified") — the two
  // records stay separate, and these carry the link back to the EW for evidence context.
  earlyWarningId?: string;
  earlyWarningReference?: string;
  projectName?: string;
  projectReference?: string;
  attachments?: File[];
}

export const toCompensationEventNoticeInput = (
  values: CompensationEventNoticeFormValues,
  context: CompensationEventNoticeContext
): CreateCompensationEventNoticeInput => {
  const clause = splitContractClause(values.relevantContractClause);
  const title = buildNoticeTitle(values.descriptionOfEvent);

  return {
    projectId: context.projectId,
    // No longer collected on the form — the backend assigns the CE reference on create.
    reference: '',
    title,
    clauseNumber: clause.number,
    clauseTitle: clause.title,
    // The form has no separate description field; the backend requires one, so the full
    // clause label ("60.1(1) - PM changes Works Information") stands in for it.
    clauseDescription: values.relevantContractClause?.trim() || clause.title || clause.number,
    type: resolveNoticeTypeValue(values.compensationEventType),
    description: values.descriptionOfEvent ?? '',
    proposedEffectDescription: values.proposedEffect ?? '',
    ...NOTICE_DEFAULT_IMPACT,
    currency: DEFAULT_CURRENCY_CODE,
    projectAlertId: context.projectAlertId,
    earlyWarningId: context.earlyWarningId,
    earlyWarningReference: context.earlyWarningReference,
    raisedBy: values.from ?? '',
    subject: title,
    to: joinRecipients(values.to) ?? '',
    cc: joinRecipients(values.cc),
    bcc: joinRecipients(values.bcc),
    projectName: context.projectName,
    projectReference: context.projectReference,
    notes: buildNoticeNotes(values),
    attachments: context.attachments,
  };
};

// The lookup select reads "<reference> - <title>" and holds the CE id.
export const toCompensationEventLookupLabel = (item: CompensationEventLookupResponse): string =>
  [item.reference?.trim(), item.title?.trim()].filter(Boolean).join(' - ');

export const toCompensationEventLookupOptions = (
  items?: CompensationEventLookupResponse[]
): CompensationEventLookupOption[] =>
  (items ?? []).map((item) => ({
    label: toCompensationEventLookupLabel(item) || item.id,
    value: item.id,
    reference: item.reference?.trim() || item.id,
  }));

// References are compared on the characters that identify them only: the extractor writes
// "CE-014 (not linked with any known Compensation Event in Auspira)", and the note after
// the reference is it talking about its own match, not part of the reference.
const toReferenceKey = (value?: string | null): string =>
  (value ?? '')
    .split('(')[0]
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();

// The id of the project's compensation event that a quoted reference names — undefined
// when the reference is missing or names an event this project does not have, which is
// the case the screen asks the PM to resolve by picking one.
export const matchCompensationEventReference = (
  reference?: string | null,
  items: CompensationEventLookupResponse[] = []
): string | undefined => {
  const key = toReferenceKey(reference);
  if (!key) return undefined;

  return items.find((item) => toReferenceKey(item.reference) === key)?.id;
};

export const toCompensationEventListResponse = (
  page: CompensationEventPageResultDto
): CompensationEventListResponse => ({
  count: toNumber(page?.meta?.totalCount) ?? page?.items?.length ?? 0,
  next: null,
  previous: null,
  items: (page?.items ?? []).map(toCompensationEvent),
});

// Only whole numbers count as an ordinal — "EVENT_LOCKED" and "" must not become 0/NaN.
const toAuditOrdinal = (value?: string | number | null): number | null => {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  const trimmed = String(value ?? '').trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
};

// Folds a free-text signal — an enum name or the row's own wording — onto the tab
// vocabulary. Only reached for an actionType outside `AuditActionType`, since the
// ordinal map is total. Ordered most-specific first where prefixes overlap.
const matchAuditAction = (value: string): CompensationEventAuditAction | null => {
  const normalised = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (!normalised) return null;

  if (COMPENSATION_EVENT_AUDIT_ACTIONS.includes(normalised as CompensationEventAuditAction)) {
    return normalised as CompensationEventAuditAction;
  }

  // 'NOT ACCEPTED' contains 'ACCEPT', and 'UNLOCK' contains 'LOCK' — specific forms first.
  if (normalised.includes('NOTACCEPT') || normalised.includes('NOT_ACCEPT')) return 'NOT_ACCEPTED';
  if (normalised.includes('DISCARD')) return 'DISCARDED';
  if (normalised.includes('UNLOCK')) return 'UNLOCKED';
  if (normalised.includes('LOCK')) return 'LOCKED';
  if (normalised.includes('STATUS')) return 'STATUS_CHANGED';
  if (normalised.includes('IMPLEMENT')) return 'IMPLEMENTED';
  if (normalised.includes('APPROV')) return 'APPROVED';
  if (normalised.includes('RAISED') || normalised.includes('CREATED')) return 'CREATED';
  if (normalised.includes('UPLOAD') || normalised.includes('FILE')) return 'DOCUMENT_UPLOADED';
  if (normalised.includes('EVIDENCE') || normalised.includes('ATTACH')) return 'EVIDENCE_ADDED';
  if (normalised.includes('REVISION')) return 'REVISION_REQUESTED';
  if (normalised.includes('REVIEW')) return 'REVIEWED';
  if (normalised.includes('REJECT')) return 'REJECTED';
  if (normalised.includes('CONFIRM')) return 'CONFIRMED';
  if (normalised.includes('ACCEPT')) return 'ACCEPTED';
  if (normalised.includes('COMMENT')) return 'COMMENT_ADDED';
  if (normalised.includes('DECISION')) return 'DECISION_RECORDED';
  if (normalised.includes('CLOSE')) return 'CLOSED';
  if (normalised.includes('DETECT')) return 'DETECTED';
  if (normalised.includes('MITIGATION')) return 'MITIGATION_AGREED';
  if (normalised.includes('INVITE')) return 'RISK_REDUCTION_MEETING_INVITE_SENT';
  if (normalised.includes('LIFECYCLE')) return 'LIFECYCLE_COMPLETED';
  if (normalised.includes('UPDATE')) return 'UPDATED';

  return null;
};

// The shared audit log documents `actionType` as a PascalCase enum name, but the live
// backend serialises it as the `AuditActionType` ordinal (Swagger types it `integer`).
// Resolve in confidence order: confirmed ordinal, then the enum name if one arrived,
// then the row's `details` wording for the ordinals the enum has not pinned down yet.
export const resolveAuditAction = (
  actionType?: string | number | null,
  details?: string | null
): CompensationEventAuditAction => {
  const ordinal = toAuditOrdinal(actionType);
  if (ordinal !== null) {
    // Read through a partial view: the map is total over `AuditActionType`, but the
    // ordinal on the wire is a bare integer and may sit outside it.
    const byOrdinal: Partial<Record<number, CompensationEventAuditAction>> =
      COMPENSATION_EVENT_AUDIT_ACTION_BY_ORDINAL;
    return byOrdinal[ordinal] ?? matchAuditAction(details ?? '') ?? 'CREATED';
  }

  return matchAuditAction(String(actionType ?? '')) ?? matchAuditAction(details ?? '') ?? 'CREATED';
};

const SYSTEM_ACTOR = 'System';

export const toAuditEntry = (log: AuditLogEntry): CompensationEventAuditEntry => {
  const sender = log.sender?.trim() || '';
  const actorName =
    sender || log.performedByUserFullName?.trim() || log.performedBy?.trim() || SYSTEM_ACTOR;
  const isSystem = actorName === SYSTEM_ACTOR;

  return {
    id: log.id,
    action: resolveAuditAction(log.actionType, log.details),
    actorName,
    actorRole: log.stage?.trim() || null,
    actorParty: isSystem ? 'SYSTEM' : 'COMMERCIAL',
    isSender: Boolean(sender),
    details: log.details?.trim() || '',
    occurredAt: log.createdOn,
  };
};
