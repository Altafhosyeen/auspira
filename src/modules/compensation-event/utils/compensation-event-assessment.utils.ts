import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import type {
  AssessedQuotationItemInput,
  AssessmentFigure,
} from '../types/compensation-event-assessment.types';
import type { QuotationLine, QuotationTableRow } from '../types/compensation-event-quotation.types';
import { formatQuotationAmount } from './compensation-event-quotation.utils';

export interface EmphasisSegment {
  text: string;
  strong: boolean;
}

// The clause copy carries one bolded phrase; `**` marks it rather than embedding JSX
// in the constants file.
export const parseEmphasis = (text: string): EmphasisSegment[] =>
  text
    .split('**')
    .map((part, index) => ({ text: part, strong: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);

export const formatAssessmentDays = (days: number): string =>
  `${days} ${Math.abs(days) === 1 ? 'day' : 'days'}`;

export const formatAssessmentFigure = (figure: AssessmentFigure, currency: string): string =>
  `${formatQuotationAmount(figure.amount, currency)} · ${formatAssessmentDays(figure.days)}`;

export const getAssessmentVariance = (
  claim: AssessmentFigure,
  assessment: AssessmentFigure
): { amount: number; days: number } => ({
  amount: assessment.amount - claim.amount,
  days: assessment.days - claim.days,
});

// What the PM can put a pencil on: a member row, or a category the contractor priced in
// one line. A group that was broken down is worth the sum of its members, so editing its
// total directly could only make it disagree with the rows underneath it.
export const isAssessedRowEditable = (row: QuotationTableRow): boolean =>
  !row.isGroup || !row.children?.length;

/** The quoted cost and the allowance the PM assessed, which are rows rather than lines. */
interface AssessedCardRows {
  quotationAmount?: number | null;
  riskAllowance?: number | null;
}

// The quoted cost and the risk allowance are rows of the card in their own right, not
// priced lines, so neither is in `lines` — but the backend prices off `items`, so both
// travel as items or the breakdown would not sum to the assessed total. Sent under the
// categories the extractor itself uses for them.
const buildAssessedCardItems = (rows: AssessedCardRows): AssessedQuotationItemInput[] => {
  const items: AssessedQuotationItemInput[] = [];

  if (typeof rows.quotationAmount === 'number' && Number.isFinite(rows.quotationAmount)) {
    items.push({
      category: 'QuotationAmount',
      description: CONTRACTOR_QUOTATION_COPY.quotationAmount.title,
      amount: rows.quotationAmount,
    });
  }

  if (typeof rows.riskAllowance === 'number' && Number.isFinite(rows.riskAllowance)) {
    items.push({
      category: 'RiskAllowance',
      description: CONTRACTOR_QUOTATION_COPY.riskAllowance.title,
      amount: rows.riskAllowance,
    });
  }

  return items;
};

// The assessed lines flattened back onto the wire's shape: one item per priced row the PM
// could put a pencil on — a member of a category the contractor broke down, or a category
// they priced in a single line. The category travels as the line's label, which is what
// `buildQuotationLines` grouped the items under in the first place. The card's own two
// rows are appended, so what is sent adds up to what the PM saw.
export const buildAssessedQuotationItems = (
  lines: QuotationLine[],
  cardRows: AssessedCardRows = {}
): AssessedQuotationItemInput[] => [
  ...buildAssessedCardItems(cardRows),
  ...lines.flatMap((line) =>
    line.members.length
      ? line.members.map((member) => ({
          category: line.label,
          // A member arrived as one free-text description, which the table shows as its
          // item; the PM's note on the row is appended rather than dropped, because the
          // wire carries a single description per item.
          description: [member.name, member.role]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(' - '),
          amount: member.amount,
        }))
      : [
          {
            category: line.label,
            description: line.description.trim(),
            amount: line.amount ?? 0,
          },
        ]
  ),
];
