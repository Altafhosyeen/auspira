import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import type { HelperFunctions } from '@/types';
import { invalidateAlertQueries } from './project-alerts';

export const RISK_REDUCTION_MEETING_QUERY_KEY = ['risk-reduction-meeting'] as const;

/* -------------------- POST /api/risk-reduction-meetings -------------------- */

export interface RiskReductionMeetingDetailPayload {
  meetingDate: string;
  location: string;
  participants: string;
  summary: string;
  outcomeSoFar?: string;
}

export interface RiskReductionMeetingAgreedActionPayload {
  description: string;
  isCompleted: boolean;
  responsibleParty: string;
  dueDate: string | null;
}

/** Matches the confirmed `POST /api/risk-reduction-meetings` request schema. */
export interface CreateRiskReductionMeetingPayload {
  projectAlertId: string;
  earlyWarningReference: string;
  projectEmailId?: string | null;
  clauseNumber: string;
  clauseTitle: string;
  clauseDescription: string;
  meetingDetailObject: RiskReductionMeetingDetailPayload;
  agreedActions: RiskReductionMeetingAgreedActionPayload[];
}

export const createRiskReductionMeeting = async <
  TResponse = any,
  TBody = CreateRiskReductionMeetingPayload,
>(
  data: TBody
) => {
  return AUSPIRA<TResponse, TBody>({
    url: API_ENDPOINTS.RISK_REDUCTION_MEETING.RISK_REDUCTION_MEETING,
    method: 'POST',
    body: data,
  });
};

export const useCreateRiskReductionMeeting = <
  TResponse = any,
  TBody = CreateRiskReductionMeetingPayload,
>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TBody) => createRiskReductionMeeting<TResponse, TBody>(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RISK_REDUCTION_MEETING_QUERY_KEY });
      // Accepting consumes the source project alert, so its cached record is now stale. Without
      // this the alert stays cached for `gcTime` (5 min) and re-opening the meeting screen renders
      // the pre-accept status — offering Accept a second time on an alert already actioned.
      invalidateAlertQueries(queryClient);
    },
  });
};

/* -------------------- GET /api/risk-reduction-meetings/early-warning/{earlyWarningId} -------------------- */

export const getRiskReductionMeetingsByEarlyWarningId = async <T = any>(earlyWarningId: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.RISK_REDUCTION_MEETING.BY_EARLY_WARNING_ID.replace(
      ':earlyWarningId',
      earlyWarningId
    ),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetRiskReductionMeetingsByEarlyWarningId = <T = any>(
  { earlyWarningId, enabled }: { earlyWarningId?: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...RISK_REDUCTION_MEETING_QUERY_KEY, 'early-warning', earlyWarningId],
    queryFn: async () => getRiskReductionMeetingsByEarlyWarningId<T>(earlyWarningId!),
    ...helpers,
    // Without the id guard the queryFn runs with `undefined` and throws inside `.replace()`,
    // which React Query surfaces as a failed request rather than a skipped one.
    enabled: (enabled ?? true) && !!earlyWarningId,
  });

/* -------------------- GET /api/risk-reduction-meetings/{riskReductionMeetingId} -------------------- */
// "Get a Early Warning Meeting with project email information and agreed actions."

export const getRiskReductionMeetingById = async <T = any>(riskReductionMeetingId: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.RISK_REDUCTION_MEETING.BY_ID.replace(
      ':riskReductionMeetingId',
      riskReductionMeetingId
    ),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetRiskReductionMeetingById = <T = any>(
  { riskReductionMeetingId, enabled }: { riskReductionMeetingId: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...RISK_REDUCTION_MEETING_QUERY_KEY, riskReductionMeetingId],
    queryFn: async () => getRiskReductionMeetingById<T>(riskReductionMeetingId),
    ...helpers,
    enabled: (enabled ?? true) && !!riskReductionMeetingId,
  });

/* -------------------- PATCH /api/risk-reduction-meetings/agreed-actions/{agreedActionId}/complete -------------------- */

export const completeAgreedAction = async (agreedActionId: string) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.RISK_REDUCTION_MEETING.COMPLETE_AGREED_ACTION.replace(
      ':agreedActionId',
      agreedActionId
    ),
    method: 'PATCH',
  });
};

export const useCompleteAgreedAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agreedActionId: string) => completeAgreedAction(agreedActionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RISK_REDUCTION_MEETING_QUERY_KEY });
    },
  });
};
