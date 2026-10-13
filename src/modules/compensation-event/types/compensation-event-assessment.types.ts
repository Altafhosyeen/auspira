import type { NoticeTimeBar } from './compensation-event-notice.types';
import type { QuotationLine } from './compensation-event-quotation.types';

export interface AssessmentFigure {
  amount: number;
  days: number;
  /** Muted aside the design prints after the figures, e.g. "overhead % queried". */
  note?: string;
}

export interface AssessmentBasis {
  /** Bold lead-in ("Defined Cost +") followed by the muted remainder. */
  lead: string;
  detail: string;
}

export interface LateEarlyWarningCheck {
  riskLabel: string;
  rule: string;
  /** Auspira's read of the clause for this event — absent when the signal carried none. */
  finding?: string;
}

export interface CompensationEventAssessment {
  reference: string;
  currency: string;
  // The claimed lines the PM assesses — same shape as the quotation they came from,
  // so the assessment table reuses the quotation row builder and item cell.
  lines: QuotationLine[];
  contractorClaim: AssessmentFigure;
  pmAssessment: AssessmentFigure;
  basis: AssessmentBasis;
  lateEarlyWarning: LateEarlyWarningCheck;
  // The PM's note on the assessment, shown in the Comment card.
  comment: string;
  timeBar: NoticeTimeBar;
}

/** One assessed item of POST /api/quotations/proceed-with-assessment. */
export interface AssessedQuotationItemInput {
  category: string;
  description: string;
  amount: number;
}

// Body for POST /api/quotations/proceed-with-assessment — the PM's determination on the
// quotation, keyed on the quotation itself. Sent as multipart/form-data because the
// backend contract carries the assessment document alongside the priced lines.
export interface ProceedWithAssessmentInput {
  quotationId: string;
  // Derived from the assessed lines, never a stored total — see `getQuotationTotal`.
  assessedTotalCost: number;
  assessedClaimDays: number;
  comments: string;
  items: AssessedQuotationItemInput[];
  // True when the PM assessed by uploading a single document instead of the line-item
  // form — mirrors the method toggle on the assessment screen.
  isFile: boolean;
  // The single assessment document, only sent when `isFile` is true.
  quotationFile?: File | null;
  // Supporting documents attached under both assessment methods.
  additionalFiles?: File[];
}
