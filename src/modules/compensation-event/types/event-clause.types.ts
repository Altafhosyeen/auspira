import type { ContractEntityType } from '@/constants/enum.constant';

// Wire shape for GET /api/event-clauses/project/{projectId}.
export interface EventClauseResponseDto {
  id: string;
  projectId: string;
  clauseNumber: string;
  title: string;
  description: string;
  // Which register the clause belongs to, following `ContractEntityType`
  // (1 = Early Warning, 2 = PMI, 3 = Compensation Event).
  entityType: ContractEntityType;
  createdOn: string;
  updatedOn: string | null;
}

export interface EventClauseOption {
  label: string;
  value: string;
}
