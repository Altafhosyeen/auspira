import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { DEFECT_NOTICE_ENDPOINTS } from '../constants/defect-notice.constants';
import type {
  AcceptDefectNoticeInput,
  CloseDefectNoticeInput,
  DefectNoticeFormValues,
  DefectNoticeListParams,
  DefectNoticePageResultDto,
  DefectNoticeResponseDto,
} from '../types/defect-notice.types';
import { toDefectNoticeListParams } from '../utils/defect-notice-api.utils';
import type { CreateDefectNoticeContext } from '../utils/defect-notice-form.utils';
import {
  toAcceptDefectNoticeFormData,
  toCreateDefectNoticeFormData,
  toCreateDefectNoticeRequest,
} from '../utils/defect-notice-form.utils';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const defectNoticeService = {
  /** GET /api/defect-notices/project/{projectId} — the paged register. */
  getListByProject: (projectId: string, params?: DefectNoticeListParams) =>
    AUSPIRA<DefectNoticePageResultDto>({
      url: buildUrl(
        DEFECT_NOTICE_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId),
        toDefectNoticeListParams(params)
      ),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  getById: (id: string) =>
    AUSPIRA<DefectNoticeResponseDto>({
      url: DEFECT_NOTICE_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/audit-logs?entityId= — the shared audit trail for the notice. `term` is
  // matched against details and username, `actionType` narrows to one action — both are
  // the endpoint's own, so neither is filtered in the browser.
  getAuditTrail: (id: string, term?: string, actionType?: number) =>
    AUSPIRA<
      Array<{
        id: string;
        actionType: string | number;
        stage: string | null;
        performedBy: string;
        performedByUserFullName: string | null;
        createdOn: string;
        details: string | null;
        sender?: string | null;
      }>
    >({
      url: buildUrl(DEFECT_NOTICE_ENDPOINTS.AUDIT_TRAIL, {
        entityId: id,
        term: term?.trim() || undefined,
        actionType,
      }),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/attachments/:entityId/projects/:projectId — files hanging off the notice.
  // `term` is the endpoint's own search over the file name and type, so filtering stays
  // server-side, exactly as the Compensation Event Documents tab reads the same route.
  getAttachmentsByEntity: (entityId: string, projectId: string, term?: string) =>
    AUSPIRA<
      Array<{
        id: string;
        projectId: string;
        entityId: string;
        entityType: number;
        fileName: string;
        fileExtension: string | null;
        /** The blob storage URL — pass this to the download endpoint as its `url` query. */
        filePath: string;
        fileSizeBytes: number | string;
        fileSizeMb: number | string;
        uploadedAt: string;
        role: number;
        uploadedByName: string;
        isEmailAttachment: boolean;
      }>
    >({
      url: buildUrl(
        DEFECT_NOTICE_ENDPOINTS.PROJECT_ATTACHMENTS.replace(':entityId', entityId).replace(
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
      url: buildUrl(DEFECT_NOTICE_ENDPOINTS.DOWNLOAD_ATTACHMENT, { url }),
      method: 'GET',
      skipLoader: true,
      responseType: 'blob' as const,
    }),

  // GET /api/project-emails/:entityId/conversations — the notice's mail-thread summaries.
  // The route is entity-scoped: it takes the record's own id, exactly as the PMI/EW/CE
  // Email tabs pass theirs, not the notice's `projectEmailId`. `term` is the endpoint's own
  // search over sender, subject and message body.
  getConversations: (entityId: string, term?: string) =>
    AUSPIRA<
      Array<{
        conversationId: string;
        subject: string;
        body: string;
        senderEmail: string | null;
        timestampUtc: string;
        count: number | string;
      }>
    >({
      url: buildUrl(DEFECT_NOTICE_ENDPOINTS.CONVERSATIONS.replace(':id', entityId), {
        term: term?.trim() || undefined,
      }),
      method: 'GET',
      skipLoader: true,
    }),

  /** GET /api/meetings/list/{entityId} — meetings booked against the notice. */
  getMeetingsByEntity: (entityId: string) =>
    AUSPIRA<
      Array<{
        id: string;
        subject: string;
        agenda?: string | null;
        startTime: string;
        endTime: string;
        timeZone?: string | null;
        location?: string | null;
        isOnlineMeeting: boolean;
        onlineMeetingUrl?: string | null;
        conversationId?: string | null;
        createdByName?: string | null;
        actionsCount?: number | string;
      }>
    >({
      url: DEFECT_NOTICE_ENDPOINTS.MEETINGS_BY_ENTITY.replace(':entityId', entityId),
      method: 'GET',
      skipLoader: true,
    }),

  // POST /api/meetings/defect-notice (form-urlencoded) — schedules a meeting against the
  // notice. Same payload the EW booking sends, keyed on `DefectNoticeId` instead of
  // `EarlyWarningId`; the EW modal's FormData binds identically under axios's
  // form-urlencoded handling, so it is forwarded as-is.
  createMeeting: (formData: FormData) =>
    AUSPIRA<void>({
      url: DEFECT_NOTICE_ENDPOINTS.CREATE_MEETING,
      method: 'POST',
      body: formData,
      isMultipart: true,
    }),

  /** POST /api/defect-notices (multipart) — raises a notice manually from the form. */
  create: (values: DefectNoticeFormValues, context: CreateDefectNoticeContext) =>
    AUSPIRA<void, FormData>({
      url: DEFECT_NOTICE_ENDPOINTS.REGISTER,
      method: 'POST',
      body: toCreateDefectNoticeFormData(toCreateDefectNoticeRequest(values, context)),
      isMultipart: true,
    }),

  /** POST /api/defect-notices/close (JSON) — marks the notice closed. */
  close: (input: CloseDefectNoticeInput) =>
    AUSPIRA<void, CloseDefectNoticeInput>({
      url: DEFECT_NOTICE_ENDPOINTS.CLOSE,
      method: 'POST',
      body: input,
    }),

  /** POST /api/defect-notices/accept (multipart) — creates the notice from a project alert. */
  accept: (input: AcceptDefectNoticeInput) =>
    AUSPIRA<void, FormData>({
      url: DEFECT_NOTICE_ENDPOINTS.ACCEPT,
      method: 'POST',
      body: toAcceptDefectNoticeFormData(input),
      isMultipart: true,
    }),
};
