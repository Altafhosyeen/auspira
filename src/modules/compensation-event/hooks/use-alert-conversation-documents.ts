import type { ProjectAlert } from '@/hooks/modules/project-alerts';
import { useConversationDocuments } from './use-conversation-documents';

// Documents & Communication on a screen opened from a signal: the alert names both the
// project it was raised on and the mail conversation it arrived on, which is everything
// the rail reads.
export const useAlertConversationDocuments = (alert?: ProjectAlert | null) =>
  useConversationDocuments({
    // The alert owns the project it was raised on; the hook falls back to the selected
    // project only when the alert carries none.
    projectId: alert?.projectId ?? undefined,
    conversationId: alert?.conversationId ?? undefined,
  });
