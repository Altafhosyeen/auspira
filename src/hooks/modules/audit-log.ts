import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types';

export const AUDIT_LOG_QUERY_KEY = ['audit-log'] as const;

/* -------------------- GET /api/audit-logs?entityId= -------------------- */

/** Shared audit trail — any entity that logs actions is read through this one endpoint. */
export interface AuditLogEntry {
  id: string;
  /** Raw `AuditActionType` enum ordinal — Swagger types it `integer` with no published name mapping. */
  actionType: number;
  /** Null unless the action ties to a lifecycle stage. */
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
  /** Set only for email-originated actions; falls back to `performedByUserFullName` when null. */
  sender: string | null;
}

// `term` is matched against details and username, `actionType` narrows to one action —
// both are the endpoint's own, so neither is filtered in the browser.
export const getAuditLogs = async <T = AuditLogEntry[]>(
  entityId: string,
  term?: string,
  actionType?: number
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.AUDIT_LOG.LIST, {
      entityId,
      term: term?.trim() || undefined,
      actionType,
    }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetAuditLogs = <T = AuditLogEntry[]>(
  {
    entityId,
    term,
    actionType,
    enabled,
  }: { entityId?: string; term?: string; actionType?: number; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    // Both narrowing values belong in the key — otherwise a search or a change of
    // action would read the previous result straight out of the cache.
    queryKey: [...AUDIT_LOG_QUERY_KEY, entityId, term ?? '', actionType ?? ''],
    queryFn: async () => getAuditLogs<T>(entityId!, term, actionType),
    ...helpers,
    enabled: (enabled ?? true) && !!entityId,
  });
