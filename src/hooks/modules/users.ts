import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { useAuthStore } from '@/store/auth.store';
import type { HelperFunctions, IMetaPaginatedResponse } from '@/types';
import type { ILookup } from '@/types/lookup.types';
import type { IUser } from '@/types/system/users.types';
import type { UpdateUserPayload, User, UserStat } from '@/types/users/users.types';

export const USERS_QUERY_KEY = ['users'] as const;
export const FILTERED_USERS_QUERY_KEY = ['filtered-users'] as const;
export const USERS_STATS_QUERY_KEY = ['users-stats'] as const;
export const PROJECTS_LOOKUP_QUERY_KEY = ['projects-lookup'] as const;

type UsersListQueryParams = {
  skip?: number;
  top?: number;
  term?: string;
  page?: number;
  skipLoader?: boolean;
};

type UsersStatsQueryParams = {
  enabled?: boolean;
  skip?: number;
  top?: number;
  term?: string;
};

/* -------------------------------- GET USERS ------------------------------- */

export const getUsers = async <T = IMetaPaginatedResponse<IUser>>(
  params?: UsersListQueryParams
) => {
  const normalizedTerm = params?.term?.trim();

  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.USERS.USERS, {
      skip: params?.skip,
      top: params?.top,
      term: normalizedTerm || undefined,
      page: params?.page,
    }),
    method: 'GET',
    skipLoader: params?.skipLoader ?? true,
  });
};

/* -------------------------------- GET USERS STATS ------------------------------- */

export const getUserStats = async (): Promise<UserStat> => {
  return AUSPIRA<UserStat>({
    url: buildUrl(API_ENDPOINTS.USERS.STATS, {}),
    method: 'GET',
  });
};

export const useGetUserStats = ({ enabled = true }: UsersStatsQueryParams = {}) =>
  useQuery<UserStat>({
    queryKey: USERS_STATS_QUERY_KEY,
    queryFn: () => getUserStats(),
    enabled,
  });

/* -------------------------------- VERIFY EMAIL ------------------------------- */

export const VERIFY_EMAIL_QUERY_KEY = ['verify-email'] as const;

export interface IVerifyEmailResponse {
  email?: string;
  isAvailable?: boolean; // true = email is free, false = already registered
  message?: string;
}

export const verifyEmail = async <T = IVerifyEmailResponse>(email: string) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.USERS.VERIFY_EMAIL, { email }),
    method: 'GET',
    isPublic: true, // registration is a public flow — no auth token yet
    skipLoader: true, // background field validation — must not block the form
  });
};

export const useVerifyEmail = <T = IVerifyEmailResponse>(
  { email, enabled = true }: { email: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...VERIFY_EMAIL_QUERY_KEY, email],
    queryFn: () => verifyEmail<T>(email),
    ...helpers,
    enabled: enabled && !!email,
  });

/* -------------------------------- GET PROJECTS LOOKUP ------------------------------- */

export const getProjectsLookup = async <T = ILookup[]>() => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.LOOKUP,
    method: 'GET',
    skipLoader: true, // lookup query — must not block pages with the global overlay
  });
};

export const useProjectsLookup = <T = ILookup[]>({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery<T>({
    queryKey: PROJECTS_LOOKUP_QUERY_KEY,
    queryFn: () => getProjectsLookup<T>(),
    enabled,
  });

export const useGetUsers = <T = IMetaPaginatedResponse<IUser>>({
  enabled = true,
  skip,
  top,
  term,
  skipLoader,
}: {
  enabled?: boolean;
  skip?: number;
  top?: number;
  term?: string;
  skipLoader?: boolean;
} = {}) =>
  useQuery<T>({
    queryKey: [
      ...USERS_QUERY_KEY,
      ...(skip !== undefined ? [`skip-${skip}`] : []),
      ...(top !== undefined ? [`top-${top}`] : []),
      ...(term?.trim() ? [`term-${term.trim()}`] : []),
    ],
    queryFn: () =>
      getUsers<T>({
        skip,
        top,
        term,
        skipLoader,
      }),
    enabled,
  });

/* -------------------------------- GET USER PROFILE ------------------------------- */

export const getUserProfile = async ({
  skipLoader = false,
}: {
  skipLoader?: boolean;
} = {}): Promise<IUser> => {
  return AUSPIRA<IUser>({
    url: `${API_ENDPOINTS.USERS.USER_PROFILE}`,
    method: 'GET',
    skipLoader,
  });
};

/* ------------------------ PUT / UPDATE PROFILE USER ----------------------- */

export const updateProfile = async ({
  values,
}: {
  values: {
    name: string;
    phoneNumber: string | null;
    jobTitle: string | null;
    contractor: string | null;
    areasOfInterest: string[] | null;
  };
}): Promise<IUser> => {
  await AUSPIRA<IUser>({
    url: `${API_ENDPOINTS.USERS.USER_PROFILE}`,
    method: 'PUT',
    body: values,
  });
  // Fetch full user profile to ensure all data is updated
  return getUserProfile();
};
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const { update: updateSession } = useSession();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (response) => {
      // Ensure store is hydrated before updating
      if (response) {
        // Update session user with full updated profile data
        setUser(response);

        // Update NextAuth session with new user data
        // This ensures that on page refresh, the session has the latest data
        await updateSession({
          user: response,
        });

        // Invalidate user queries to keep cache in sync
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      }
    },
    onError: (error) => {
      console.error('Profile update error:', error);
    },
  });
};

/* ---------------------------------- POST ---------------------------------- */
export interface IRolePayload {
  name: string;
  desc: string;
  is_admin: boolean;
}

export const createUser = async ({ data }: { data: any }) => {
  return AUSPIRA<any>({
    url: API_ENDPOINTS.USERS.USERS,
    method: 'POST',
    body: data,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (payload) => createUser({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: USERS_STATS_QUERY_KEY,
      });
    },
  });
};

/* ---------------------------------- UPDATE ---------------------------------- */

export const updateUser = async ({ id, data }: { id: string; data: UpdateUserPayload }) => {
  return AUSPIRA<User>({
    url: `${API_ENDPOINTS.USERS.USERS}${id}/`,
    method: 'PUT',
    body: data,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { id: string; data: UpdateUserPayload }>({
    mutationFn: (payload) => updateUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: USERS_STATS_QUERY_KEY });
    },
  });
};

/* ---------------------------------- DELETE ---------------------------------- */

export const deleteUser = async (id: string) => {
  return AUSPIRA<void>({
    url: `${API_ENDPOINTS.USERS.USERS}${id}/`,
    method: 'DELETE',
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY, exact: false });
      queryClient.invalidateQueries({ queryKey: USERS_STATS_QUERY_KEY });
    },
  });
};

/* -------------------------------- GET BY ID ------------------------------- */
export const getUserProfileById = async (id: string): Promise<IUser> => {
  return AUSPIRA<IUser>({
    url: `${API_ENDPOINTS.USERS.USER_PROFILE}${id}/`,
    method: 'GET',
  });
};

export const useGetUserProfileById = (id: string) => {
  return useQuery<IUser>({
    queryKey: [...USERS_QUERY_KEY, `id-${id}`],
    queryFn: () => getUserProfileById(id),
    enabled: !!id,
  });
};
