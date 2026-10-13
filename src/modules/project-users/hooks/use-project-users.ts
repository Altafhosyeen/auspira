import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PROJECT_USERS_QUERY_KEY } from '../constants/project-user.constants';
import {
  assignProjectUser,
  getProjectUsers,
  removeProjectUser,
  updateProjectUserRole,
} from '../services/project-user.service';
import type {
  AssignProjectUserPayload,
  GetProjectUsersParams,
  UpdateProjectUserRolePayload,
} from '../types/project-user.types';

export const useGetProjectUsers = (
  projectId: string,
  params?: GetProjectUsersParams,
  enabled = true
) =>
  useQuery({
    queryKey: [
      ...PROJECT_USERS_QUERY_KEY,
      projectId,
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.status?.join(',') ?? '',
    ],
    queryFn: () => getProjectUsers(projectId, params),
    // Paging/filtering swaps the query key — hold the previous page rather than flash
    // an empty table.
    placeholderData: keepPreviousData,
    enabled: enabled && !!projectId,
  });

export const useAssignProjectUser = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignProjectUserPayload) => assignProjectUser(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_USERS_QUERY_KEY, projectId] });
    },
  });
};

export const useRemoveProjectUser = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeProjectUser(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_USERS_QUERY_KEY, projectId] });
    },
  });
};

export const useUpdateProjectUserRole = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectUserRolePayload) =>
      updateProjectUserRole(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_USERS_QUERY_KEY, projectId] });
    },
  });
};
