import dayjs from 'dayjs';
import type { CSSProperties } from 'react';
import { humanizeCamelCase } from '@/hooks/modules/project-alerts';
import {
  CONTRACTOR_QUOTATION_COPY,
  QUOTATION_CATEGORY_LABELS,
  QUOTATION_SUBMITTED_DATE_FORMAT,
} from '../constants/compensation-event-quotation.constants';
import {
  QUOTATION_COLORS,
  QUOTATION_MEMBER_TINTS,
  QUOTATION_SIZES,
} from '../constants/compensation-event-quotation.theme';
import type { ApiNumber } from '../types/compensation-event-api.types';
import type {
  ContractorQuotation,
  ProgrammeImpactEntry,
  QuotationLine,
  QuotationLineCategory,
  QuotationSummary,
  QuotationSummaryRow,
  QuotationTableRow,
} from '../types/compensation-event-quotation.types';
import type { QuotationResponseDto } from '../types/compensation-event-quotation-api.types';
import { DASH } from './compensation-event.utils';
import { toNumber } from './compensation-event-api.utils';
import { formatCurrency, toCurrencyCode } from './compensation-event-currency.utils';
import { getNoticeTimeBar } from './compensation-event-notice.utils';
import { buildQuotationSubmittedBy } from './compensation-event-preparer.utils';

// A line the contractor broke down is worth its members; one that arrived as a single
// category amount carries that amount itself.
export const getLineTotal = (line: QuotationLine): number =>
  line.members.length
    ? line.members.reduce((total, member) => total + member.amount, 0)
    : (line.amount ?? 0);

export const getQuotationTotal = (lines: QuotationLine[]): number =>
  lines.reduce((total, line) => total + getLineTotal(line), 0);

export const getTotalWithRiskAllowance = (lines: QuotationLine[], riskAllowance: number): number =>
  getQuotationTotal(lines) + (Number.isFinite(riskAllowance) ? riskAllowance : 0);

// The frame renders round figures whole ("$40,962"), so a quotation priced in whole units
// drops the fractional part. Pence are kept where the contractor actually quoted them:
// rounding a £7.26 fee to £7 left the rows on the card visibly failing to add up to their
// own total. A figure the quotation never named is a dash — never a formatted zero, which
// reads as a price.
export const formatQuotationAmount = (
  amount: number | null | undefined,
  currency?: string | null
): string =>
  typeof amount === 'number' && Number.isFinite(amount)
    ? formatCurrency(amount, currency, {
        locale: 'en-US',
        maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      })
    : DASH;

// The claimed delay as the days card states it. Undefined means the quotation claimed no
// time impact at all, which reads differently from a claim of zero days — so that case is
// worded rather than printed as "0 calendar days".
export const formatQuotationDaysClaimed = (days: number | null | undefined): string => {
  if (typeof days !== 'number' || !Number.isFinite(days)) {
    return CONTRACTOR_QUOTATION_COPY.quotation.noDaysClaimed;
  }

  const suffix =
    Math.abs(days) === 1
      ? CONTRACTOR_QUOTATION_COPY.quotation.daySuffix
      : CONTRACTOR_QUOTATION_COPY.quotation.daysSuffix;

  return `${days} ${suffix}`;
};

export const buildQuotationRows = (lines: QuotationLine[]): QuotationTableRow[] =>
  lines.map((line) => ({
    key: line.id,
    isGroup: true,
    category: line.category,
    item: line.label,
    description: line.description,
    amount: getLineTotal(line),
    // A line with no members has nothing to expand into, so it is left a leaf and antd
    // draws it as a plain row.
    children: line.members.length
      ? line.members.map((member) => ({
          key: `${line.id}-${member.id}`,
          isGroup: false,
          item: member.name,
          description: member.role,
          amount: member.amount,
        }))
      : undefined,
  }));

