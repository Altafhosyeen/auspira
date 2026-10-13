import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateAlertQueries } from '@/hooks/modules/project-alerts';
import type { HelperFunctions } from '@/types';
import { earlyWarningService } from '../services/early-warning.service';
import type {
  EarlyWarning,
  EarlyWarningListResponse,
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
  EarlyWarningMeetingDto,
  EarlyWarningProjectListParams,
  MarkMeetingActionCompleteDto,
  MeetingActionDto,
  MeetingDto,
  UpdateMeetingActionAssigneesPayload,
  UserLookupDto,
  VerifyEarlyWarningReferenceResult,
} from '../types/early-warning-api.types';

import { downloadBlob } from '../utils/early-warning.utils';
import { toEarlyWarning, toEarlyWarningListResponse } from '../utils/early-warning-api.utils';
import type { RrmDetailByIdDto } from '../utils/early-warning-rrm.utils';

// Same root key the legacy hooks use, so old and new pages share one cache while both exist.
export const EARLY_WARNING_QUERY_KEY = ['early-warning'] as const;

const fetchListByProject = async (
  projectId: string,
  params?: EarlyWarningProjectListParams
): Promise<EarlyWarningListResponse> =>
  toEarlyWarningListResponse(await earlyWarningService.getListByProject(projectId, params));

// Standalone fetch — used by the Excel export, which needs the full register regardless of the
// on-screen filter/page.
export const fetchEarlyWarnings = async (
  projectId: string,
  params?: EarlyWarningProjectListParams
): Promise<EarlyWarningListResponse> => fetchListByProject(projectId, params);

export const useGetEarlyWarnings = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: EarlyWarningProjectListParams; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarningListResponse>
) =>
  useQuery<EarlyWarningListResponse>({
    queryKey: [
      ...EARLY_WARNING_QUERY_KEY,
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.status ?? '',
      params?.includeAll ?? false,
    ],
    queryFn: () => fetchListByProject(projectId!, params),
    // Paging swaps the query key — hold the previous page rather than flash an empty table.
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

export const useGetEarlyWarningById = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarning>
) =>
  useQuery<EarlyWarning>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, id ?? ''],
    queryFn: async () => toEarlyWarning(await earlyWarningService.getById(id!)),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Lightweight id/reference/title list for pickers — one row per EW on the project. */
export const useGetEarlyWarningsLookup = (
  { projectId, enabled }: { projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarningLookupDto[]>
) =>
  useQuery<EarlyWarningLookupDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'lookup', projectId ?? ''],
    queryFn: () => earlyWarningService.getLookupByProject(projectId!),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/** Field-level check — resolves `true` when the reference is free on this project. */
export const useVerifyEarlyWarningReference = () =>
  useMutation({
    mutationFn: async ({ reference, projectId }: { reference: string; projectId?: string }) => {
      const result: VerifyEarlyWarningReferenceResult = await earlyWarningService.verifyReference(
        reference,
        projectId
      );
      return result?.isAvailable === true;
    },
  });

export const useRegisterEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      values: RegisterEarlyWarningFormValues;
      context: RegisterEarlyWarningContext;
    }) => earlyWarningService.register(input.values, input.context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
      // Registering settles the source alert, so its cache goes stale too.
      invalidateAlertQueries(queryClient);
    },
  });
};

/** Standalone fetch of an entity's attachments — used by the register sidebar's download action. */
export const fetchEarlyWarningAttachments = async (
  entityId: string,
  projectId: string
): Promise<EarlyWarningAttachmentDto[]> =>
  earlyWarningService.getAttachmentsByEntity(entityId, projectId);

/** Attachments hanging off an EW (or its originating alert) on a project. */
export const useGetEarlyWarningAttachments = (
  { entityId, projectId, enabled }: { entityId?: string; projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarningAttachmentDto[]>
) =>
  useQuery<EarlyWarningAttachmentDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'attachments', entityId ?? '', projectId ?? ''],
    queryFn: () => earlyWarningService.getAttachmentsByEntity(entityId!, projectId!),
    ...helpers,
    enabled: (enabled ?? true) && !!entityId && !!projectId,
  });

/** Download one attachment via its blob URL — fetches the file as a blob and saves it. */
export const useDownloadEarlyWarningAttachment = () =>
  useMutation({
    mutationFn: async ({ url, fileName }: { url: string; fileName: string }) => {
      const blob = await earlyWarningService.downloadAttachment(url);
      downloadBlob(blob, fileName);
    },
  });

// Open a stored attachment in a new tab — fetched as a blob because the endpoint is authenticated.
export const useViewEarlyWarningAttachment = () =>
  useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const blob = await earlyWarningService.downloadAttachment(url);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    },
  });

