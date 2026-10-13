import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useGetAttachmentsByEntity, useGetEntityConversations } from '@/modules/compensation-event';
import type { HelperFunctions } from '@/types';
import { USE_MOCK_REQUEST_FOR_INFORMATION } from '../constants/request-for-information.constants';
import {
  MOCK_REQUEST_FOR_INFORMATION_DOCUMENTS,
  MOCK_REQUEST_FOR_INFORMATION_LIST,
  MOCK_REQUEST_FOR_INFORMATION_THREAD,
} from '../mocks/request-for-information.mock';
import { requestForInformationService } from '../services/request-for-information.service';
import type {
  CreateRequestForInformationInput,
  RequestForInformation,
  RequestForInformationListResponse,
  UpdateRequestForInformationInput,
} from '../types/request-for-information.types';
import type { RequestForInformationProjectListParams } from '../types/request-for-information-api.types';
import {
  filterRequestForInformationList,
  paginateRequestForInformationList,
  toRequestForInformationThread,
} from '../utils/request-for-information.utils';
import {
  toRequestForInformation,
  toRequestForInformationListResponse,
} from '../utils/request-for-information-api.utils';

export const REQUEST_FOR_INFORMATION_QUERY_KEY = ['request-for-information'] as const;

// `count` is the number of rows the search/status filter matched — not the page length —
// so the table's pagination and "Showing x to y of z" line stay honest while the register
// runs on mock data.
const toMockListResponse = (
  params?: RequestForInformationProjectListParams
): RequestForInformationListResponse => {
  const matches = filterRequestForInformationList(MOCK_REQUEST_FOR_INFORMATION_LIST, params);

  return {
    count: matches.length,
    next: null,
    previous: null,
    items: paginateRequestForInformationList(matches, params),
  };
};

// The backend RFI endpoints are not live yet — `USE_MOCK_REQUEST_FOR_INFORMATION` skips
// the API call entirely and resolves the module's mock rows, so the register renders
// without depending on a backend that doesn't exist. Remove this branch once the real
// API ships.
export const getRequestForInformationList = async (
  projectId: string,
  params?: RequestForInformationProjectListParams
): Promise<RequestForInformationListResponse> => {
  if (USE_MOCK_REQUEST_FOR_INFORMATION) return toMockListResponse(params);

  return toRequestForInformationListResponse(
    await requestForInformationService.getListByProject(projectId, params)
  );
};

export const useGetRequestForInformationList = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: RequestForInformationProjectListParams; enabled?: boolean },
  helpers?: HelperFunctions<RequestForInformationListResponse>
) =>
  useQuery<RequestForInformationListResponse>({
    queryKey: [
      ...REQUEST_FOR_INFORMATION_QUERY_KEY,
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.includeAll ?? false,
      params?.statuses?.join(',') ?? '',
    ],
    queryFn: () => getRequestForInformationList(projectId!, params),
    ...helpers,
    enabled: (enabled ?? true) && (USE_MOCK_REQUEST_FOR_INFORMATION || !!projectId),
  });

export const useGetRequestForInformationById = (
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<RequestForInformation>
) =>
  useQuery<RequestForInformation>({
    queryKey: [...REQUEST_FOR_INFORMATION_QUERY_KEY, id],
    queryFn: async () => {
      if (USE_MOCK_REQUEST_FOR_INFORMATION) {
        const mock = MOCK_REQUEST_FOR_INFORMATION_LIST.find((item) => item.id === id);
        if (mock) return mock;
      }
      return toRequestForInformation(await requestForInformationService.getById(id));
    },
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

// Shared by the Email Thread tab and the detail page's tab-badge count, so the badge can
// never disagree with what the tab itself lists. Reuses the Compensation Event module's
// entity-conversations hook (entity-agnostic, keyed only by `entityId`) since both detail
// screens read the same backend thread endpoint. The live endpoint is the source of truth;
// the module's own mock thread only stands in while it has nothing for the id — which it
// always will for a mock RFI, since mock ids aren't real backend entities.
export const useRequestForInformationThread = (rfi: RequestForInformation | undefined) => {
  const { data: conversations, isLoading } = useGetEntityConversations({
    entityId: rfi?.id,
    enabled: !USE_MOCK_REQUEST_FOR_INFORMATION,
  });

  const messages = useMemo(() => {
    const live = toRequestForInformationThread(conversations ?? []);
    if (live.length) return live;
    if (!rfi) return [];
    return USE_MOCK_REQUEST_FOR_INFORMATION
      ? (MOCK_REQUEST_FOR_INFORMATION_THREAD[rfi.id] ?? [])
      : [];
  }, [conversations, rfi]);

  return { messages, conversations, isLoading };
};

// Shared by the Documents tab and the detail page's tab-badge count, same reasoning as
// `useRequestForInformationThread` above.
export const useRequestForInformationDocuments = (
  rfi: RequestForInformation | undefined,
  projectId?: string | null
) => {
  const { data: liveFiles, isLoading } = useGetAttachmentsByEntity({
    entityId: rfi?.id,
    projectId: projectId ?? undefined,
    enabled: !USE_MOCK_REQUEST_FOR_INFORMATION,
  });

  const files = useMemo(() => {
    if (liveFiles?.length) return liveFiles;
    if (!rfi) return [];
    return USE_MOCK_REQUEST_FOR_INFORMATION
      ? (MOCK_REQUEST_FOR_INFORMATION_DOCUMENTS[rfi.id] ?? [])
      : [];
  }, [liveFiles, rfi]);

  return { files, isLoading };
};

export const useCreateRequestForInformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRequestForInformationInput) =>
      USE_MOCK_REQUEST_FOR_INFORMATION
        ? Promise.resolve(input as unknown as RequestForInformation)
        : requestForInformationService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_FOR_INFORMATION_QUERY_KEY });
    },
  });
};

export const useUpdateRequestForInformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRequestForInformationInput }) =>
      USE_MOCK_REQUEST_FOR_INFORMATION
        ? Promise.resolve(input as unknown as RequestForInformation)
        : requestForInformationService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_FOR_INFORMATION_QUERY_KEY });
    },
  });
};

export const useDeleteRequestForInformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      USE_MOCK_REQUEST_FOR_INFORMATION
        ? Promise.resolve()
        : requestForInformationService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_FOR_INFORMATION_QUERY_KEY });
    },
  });
};
