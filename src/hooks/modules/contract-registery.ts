import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { IMetaPaginatedResponse } from '@/types';
import type { HelperFunctions } from '@/types/custom.types';

const ZCLAUSES_PAGE_SIZE = 10;
// Distinct from project.ts's PROJECT_QUERY_KEY (['project']) — keeping these separate means
// editing a project (which invalidates ['project', id]) doesn't also refetch z-clauses/documents.
const ZCLAUSES_QUERY_KEY = ['contract-registry'] as const;

export const getProjectZClauses = async <T = any>(id: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.PROJECT + '/' + id + '/z-clauses',
    method: 'GET',
    skipLoader: false, // consumers render their own loading state — avoid stacking the global overlay
  });
};

export const useGetZClausesForProject = <T = any>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...ZCLAUSES_QUERY_KEY, id, 'z-clauses'],
    queryFn: async () => getProjectZClauses<T>(id),
    ...helpers,
    enabled, // Only run if id is provided
  });

/* ---------------------------- GET ALL DOCUMENT ---------------------------- */

export const getAllDocuments = async <T = any>(id: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.DOCUMENTS_ALL_VERSIONS.replace(':id', String(id)),
    method: 'GET',
  });
};

export const useGetAllDocuments = <T = any>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...ZCLAUSES_QUERY_KEY, id, 'documents'],
    queryFn: async () => getAllDocuments<T>(id),
    ...helpers,
    enabled, // Only run if id is provided
  });
/* -------------------------------- Time bar -------------------------------- */

export const getTimeBar = async <T = any>({ id }: { id: string }) => {
  return AUSPIRA<T>({
    url: `${API_ENDPOINTS.CONTRACT_REGISTRY.TIME_BAR}?ProjectId=${id}`,
    method: 'GET',
  });
};

export const useGetTimeBar = <T = any>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: ['time-bar', id],
    queryFn: async () => getTimeBar<T>({ id }),
    ...helpers,
    enabled, // Only run if id is provided
  });

/* ----------------------------- GET TIME BAR (paged) ----------------------------- */

const TIMEBAR_PAGE_SIZE = 10;

export const getTimeBarPage = async <TItem = any>({
  id,
  skip,
  top = TIMEBAR_PAGE_SIZE,
}: {
  id: string;
  skip: number;
  top?: number;
}) => {
  return AUSPIRA<IMetaPaginatedResponse<TItem>>({
    url: buildUrl(API_ENDPOINTS.CONTRACT_REGISTRY.TIME_BAR, { ProjectId: id, skip, top }),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state for infinite scroll
  });
};

export const useGetTimeBarInfinite = <TItem = any>({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) =>
  useInfiniteQuery({
    queryKey: ['time-bar', id, 'infinite'],
    queryFn: ({ pageParam }) => getTimeBarPage<TItem>({ id, skip: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
      return loaded < lastPage.meta.totalCount ? loaded : undefined;
    },
    enabled, // Only run if id is provided
  });

/* ------------------------------ GET Z_CLAUSES ----------------------------- */

export const getZClauses = async <T = any>({ id }: { id: string }) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.Z_CLAUSES.Z_CLAUSES + `?ProjectId=${id}`,
    method: 'GET',
    skipLoader: true, // polled every 5s in the background — never flash the global overlay
  });
};

export const useGetZClauses = <T = any>(
  { id, enabled }: { id: string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: ['z-clauses', id],
    queryFn: async () => getZClauses<T>({ id }),
    ...helpers,
    enabled, // Only run if id is provided
  });

/* -------------------------- GET Z_CLAUSES (paged) -------------------------- */

export const getZClausesPage = async <TItem = any>({
  id,
  skip,
  top = ZCLAUSES_PAGE_SIZE,
}: {
  id: string;
  skip: number;
  top?: number;
}) => {
  return AUSPIRA<IMetaPaginatedResponse<TItem>>({
    url: buildUrl(API_ENDPOINTS.Z_CLAUSES.Z_CLAUSES, { ProjectId: id, skip, top }),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state for infinite scroll
  });
};

export const useGetZClausesInfinite = <TItem = any>({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) =>
  useInfiniteQuery({
    queryKey: ['z-clauses', id, 'infinite'],
    queryFn: ({ pageParam }) => getZClausesPage<TItem>({ id, skip: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
      return loaded < lastPage.meta.totalCount ? loaded : undefined;
    },
    enabled, // Only run if id is provided
  });
