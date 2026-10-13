import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EarlyWarningFormValues } from '@/components/contract-control-agent/EarlyWarningNoticeFormOld';
import { API_ENDPOINTS } from '@/constants';
import { invalidateAlertQueries } from '@/hooks/modules/project-alerts';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions, IPaginatedApiResponse } from '@/types';

export const EARLY_WARNING_QUERY_KEY = ['early-warning'] as const;

/** Query params for GET /api/early-warnings/project/{projectId}. */
export interface EarlyWarningListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
}

/** Payload sent to the backend EarlyWarningNoticeDto — camelCase keys, date as YYYY-MM-DD. */
interface EarlyWarningNoticeDto {
  ewReference: string;
  date: string | null;
  projectName: string;
  contractReference: string;
  to: string;
  cc: string | null;
  bcc: string | null;
  subject: string;
  description: string;
  potentialImpacts: string;
  proposedMitigationAction: string;
}

const toEarlyWarningNoticeDto = (data: EarlyWarningFormValues): EarlyWarningNoticeDto => ({
  ewReference: data.ewReference,
  date: data.date ? data.date.format('YYYY-MM-DD') : null,
  projectName: data.projectName,
  contractReference: data.contractReference,
  to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
  cc: data.cc?.length ? data.cc.join(', ') : null,
  bcc: data.bcc?.length ? data.bcc.join(', ') : null,
  subject: data.subject,
  description: data.description,
  potentialImpacts: data.potentialImpacts ?? '',
  proposedMitigationAction: data.proposedMitigation ?? '',
});

export const createEarlyWarning = async ({ data }: { data: EarlyWarningFormValues }) => {
  return AUSPIRA<EarlyWarningNoticeDto>({
    url: API_ENDPOINTS.EARLY_WARNING.EARLY_WARNING,
    method: 'POST',
    body: toEarlyWarningNoticeDto(data),
    isPublic: true,
  });
};

export const useCreateEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEarlyWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/* -------------------- POST /api/early-warnings/accept -------------------- */

/**
 * Accepts a project alert and creates the Early Warning from it server-side — the counterpart to
 * `notAcceptProjectAlert`, which records the opposite decision. The whole payload is the alert id
 * plus its mail thread: everything else the EW needs is read off the alert on the backend, so
 * nothing from the register form is involved.
 */
export interface AcceptEarlyWarningPayload {
  projectAlertId: string;
  /** Mail-thread id off the alert. Optional — an alert ingested from a daily site report or the
   * weather feed has no conversation to link. */
  conversationId?: string | null;
}

export const acceptEarlyWarning = async ({
  projectAlertId,
  conversationId,
}: AcceptEarlyWarningPayload) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.EARLY_WARNING.ACCEPT,
    method: 'POST',
    body: { projectAlertId, conversationId: conversationId ?? undefined },
  });
};

export const useAcceptEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptEarlyWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
      // The alert itself changes state (and drops out of the awareness queue), so its cached
      // list/by-id entries are stale the moment this succeeds.
      invalidateAlertQueries(queryClient);
    },
  });
};

/* -------------------- GET early warnings for a project (paged) -------------------- */

export const getEarlyWarnings = async <T = IPaginatedApiResponse<any>>(
  projectId: string,
  params?: EarlyWarningListParams
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.EARLY_WARNING.LIST_BY_PROJECT.replace(':projectId', projectId), {
      skip: params?.skip,
      top: params?.top,
      term: params?.term?.trim(),
      includeAll: params?.includeAll,
    }),
    method: 'GET',
    skipLoader: true, // list fetch — avoid stacking the global overlay
  });
};

export const useGetEarlyWarnings = <T = IPaginatedApiResponse<any>>(
  {
    projectId,
    params,
    enabled,
  }: { projectId: string; params?: EarlyWarningListParams; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [
      ...EARLY_WARNING_QUERY_KEY,
      projectId,
      params?.skip ?? 0,
      params?.top ?? 10,
      params?.term ?? '',
      params?.includeAll ?? false,
    ],
    queryFn: async () => getEarlyWarnings<T>(projectId, params),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/* -------------------- GET /api/early-warnings/project/{projectId}/lookup -------------------- */

export interface EarlyWarningLookupItem {
  id: string;
  title: string;
  reference: string;
}

export const getEarlyWarningsLookup = async <T = EarlyWarningLookupItem[]>(projectId: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.EARLY_WARNING.LOOKUP_BY_PROJECT.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true, // lookup query — must not block pages with the global overlay
  });
};

