// Wire shapes for /api/quotations, mirroring the backend DTOs exactly.
// The UI never consumes these directly — `toContractorQuotation` maps them onto the
// module's domain model first.
import type { QuotationStatus } from '@/constants/enum.constant';
import type { ApiNumber } from './compensation-event-api.types';

export interface QuotationItemResponseDto {
  id: string;
  category: string;
  description: string;
  amount: ApiNumber;
}

/** POST /api/quotations/confirm — the quotation now linked to the picked compensation event. */
export interface ConfirmQuotationResponseDto {
  quotationId: string;
}

// GET /api/quotations/{id} and GET /api/pmi-quotations/project-manager-instruction/{pmiId} share one wire shape: a CE quotation names its event in compensationEventId, a PMI quotation names its instruction in projectManagerInstructionId — exactly one is set.
export interface QuotationResponseDto {
  id: string;
  compensationEventId: string | null;
  /** Set on a PMI quotation — the instruction whose quotation this is. */
  projectManagerInstructionId?: string | null;
  ceReference: string;
  version: ApiNumber;
  isLatest: boolean;
  status: QuotationStatus;
  totalCost: ApiNumber;
  currency: string;
  preparedBy: string | null;
  delayClaimedDays: ApiNumber | null;
  originalCompletionDate: string | null;
  revisedCompletionDate: string | null;
  supportingProgrammeReference: string | null;
  programmeNarrative: string | null;
  createdOn: string;
  // The clause the quotation was raised under — filled on PMI quotations, whose record
  // cites one directly rather than through the CE it prices.
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  // Priced on top of the items when the contractor allowed for residual risk — absent on
  // responses from before the column existed, so both fields are read defensively.
  riskAllowance?: ApiNumber | null;
  riskAllowanceDescription?: string | null;
  items: QuotationItemResponseDto[];
}

// The extractor's read of a quotation mail, JSON-encoded onto `ProjectAlert.quotation`.
// It is the same information as `QuotationResponseDto` minus everything the register
// assigns — no id, version, status or compensation event of its own — and every field is
// optional because the extractor only fills what the mail actually said.
export interface AlertQuotationItemDto {
  category?: string | null;
  description?: string | null;
  amount?: ApiNumber | null;
}

// The extractor names the preparers either the way the register does — one string folding
// the role in ("J. Whitfield, Contracts Manager") — or as a row per person.
export interface AlertQuotationPreparerDto {
  name?: string | null;
  role?: string | null;
}

export interface AlertQuotationDto {
  totalCost?: ApiNumber | null;
  currency?: string | null;
  preparedBy?: string | AlertQuotationPreparerDto[] | null;
  delayClaimedDays?: ApiNumber | null;
  originalCompletionDate?: string | null;
  revisedCompletionDate?: string | null;
  supportingProgrammeReference?: string | null;
  programmeNarrative?: string | null;
  // Priced on top of the items, when the mail said so — the register's own DTO has no
  // equivalent, so this only ever arrives on an alert.
  riskAllowance?: ApiNumber | null;
  riskAllowanceDescription?: string | null;
  items?: AlertQuotationItemDto[];
}
