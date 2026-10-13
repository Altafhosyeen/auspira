import { AUSPIRA } from '@/lib/api/auspira-api';
import { EVENT_CLAUSE_ENDPOINTS } from '../constants/compensation-event.constants';
import type { EventClauseResponseDto } from '../types/event-clause.types';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const eventClauseService = {
  getListByProject: (projectId: string) =>
    AUSPIRA<EventClauseResponseDto[]>({
      url: EVENT_CLAUSE_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId),
      method: 'GET',
      skipLoader: true, // lookup query — must not block the form with the global overlay
    }),
};
