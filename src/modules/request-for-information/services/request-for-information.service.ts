import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { REQUEST_FOR_INFORMATION_ENDPOINTS } from '../constants/request-for-information.constants';
import type {
  CreateRequestForInformationInput,
  RequestForInformation,
  UpdateRequestForInformationInput,
} from '../types/request-for-information.types';
import type {
  RequestForInformationPageResultDto,
  RequestForInformationProjectListParams,
  RequestForInformationResponseDto,
} from '../types/request-for-information-api.types';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const requestForInformationService = {
  getListByProject: (projectId: string, params?: RequestForInformationProjectListParams) =>
    AUSPIRA<RequestForInformationPageResultDto>({
      url: buildUrl(
        REQUEST_FOR_INFORMATION_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId),
        {
          Skip: params?.skip,
          Top: params?.top,
          Term: params?.term?.trim(),
          IncludeAll: params?.includeAll,
          status: params?.statuses?.length ? params.statuses.join(',') : undefined,
        }
      ),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  getById: (id: string) =>
    AUSPIRA<RequestForInformationResponseDto>({
      url: REQUEST_FOR_INFORMATION_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  create: (input: CreateRequestForInformationInput) =>
    AUSPIRA<RequestForInformation>({
      url: REQUEST_FOR_INFORMATION_ENDPOINTS.LIST,
      method: 'POST',
      body: input,
    }),

  update: (id: string, input: UpdateRequestForInformationInput) =>
    AUSPIRA<RequestForInformation>({
      url: REQUEST_FOR_INFORMATION_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'PUT',
      body: input,
    }),

  remove: (id: string) =>
    AUSPIRA<void>({
      url: REQUEST_FOR_INFORMATION_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'DELETE',
    }),
};
