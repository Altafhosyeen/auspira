import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { EARLY_WARNING_ENDPOINTS } from '../constants/early-warning.constants';
import type {
  RegisterEarlyWarningContext,
  RegisterEarlyWarningFormValues,
} from '../types/early-warning.types';
import type {
  AgreedActionDto,
  ApiEarlyWarningDetail,
  EarlyWarningAttachmentDto,
  EarlyWarningAuditTrailEntry,
  EarlyWarningConversationDto,
  EarlyWarningLookupDto,
  EarlyWarningPageResultDto,
  EarlyWarningProjectListParams,
  MarkMeetingActionCompleteDto,
  MeetingActionDto,
  MeetingDto,
  RegisterEarlyWarningRequest,
  UpdateMeetingActionAssigneesPayload,
  UserLookupDto,
  VerifyEarlyWarningReferenceResult,
} from '../types/early-warning-api.types';

import { toRegisterEarlyWarningFormData } from '../utils/early-warning-api.utils';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const earlyWarningService = {
  getListByProject: (projectId: string, params?: EarlyWarningProjectListParams) =>
    AUSPIRA<EarlyWarningPageResultDto>({
      url: buildUrl(EARLY_WARNING_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId), {
        skip: params?.skip,
        top: params?.top,
        term: params?.term?.trim(),
        includeAll: params?.includeAll,
        status: params?.status,
      }),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  getLookupByProject: (projectId: string) =>
    AUSPIRA<EarlyWarningLookupDto[]>({
      url: EARLY_WARNING_ENDPOINTS.LOOKUP_BY_PROJECT.replace(':projectId', projectId),
      method: 'GET',
      skipLoader: true, // lookup query — must not block pages with the global overlay
    }),

  getById: (id: string) =>
    AUSPIRA<ApiEarlyWarningDetail>({
      url: EARLY_WARNING_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  verifyReference: (reference: string, projectId?: string) =>
    AUSPIRA<VerifyEarlyWarningReferenceResult>({
      url: buildUrl(EARLY_WARNING_ENDPOINTS.VERIFY_REFERENCE, {
        reference,
        projectId,
      }),
      method: 'GET',
      skipLoader: true, // field-level validation — must not block the form
    }),

  register: (values: RegisterEarlyWarningFormValues, context: RegisterEarlyWarningContext) =>
    AUSPIRA<RegisterEarlyWarningRequest>({
      url: EARLY_WARNING_ENDPOINTS.REGISTER,
      method: 'POST',
      // Real FormData — the axios interceptor picks the multipart content type off
      // `data instanceof FormData`, not off `isMultipart` alone.
      body: toRegisterEarlyWarningFormData(values, context),
      isMultipart: true,
    }),

  getAttachmentsByEntity: (entityId: string, projectId: string) =>
    AUSPIRA<EarlyWarningAttachmentDto[]>({
      url: EARLY_WARNING_ENDPOINTS.PROJECT_ATTACHMENTS.replace(':entityId', entityId).replace(
        ':projectId',
        projectId
      ),
      method: 'GET',
      skipLoader: true, // background fetch — must not block the form with the global overlay
    }),

  /** Blob response so the file can be saved, not parsed as JSON. */
  downloadAttachment: (url: string) =>
    AUSPIRA<Blob>({
      url: buildUrl(EARLY_WARNING_ENDPOINTS.DOWNLOAD_ATTACHMENT, { url }),
      method: 'GET',
      skipLoader: true,
      responseType: 'blob' as const,
    }),

  getAuditTrail: (id: string) =>
    AUSPIRA<EarlyWarningAuditTrailEntry[]>({
      url: buildUrl(EARLY_WARNING_ENDPOINTS.AUDIT_TRAIL, { entityId: id }),
      method: 'GET',
      skipLoader: true,
    }),

  getConversations: (id: string) =>
    AUSPIRA<EarlyWarningConversationDto[]>({
      url: EARLY_WARNING_ENDPOINTS.CONVERSATIONS.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  markMitigationAgreed: (id: string) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.MITIGATION_AGREED.replace(':id', id),
      method: 'PATCH',
    }),

  close: (payload: { earlyWarningId: string; closingReason: string; closingNotes: string }) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.CLOSE,
      method: 'POST',
      body: payload,
    }),

  getRiskReductionMeetingById: <T>(riskReductionMeetingId: string) =>
    AUSPIRA<T>({
      url: EARLY_WARNING_ENDPOINTS.RRM_DETAIL.replace(
        ':riskReductionMeetingId',
        riskReductionMeetingId
      ),
      method: 'GET',
      skipLoader: true,
    }),

  getRiskReductionMeetingsByEarlyWarningId: <T>(earlyWarningId: string) =>
    AUSPIRA<T>({
      url: EARLY_WARNING_ENDPOINTS.RRM_BY_EARLY_WARNING.replace(':earlyWarningId', earlyWarningId),
      method: 'GET',
      skipLoader: true,
    }),

  completeAgreedAction: (agreedActionId: string) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.RRM_AGREED_ACTION_COMPLETE.replace(
        ':agreedActionId',
        agreedActionId
      ),
      method: 'PATCH',
    }),

  getAgreedActionsByEarlyWarningId: (earlyWarningId: string) =>
    AUSPIRA<AgreedActionDto[]>({
      url: EARLY_WARNING_ENDPOINTS.AGREED_ACTIONS_BY_EW.replace(':earlyWarningId', earlyWarningId),
      method: 'GET',
      skipLoader: true,
    }),

  getMeetingActionsByMeetingId: (meetingId: string) =>
    AUSPIRA<MeetingActionDto[]>({
      url: EARLY_WARNING_ENDPOINTS.MEETING_ACTIONS_BY_MEETING.replace(':meetingId', meetingId),
      method: 'GET',
      skipLoader: true,
    }),

  createMeetingAction: (formData: FormData) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.MEETING_ACTIONS,
      method: 'POST',
      body: formData,
      isMultipart: true,
    }),

  completeMeetingAction: (meetingActionId: string, payload?: MarkMeetingActionCompleteDto) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.MEETING_ACTION_COMPLETE.replace(
        ':meetingActionId',
        meetingActionId
      ),
      method: 'POST',
      body: payload ?? {},
    }),

  deleteMeetingAction: (meetingActionId: string) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.MEETING_ACTION_BY_ID.replace(
        ':meetingActionId',
        meetingActionId
      ),
      method: 'DELETE',
    }),

  updateMeetingActionAssignees: (
    meetingActionId: string,
    payload: UpdateMeetingActionAssigneesPayload
  ) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.MEETING_ACTION_BY_ID.replace(
        ':meetingActionId',
        meetingActionId
      ),
      method: 'PUT',
      body: payload,
    }),

  getMeetingsByEarlyWarningId: (earlyWarningId: string) =>
    AUSPIRA<MeetingDto[]>({
      url: EARLY_WARNING_ENDPOINTS.MEETINGS_BY_EARLY_WARNING.replace(':entityId', earlyWarningId),
      method: 'GET',
      skipLoader: true,
    }),

  getMeetingById: (meetingId: string) =>
    AUSPIRA<MeetingDto>({
      url: EARLY_WARNING_ENDPOINTS.MEETING_BY_ID.replace(':meetingId', meetingId),
      method: 'GET',
      skipLoader: true,
    }),

  createMeeting: (formData: FormData) =>
    AUSPIRA<void>({
      url: EARLY_WARNING_ENDPOINTS.MEETINGS,
      method: 'POST',
      body: formData,
      isMultipart: true,
    }),

  getProjectUsersLookup: (projectId: string) =>
    AUSPIRA<UserLookupDto[]>({
      url: EARLY_WARNING_ENDPOINTS.PROJECT_USERS_LOOKUP.replace(':id', projectId),
      method: 'GET',
      skipLoader: true,
    }),
};
