import type { ContractEntityType } from '@/constants/enum.constant';
import type { EventClauseOption, EventClauseResponseDto } from '../types/event-clause.types';

// The form holds the composite label ("60.1(1) - PM changes Works Information") and
// `splitContractClause` reads the number and title back off it for the payload, so the
// separator here has to stay in step with that helper.
export const toEventClauseLabel = (clause: EventClauseResponseDto): string =>
  [clause.clauseNumber?.trim(), clause.title?.trim()].filter(Boolean).join(' - ');

// `entityType` narrows the catalogue to one register's clauses — the EW → CE hand-off only
// offers Compensation Event clauses, for one. Left undefined, every clause on the project is offered.
export const toEventClauseOptions = (
  clauses?: EventClauseResponseDto[],
  entityType?: ContractEntityType
): EventClauseOption[] =>
  (clauses ?? [])
    .filter((clause) => entityType === undefined || clause.entityType === entityType)
    .map(toEventClauseLabel)
    .filter((label) => !!label)
    .map((label) => ({ label, value: label }));
