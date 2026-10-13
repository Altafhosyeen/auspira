import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import type { ContractEntityType } from '@/constants/enum.constant';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types';

export const CLOSING_REASONS_QUERY_KEY = ['closing-reasons'] as const;

export interface ClosingReason {
  id: number;
  title: string;
}

/* -------------------- GET /api/closing-reasons -------------------- */

export const getClosingReasons = async <T = ClosingReason[]>(entityType: ContractEntityType) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.CLOSING_REASONS.CLOSING_REASONS, { entityType }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetClosingReasons = <T = ClosingReason[]>(
  { entityType, enabled }: { entityType?: ContractEntityType; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...CLOSING_REASONS_QUERY_KEY, entityType],
    queryFn: async () => getClosingReasons<T>(entityType!),
    ...helpers,
    enabled: (enabled ?? true) && entityType !== undefined,
  });
