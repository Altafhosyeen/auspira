import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { IMetaPaginatedResponse } from '@/types';
import { PROJECT_USER_ENDPOINTS } from '../constants/project-user.constants';
import type {
  AssignProjectUserPayload,
  GetProjectUsersParams,
  ProjectUser,
  UpdateProjectUserRolePayload,
} from '../types/project-user.types';

export const getProjectUsers = async (projectId: string, params?: GetProjectUsersParams) =>
  AUSPIRA<IMetaPaginatedResponse<ProjectUser>>({
    url: buildUrl(PROJECT_USER_ENDPOINTS.LIST.replace(':id', projectId), {
      skip: params?.skip,
      top: params?.top,
      term: params?.term?.trim() || undefined,
      // Multi-select status filter — comma-joined so one param carries every picked
      // status code, omitted entirely when nothing is picked.
      status: params?.status?.length ? params.status.join(',') : undefined,
    }),
    method: 'GET',
    skipLoader: true,
  });

export const assignProjectUser = async (projectId: string, payload: AssignProjectUserPayload) =>
  AUSPIRA<void, AssignProjectUserPayload>({
    url: PROJECT_USER_ENDPOINTS.ASSIGN.replace(':id', projectId),
    method: 'POST',
    body: payload,
  });

export const removeProjectUser = async (projectId: string, userId: string) =>
  AUSPIRA<void>({
    url: PROJECT_USER_ENDPOINTS.REMOVE.replace(':id', projectId).replace(':userId', userId),
    method: 'DELETE',
  });

export const updateProjectUserRole = async (
  projectId: string,
  payload: UpdateProjectUserRolePayload
) =>
  AUSPIRA<void, { projectRole: number }>({
    url: PROJECT_USER_ENDPOINTS.UPDATE_ROLE.replace(':id', projectId).replace(
      ':userId',
      payload.userId
    ),
    method: 'PUT',
    body: { projectRole: payload.projectRole },
  });
