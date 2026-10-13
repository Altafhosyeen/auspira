import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import { PMI_ENDPOINTS, PMI_QUOTATION_ENDPOINTS } from '../constants/pmi.constants';
import type {
  AcceptPmiQuotationInput,
  ConfirmPmiQuotationInput,
  ConfirmPmiQuotationResponseDto,
  PmiAttachmentDto,
  PmiAuditTrailEntry,
  PmiConversationDto,
  PmiListParams,
  PmiLookupResponseDto,
  PmiPageResultDto,
  ProjectManagerInstructionResponseDto,
  RegisterPmiRequest,
  RequestPmiQuotationRevisionInput,
} from '../types/pmi.types';
import { toPmiListParams } from '../utils/pmi-api.utils';
import { toRegisterPmiFormData } from '../utils/pmi-form.utils';

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const pmiService = {
  getListByProject: (projectId: string, params?: PmiListParams) =>
    AUSPIRA<PmiPageResultDto>({
      url: buildUrl(
        PMI_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId),
        toPmiListParams(params)
      ),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  getLookupByProject: (projectId: string) =>
    AUSPIRA<PmiLookupResponseDto[]>({
      url: PMI_ENDPOINTS.LOOKUP_BY_PROJECT.replace(':projectId', projectId),
      method: 'GET',
      skipLoader: true, // lookup query — must not block pages with the global overlay
    }),

  getById: (id: string) =>
    AUSPIRA<ProjectManagerInstructionResponseDto>({
      url: PMI_ENDPOINTS.BY_ID.replace(':id', id),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/audit-logs?entityId= — the shared audit trail for the PMI. `term` searches
  // details and username, `actionType` narrows to one action; both are the endpoint's own,
  // so neither is filtered in the browser.
  getAuditTrail: (id: string, term?: string, actionType?: number) =>
    AUSPIRA<PmiAuditTrailEntry[]>({
      url: buildUrl(PMI_ENDPOINTS.AUDIT_TRAIL, {
        entityId: id,
        term: term?.trim() || undefined,
        actionType,
      }),
      method: 'GET',
      skipLoader: true,
    }),

  // GET /api/attachments/:entityId/projects/:projectId — files hanging off the PMI.
  // `term` is the endpoint's own search, so filtering stays server-side.
  getAttachmentsByEntity: (entityId: string, projectId: string, term?: string) =>
    AUSPIRA<PmiAttachmentDto[]>({
      url: buildUrl(
        PMI_ENDPOINTS.PROJECT_ATTACHMENTS.replace(':entityId', entityId).replace(
          ':projectId',
          projectId
        ),
        { term: term?.trim() || undefined }
      ),
      method: 'GET',
      skipLoader: true,
    }),

  /** GET /api/attachments/download?url=... — bytes off the blob URL, saved by the caller. */
  downloadAttachment: (url: string) =>
    AUSPIRA<Blob>({
      url: buildUrl(PMI_ENDPOINTS.DOWNLOAD_ATTACHMENT, { url }),
      method: 'GET',
      skipLoader: true,
      responseType: 'blob' as const,
    }),

  // GET /api/project-emails/:id/conversations — the PMI's mail-thread summaries.
  // `term` is the endpoint's own search over sender, subject and message body, so the
  // thread list is never filtered in the browser.
  getConversations: (id: string, term?: string) =>
    AUSPIRA<PmiConversationDto[]>({
      url: buildUrl(PMI_ENDPOINTS.CONVERSATIONS.replace(':id', id), {
        term: term?.trim() || undefined,
      }),
      method: 'GET',
      skipLoader: true,
    }),

  /** POST /api/project-manager-instructions (multipart) — registers a new PMI. */
  create: (input: RegisterPmiRequest) =>
    AUSPIRA<ProjectManagerInstructionResponseDto>({
      url: PMI_ENDPOINTS.REGISTER,
      method: 'POST',
      body: toRegisterPmiFormData(input),
      isMultipart: true,
    }),

  /** POST /api/pmi-quotations/confirm — links the alert's quotation to a PMI. */
  confirmQuotation: (input: ConfirmPmiQuotationInput) =>
    AUSPIRA<ConfirmPmiQuotationResponseDto, ConfirmPmiQuotationInput>({
      url: PMI_QUOTATION_ENDPOINTS.CONFIRM,
      method: 'POST',
      body: input,
    }),

  /** POST /api/pmi-quotations/accept — accepts a PMI quotation. */
  acceptQuotation: (input: AcceptPmiQuotationInput) =>
    AUSPIRA<void, AcceptPmiQuotationInput>({
      url: PMI_QUOTATION_ENDPOINTS.ACCEPT,
      method: 'POST',
      body: input,
    }),

  /** POST /api/pmi-quotations/request-revision (multipart) — requests a revised quotation. */
  requestQuotationRevision: ({
    quotationId,
    subject,
    description,
    attachments,
  }: RequestPmiQuotationRevisionInput) => {
    const formData = new FormData();
    formData.append('QuotationId', quotationId);
    formData.append('Subject', subject);
    formData.append('Description', description);
    attachments?.forEach((file) => {
      formData.append('Attachments', file);
    });

    return AUSPIRA<void, FormData>({
      url: PMI_QUOTATION_ENDPOINTS.REQUEST_REVISION,
      method: 'POST',
      body: formData,
      isMultipart: true,
    });
  },

  /** GET /api/pmi-quotations/project-manager-instruction/:pmiId */
  getQuotationsByPmiId: (pmiId: string, status?: number) =>
    AUSPIRA<any[]>({
      url: buildUrl(
        PMI_QUOTATION_ENDPOINTS.BY_PMI.replace(':pmiId', pmiId),
        status != null ? { status } : undefined
      ),
      method: 'GET',
      skipLoader: true,
    }),
};
