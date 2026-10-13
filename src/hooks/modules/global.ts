import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { HelperFunctions } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const GLOBAL_QUERY_KEY = ['global'] as const;

/* -------------------- GET /api/audit-logs?entityId={entityId} -------------------- */

export interface AuditLogEntry {
  id: string;
  actionType: number;
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
}

export const getAuditLogs = async <T = AuditLogEntry[]>(entityId: string) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.GLOBAL_APIS.AUDIT_LOGS, { entityId }),
    method: 'GET',
    skipLoader: true, // consumer renders its own loading state — avoid stacking the global overlay
  });
};

export const useGetAuditLogs = <T = AuditLogEntry[]>(
  { entityId, enabled }: { entityId: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...GLOBAL_QUERY_KEY, entityId, 'audit-logs'],
    queryFn: async () => getAuditLogs<T>(entityId),
    ...helpers,
    enabled: (enabled ?? true) && !!entityId,
  });
