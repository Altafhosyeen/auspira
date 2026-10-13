import { useQueries, useQuery } from '@tanstack/react-query';
import { getProjectEmailThread } from '@/hooks/modules/project-email-thread';
import { projectEmailService } from '../services/project-email.service';
import type { ProjectEmailMessageDto } from '../types/project-email-api.types';

export const PROJECT_EMAIL_QUERY_KEY = ['project-email'] as const;

/** Every conversation tied to an entity (e.g. a compensation event id). */
export const useGetEntityConversations = ({
  entityId,
  term,
  enabled,
}: {
  entityId?: string;
  term?: string;
  enabled?: boolean;
}) =>
  useQuery({
    // `term` belongs in the key — otherwise a search would read the unfiltered result
    // straight out of the cache.
    queryKey: [...PROJECT_EMAIL_QUERY_KEY, 'conversations', entityId ?? '', term ?? ''],
    queryFn: () => projectEmailService.getConversationsByEntity(entityId!, term),
    // Keeps the previous rows on screen while a new term is in flight, so the list
    // does not flash empty between keystrokes.
    placeholderData: (previous) => previous,
    enabled: (enabled ?? true) && !!entityId,
  });

// Resolves every conversation tied to a compensation event, then fetches each one's
// full thread in parallel. A CE is not guaranteed to have exactly one conversation, so
// the tab shows every message across all of them rather than picking just one.
export const useGetCompensationEventEmailThread = ({
  compensationEventId,
  projectId,
  enabled,
}: {
  compensationEventId?: string;
  projectId?: string;
  enabled?: boolean;
}) => {
  const conversations = useGetEntityConversations({
    entityId: compensationEventId,
    enabled,
  });
  const conversationIds = conversations.data?.map((item) => item.conversationId) ?? [];

  const threadQueries = useQueries({
    queries: conversationIds.map((conversationId) => ({
      queryKey: [...PROJECT_EMAIL_QUERY_KEY, 'thread', projectId ?? '', conversationId],
      queryFn: () =>
        getProjectEmailThread<ProjectEmailMessageDto[]>({
          projectId: projectId!,
          conversationId,
          includeAll: true,
        }),
      enabled: (enabled ?? true) && !!projectId,
    })),
  });

  return {
    messages: threadQueries.flatMap((query) => query.data ?? []),
    isLoading: conversations.isLoading || threadQueries.some((query) => query.isLoading),
  };
};
