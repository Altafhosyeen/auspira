import type { ProjectAlert } from '@/hooks/modules/project-alerts';
import type { ContractorQuotation } from '../types/compensation-event-quotation.types';
import type {
  AlertQuotationDto,
  AlertQuotationItemDto,
  AlertQuotationPreparerDto,
} from '../types/compensation-event-quotation-api.types';
import { toNumber } from './compensation-event-api.utils';
import { toCurrencyCode } from './compensation-event-currency.utils';
import { getTimeBarForDeadline } from './compensation-event-notice.utils';
import { getAlertDeadline } from './compensation-event-notice-prefill.utils';
import {
  asRecord,
  buildQuotationSubmittedBy,
  toCamelKeys,
} from './compensation-event-preparer.utils';
import {
  buildQuotationLines,
  buildQuotationProgrammeImpact,
  findQuotationAmountItem,
} from './compensation-event-quotation.utils';

// "CE-014 (not linked with any known Compensation Event in Auspira)" — the note after the
// reference is the extractor talking about its own match, not part of the reference.
// A PMI quotation names its instruction via `pmiReference` instead, so the card reads that
// when the signal wrote one.
// The extractor writes a key for every reference it looked for and leaves the ones the
// mail never named as null *or* as an empty string, so blank has to count as absent here —
// `??` alone would stop on a written-but-empty `pmiReference` and never read the CE one.
export const getAlertQuotationReference = (alert: ProjectAlert): string =>
  [alert.pmiReference, alert.compensationEventReference, alert.earlyWarningReference]
    .map((reference) => (reference ?? '').split('(')[0].trim())
    .find((reference) => reference !== '') ?? '';

// The extractor writes a key for everything it looked for and leaves the ones the mail
// never said as null or as an empty string, so a payload is only empty once nothing on it
// carries a value.
const QUOTATION_CONTENT_KEYS = [
  'totalCost',
  'currency',
  'preparedBy',
  'delayClaimedDays',
  'originalCompletionDate',
  'revisedCompletionDate',
  'supportingProgrammeReference',
  'programmeNarrative',
  'riskAllowance',
  'riskAllowanceDescription',
] as const;

const hasQuotationContent = (body: Record<string, unknown>): boolean =>
  QUOTATION_CONTENT_KEYS.some((key) => {
    const value = body[key];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return !!value.trim();
    if (Array.isArray(value)) return !!value.length;
    return true;
  });

// `ProjectAlert.quotation` is a JSON-encoded string on a free-form column, so it is parsed
// defensively. Null when unset, unparseable, or carrying neither priced items nor any of
// the fields the extractor fills — a quotation mail routinely states its programme impact
// and preparer without ever itemising a cost, and that is still a quotation to show.
export const parseAlertQuotation = (raw?: string | null): AlertQuotationDto | null => {
  if (!raw?.trim()) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const root = asRecord(parsed);
  if (!root) return null;

  // Some payloads nest the quotation under its own key instead of sending it at the root.
  const body = toCamelKeys(asRecord(toCamelKeys(root).quotation) ?? root);

  const items = (Array.isArray(body.items) ? body.items : [])
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => !!item)
    .map((item) => toCamelKeys(item) as AlertQuotationItemDto);

  if (!items.length && !hasQuotationContent(body)) return null;

  // Preparer rows come through the same inconsistent casing as the payload around them.
  const preparedBy = Array.isArray(body.preparedBy)
    ? body.preparedBy
        .map(asRecord)
        .filter((preparer): preparer is Record<string, unknown> => !!preparer)
        .map((preparer) => toCamelKeys(preparer) as AlertQuotationPreparerDto)
    : (body.preparedBy as string | null | undefined);

  return { ...(body as unknown as AlertQuotationDto), preparedBy, items };
};

// The quotation the extractor read off the alert's mail, mapped onto the screen's model —
// undefined when the alert carries no usable quotation payload.
export const toContractorQuotationFromAlert = (
  alert: ProjectAlert
): ContractorQuotation | undefined => {
  const quotation = parseAlertQuotation(alert.quotation);
  if (!quotation) return undefined;

  const items = (quotation.items ?? []).map((item, index) => ({
    // Items are unidentified on the wire, so position keys them within the alert.
    id: `${alert.id}-${index}`,
    category: item.category,
    description: item.description,
    amount: toNumber(item.amount) ?? 0,
  }));

  return {
    reference: getAlertQuotationReference(alert),
    // The payload carries no submission stamp of its own, and the alert was raised off the
    // mail the quotation arrived on — that is the closest thing to when it was submitted.
    submittedOn: alert.createdOn,
    currency: toCurrencyCode(quotation.currency),
    lines: buildQuotationLines(items),
    // Unlike the register's DTO, the extractor does read an allowance off the mail when
    // the contractor priced one.
    riskAllowance: toNumber(quotation.riskAllowance) ?? 0,
    riskAllowanceDescription: quotation.riskAllowanceDescription?.trim() || undefined,
    programmeImpact: buildQuotationProgrammeImpact(quotation),
    delayClaimedDays: toNumber(quotation.delayClaimedDays) ?? undefined,
    submittedBy: buildQuotationSubmittedBy(alert.id, quotation.preparedBy, alert.createdOn),
    // The alert's own reply window — the same countdown the notice screen shows.
    timeBar: getTimeBarForDeadline(getAlertDeadline(alert)),
    // Read the quoted cost off its own item where the payload names one, so the card
    // states the same figure before and after the quotation is persisted.
    declaredTotal: findQuotationAmountItem(items) ?? toNumber(quotation.totalCost) ?? undefined,
  };
};
