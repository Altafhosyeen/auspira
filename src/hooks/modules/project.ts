import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { USERS_QUERY_KEY, USERS_STATS_QUERY_KEY } from '@/hooks/modules/users';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions, IPaginatedApiResponse } from '@/types';
import type { IInvoiceTemplateQueryParams } from '@/types/finance/invoice-templates';

export const PROJECT_QUERY_KEY = ['project'] as const;

export const getProjects = async <T = IPaginatedApiResponse<any>>(
  params?: IInvoiceTemplateQueryParams
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PROJECT, {
      skip: params?.skip,
      top: params?.top,
      term: params?.term?.trim(),
    }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjects = <T = IPaginatedApiResponse<any>>(
  params?: IInvoiceTemplateQueryParams,
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, params?.skip ?? 0, params?.top ?? 10, params?.term ?? ''],
    queryFn: async () => getProjects<T>(params),
    ...helpers,
  });
/* ------------------------------ Project looup ----------------------------- */
export const lookupProject = async <T = any>() => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.LOOKUP,
    method: 'GET',
    skipLoader: true,
  });
};

export const useLookupProject = <T = any>() =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'lookup'],
    queryFn: async () => lookupProject<T>(),
    enabled: true, // Always run
  });
/* ---------------------------------- POST  ---------------------------------- */

export const createProjectWithNameAndRef = async ({ data }: { data: any }) => {
  return AUSPIRA<any>({
    url: API_ENDPOINTS.PROJECTS.PROJECT,
    method: 'POST',
    body: data,
  });
};

export const useCreateProjectWithNameAndRef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectWithNameAndRef,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
    },
  });
};

/* ---------------------------------- LIST ---------------------------------- */
export const listProjects = async <T = any>() => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.PROJECT,
    method: 'GET',
    skipLoader: true,
  });
};

export const useListProjects = <T = any>(helpers?: HelperFunctions<T>) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'list'],
    queryFn: async () => listProjects<T>(),
    ...helpers,
  });

/* -------------------------------- GET by ID ------------------------------- */

export const getProjectById = async <T = any>(id: string) => {
  return AUSPIRA<T>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT}/${id}`,
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjectById = <T = any>(
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, id],
    queryFn: async () => getProjectById<T>(id),
    ...helpers,
    enabled: enabled,
  });

/* ----------------------------------- PUT Basic---------------------------------- */

export const updateProjectBasic = async <T = any>({ data, id }: { data: T; id: string }) => {
  return AUSPIRA<void>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT}/${id}/basic`,
    method: 'PUT',
    body: data,
  });
};

export const useUpdateProjectBasic = <T = any>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { data: T; id: string }) => updateProjectBasic<T>(variables),
    onSuccess: (_data, variables) => {
      // Invalidate both the list and specific project queries
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, variables.id] });
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
  });
};

/* ----------------------------------- PUT ---------------------------------- */
export const updateProject = async <T = any>({ data, id }: { data: T; id: string }) => {
  return AUSPIRA<void>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT}/${id}`,
    method: 'PUT',
    body: data,
  });
};

export const useUpdateProject = <T = any>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { data: T; id: string }) => updateProject<T>(variables),
    onSuccess: (_data, variables) => {
      // Invalidate both the list and specific project queries
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, variables.id] });
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
  });
};

/* -------------------------------- REFERENCE -------------------------------- */

export const getProjectReferences = async <T = any>({
  referenceId,
}: {
  referenceId: number | string;
}) => {
  return AUSPIRA<T>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT}/verify-reference/?referenceId=${referenceId}`,
    method: 'GET',
  });
};

export const useGetProjectReferences = <T = any>({
  referenceId,
  enabled,
}: {
  referenceId: number | string;
  enabled: boolean;
}) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, referenceId, 'references'],
    queryFn: async () => getProjectReferences<T>({ referenceId }),
    enabled, // Only run if referenceId is provided
  });

/* ------------------------- PROJECT ASSIGN TO USER ------------------------- */

export const assignProjectToUser = async <T = any>({ data, id }: { data: T; id: string }) => {
  return AUSPIRA<void>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT}/${id}/users/`,
    method: 'POST',
    body: data,
  });
};

export const useAssignProjectToUser = <T = any>() => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }: { data: T; id: string }) => assignProjectToUser<T>({ data, id }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...PROJECT_QUERY_KEY, variables.id],
      });
      // Assigning a project changes the user's allocatedProjectsCount + assignable-projects list
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY, exact: false });
      queryClient.invalidateQueries({ queryKey: USERS_STATS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PROJECT_QUERY_KEY, 'assignable-projects'],
        exact: false,
      });
    },
  });
};

/* --------------------------- ASSIGN ABLE PROJECT -------------------------- */

export const getAssignableProjects = async <T = any>({ id }: { id: string }) => {
  return AUSPIRA<T>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT_USER_ASSIGNABLE}/${id}`,
    method: 'GET',
  });
};

export const useGetAssignableProjects = <T = any>(id?: string, helpers?: HelperFunctions<T>) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'assignable-projects', id],
    queryFn: () => getAssignableProjects<T>({ id: id! }),
    enabled: !!id,
    ...helpers,
  });

/* --------------------------------- OPTIONS -------------------------------- */

export const getProjectOptions = async <T = any>({ projectId }: { projectId: string }) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.OPTIONS.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjectOptions = <T = any>(projectId?: string, helpers?: HelperFunctions<T>) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'options', projectId],
    queryFn: () => getProjectOptions<T>({ projectId: projectId! }),
    enabled: !!projectId,
    ...helpers,
  });

/* ----------------------------- CONTACT PERSONS ---------------------------- */

export const getContactPersons = async <T = any>({ projectId }: { projectId: string }) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.CONTACT_PERSONS.replace(':id', projectId),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetContactPersons = <T = any>(projectId?: string, helpers?: HelperFunctions<T>) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'contact-persons', projectId],
    queryFn: () => getContactPersons<T>({ projectId: projectId! }),
    enabled: !!projectId,
    ...helpers,
  });

// Split out of this file to stay under the 500-line architecture cap — re-exported here
// so existing `from '@/hooks/modules/project'` imports keep working unchanged.
export * from './project-ai';
export * from './project-documents';
export * from './project-emails';
