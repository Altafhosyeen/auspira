import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateAlertQueries, type ProjectAlert } from '@/hooks/modules/project-alerts';
import { COMPENSATION_EVENT_QUERY_KEY } from '@/modules/compensation-event';
import type { HelperFunctions, IMetaPaginatedResponse } from '@/types';
import type {
  AcceptCompensationEventPayload,
  AwarenessListParams,
  DiscardPayload,
  NotAcceptedPayload,
} from '../services/awareness.service';
import { awarenessService } from '../services/awareness.service';
import type { Signal } from '../types/awareness.types';
import { mapAlertToSignal } from '../utils/awareness.utils';

export const AWARENESS_QUERY_KEY = ['awareness'] as const;

export const useGetAwarenessSignals = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: AwarenessListParams; enabled?: boolean },
  helpers?: HelperFunctions<Signal[]>
) =>
  useQuery<Signal[]>({
    queryKey: [
      ...AWARENESS_QUERY_KEY,
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 10,
      params?.term ?? '',
    ],
    queryFn: async () => {
      const res: IMetaPaginatedResponse<ProjectAlert> = await awarenessService.getListByProject(
        projectId!,
        params
      );
      return (res?.items ?? []).map(mapAlertToSignal);
    },
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/** A single project alert (signal) for the review screen. */
export const useGetAwarenessAlert = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<ProjectAlert>
) =>
  useQuery<ProjectAlert>({
    queryKey: [...AWARENESS_QUERY_KEY, 'detail', id ?? ''],
    queryFn: () => awarenessService.getById(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Accept & register an Early Warning directly (no intermediate screen). */
export const useAcceptEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectAlertId,
      conversationId,
    }: {
      projectAlertId: string;
      conversationId?: string | null;
    }) => awarenessService.accept({ projectAlertId, conversationId }),
    onSuccess: () => {
      invalidateAlertQueries(queryClient);
    },
  });
};

/** Accept a Compensation Event signal — the backend creates the CE from the alert. */
export const useAcceptCompensationEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptCompensationEventPayload) =>
      awarenessService.acceptCompensationEvent(payload),
    onSuccess: () => {
      invalidateAlertQueries(queryClient);
      // Accepting creates the compensation event, and the screen routes straight to the CE
      // register — without this the register can paint from cache and miss the new event.
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
    },
  });
};

/** Record a signal as not accepted (or discarded — see `isNotAccept`). */
export const useNotAcceptedAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotAcceptedPayload) => awarenessService.notAccepted(payload),
    onSuccess: () => {
      invalidateAlertQueries(queryClient);
    },
  });
};

/** Soft-delete (discard) a signal. */
export const useDiscardAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DiscardPayload) => awarenessService.discard(payload),
    onSuccess: (_data, { projectAlertId }) => {
      // The review screen is still mounted while it navigates away, so its by-id query is held
      // back — refetching it would hit the alert this call just soft-deleted.
      invalidateAlertQueries(queryClient, projectAlertId);
    },
  });
};
