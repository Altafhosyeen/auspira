import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { COMPENSATION_EVENT_ENDPOINTS } from '../constants/compensation-event.constants';
import type {
  CompensationEvent,
  CreateCompensationEventInput,
  UpdateCompensationEventInput,
} from '../types/compensation-event.types';
import type {
  CompensationEventFinancialResponseDto,
  CompensationEventLookupResponse,
  CompensationEventPageResultDto,
  CompensationEventProjectListParams,
  CompensationEventResponseDto,
  CompensationEventTotalsResponseDto,
  CreateCompensationEventNoticeInput,
  VerifyCompensationEventReferenceResult,
} from '../types/compensation-event-api.types';

// Multipart encoding of the notice payload. The endpoint is multipart so attachments
// ride along with the fields, and `isMultipart` alone is not enough — the axios
// interceptor picks the content type off `data instanceof FormData`, so the body has
// to be real FormData. Scalars are stringified; files are appended as-is.
const toNoticeFormData = (input: CreateCompensationEventNoticeInput): FormData => {
  const formData = new FormData();

  const append = (key: string, value: string | number | boolean | undefined) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  };

  append('ProjectId', input.projectId);
  append('Reference', input.reference);
  append('Title', input.title);
  append('ClauseNumber', input.clauseNumber);
  append('ClauseTitle', input.clauseTitle);
  append('ClauseDescription', input.clauseDescription);
  append('AdditionalClauseReferences', input.additionalClauseReferences);
  append('Type', input.type);
  append('Description', input.description);
  append('ProposedEffectDescription', input.proposedEffectDescription);
  append('EstimatedValue', input.estimatedValue);
  append('EstimatedDays', input.estimatedDays);
  append('Currency', input.currency);
  append('IsQuotationRequired', input.isQuotationRequired);
  append('RequiresPmDecision', input.requiresPmDecision);
  append('ProjectAlertId', input.projectAlertId);
  append('EarlyWarningReference', input.earlyWarningReference);
  append('EarlyWarningId', input.earlyWarningId);
  append('RaisedBy', input.raisedBy);
  append('Notes', input.notes);
  append('Subject', input.subject);
  append('To', input.to);
  append('CC', input.cc);
  append('BCC', input.bcc);
  append('ProjectName', input.projectName);
  append('ProjectReference', input.projectReference);

  (input.attachments ?? []).forEach((file) => {
    formData.append('Attachments', file);
  });

  return formData;
};

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const compensationEventService = {
  getListByProject: (projectId: string, params?: CompensationEventProjectListParams) =>
    AUSPIRA<CompensationEventPageResultDto>({
      url: buildUrl(COMPENSATION_EVENT_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId), {
        Skip: params?.skip,
        Top: params?.top,
        Term: params?.term?.trim(),
        IncludeAll: params?.includeAll,
        // Multi-select state filter — comma-joined so one param carries every picked
        // status code. The endpoint declares this as `status` (lowercase, singular), so
        // the casing here is not ours to tidy. Omitted entirely when nothing is picked,
        // so the backend keeps returning the unfiltered register.
        status: params?.statuses?.length ? params.statuses.join(',') : undefined,
      }),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  getLookupByProject: (projectId: string) =>
    AUSPIRA<CompensationEventLookupResponse[]>({
      url: COMPENSATION_EVENT_ENDPOINTS.LOOKUP_BY_PROJECT.replace(':projectId', projectId),
      method: 'GET',
      skipLoader: true, // lookup query — must not block the page with the global overlay
    }),

  getById: (id: string) =>
    AUSPIRA<CompensationEventResponseDto>({
      url: COMPENSATION_EVENT_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  getTotalsByProject: (projectId: string) =>
    AUSPIRA<CompensationEventTotalsResponseDto>({
      url: COMPENSATION_EVENT_ENDPOINTS.TOTALS_BY_PROJECT.replace(':projectId', projectId),
      method: 'GET',
      skipLoader: true,
    }),

  getFinancialSummary: (id: string) =>
    AUSPIRA<CompensationEventFinancialResponseDto>({
      url: COMPENSATION_EVENT_ENDPOINTS.FINANCIAL.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  verifyReference: (reference: string, projectId?: string) =>
    AUSPIRA<VerifyCompensationEventReferenceResult>({
      url: buildUrl(COMPENSATION_EVENT_ENDPOINTS.VERIFY_REFERENCE, {
        Reference: reference,
        ProjectId: projectId,
      }),
      method: 'GET',
      skipLoader: true, // field-level validation — must not block the form
    }),

  createNotice: (input: CreateCompensationEventNoticeInput) =>
    AUSPIRA<CompensationEventResponseDto>({
      url: COMPENSATION_EVENT_ENDPOINTS.LIST,
      method: 'POST',
      body: toNoticeFormData(input),
      isMultipart: true,
    }),

  create: (input: CreateCompensationEventInput) =>
    AUSPIRA<CompensationEvent>({
      url: COMPENSATION_EVENT_ENDPOINTS.LIST,
      method: 'POST',
      body: input,
    }),

  update: (id: string, input: UpdateCompensationEventInput) =>
    AUSPIRA<CompensationEvent>({
      url: COMPENSATION_EVENT_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'PUT',
      body: input,
    }),

  remove: (id: string) =>
    AUSPIRA<void>({
      url: COMPENSATION_EVENT_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'DELETE',
    }),
};
