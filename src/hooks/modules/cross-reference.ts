import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProjectCrossReference,
  ProjectCrossReferenceGroup,
} from '@/components/module/project/third-step/cross-reference/types';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types/custom.types';

export const CROSS_REFERENCE_QUERY_KEY = ['cross-reference'] as const;

/* -------------------- GET a single cross-reference by id -------------------- */

export const getCrossReferenceById = async <T = ProjectCrossReference>(
  projectCrossReferenceId: string
) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.CROSS_REFERENCE.BY_ID.replace(
      ':projectCrossReferenceId',
      projectCrossReferenceId
    ),
    method: 'GET',
    skipLoader: true, // consumer (the view modal) renders its own loading state
  });
};

export const useGetCrossReferenceById = <T = ProjectCrossReference>(
  { projectCrossReferenceId, enabled }: { projectCrossReferenceId: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...CROSS_REFERENCE_QUERY_KEY, projectCrossReferenceId, 'by-id'],
    queryFn: async () => getCrossReferenceById<T>(projectCrossReferenceId),
    ...helpers,
    enabled, // Only run if id is provided
  });

/* -------------------- GET unresolved cross-reference groups -------------------- */

export const getUnresolvedCrossReferenceGroups = async <T = ProjectCrossReferenceGroup[]>(
  projectId: string
) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.CROSS_REFERENCE.UNRESOLVED_GROUPS.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state — avoid stacking the global overlay
  });
};

export const useGetUnresolvedCrossReferenceGroups = <T = ProjectCrossReferenceGroup[]>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...CROSS_REFERENCE_QUERY_KEY, id, 'unresolved', 'groups'],
    queryFn: async () => getUnresolvedCrossReferenceGroups<T>(id),
    staleTime: 0,
    ...helpers,
    enabled, // Only run if id is provided
  });

/* -------------------- GET all cross-reference groups -------------------- */

export const getCrossReferenceGroups = async <T = ProjectCrossReferenceGroup[]>(
  projectId: string
) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.CROSS_REFERENCE.GROUPS.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state — avoid stacking the global overlay
  });
};

export const useGetCrossReferenceGroups = <T = ProjectCrossReferenceGroup[]>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...CROSS_REFERENCE_QUERY_KEY, id, 'groups'],
    queryFn: async () => getCrossReferenceGroups<T>(id),
    staleTime: 0,
    ...helpers,
    enabled, // Only run if id is provided
  });

/* -------------------- PATCH mark a cross-reference resolved -------------------- */

export const markCrossReferenceResolved = async ({
  projectCrossReferenceId,
}: {
  projectCrossReferenceId: string;
}) => {
  return AUSPIRA({
    url: API_ENDPOINTS.CROSS_REFERENCE.MARK_RESOLVED.replace(
      ':projectCrossReferenceId',
      projectCrossReferenceId
    ),
    method: 'PATCH',
  });
};

export const useMarkCrossReferenceResolved = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markCrossReferenceResolved,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CROSS_REFERENCE_QUERY_KEY });
    },
  });
};

/* -------------------- PATCH set a cross-reference as contract route -------------------- */

export const setCrossReferenceContractRoute = async ({
  projectCrossReferenceId,
}: {
  projectCrossReferenceId: string;
}) => {
  return AUSPIRA({
    url: API_ENDPOINTS.CROSS_REFERENCE.SET_CONTRACT_ROUTE.replace(
      ':projectCrossReferenceId',
      projectCrossReferenceId
    ),
    method: 'PATCH',
  });
};

export const useSetCrossReferenceContractRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setCrossReferenceContractRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CROSS_REFERENCE_QUERY_KEY });
    },
  });
};

/* -------------------- PATCH update a cross-reference value -------------------- */

/** Payload for the update-value endpoint — the check id + the chosen/entered value. */
export interface UpdateCrossReferenceValueDto {
  projectCrossReferenceId: string;
  value: string;
}

export const updateCrossReferenceValue = async (body: UpdateCrossReferenceValueDto) => {
  return AUSPIRA<unknown, UpdateCrossReferenceValueDto>({
    url: API_ENDPOINTS.CROSS_REFERENCE.UPDATE_VALUE,
    method: 'PATCH',
    body,
  });
};

export const useUpdateCrossReferenceValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCrossReferenceValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CROSS_REFERENCE_QUERY_KEY });
    },
  });
};

/* -------------------- POST send a cross-reference clarification email -------------------- */

/** Payload for the send-email endpoint — recipients + the cross-reference being queried. */
export interface SendCrossReferenceEmailDto {
  to: string;
  cc?: string;
  bcc?: string;
  projectCrossReferenceId: string;
  description: string;
}

export const sendCrossReferenceEmail = async (body: SendCrossReferenceEmailDto) => {
  return AUSPIRA<unknown, SendCrossReferenceEmailDto>({
    url: API_ENDPOINTS.CROSS_REFERENCE.SEND_EMAIL,
    method: 'POST',
    body,
  });
};

export const useSendCrossReferenceEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendCrossReferenceEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CROSS_REFERENCE_QUERY_KEY });
    },
  });
};

/* -------------------- GET keys descriptions metadata -------------------- */

export const getKeysDescriptions = async <T = Record<string, string>>(projectId: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.CROSS_REFERENCE.KEYS_DESCRIPTIONS.replace(':id', projectId),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state — avoid stacking the global overlay
  });
};

export const useGetKeysDescriptions = <T = Record<string, string>>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...CROSS_REFERENCE_QUERY_KEY, id, 'keys-descriptions'],
    queryFn: async () => getKeysDescriptions<T>(id),
    ...helpers,
    enabled, // Only run if id is provided
  });

/* -------------------- GET a cross-reference's audit trail -------------------- */

export const getCrossReferenceAuditTrail = async <T = unknown[]>(
  projectCrossReferenceId: string
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.GLOBAL_APIS.AUDIT_LOGS, { entityId: projectCrossReferenceId }),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state — avoid stacking the global overlay
  });
};

export const useGetCrossReferenceAuditTrail = <T = unknown[]>(
  { projectCrossReferenceId, enabled }: { projectCrossReferenceId: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...CROSS_REFERENCE_QUERY_KEY, projectCrossReferenceId, 'audit-trail'],
    queryFn: async () => getCrossReferenceAuditTrail<T>(projectCrossReferenceId),
    staleTime: 0,
    ...helpers,
    enabled, // Only run if id is provided
  });
