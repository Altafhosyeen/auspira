// ==========================================
// Z-CLAUSES — METADATA PANEL DATA TYPES (card-friendly display shape)
// ==========================================

import type { ZClauseTypeLabel } from './components/ZClauseCard';

export interface ZClauseCardData {
  number: string;
  title: string;
  description: string;
  /** Undefined when the clause has neither `amendsClause` nor `reference` — no badge to show. */
  typeLabel?: ZClauseTypeLabel;
  /** Reference label for the orange tag — just the clause number or external reference, no page mixed in. */
  refLabel: string;
  /** Page number shown as a separate clickable chip beside the reference tag. */
  page?: number;
  /** e.g. "LOW - defines treatment of early works payments". */
  impact?: string;
}

export interface ZClauseCategoryData {
  id: string;
  title: string;
  clauses: ZClauseCardData[];
}
