import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { PROJECT_EMAIL_ENDPOINTS } from '../constants/compensation-event.constants';
import type { EntityConversationDto } from '../types/project-email-api.types';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const projectEmailService = {
  // `term` is the endpoint's own search over sender, subject and message body, so the
  // thread list is never filtered in the browser.
  getConversationsByEntity: (entityId: string, term?: string) =>
    AUSPIRA<EntityConversationDto[]>({
      url: buildUrl(
        PROJECT_EMAIL_ENDPOINTS.CONVERSATIONS_BY_ENTITY.replace(':entityId', entityId),
        { term: term?.trim() || undefined }
      ),
      method: 'GET',
      skipLoader: true, // background panel fetch — must not block the tab with the global overlay
    }),
};
