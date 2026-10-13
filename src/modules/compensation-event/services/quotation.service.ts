import { AUSPIRA } from '@/lib/api/auspira-api';
import { QUOTATION_ENDPOINTS } from '../constants/compensation-event.constants';
import type { ProceedWithAssessmentInput } from '../types/compensation-event-assessment.types';
import type {
  AcceptQuotationInput,
  ConfirmQuotationInput,
  RequestQuotationRevisionInput,
} from '../types/compensation-event-quotation.types';
import type {
  ConfirmQuotationResponseDto,
  QuotationResponseDto,
} from '../types/compensation-event-quotation-api.types';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const quotationService = {
  getByCompensationEvent: (compensationEventId: string) =>
    AUSPIRA<QuotationResponseDto[]>({
      url: QUOTATION_ENDPOINTS.LIST_BY_COMPENSATION_EVENT.replace(
        ':compensationEventId',
        compensationEventId
      ),
      method: 'GET',
      skipLoader: true, // page-level fetch handled by the container's own Skeleton, not the global overlay
    }),

  getById: (id: string) =>
    AUSPIRA<QuotationResponseDto>({
      url: QUOTATION_ENDPOINTS.GET_BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true, // page-level fetch handled by the container's own Skeleton, not the global overlay
    }),

  confirm: (input: ConfirmQuotationInput) =>
    AUSPIRA<ConfirmQuotationResponseDto, ConfirmQuotationInput>({
      url: QUOTATION_ENDPOINTS.CONFIRM,
      method: 'POST',
      body: input,
    }),

  accept: (input: AcceptQuotationInput) =>
    AUSPIRA<void, AcceptQuotationInput>({
      url: QUOTATION_ENDPOINTS.ACCEPT,
      method: 'POST',
      body: input,
    }),

  // Multipart — the backend's RequestQuotationRevisionDto only reads
  // quotationId/subject/description/attachments. `isMultipart` alone is not enough; the
  // axios interceptor picks the content type off `data instanceof FormData`.
  requestRevision: ({
    quotationId,
    subject,
    description,
    attachments,
  }: RequestQuotationRevisionInput) => {
    const formData = new FormData();
    formData.append('QuotationId', quotationId);
    formData.append('Subject', subject);
    formData.append('Description', description);
    attachments?.forEach((file) => {
      formData.append('Attachments', file);
    });

    return AUSPIRA<void, FormData>({
      url: QUOTATION_ENDPOINTS.REQUEST_REVISION,
      method: 'POST',
      body: formData,
      isMultipart: true,
    });
  },

  // Multipart — the backend's ProceedWithAssessmentDto reads QuotationId/AssessedTotalCost/
  // AssessedClaimDays/Comments/Items[]/IsFile/QuotationFile/AdditionalFiles. Items is an
  // array of objects, so each one is indexed the same way the meeting modals index
  // ExternalAttendees[i] — form-data has no native array-of-object shape.
  proceedWithAssessment: ({
    quotationId,
    assessedTotalCost,
    assessedClaimDays,
    comments,
    items,
    isFile,
    quotationFile,
    additionalFiles,
  }: ProceedWithAssessmentInput) => {
    const formData = new FormData();
    formData.append('QuotationId', quotationId);
    formData.append('AssessedTotalCost', String(assessedTotalCost));
    formData.append('AssessedClaimDays', String(assessedClaimDays));
    formData.append('Comments', comments);
    formData.append('IsFile', String(isFile));

    items.forEach((item, index) => {
      formData.append(`Items[${index}].Category`, item.category);
      formData.append(`Items[${index}].Description`, item.description);
      formData.append(`Items[${index}].Amount`, String(item.amount));
    });

    if (isFile && quotationFile) {
      formData.append('QuotationFile', quotationFile);
    }
    additionalFiles?.forEach((file) => {
      formData.append('AdditionalFiles', file);
    });

    return AUSPIRA<void, FormData>({
      url: QUOTATION_ENDPOINTS.PROCEED_WITH_ASSESSMENT,
      method: 'POST',
      body: formData,
      isMultipart: true,
    });
  },
};
