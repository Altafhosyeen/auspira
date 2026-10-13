import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  API_ENDPOINTS,
  type ProjectAlertSource,
  type ProjectAlertStatus,
  type ProjectAlertType,
} from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions, IMetaPaginatedResponse } from '@/types';

/** One source email backing a project alert — the alert's own email fields live here, not at the top level. */
export interface ProjectAlertEmail {
  id: string;
  projectAlertId: string;
  projectEmailId: string | null;
  missingInformation: string | null;
  description: string | null;
  confidencePercentage: number;
  emailTo: string | null;
  emailCc: string | null;
  emailSubject: string | null;
  emailSender: string | null;
  emailBody: string | null;
}

/** A single project alert row, as returned by the list/by-id endpoints. */
export interface ProjectAlert {
  id: string;
  projectId: string;
  projectEmailId: string | null;
  dailySiteReportId: string | null;
  earlyWarningReference: string | null;
  alertStatus: ProjectAlertStatus;
  title: string;
  description: string | null;
  /** Short extractor-written precis of the signal, sent alongside `title`/`description`. Carried
   * onto the Early Warning the alert is promoted into — see `RegisterEarlyWarningContext`. */
  summary: string | null;
  missingInformation: string | null;
  confidencePercentage: number;
  overdueDateTime: string | null;
  compensationDueDate: string | null;
  compensationOverDueAt: string | null;
  overdueAt: string | null;
  /** Origin channel the alert was ingested from — see `ProjectAlertSource`. */
  source: ProjectAlertSource;
  weatherApiCallDateTime: string | null;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription: string | null;
  alertType: ProjectAlertType;
  createdOn: string;
  updatedOn: string;
  projectAlertEmails: ProjectAlertEmail[];
  /** Mail-thread id (e.g. Graph API conversationId) — mirrors the field on `ProjectAlertRequest`. */
  conversationId?: string | null;
  /** JSON-encoded `{ potentialImpacts, keyDatesAffected, proposedActions, delayToCompletion, keyImpactDate, costIncrease, performanceImpairment }`. */
  impactAssessment?: string | null;
  /** JSON-encoded `{ meetingDate, location, participants, clauseDescription, summary, agreedActions }` — parse with `parseRiskReductionMeeting`. */
  riskReductionMeeting?: string | null;
  /** JSON-encoded compensation event draft the extractor built from the mail — parse with `parseAlertCompensationEvent`. */
  compensationEvent?: string | null;
  /** The contractor's own CE reference as written in the mail. Carries a trailing note when
   * the extractor could not match it to a CE in Auspira ("CE-014 (not linked with …)"). */
  compensationEventReference?: string | null;
  /** The PMI reference the signal names, when the extractor read one off the mail. */
  pmiReference?: string | null;
  /** JSON-encoded quotation draft — parse with `parseAlertQuotation` in the CE module. */
  quotation?: string | null;
}

/** The alert's email fields (sender/to/cc/subject/body) live on `projectAlertEmails`, not the alert itself. */
export const getPrimaryAlertEmail = (alert: ProjectAlert): ProjectAlertEmail | undefined =>
  alert.projectAlertEmails?.[0];

/** One entry of the JSON-encoded `ProjectAlert.missingInformation` array. */
export interface MissingInformationItem {
  label: string;
  description: string;
}

/** "delayToCompletion" -> "Delay To Completion". */
export const humanizeCamelCase = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/** `ProjectAlert.missingInformation` / `ProjectAlertEmail.missingInformation` is a JSON-encoded
 * `MissingInformationItem[]` — parses defensively since the field is a free-form string column. */
export const parseMissingInformation = (raw?: string | null): MissingInformationItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Parsed `ProjectAlert.impactAssessment`, mapped onto the Register EW form's Impact Assessment
 * fields — `impactTypes` collects whichever of the four boolean flags came back truthy. */
export interface ImpactAssessmentDetail {
  potentialImpacts?: string;
  proposedActions?: string;
  keyDatesAffected?: string;
  impactTypes: string[];
}

/** `ProjectAlert.impactAssessment` is a JSON-encoded string — tolerates either PascalCase or
 * camelCase keys since the backend has been observed sending both (see `parseRiskReductionMeeting`
 * for the same pattern on a sibling field). Returns `null` when unset or unparseable. */
export const parseImpactAssessment = (raw?: string | null): ImpactAssessmentDetail | null => {
  if (!raw) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  // The backend sometimes sends the literal string "null" — that is no assessment, not an empty one.
  if (!parsed || typeof parsed !== 'object') return null;

  const pick = (...keys: string[]): unknown => {
    for (const key of keys) {
      if (parsed?.[key] !== undefined && parsed?.[key] !== null) return parsed[key];
    }
    return undefined;
  };

  const impactTypes: string[] = [];
  if (pick('delayToCompletion', 'DelayToCompletion')) impactTypes.push('delay');
  if (pick('keyImpactDate', 'KeyImpactDate')) impactTypes.push('key-date');
  if (pick('costIncrease', 'CostIncrease')) impactTypes.push('cost');
  if (pick('performanceImpairment', 'PerformanceImpairment')) impactTypes.push('performance');

  return {
    potentialImpacts: (pick('potentialImpacts', 'PotentialImpacts') as string) || undefined,
    proposedActions: (pick('proposedActions', 'ProposedActions') as string) || undefined,
    keyDatesAffected: (pick('keyDatesAffected', 'KeyDatesAffected') as string) || undefined,
    impactTypes,
  };
};