// The cost the quotation states in its own `totalCost` item. It heads the card as the
// Quotation Amount exactly as sent, with the fee and the allowance listed under it as
// further lines, so the card's total runs past `totalCost` rather than back to it.
// A total the wire did not name reads as zero rather than as no row at all: the card
// states the same three headline figures on every quotation, so a reader never has to
// work out whether a missing line means nothing was priced or nothing was sent.
const getQuotationBaseCost = (declaredTotal?: number | null): number =>
  typeof declaredTotal === 'number' && Number.isFinite(declaredTotal) ? declaredTotal : 0;

// A percentage the contractor stated in the line's own wording — "Fee at 3.5%", "3.5 %".
// Read out so the rate can head the row in brackets rather than hiding behind the hover
// icon, which is where a reader looks for prose, not for a figure that prices the line.
const PERCENTAGE_PATTERN = /(\d+(?:\.\d+)?)\s*%/;

export const extractQuotationPercentage = (description?: string | null): string | undefined => {
  const match = description?.match(PERCENTAGE_PATTERN);
  // Trailing zeros are the extractor's, not the contractor's — "3.50%" reads as false
  // precision next to a rate quoted as "3.5%".
  return match?.[1] ? `${Number(match[1])}%` : undefined;
};

// The label with its rate stated after it, so the figure that prices the line is read at
// a glance. The contractor's full wording still rides the info icon beside it — the
// bracket states the rate, the tooltip keeps the reason for it.
const buildLineLabel = (label: string, percentage?: string): string =>
  percentage ? `${label} (${percentage})` : label;

// The summary card states the quotation flat — one row per priced item, exactly as the
// contractor sent it, with no category grouping laid over the top. A category the wire
// broke into several items contributes one row each, headed by its category; the
// contractor's own description of the item is read on hover instead of on the row itself.
export const buildQuotationSummaryRows = (
  lines: QuotationLine[],
  riskAllowance: number,
  declaredTotal?: number | null
): QuotationSummaryRow[] => {
  const rows: QuotationSummaryRow[] = [];

  // The quoted cost, ahead of the fee and allowance listed under it.
  rows.push({
    key: 'quotation-amount',
    label: CONTRACTOR_QUOTATION_COPY.quotationAmount.title,
    hint: CONTRACTOR_QUOTATION_COPY.quotationAmount.tooltip,
    amount: getQuotationBaseCost(declaredTotal),
  });

  lines.forEach((line) => {
    if (!line.members.length) {
      const description = line.description?.trim() || undefined;
      // A rate the contractor quoted belongs on the row — it prices the line, so it is
      // read at a glance rather than hunted for under the info icon.
      const percentage = extractQuotationPercentage(description);

      rows.push({
        key: line.id,
        // The row is filed under its category, with any quoted rate in brackets after it;
        // the contractor's own wording stays the hover hint, never the headline.
        label: buildLineLabel(line.label, percentage),
        hint: description,
        amount: line.amount ?? 0,
      });
      return;
    }

    line.members.forEach((member) => {
      rows.push({
        key: `${line.id}-${member.id}`,
        label: member.name?.trim() || line.label,
        hint: member.name?.trim() ? line.label : undefined,
        amount: member.amount,
      });
    });
  });

  // An allowance the contractor did not price is an allowance of nothing, so the row
  // still stands and states zero.
  rows.push({
    key: 'risk-allowance',
    label: CONTRACTOR_QUOTATION_COPY.riskAllowance.title,
    hint: CONTRACTOR_QUOTATION_COPY.riskAllowance.tooltip,
    amount: Number.isFinite(riskAllowance) ? riskAllowance : 0,
  });

  return rows;
};

// The card's total is the sum of the rows above it, so it can never contradict them.
// Null when not one row named a figure — a quotation for nothing is not a quotation.
export const getQuotationSummaryRowsTotal = (rows: QuotationSummaryRow[]): number | null =>
  rows.some((row) => row.amount !== null)
    ? rows.reduce((total, row) => total + (row.amount ?? 0), 0)
    : null;

