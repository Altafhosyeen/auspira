import { stripClausePrefix } from '@/components/shared/app-page-title';
import type { ClauseChipValue } from '@/components/shared/clause-chip';
import type { RequestForInformation } from '../types/request-for-information.types';

// The chip prints "CL.17.1"; the clause itself is a full sentence and lives in the hover.
const CLAUSE_PREFIX = 'CL.';
const DETAIL_SEPARATOR = ' – ';

// What the header prints beside its title — the clause the RFI names, with the clause
// wording (prefixed by the RFI's own reference) on hover. Returns undefined when the record
// names no clause, so the header drops the chip rather than printing an empty pill.
export const resolveClauseChip = (
  rfi?: RequestForInformation | null
): ClauseChipValue | undefined => {
  if (!rfi) return undefined;

  const number = stripClausePrefix(rfi.clauseNumber);
  const detail = rfi.clauseDescription?.trim();
  if (!number && !detail) return undefined;

  const line = [rfi.reference?.trim(), detail].filter(Boolean).join(DETAIL_SEPARATOR);

  return {
    label: number ? `${CLAUSE_PREFIX}${number}` : undefined,
    lines: line ? [line] : [],
  };
};
