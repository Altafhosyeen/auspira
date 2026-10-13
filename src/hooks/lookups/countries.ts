import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { ICountry } from '@/types/lookup.types';
import { useQuery } from '@tanstack/react-query';

export const COUNTRIES_QUERY_KEY = ['countries'] as const;

/* --------------------------- GET COUNTRIES --------------------------- */

export const getCountries = async <T = ICountry[]>() => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.LOOKUPS.COUNTRIES,
    method: 'GET',
    skipLoader: true, // lookup query — must not block pages with the global overlay
  });
};

export const useCountries = <T = ICountry[]>({ enabled }: { enabled?: boolean }) =>
  useQuery<T>({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: () => getCountries<T>(),
    enabled,
  });