export const getQuotationGroupKeys = (lines: QuotationLine[]): string[] =>
  lines.map((line) => line.id);

// Row keys are the line id on a group row and `<lineId>-<memberId>` on a member row, so
// one key off the table resolves back to the line or member the PM just edited.
export const setQuotationMemberAmount = (
  lines: QuotationLine[],
  key: string,
  amount: number
): QuotationLine[] =>
  lines.map((line) => ({
    ...line,
    members: line.members.map((member) =>
      `${line.id}-${member.id}` === key ? { ...member, amount } : member
    ),
  }));

// A category the contractor priced in one line carries the amount on the line itself, so a
// group key reprices that line; on a line that was broken down the same key names no
// member and the amount stays the sum of the members underneath it.
export const setQuotationRowAmount = (
  lines: QuotationLine[],
  key: string,
  amount: number
): QuotationLine[] =>
  lines.map((line) =>
    line.id === key && !line.members.length
      ? { ...line, amount }
      : {
          ...line,
          members: line.members.map((member) =>
            `${line.id}-${member.id}` === key ? { ...member, amount } : member
          ),
        }
  );

// A group key edits the line's own description; a member key edits that member's role,
// which is what the DESCRIPTION column shows on member rows.
export const setQuotationRowDescription = (
  lines: QuotationLine[],
  key: string,
  description: string
): QuotationLine[] =>
  lines.map((line) =>
    line.id === key
      ? { ...line, description }
      : {
          ...line,
          members: line.members.map((member) =>
            `${line.id}-${member.id}` === key ? { ...member, role: description } : member
          ),
        }
  );

// The frame draws a collapsed group as its own outlined block and an expanded one as
// plain rows ruled by a hairline — so a row is either boxed or divided, never both. A
// category the contractor priced in one line has no members to reveal, so it stays boxed
// whatever the expanded keys say — an expanded state that shows nothing is not a state.
export const isQuotationRowBoxed = (row: QuotationTableRow, expandedRowKeys: string[]): boolean =>
  row.isGroup && (!row.children?.length || !expandedRowKeys.includes(row.key));

// The table token clears the cell border, so the rows that stay in the table paint their
// hairline back in.
export const DIVIDED_ROW_CELL_STYLE: CSSProperties = {
  borderBottomColor: QUOTATION_COLORS.rowDivider,
};

// A boxed group hands its whole row to the ITEM cell; the block inside brings its own
// border, spacing and horizontal inset (see CompensationEventQuotationGroupBox), so the
// cell is cleared of its own padding entirely rather than layering two insets — a cell
// padding left in place here has, in practice, let the block's border touch the card edge
// instead of landing under the header's column edges as intended.
export const BOXED_ROW_CELL_STYLE: CSSProperties = {
  borderBottomColor: 'transparent',
  padding: 0,
};

export const QUOTATION_HEADER_CELL_STYLE: CSSProperties = {
  fontSize: QUOTATION_SIZES.headerFontSize,
  fontWeight: 500,
  letterSpacing: QUOTATION_SIZES.headerLetterSpacing,
};

// Tint is derived from the name rather than the row index so one person keeps the
// same colour in every line they appear in.
export const getMemberTint = (name: string) => {
  const seed = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return QUOTATION_MEMBER_TINTS[seed % QUOTATION_MEMBER_TINTS.length];
};

// A priced breakdown is always worth its lines; a quotation that broke nothing down falls
// back to the total it stated, and one that stated none has no total to report.
export const getQuotationSummary = (
  quotation: ContractorQuotation,
  riskAllowance: number
): QuotationSummary => {
  const quotationTotal = quotation.lines.length
    ? getQuotationTotal(quotation.lines)
    : (quotation.declaredTotal ?? null);
  const allowance = Number.isFinite(riskAllowance) ? riskAllowance : 0;

  return {
    quotationTotal,
    riskAllowance: allowance,
    grandTotal: quotationTotal === null && !allowance ? null : (quotationTotal ?? 0) + allowance,
  };
};

