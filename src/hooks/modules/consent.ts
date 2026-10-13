import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { useQuery } from '@tanstack/react-query';
export const CONSENT_CONNECT_QUERY_KEY = ['consentConnect'] as const;
export const getConsentConnect = async <T>() => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.CONSENTS.CONSENTS,
    method: 'GET',
    skipLoader: true, // background fetch for the connect-email modal — must not block pages with the global overlay
  });
};

export const useGetConsentConnect = <T>() =>
  useQuery<T>({
    queryKey: [...CONSENT_CONNECT_QUERY_KEY],
    queryFn: async () => getConsentConnect<T>(),
  });
