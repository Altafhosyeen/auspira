import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { PROGRAMME_ENDPOINTS } from '../constants/programme.constants';
import type {
  AcceptProgrammeInput,
  ProgrammeHealthResponseDto,
  ProgrammeListPageResultDto,
  ProgrammeListParams,
  ProgrammeSummaryPageResultDto,
} from '../types/programme.types';
import { toProgrammeListParams } from '../utils/programme-api.utils';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const programmeService = {
  // GET /api/programme/project/{projectId}/summary — the register's own columns (reference,
  // completion date, variance, health, raised by/at, status, file url), paged and searched
  // server-side. This is what the Program Health list screen renders.
  getSummaryByProject: (projectId: string, params?: ProgrammeListParams) =>
    AUSPIRA<ProgrammeSummaryPageResultDto>({
      url: buildUrl(
        PROGRAMME_ENDPOINTS.SUMMARY_BY_PROJECT.replace(':projectId', projectId),
        toProgrammeListParams(params)
      ),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  // GET /api/programme/{id} — one programme health record by its own id (the id the register
  // rows carry), so a row can open the detail without listing the whole project first.
  getById: (id: string) =>
    AUSPIRA<ProgrammeHealthResponseDto>({
      url: PROGRAMME_ENDPOINTS.GET_BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/programme/project/{projectId} — the full records behind the summary rows
  // (version, extractor json, conversationId, createdOn), which is what ties a record back to
  // the alert it was accepted from.
  getListByProject: (projectId: string, params?: ProgrammeListParams) =>
    AUSPIRA<ProgrammeListPageResultDto>({
      url: buildUrl(
        PROGRAMME_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId),
        toProgrammeListParams(params)
      ),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/attachments/download?url=... — bytes off the blob URL, saved by the caller.
  // A register row's `fileUrl` is a private storage URL, so opening it directly 404s.
  downloadAttachment: (url: string) =>
    AUSPIRA<Blob>({
      url: buildUrl(PROGRAMME_ENDPOINTS.DOWNLOAD_ATTACHMENT, { url }),
      method: 'GET',
      skipLoader: true,
      responseType: 'blob' as const,
    }),

  // POST /api/programme/accept (JSON) — accepts the programme behind a project alert and
  // stores it as a new ProgrammeHealth version, which is what puts the record on the Program
  // Health register. Unlike the Defect Notice and Daily Site Report accepts this one carries
  // no evidence: the body holds the alert id alone.
  accept: (input: AcceptProgrammeInput) =>
    AUSPIRA<void, AcceptProgrammeInput>({
      url: PROGRAMME_ENDPOINTS.ACCEPT,
      method: 'POST',
      body: input,
    }),
};