/** Parsed `ProjectAlert.compensationEvent` — the compensation event the extractor read out of
 * the signal, in the shape the notice form seeds itself from. */
export interface AlertCompensationEventDetail {
  clauseNumber?: string;
  clauseTitle?: string;
  clauseDescription?: string;
  /** Address of whoever raised the event — the notice's "From" when the alert carries no email. */
  raisedBy?: string;
  /** Mirrors `COMPENSATION_EVENT_TYPE` (1 = contractor notification). */
  type?: number;
  estimatedValue?: number;
  currency?: string;
  estimatedDays?: number;
  requiresPMDecision?: boolean;
  isQuotationRequired?: boolean;
  proposedEffectDescription?: string;
}

/** `ProjectAlert.compensationEvent` is a JSON-encoded string — tolerates PascalCase or camelCase
 * keys for the same reason `parseImpactAssessment` does, and blanks out the empty strings the
 * extractor sends for fields it could not fill. Returns `null` when unset or unparseable. */
export const parseAlertCompensationEvent = (
  raw?: string | null
): AlertCompensationEventDetail | null => {
  if (!raw) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  // The extractor sends the event either bare or wrapped alongside its quotation
  // (`{ compensationEvent: {...}, quotation: null }`) — read through the envelope.
  const envelope = parsed.compensationEvent ?? parsed.CompensationEvent;
  if (envelope && typeof envelope === 'object') parsed = envelope as Record<string, unknown>;

  const pick = (key: string): unknown => {
    const pascal = key.replace(/^./, (c) => c.toUpperCase());
    return parsed[key] ?? parsed[pascal] ?? undefined;
  };

  const text = (key: string): string | undefined => {
    const value = pick(key);
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };

  const numeric = (key: string): number | undefined => {
    const value = pick(key);
    // Number('') is 0, and the extractor sends '' for numbers it could not read.
    if (value === undefined || value === '') return undefined;
    const parsedNumber = Number(value);
    return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
  };

  return {
    clauseNumber: text('clauseNumber'),
    clauseTitle: text('clauseTitle'),
    clauseDescription: text('clauseDescription'),
    raisedBy: text('raisedBy'),
    type: numeric('type'),
    estimatedValue: numeric('estimatedValue'),
    currency: text('currency'),
    estimatedDays: numeric('estimatedDays'),
    requiresPMDecision: pick('requiresPMDecision') === true,
    isQuotationRequired: pick('isQuotationRequired') === true,
    proposedEffectDescription: text('proposedEffectDescription'),
  };
};

export const PROJECT_ALERTS_QUERY_KEY = ['project-alerts'] as const;

/** The awareness module caches the same alerts under its own `['awareness']` key. Declared here
 * rather than imported from that module so this layer keeps no dependency on a feature slice. */
const AWARENESS_ALERTS_QUERY_KEY = ['awareness'] as const;

/**
 * Drops every cached copy of the alerts, under both keys. Anything that settles an alert —
 * discard, not-accepted, or an EW/CE/RRM registration downstream — has to call this: the
 * Awareness list reads `['project-alerts']` while the review screens read `['awareness']`, so
 * invalidating one alone leaves the other serving a stale list for its full `staleTime`.
 *
 * `predicate` skips the by-id query of an alert that was just removed — the screen that
 * triggered the action is still mounted while navigation happens, so refetching it 404s.
 */
export const invalidateAlertQueries = (queryClient: QueryClient, removedAlertId?: string) => {
  for (const queryKey of [PROJECT_ALERTS_QUERY_KEY, AWARENESS_ALERTS_QUERY_KEY]) {
    queryClient.invalidateQueries({
      queryKey,
      predicate: removedAlertId ? (query) => !query.queryKey.includes(removedAlertId) : undefined,
    });
  }
};

/** Query params for GET /api/project-alerts/project/{projectId}. */
export interface ProjectAlertListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
}

/** Payload sent to POST /api/project-alerts — matches ProjectAlertRequest. */
export interface ProjectAlertRequest {
  id?: string;
  projectId: string;
  projectEmailId?: string | null;
  dailySiteReportId?: string | null;
  title: string;
  description?: string | null;
  missingInformation?: string | null;
  alertType: number;
  confidencePercentage?: number;
  overdueDateTime?: string | null;
  compensationDueDate?: string | null;
  source?: string | null;
  weatherApiCallDateTime?: string | null;
  earlyWarningReference?: string | null;
  clauseDescription?: string | null;
  conversationId?: string | null;
  impactAssessment?: unknown | null;
  riskReductionMeeting?: unknown | null;
}

