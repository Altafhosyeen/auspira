import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { PROJECT_DAILY_REPORT_ENDPOINTS } from '../constants/project-daily-report.constants';
import type {
  AcceptDailySiteReportInput,
  DailySiteReportAttachmentDto,
  DailySiteReportAuditEntryDto,
  DailySiteReportConversationDto,
  DailySiteReportPageResultDto,
  DailySiteReportResponseDto,
  ProjectDailyReportListParams,
} from '../types/project-daily-report.types';
import {
  toAcceptDailySiteReportFormData,
  toProjectDailyReportListParams,
} from '../utils/project-daily-report-api.utils';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const projectDailyReportService = {
  /** GET /api/daily-site-reports/project/{projectId} — the paged register. */
  getListByProject: (projectId: string, params?: ProjectDailyReportListParams) =>
    AUSPIRA<DailySiteReportPageResultDto>({
      url: buildUrl(
        PROJECT_DAILY_REPORT_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId),
        toProjectDailyReportListParams(params)
      ),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  /** GET /api/daily-site-reports/{id} — one report, for the detail screen. */
  getById: (id: string) =>
    AUSPIRA<DailySiteReportResponseDto>({
      url: PROJECT_DAILY_REPORT_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/audit-logs?entityId= — the shared audit trail for the report. `term` is matched
  // against details and username, `actionType` narrows to one action — both are the
  // endpoint's own, so neither is filtered in the browser.
  getAuditTrail: (id: string, term?: string, actionType?: number) =>
    AUSPIRA<DailySiteReportAuditEntryDto[]>({
      url: buildUrl(PROJECT_DAILY_REPORT_ENDPOINTS.AUDIT_TRAIL, {
        entityId: id,
        term: term?.trim() || undefined,
        actionType,
      }),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/attachments/{entityId}/projects/{projectId} — files hanging off the report.
  // `term` is the endpoint's own search over the file name and type, so filtering stays
  // server-side, exactly as the Defect Notice Documents tab reads the same route.
  getAttachmentsByEntity: (entityId: string, projectId: string, term?: string) =>
    AUSPIRA<DailySiteReportAttachmentDto[]>({
      url: buildUrl(
        PROJECT_DAILY_REPORT_ENDPOINTS.PROJECT_ATTACHMENTS.replace(':entityId', entityId).replace(
          ':projectId',
          projectId
        ),
        { term: term?.trim() || undefined }
      ),
      method: 'GET',
      skipLoader: true,
    }),

  /** GET /api/attachments/download?url=... — bytes off the blob URL, saved by the caller. */
  downloadAttachment: (url: string) =>
    AUSPIRA<Blob>({
      url: buildUrl(PROJECT_DAILY_REPORT_ENDPOINTS.DOWNLOAD_ATTACHMENT, { url }),
      method: 'GET',
      skipLoader: true,
      responseType: 'blob' as const,
    }),

  /** POST /api/daily-site-reports/accept (multipart) — creates the report from a project alert. */
  accept: (input: AcceptDailySiteReportInput) =>
    AUSPIRA<void, FormData>({
      url: PROJECT_DAILY_REPORT_ENDPOINTS.ACCEPT,
      method: 'POST',
      body: toAcceptDailySiteReportFormData(input),
      isMultipart: true,
    }),

  // GET /api/project-emails/{entityId}/conversations — the report's mail-thread summaries.
  // The route is entity-scoped: it takes the record's own id, exactly as the PMI/EW/CE/DN
  // Email tabs pass theirs, not the report's `projectEmailId`.
  getConversations: (entityId: string, term?: string) =>
    AUSPIRA<DailySiteReportConversationDto[]>({
      url: buildUrl(PROJECT_DAILY_REPORT_ENDPOINTS.CONVERSATIONS.replace(':entityId', entityId), {
        term: term?.trim() || undefined,
      }),
      method: 'GET',
      skipLoader: true,
    }),
};
