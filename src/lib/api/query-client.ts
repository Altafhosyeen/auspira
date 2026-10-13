import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query';
import { handleApiError } from './error-handler';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleApiError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleApiError(error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Data stays fresh for 60s — avoids redundant refetches on quick navigation
      staleTime: 60_000,
      // Keep unused query data in cache for 5 min so navigating back is instant
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});
