import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateAlertQueries } from '@/hooks/modules/project-alerts';
import type { HelperFunctions } from '@/types';
import { pmiService } from '../services/pmi.service';
import type {
  AcceptPmiQuotationInput,
  ConfirmPmiQuotationInput,
  PmiAttachmentDto,
  PmiAuditTrailEntry,
  PmiConversationDto,
  PmiListParams,
  PmiListResponse,
  PmiLookupResponseDto,
  ProjectManagerInstruction,
  ProjectManagerInstructionResponseDto,
  RegisterPmiRequest,
  RequestPmiQuotationRevisionInput,
} from '../types/pmi.types';
import { downloadBlob } from '../utils/pmi.utils';
import { toPmiListResponse, toProjectManagerInstruction } from '../utils/pmi-api.utils';

export const PMI_QUERY_KEY = ['project-manager-instruction'] as const;

const fetchListByProject = async (
  projectId: string,
  params?: PmiListParams
): Promise<PmiListResponse> => {
  const result = await pmiService.getListByProject(projectId, params);
  const mapped = toPmiListResponse(result);
  return { count: mapped.count, next: null, previous: null, items: mapped.items };
};

// Standalone fetch — used by the Excel export, which needs the full register.
export const fetchPmis = async (
  projectId: string,
  params?: PmiListParams
): Promise<PmiListResponse> => fetchListByProject(projectId, params);

export const useGetPmis = (
  { projectId, params, enabled }: { projectId?: string; params?: PmiListParams; enabled?: boolean },
  helpers?: HelperFunctions<PmiListResponse>
) =>
  useQuery<PmiListResponse>({
    queryKey: [
      ...PMI_QUERY_KEY,
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.includeAll ?? false,
      params?.status ?? '',
    ],
    queryFn: () => fetchListByProject(projectId!, params),
    // Paging swaps the query key — hold the previous page rather than flash an empty table.
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

export const useGetPmiById = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<ProjectManagerInstruction>
) =>
  useQuery<ProjectManagerInstruction>({
    queryKey: [...PMI_QUERY_KEY, id ?? ''],
    queryFn: async () => toProjectManagerInstruction(await pmiService.getById(id!)),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Lightweight id/reference/title list for pickers — one row per PMI on the project. */
export const useGetPmisLookup = (
  { projectId, enabled }: { projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<PmiLookupResponseDto[]>
) =>
  useQuery<PmiLookupResponseDto[]>({
    queryKey: [...PMI_QUERY_KEY, 'lookup', projectId ?? ''],
    queryFn: () => pmiService.getLookupByProject(projectId!),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/** Raw detail record — keeps the full DTO so the detail view reads the raw fields. */
export const useGetPmiDetail = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<ProjectManagerInstructionResponseDto>
) =>
  useQuery<ProjectManagerInstructionResponseDto>({
    queryKey: [...PMI_QUERY_KEY, 'detail', id ?? ''],
    queryFn: () => pmiService.getById(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Who did each lifecycle stage — the shared audit-log endpoint keyed on the PMI id. */
export const useGetPmiAuditTrail = (
  {
    id,
    term,
    actionType,
    enabled,
  }: { id?: string; term?: string; actionType?: number; enabled?: boolean },
  helpers?: HelperFunctions<PmiAuditTrailEntry[]>
) =>
  useQuery<PmiAuditTrailEntry[]>({
    // Both narrowing values belong in the key — otherwise a search or a change of
    // action would read the previous result straight out of the cache.
    queryKey: [...PMI_QUERY_KEY, 'audit-trail', id ?? '', term ?? '', actionType ?? ''],
    queryFn: () => pmiService.getAuditTrail(id!, term, actionType),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Attachments hanging off the PMI on its project. */
export const useGetPmiAttachments = (
  {
    entityId,
    projectId,
    term,
    enabled,
  }: { entityId?: string; projectId?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<PmiAttachmentDto[]>
) =>
  useQuery<PmiAttachmentDto[]>({
    // `term` belongs in the key — without it every search would read the first
    // result out of the cache instead of re-querying.
    queryKey: [...PMI_QUERY_KEY, 'attachments', entityId ?? '', projectId ?? '', term ?? ''],
    queryFn: () => pmiService.getAttachmentsByEntity(entityId!, projectId!, term),
    ...helpers,
    enabled: (enabled ?? true) && !!entityId && !!projectId,
  });

/** Download one attachment via its blob URL — fetches the file as a blob and saves it. */
export const useDownloadPmiAttachment = () =>
  useMutation({
    mutationFn: async ({ url, fileName }: { url: string; fileName: string }) => {
      const blob = await pmiService.downloadAttachment(url);
      downloadBlob(blob, fileName);
    },
  });

/** The PMI's mail threads, for the Email Thread tab. */
export const useGetPmiConversations = (
  { id, term, enabled }: { id?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<PmiConversationDto[]>
) =>
  useQuery<PmiConversationDto[]>({
    // `term` belongs in the key — without it every search would read the previous
    // result straight out of the cache instead of re-querying.
    queryKey: [...PMI_QUERY_KEY, 'conversations', id ?? '', term ?? ''],
    queryFn: () => pmiService.getConversations(id!, term),
    // Keeps the previous rows on screen while a new term is in flight, so the list
    // does not flash empty between keystrokes.
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** POST /api/project-manager-instructions — registers a new PMI. */
export const useCreatePmi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterPmiRequest) => pmiService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PMI_QUERY_KEY });
    },
  });
};

/** POST /api/pmi-quotations/confirm — links quotation to a PMI */
export const useConfirmPmiQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmPmiQuotationInput) => pmiService.confirmQuotation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PMI_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

/** POST /api/pmi-quotations/accept — accepts a PMI quotation */
export const useAcceptPmiQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AcceptPmiQuotationInput) => pmiService.acceptQuotation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PMI_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

/** POST /api/pmi-quotations/request-revision — requests revision for a PMI quotation */
export const useRequestPmiQuotationRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RequestPmiQuotationRevisionInput) =>
      pmiService.requestQuotationRevision(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PMI_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

/** GET /api/pmi-quotations/project-manager-instruction/:pmiId */
export const useGetPmiQuotations = (
  { pmiId, status, enabled }: { pmiId?: string; status?: number; enabled?: boolean },
  helpers?: HelperFunctions<any[]>
) =>
  useQuery<any[]>({
    queryKey: [...PMI_QUERY_KEY, 'quotations', pmiId ?? '', status ?? ''],
    queryFn: () => pmiService.getQuotationsByPmiId(pmiId!, status),
    ...helpers,
    enabled: (enabled ?? true) && !!pmiId,
  });