/** Full detail record — keeps the raw DTO so the lifecycles drive the detail view. */
export const useGetEarlyWarningDetail = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<ApiEarlyWarningDetail>
) =>
  useQuery<ApiEarlyWarningDetail>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'detail', id ?? ''],
    queryFn: () => earlyWarningService.getById(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Who did each lifecycle stage — the rows themselves carry no actor. */
export const useGetEarlyWarningAuditTrail = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarningAuditTrailEntry[]>
) =>
  useQuery<EarlyWarningAuditTrailEntry[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'audit-trail', id ?? ''],
    queryFn: () => earlyWarningService.getAuditTrail(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** The EW's mail threads, for the Evidence & Thread tab. */
export const useGetEarlyWarningConversations = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarningConversationDto[]>
) =>
  useQuery<EarlyWarningConversationDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'conversations', id ?? ''],
    queryFn: () => earlyWarningService.getConversations(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

export const useMarkEarlyWarningMitigationAgreed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => earlyWarningService.markMitigationAgreed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

export const useCloseEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      earlyWarningId: string;
      closingReason: string;
      closingNotes: string;
    }) => earlyWarningService.close(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/** A single risk-reduction meeting, with its meeting details + agreed actions. */
export const useGetRrmDetail = (
  { meetingId, enabled }: { meetingId?: string; enabled?: boolean },
  helpers?: HelperFunctions<RrmDetailByIdDto>
) =>
  useQuery<RrmDetailByIdDto>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'rrm', meetingId ?? ''],
    queryFn: () => earlyWarningService.getRiskReductionMeetingById(meetingId!),
    ...helpers,
    enabled: (enabled ?? true) && !!meetingId,
  });

/** Meetings recorded against an EW — used to open the first one from the detail header. */
export const useGetRrmMeetingsByEarlyWarningId = (
  { earlyWarningId, enabled }: { earlyWarningId?: string; enabled?: boolean },
  helpers?: HelperFunctions<EarlyWarningMeetingDto[]>
) =>
  useQuery<EarlyWarningMeetingDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'rrm', 'early-warning', earlyWarningId ?? ''],
    queryFn: () =>
      earlyWarningService.getRiskReductionMeetingsByEarlyWarningId<EarlyWarningMeetingDto[]>(
        earlyWarningId!
      ),
    ...helpers,
    enabled: (enabled ?? true) && !!earlyWarningId,
  });

export const useCompleteAgreedAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agreedActionId: string) =>
      earlyWarningService.completeAgreedAction(agreedActionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/** Get the list of agreed actions for risk reduction meetings tied to a specific early warning. */
export const useGetAgreedActionsByEarlyWarningId = (
  { earlyWarningId, enabled }: { earlyWarningId?: string; enabled?: boolean },
  helpers?: HelperFunctions<AgreedActionDto[]>
) =>
  useQuery<AgreedActionDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'agreed-actions', earlyWarningId ?? ''],
    queryFn: () => earlyWarningService.getAgreedActionsByEarlyWarningId(earlyWarningId!),
    ...helpers,
    enabled: (enabled ?? true) && !!earlyWarningId,
  });

/** Actions tied directly to a meeting (POST/GET /api/meeting-actions) */

export const useGetMeetingActionsByMeetingId = (
  { meetingId, enabled }: { meetingId?: string; enabled?: boolean },
  helpers?: HelperFunctions<MeetingActionDto[]>
) =>
  useQuery<MeetingActionDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'meeting-actions', meetingId ?? ''],
    queryFn: () => earlyWarningService.getMeetingActionsByMeetingId(meetingId!),
    ...helpers,
    enabled: (enabled ?? true) && !!meetingId,
  });

export const useCreateMeetingAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => earlyWarningService.createMeetingAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

export const useCompleteMeetingAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingActionId,
      payload,
    }: {
      meetingActionId: string;
      payload?: MarkMeetingActionCompleteDto;
    }) => earlyWarningService.completeMeetingAction(meetingActionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

export const useDeleteMeetingAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingActionId: string) =>
      earlyWarningService.deleteMeetingAction(meetingActionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

export const useUpdateMeetingActionAssignees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingActionId,
      payload,
    }: {
      meetingActionId: string;
      payload: UpdateMeetingActionAssigneesPayload;
    }) => earlyWarningService.updateMeetingActionAssignees(meetingActionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/** Fetch meetings for an early warning from GET /api/meetings/list/{entityId} */
export const useGetMeetingsByEarlyWarningId = (
  { earlyWarningId, enabled }: { earlyWarningId?: string; enabled?: boolean },
  helpers?: HelperFunctions<MeetingDto[]>
) =>
  useQuery<MeetingDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'meetings', earlyWarningId ?? ''],
    queryFn: () => earlyWarningService.getMeetingsByEarlyWarningId(earlyWarningId!),
    ...helpers,
    enabled: (enabled ?? true) && !!earlyWarningId,
  });

/** Fetch a single meeting by ID from GET /api/meetings/{meetingId} */
export const useGetMeetingById = (
  { meetingId, enabled }: { meetingId?: string; enabled?: boolean },
  helpers?: HelperFunctions<MeetingDto>
) =>
  useQuery<MeetingDto>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'meeting-detail', meetingId ?? ''],
    queryFn: () => earlyWarningService.getMeetingById(meetingId!),
    ...helpers,
    enabled: (enabled ?? true) && !!meetingId,
  });

/** Create meeting via POST /api/meetings (FormData) */
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => earlyWarningService.createMeeting(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/** Get users lookup for a project from GET /api/project-user/{projectId}/users/lookup */
export const useGetProjectUsersLookup = (
  { projectId, enabled }: { projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<UserLookupDto[]>
) =>
  useQuery<UserLookupDto[]>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'project-users-lookup', projectId ?? ''],
    queryFn: () => earlyWarningService.getProjectUsersLookup(projectId!),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });
