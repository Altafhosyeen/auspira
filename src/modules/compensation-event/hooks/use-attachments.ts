import { useMutation, useQuery } from '@tanstack/react-query';
import type { HelperFunctions } from '@/types';
import { attachmentsService } from '../services/attachments.service';
import type { CompensationEventEvidenceFile } from '../types/compensation-event.types';
import { toEvidenceFile } from '../utils/compensation-event-api.utils';

export const ATTACHMENTS_QUERY_KEY = ['attachment'] as const;

/** GET /api/attachments/{entityId}/projects/{projectId} — the Documents tab's file list. */
export const useGetAttachmentsByEntity = (
  {
    entityId,
    projectId,
    term,
    enabled,
  }: { entityId?: string; projectId?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<CompensationEventEvidenceFile[]>
) =>
  useQuery<CompensationEventEvidenceFile[]>({
    // `term` belongs in the key — without it every search would read the previous
    // result straight out of the cache instead of re-querying.
    queryKey: [...ATTACHMENTS_QUERY_KEY, entityId ?? '', projectId ?? '', term ?? ''],
    queryFn: async () =>
      (await attachmentsService.getAttachmentsByEntity(entityId!, projectId!, term)).map(
        toEvidenceFile
      ),
    // Keeps the previous rows on screen while a new term is in flight, so the list
    // does not flash empty between keystrokes.
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!entityId && !!projectId,
  });

/** GET /api/attachments/download?url=... — fetches a file's bytes off its blob URL. */
export const useDownloadAttachment = () =>
  useMutation({
    mutationFn: (url: string) => attachmentsService.download(url),
  });
