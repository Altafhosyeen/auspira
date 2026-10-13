import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { ContractEntityType } from '@/constants/enum.constant';
import { eventClauseService } from '../services/event-clause.service';
import type { EventClauseOption, EventClauseResponseDto } from '../types/event-clause.types';
import { toEventClauseOptions } from '../utils/event-clause.utils';

export const EVENT_CLAUSE_QUERY_KEY = ['event-clause'] as const;

// Clause catalogue for a project, mapped to the antd Select options the notice form takes.
// `entityType` filters the catalogue down to one register's clauses (the EW → CE modal offers
// Compensation Event clauses only). It stays out of the query key on purpose: the request is the
// same either way, so every caller shares one cache entry and narrows it in `select`.
export const useGetEventClauseOptions = ({
  projectId,
  entityType,
  enabled,
}: {
  projectId?: string;
  entityType?: ContractEntityType;
  enabled?: boolean;
}) => {
  // Stable across renders so React Query can memoise the mapped list — an options array with a
  // fresh identity every render would re-run every consumer's `useMemo` for nothing.
  const select = useCallback(
    (clauses: EventClauseResponseDto[]) => toEventClauseOptions(clauses, entityType),
    [entityType]
  );

  return useQuery<EventClauseResponseDto[], Error, EventClauseOption[]>({
    queryKey: [...EVENT_CLAUSE_QUERY_KEY, projectId ?? ''],
    queryFn: () => eventClauseService.getListByProject(projectId!),
    select,
    enabled: (enabled ?? true) && !!projectId,
  });
};