export const useGetEarlyWarningsLookup = <T = EarlyWarningLookupItem[]>(
  { projectId, enabled }: { projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, 'lookup', projectId],
    queryFn: async () => getEarlyWarningsLookup<T>(projectId!),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/* -------------------- GET /api/early-warnings/{id} (by id, with lifecycle details) -------------------- */

export const getEarlyWarningById = async <T = any>(id: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.EARLY_WARNING.BY_ID.replace(':id', id),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetEarlyWarningById = <T = any>(
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, id],
    queryFn: async () => getEarlyWarningById<T>(id),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/* -------------------- GET /api/early-warnings/verify-reference -------------------- */

export interface VerifyEarlyWarningReferenceResult {
  referenceId: string;
  /** `true` when the reference does not already exist on the project — i.e. free to use. */
  isAvailable: boolean;
}

export const verifyEarlyWarningReference = async (
  reference: string,
  projectId?: string
): Promise<VerifyEarlyWarningReferenceResult> => {
  return AUSPIRA<VerifyEarlyWarningReferenceResult>({
    url: buildUrl(API_ENDPOINTS.EARLY_WARNING.VERIFY_REFERENCE, { reference, projectId }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useVerifyEarlyWarningReference = () =>
  useMutation({
    mutationFn: ({ reference, projectId }: { reference: string; projectId?: string }) =>
      verifyEarlyWarningReference(reference, projectId),
  });

/* -------------------- GET /api/early-warnings/{id}/conversations -------------------- */

export const getEarlyWarningConversations = async <T = any>(id: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.GLOBAL_APIS.PROJECT_EMAIL_CONVERSATIONS.replace(':id', id),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetEarlyWarningConversations = <T = any>(
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, id, 'conversations'],
    queryFn: async () => getEarlyWarningConversations<T>(id),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/* -------------------- GET /api/early-warnings/{id}/audit-trail -------------------- */

export interface EarlyWarningAuditTrailEntry {
  id: string;
  earlyWarningId: string;
  /**
   * Mirrors `EarlyWarningAuditActionType` — usually the enum name (e.g. "Created") but the
   * backend has also been observed sending the raw numeric value, so both shapes are handled.
   */
  actionType: string | number;
  /** Null unless the action ties to a lifecycle stage (e.g. `LifecycleCompleted`). */
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
  /** Email address the action originated from — null for actions taken directly in Auspira. */
  sender: string | null;
}

export const getEarlyWarningAuditTrail = async <T = EarlyWarningAuditTrailEntry[]>(id: string) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.GLOBAL_APIS.AUDIT_LOGS, { entityId: id }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetEarlyWarningAuditTrail = <T = EarlyWarningAuditTrailEntry[]>(
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...EARLY_WARNING_QUERY_KEY, id, 'audit-trail'],
    queryFn: async () => getEarlyWarningAuditTrail<T>(id),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/* -------------------- PATCH /api/early-warnings/{id}/mitigation-agreed -------------------- */

export const markEarlyWarningMitigationAgreed = async (id: string) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.EARLY_WARNING.MITIGATION_AGREED.replace(':id', id),
    method: 'PATCH',
  });
};

export const useMarkEarlyWarningMitigationAgreed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markEarlyWarningMitigationAgreed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/* -------------------- POST /api/early-warnings/close -------------------- */

export interface CloseEarlyWarningPayload {
  earlyWarningId: string;
  closingReason: string;
  closingNotes: string;
}

export const closeEarlyWarning = async (data: CloseEarlyWarningPayload) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.EARLY_WARNING.CLOSE,
    method: 'POST',
    body: data,
  });
};

export const useCloseEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeEarlyWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};

/* -------------------- POST /api/early-warnings/{id}/risk-reduction-meeting-invite -------------------- */

export interface RiskReductionMeetingInviteRequest {
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
  summary: string;
  message?: string;
}

export const sendRiskReductionMeetingInvite = async ({
  groupId,
  data,
}: {
  groupId: string;
  data: RiskReductionMeetingInviteRequest;
}) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.EARLY_WARNING.RISK_REDUCTION_MEETING_INVITE.replace(':id', groupId),
    method: 'POST',
    body: data,
  });
};

export const useSendRiskReductionMeetingInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendRiskReductionMeetingInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};