/* -------------------- POST /api/project-alerts (create) -------------------- */

export const createProjectAlert = async (data: ProjectAlertRequest) => {
  return AUSPIRA<ProjectAlertRequest>({
    url: API_ENDPOINTS.PROJECT_ALERTS.PROJECT_ALERTS,
    method: 'POST',
    body: data,
  });
};

export const useCreateProjectAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProjectAlert,
    onSuccess: () => {
      invalidateAlertQueries(queryClient);
    },
  });
};

/* -------------------- GET /api/project-alerts/project/{projectId} (paged) -------------------- */

export const getProjectAlerts = async <T = IMetaPaginatedResponse<ProjectAlert>>(
  projectId: string,
  params?: ProjectAlertListParams
) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.PROJECT_ALERTS.LIST_BY_PROJECT.replace(':projectId', projectId), {
      skip: params?.skip,
      top: params?.top,
      term: params?.term?.trim(),
      includeAll: params?.includeAll,
    }),
    method: 'GET',
    skipLoader: true, // list fetch — avoid stacking the global overlay
  });
};

export const useGetProjectAlerts = <T = IMetaPaginatedResponse<ProjectAlert>>(
  {
    projectId,
    params,
    enabled,
  }: { projectId: string; params?: ProjectAlertListParams; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [
      ...PROJECT_ALERTS_QUERY_KEY,
      projectId,
      params?.skip ?? 0,
      params?.top ?? 10,
      params?.term ?? '',
      params?.includeAll ?? false,
    ],
    queryFn: async () => getProjectAlerts<T>(projectId, params),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/* -------------------- GET /api/project-alerts/{id} (by id) -------------------- */

export const getProjectAlertById = async <T = ProjectAlert>(id: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECT_ALERTS.BY_ID.replace(':id', id),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjectAlertById = <T = ProjectAlert>(
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_ALERTS_QUERY_KEY, id],
    queryFn: async () => getProjectAlertById<T>(id),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/* -------------------- DELETE /api/project-alerts/{id} (soft delete) -------------------- */

/** Body of the soft delete — the same four fields `awarenessService.discard` sends. */
export interface DeleteProjectAlertPayload {
  id: string;
  /** Free-text comment. Omitted entirely for a plain dismiss, which carries no reason. */
  notAcceptReason?: string;
  /** The clause test the event fails — its own field, not folded into the reason. */
  notAcceptReasonTitle?: string;
  attachments?: string[];
}

/**
 * The endpoint takes a required body, so a bodiless DELETE is rejected. It has to be
 * multipart with PascalCase keys: `isMultipart` skips the JSON.stringify the client
 * otherwise applies, and the axios interceptor drops the JSON Content-Type so the
 * boundary is set for us. Swagger offers x-www-form-urlencoded, but URLSearchParams
 * is answered with a 400 here — same finding as `awarenessService.discard`, which
 * calls this very route.
 *
 * `IsNotAccept` is false: this is a dismissal, not a Not Accepted decision. That one
 * goes to /not-accepted (see `notAcceptProjectAlert`) and raises the EW/CE in
 * NotAccepted status rather than soft-deleting the alert.
 */
export const deleteProjectAlert = async ({
  id,
  notAcceptReason,
  notAcceptReasonTitle,
  attachments,
}: DeleteProjectAlertPayload) => {
  const form = new FormData();
  if (notAcceptReason) form.append('NotAcceptReason', notAcceptReason);
  if (notAcceptReasonTitle) form.append('NotAcceptReasonTitle', notAcceptReasonTitle);
  form.append('IsNotAccept', 'false');
  for (const attachment of attachments ?? []) form.append('Attachments', attachment);

  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECT_ALERTS.DELETE.replace(':id', id),
    method: 'DELETE',
    isMultipart: true,
    body: form,
  });
};

export const useDeleteProjectAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectAlert,
    onSuccess: (_data, { id }) => {
      invalidateAlertQueries(queryClient, id);
    },
  });
};

/* -------------------- POST /api/project-alerts/{projectAlertId}/not-accepted -------------------- */

/**
 * Records a "not accepted" decision on a signal — the backend still creates the Early Warning
 * or Compensation Event, but in NotAccepted status rather than registering it as agreed.
 * The PM's reason rides the body — it is a contractual decision, so it is recorded, not implied.
 */

export interface NotAcceptProjectAlertPayload {
  projectAlertId: string;
  reason: string;
}

export const notAcceptProjectAlert = async ({
  projectAlertId,
  reason,
}: NotAcceptProjectAlertPayload) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECT_ALERTS.NOT_ACCEPTED.replace(':projectAlertId', projectAlertId),
    method: 'POST',
    body: { notAcceptReason: reason },
  });
};

export const useNotAcceptProjectAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notAcceptProjectAlert,
    onSuccess: () => {
      invalidateAlertQueries(queryClient);
    },
  });
};