// A CE can carry several submitted revisions — the screen always shows the current one.
export const selectLatestQuotation = (
  quotations?: QuotationResponseDto[]
): QuotationResponseDto | undefined => {
  if (!quotations?.length) return undefined;

  return (
    quotations.find((quotation) => quotation.isLatest) ??
    [...quotations].sort((a, b) => (toNumber(b.version) ?? 0) - (toNumber(a.version) ?? 0))[0]
  );
};

// The backend sends free-text categories; fold the known ones onto the Figma icon set.
export const normaliseQuotationCategory = (category: string): QuotationLineCategory => {
  const value = category.trim().toLowerCase();
  if (/people|labour|labor|staff/.test(value)) return 'people';
  if (/equip|plant/.test(value)) return 'equipment';
  if (/fee/.test(value)) return 'fee';
  return 'other';
};

const formatProgrammeDate = (value?: string | null): string | null =>
  value && dayjs(value).isValid() ? dayjs(value).format(QUOTATION_SUBMITTED_DATE_FORMAT) : null;

// Both quotation payloads carry the same programme fields; the alert's copy just makes
// every one of them optional, so the card is built off the shared subset.
interface QuotationProgrammeSource {
  delayClaimedDays?: ApiNumber | null;
  originalCompletionDate?: string | null;
  revisedCompletionDate?: string | null;
  supportingProgrammeReference?: string | null;
  programmeNarrative?: string | null;
}

// Only fields the backend actually populated make it onto the card — an unclaimed delay
// or an unset supporting reference has nothing meaningful to show.
export const buildQuotationProgrammeImpact = (
  source: QuotationProgrammeSource
): ProgrammeImpactEntry[] => {
  const entries: ProgrammeImpactEntry[] = [];
  const delayDays = toNumber(source.delayClaimedDays);

  if (delayDays) {
    entries.push({ label: 'Delay claimed', value: `${delayDays} calendar days` });
  }

  const revisedCompletion = formatProgrammeDate(source.revisedCompletionDate);
  if (revisedCompletion) {
    const originalCompletion = formatProgrammeDate(source.originalCompletionDate);
    entries.push({
      label: 'Revised completion',
      value: originalCompletion
        ? `${revisedCompletion} (was ${originalCompletion})`
        : revisedCompletion,
    });
  }

  const supportingDocs = [source.supportingProgrammeReference, source.programmeNarrative]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(', ');
  if (supportingDocs) {
    entries.push({ label: 'Supporting docs', value: supportingDocs });
  }

  return entries;
};

/** One priced item, flattened out of whichever payload it arrived on. */
export interface QuotationSourceItem {
  id: string;
  category?: string | null;
  description?: string | null;
  amount: number;
}

// Categories that restate a figure the card already shows on its own row rather than
// naming a priced work item — folding them into the lines would duplicate that row.
// The quoted cost has arrived under both names: `totalCost` originally, `QuotationAmount`
// since the extractor started labelling its items the way the card heads them.
const NON_LINE_ITEM_CATEGORIES = new Set(['totalcost', 'quotationamount', 'riskallowance']);

// The categories under which the quoted cost itself arrives, as opposed to a total that
// may already have the fee and the allowance folded into it.
const QUOTATION_AMOUNT_CATEGORIES = new Set(['totalcost', 'quotationamount']);

// The category the priced allowance arrives under, alongside the DTO's own top-level
// `riskAllowance` field.
const RISK_ALLOWANCE_CATEGORIES = new Set(['riskallowance']);

export const normaliseCategoryKey = (category?: string | null): string =>
  (category ?? '').trim().toLowerCase().replace(/\s+/g, '');

