import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RegisterEwFormValues } from '@/components/contract-control-agent/early-warning-form.data';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { EARLY_WARNING_QUERY_KEY } from './early-warning';

/**
 * Registering an Early Warning — split out of `early-warning.ts` because that file was at the
 * 500-line ceiling. This is the one multipart endpoint in the family (attachments ride along with
 * the fields), so it carries its own DTO, form-data encoder and mutation.
 */

/* -------------------- POST /api/early-warnings (Register Early Warning) -------------------- */

/** Payload sent to POST /api/early-warnings — PascalCase keys to match the backend DTO exactly. */
interface RegisterEarlyWarningRequest {
  ProjectId: string;
  /** Absent when the EW is raised manually rather than promoted from a project alert. */
  ProjectAlertId?: string;
  Reference: string;
  RaisedBy: string;
  Title: string;
  Description: string;
  /** The originating alert's `summary`. Absent for a manually raised EW — there is no alert
   * to take it from. */
  Summary?: string | null;
  /** Early Warnings are always raised under NEC4 Cl. 15.1 — fixed rather than picked. */
  ClauseNumber: string;
  ClauseTitle: string;
  /** The alert's own read of the clause when one raised this EW; the standard NEC4 15.1
   * wording otherwise. */
  ClauseDescription: string;
  DateRaised: string;
  To: string;
  CC: string;
  BCC: string;
  Subject: string;
  PotentialImpacts: string;
  ProposedActions: string;
  KeyDatesAffected: string;
  DelayToCompletion: boolean;
  KeyDateImpact: boolean;
  CostIncrease: boolean;
  PerformanceImpairment: boolean;
  /** Picked files, streamed as repeated multipart parts under this key. */
  Attachments: File[];
  ProjectName: string;
  ProjectReference: string;
}

/** Extra identifiers the register form doesn't carry itself. */
export interface RegisterEarlyWarningContext {
  projectId: string;
  /** Omitted in create mode (`/early-warning-register/new`) — there is no originating alert. */
  projectAlertId?: string;
  /** The originating alert's `summary`. Not a form field — it is extractor output the user never
   * edits, so it rides the context rather than `RegisterEwFormValues`. */
  summary?: string | null;
  /** The originating alert's own read of the clause, when there is one — not a form field
   * either. Absent for a manually raised EW, and the standard NEC4 15.1 wording stands in. */
  clauseDescription?: string | null;
  projectName: string;
  projectReference: string;
  /** Files picked in the Evidence card. Sent as multiple parts under one `Attachments` key. */
  attachments?: File[];
}

const joinRecipients = (value?: string | string[]) =>
  Array.isArray(value) ? value.join(', ') : (value ?? '');

// NEC4 has one clause for raising an Early Warning — there is no picker on this form because
// there is nothing to pick.
const EARLY_WARNING_CLAUSE_NUMBER = '15.1';
const EARLY_WARNING_CLAUSE_TITLE = 'Early Warning Procedure';
const EARLY_WARNING_CLAUSE_DESCRIPTION_FALLBACK =
  'The Contractor and the Project Manager give an early warning by notifying the other as soon as either becomes aware of any matter which could increase the total of the Prices, delay Completion or impair the performance of the works in use.';

const toRegisterEarlyWarningRequest = (
  data: RegisterEwFormValues,
  context: RegisterEarlyWarningContext
): RegisterEarlyWarningRequest => ({
  ProjectId: context.projectId,
  ProjectAlertId: context.projectAlertId,
  Reference: data.ewReference,
  RaisedBy: data.raisedBy,
  Title: data.riskTitle,
  Description: data.riskDescription ?? '',
  Summary: context?.summary || null,
  ClauseNumber: EARLY_WARNING_CLAUSE_NUMBER,
  ClauseTitle: EARLY_WARNING_CLAUSE_TITLE,
  ClauseDescription:
    context?.clauseDescription?.trim() || EARLY_WARNING_CLAUSE_DESCRIPTION_FALLBACK,
  DateRaised: data.dateRaised ? data.dateRaised.format('YYYY-MM-DD') : '',
  To: joinRecipients(data.to),
  CC: joinRecipients(data.cc),
  BCC: joinRecipients(data.bcc),
  Subject: data.riskTitle,
  PotentialImpacts: data.potentialImpacts ?? '',
  ProposedActions: data.proposedActions ?? '',
  KeyDatesAffected: data.keyDatesAffected ?? '',
  // The impactTypes checkbox field is currently commented out in ImpactAssessmentCard,
  // so antd never registers it and `data.impactTypes` comes back undefined on submit.
  DelayToCompletion: (data.impactTypes ?? []).includes('delay'),
  KeyDateImpact: (data.impactTypes ?? []).includes('key-date'),
  CostIncrease: (data.impactTypes ?? []).includes('cost'),
  PerformanceImpairment: (data.impactTypes ?? []).includes('performance'),
  Attachments: context.attachments ?? [],
  ProjectName: context.projectName,
  ProjectReference: context.projectReference,
});

/**
 * Multipart encoding of the register payload.
 *
 * The endpoint is multipart so attachments can ride along with the fields. Note that
 * `isMultipart` alone is not enough: it only tells the api-client to skip `JSON.stringify`,
 * while the axios interceptor picks the multipart content type off `data instanceof FormData`.
 * The body therefore has to be real FormData, not a plain object.
 *
 * Scalars are stringified — booleans become "true"/"false", which is what the backend's bool
 * binder expects. Arrays are appended once per item so the collection binds, and an empty array
 * sends no entry at all. Files are appended as-is: stringifying one would send the useless
 * literal "[object File]" instead of its bytes.
 */
const toRegisterEarlyWarningFormData = (
  data: RegisterEwFormValues,
  context: RegisterEarlyWarningContext
): FormData => {
  const payload = toRegisterEarlyWarningRequest(data, context);
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof Blob) formData.append(key, item);
        else formData.append(key, String(item));
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const registerEarlyWarning = async ({
  data,
  context,
}: {
  data: RegisterEwFormValues;
  context: RegisterEarlyWarningContext;
}) => {
  return AUSPIRA<RegisterEarlyWarningRequest>({
    url: API_ENDPOINTS.EARLY_WARNING.REGISTER,
    method: 'POST',
    body: toRegisterEarlyWarningFormData(data, context),
    isMultipart: true,
  });
};

export const useRegisterEarlyWarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerEarlyWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARLY_WARNING_QUERY_KEY });
    },
  });
};
