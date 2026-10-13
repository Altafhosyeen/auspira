import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { ATTACHMENT_ENDPOINTS } from '../constants/compensation-event.constants';
import type { AttachmentResponseDto } from '../types/compensation-event-api.types';

// Attachments are entity-agnostic on the backend — the Documents tab scopes them to
// the compensation event entity (entityId = CE id, entityType = CompensationEvent).
export const attachmentsService = {
  // `term` is the endpoint's own search over the file name and type, so the Documents
  // tab searches every attachment rather than the page already fetched.
  getAttachmentsByEntity: (entityId: string, projectId: string, term?: string) =>
    AUSPIRA<AttachmentResponseDto[]>({
      url: buildUrl(
        ATTACHMENT_ENDPOINTS.LIST_BY_ENTITY.replace(':entityId', entityId).replace(
          ':projectId',
          projectId
        ),
        { term: term?.trim() || undefined }
      ),
      method: 'GET',
      skipLoader: true, // tab-level list fetch — must not block the page with the global overlay
    }),

  // Fetches the file bytes for a blob storage URL — the endpoint streams the file, so
  // the response comes back as a Blob rather than JSON.
  download: (url: string) =>
    AUSPIRA<Blob>({
      url: buildUrl(ATTACHMENT_ENDPOINTS.DOWNLOAD, { url }),
      method: 'GET',
      skipLoader: true, // download runs in the background — no global overlay
      responseType: 'blob',
    }),
};