// The figure an item states under one of the given categories, or null when the payload
// priced none of them. `items` is what the extractor actually read off the quotation, so
// a figure found here is preferred over the DTO's own top-level fields.
const findItemAmountByCategory = (
  items: { category?: string | null; amount: number }[],
  categories: Set<string>
): number | null => {
  const item = items.find((entry) => categories.has(normaliseCategoryKey(entry.category)));

  return item && Number.isFinite(item.amount) ? item.amount : null;
};

// The quoted cost as the payload states it in its own right. Preferred over the DTO's
// `totalCost`, which the register re-sums to include the fee and the allowance once the
// quotation is persisted — reading that back as the quoted cost would inflate the row
// every time the card reloaded.
export const findQuotationAmountItem = (
  items: { category?: string | null; amount: number }[]
): number | null => findItemAmountByCategory(items, QUOTATION_AMOUNT_CATEGORIES);

// The allowance the payload priced in its own item. Preferred over the DTO's top-level
// `riskAllowance`, which has been seen carrying a stale default long after the extractor
// priced the allowance on the item — reading that field first put a £1,500 allowance on
// a card whose items added up to £73.26.
export const findRiskAllowanceItem = (
  items: { category?: string | null; amount: number }[]
): number | null => findItemAmountByCategory(items, RISK_ALLOWANCE_CATEGORIES);

// Items arrive flat and category-tagged, and the table is grouped by category. A category
// the contractor broke down keeps its items as expandable members; one that arrived as a
// single priced line has no breakdown to expand, so it stays a plain row carrying its own
// description and amount.
export const buildQuotationLines = (items: QuotationSourceItem[]): QuotationLine[] => {
  const groups = new Map<string, QuotationSourceItem[]>();
  items.forEach((item) => {
    const label = item.category?.trim() || QUOTATION_CATEGORY_LABELS.other;
    if (NON_LINE_ITEM_CATEGORIES.has(normaliseCategoryKey(label))) return;
    groups.set(label, [...(groups.get(label) ?? []), item]);
  });

  return Array.from(groups.entries()).map(([label, groupItems]) => {
    const [single] = groupItems.length === 1 ? groupItems : [];

    return {
      id: label.toLowerCase().replace(/\s+/g, '-'),
      category: normaliseQuotationCategory(label),
      // The wire writes a category the way it is named in code ("PlantAndMaterials").
      label: humanizeCamelCase(label),
      description: single?.description?.trim() ?? '',
      members: single
        ? []
        : groupItems.map((item) => ({
            id: item.id,
            name: item.description?.trim() ?? '',
            role: '',
            amount: item.amount,
          })),
      ...(single ? { amount: single.amount } : {}),
    };
  });
};

export const toContractorQuotation = (dto: QuotationResponseDto): ContractorQuotation => {
  const items = dto.items.map((item) => ({
    id: item.id,
    category: item.category,
    description: item.description,
    amount: toNumber(item.amount) ?? 0,
  }));

  return {
    reference: dto.ceReference,
    submittedOn: dto.createdOn,
    currency: toCurrencyCode(dto.currency),
    lines: buildQuotationLines(items),
    // The priced item wins over the DTO field — see findRiskAllowanceItem.
    riskAllowance: findRiskAllowanceItem(items) ?? toNumber(dto.riskAllowance) ?? 0,
    riskAllowanceDescription: dto.riskAllowanceDescription?.trim() || undefined,
    programmeImpact: buildQuotationProgrammeImpact(dto),
    delayClaimedDays: toNumber(dto.delayClaimedDays) ?? undefined,
    submittedBy: buildQuotationSubmittedBy(dto.id, dto.preparedBy, dto.createdOn),
    // No explicit deadline on the DTO; reuse the notice screen's reply-window proxy.
    timeBar: getNoticeTimeBar(dayjs(dto.createdOn)),
    // The stored `totalCost` is re-summed to cover every item once the quotation is
    // persisted, so the item that names the quoted cost is read in preference to it.
    declaredTotal: findQuotationAmountItem(items) ?? toNumber(dto.totalCost) ?? undefined,
  };
};
