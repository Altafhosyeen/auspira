import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateAlertQueries } from '@/hooks/modules/project-alerts';
import type { HelperFunctions } from '@/types';
import { defectNoticeService } from '../services/defect-notice.service';
import type {
  AcceptDefectNoticeInput,
  CloseDefectNoticeInput,
  DefectNotice,
  DefectNoticeAttachmentDto,
  DefectNoticeAuditEntry,
  DefectNoticeConversationDto,
  DefectNoticeFormValues,
  DefectNoticeListParams,
  DefectNoticeListResponse,
  DefectNoticeMeetingDto,
  DefectNoticeResponseDto,
} from '../types/defect-notice.types';
import { downloadBlob } from '../utils/defect-notice.utils';
import { toDefectNotice, toDefectNoticeListResponse } from '../utils/defect-notice-api.utils';
import type { CreateDefectNoticeContext } from '../utils/defect-notice-form.utils';

export const DEFECT_NOTICE_QUERY_KEY = ['defect-notice'] as const;

const fetchListByProject = async (
  projectId: string,
  params?: DefectNoticeListParams
): Promise<DefectNoticeListResponse> => {
  const result = await defectNoticeService.getListByProject(projectId, params);
  const mapped = toDefectNoticeListResponse(result);
  return { count: mapped.count, next: null, previous: null, items: mapped.items };
};

// Standalone fetch — used by the Excel export, which needs the full register.
export const fetchDefectNotices = async (
  projectId: string,
  params?: DefectNoticeListParams
): Promise<DefectNoticeListResponse> => fetchListByProject(projectId, params);

export const useGetDefectNotices = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: DefectNoticeListParams; enabled?: boolean },
  helpers?: HelperFunctions<DefectNoticeListResponse>
) =>
  useQuery<DefectNoticeListResponse>({
    queryKey: [
      ...DEFECT_NOTICE_QUERY_KEY,
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.includeAll ?? false,
    ],
    queryFn: () => fetchListByProject(projectId!, params),
    // Paging swaps the query key — hold the previous page rather than flash an empty table.
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

export const useGetDefectNoticeById = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<DefectNotice>
) =>
  useQuery<DefectNotice>({
    queryKey: [...DEFECT_NOTICE_QUERY_KEY, id ?? ''],
    queryFn: async () => toDefectNotice(await defectNoticeService.getById(id!)),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Raw detail record — keeps the full DTO so the detail view reads the raw fields. */
export const useGetDefectNoticeDetail = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<DefectNoticeResponseDto>
) =>
  useQuery<DefectNoticeResponseDto>({
    queryKey: [...DEFECT_NOTICE_QUERY_KEY, 'detail', id ?? ''],
    queryFn: () => defectNoticeService.getById(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Who did each lifecycle stage — the shared audit-log endpoint keyed on the notice id. */
export const useGetDefectNoticeAuditTrail = (
  {
    id,
    term,
    actionType,
    enabled,
  }: { id?: string; term?: string; actionType?: number; enabled?: boolean },
  helpers?: HelperFunctions<DefectNoticeAuditEntry[]>
) =>
  useQuery<DefectNoticeAuditEntry[]>({
    // Both narrowing values are the endpoint's own, so both belong in the key — otherwise a
    // search or a change of action would read the previous result straight out of the cache.
    queryKey: [...DEFECT_NOTICE_QUERY_KEY, 'audit-trail', id ?? '', term ?? '', actionType ?? ''],
    queryFn: () => defectNoticeService.getAuditTrail(id!, term, actionType),
    // Keeps the previous rows on screen while a new term is in flight, so the list does
    // not flash empty between keystrokes.
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Attachments hanging off the notice on its project. */
export const useGetDefectNoticeAttachments = (
  {
    entityId,
    projectId,
    term,
    enabled,
  }: { entityId?: string; projectId?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<DefectNoticeAttachmentDto[]>
) =>
  useQuery<DefectNoticeAttachmentDto[]>({
    // `term` belongs in the key — without it every search would read the previous result
    // straight out of the cache instead of re-querying.
    queryKey: [
      ...DEFECT_NOTICE_QUERY_KEY,
      'attachments',
      entityId ?? '',
      projectId ?? '',
      term ?? '',
    ],
    queryFn: () => defectNoticeService.getAttachmentsByEntity(entityId!, projectId!, term),
    // Keeps the previous rows on screen while a new term is in flight, so the list does
    // not flash empty between keystrokes.
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!entityId && !!projectId,
  });

/** Download one attachment via its blob URL — fetches the file as a blob and saves it. */
export const useDownloadDefectNoticeAttachment = () =>
  useMutation({
    mutationFn: async ({ url, fileName }: { url: string; fileName: string }) => {
      const blob = await defectNoticeService.downloadAttachment(url);
      downloadBlob(blob, fileName);
    },
  });

// The notice's mail threads, for the Email Thread tab. The conversations route is
// entity-scoped, so this takes the notice's own id — the same id the PMI, Early Warning
// and Compensation Event Email tabs pass — not the record's `projectEmailId`.
export const useGetDefectNoticeConversations = (
  { entityId, term, enabled }: { entityId?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<DefectNoticeConversationDto[]>
) =>
  useQuery<DefectNoticeConversationDto[]>({
    // `term` belongs in the key — without it every search would read the previous result
    // straight out of the cache instead of re-querying.
    queryKey: [...DEFECT_NOTICE_QUERY_KEY, 'conversations', entityId ?? '', term ?? ''],
    queryFn: () => defectNoticeService.getConversations(entityId!, term),
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!entityId,
  });

/** Meetings booked against the notice, for the Meetings tab. */
export const useGetDefectNoticeMeetings = (
  { entityId, enabled }: { entityId?: string; enabled?: boolean },
  helpers?: HelperFunctions<DefectNoticeMeetingDto[]>
) =>
  useQuery<DefectNoticeMeetingDto[]>({
    queryKey: [...DEFECT_NOTICE_QUERY_KEY, 'meetings', entityId ?? ''],
    queryFn: () => defectNoticeService.getMeetingsByEntity(entityId!),
    ...helpers,
    enabled: (enabled ?? true) && !!entityId,
  });

/** POST /api/meetings/defect-notice — schedules a meeting against the notice (EW flow). */
export const useCreateDefectNoticeMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => defectNoticeService.createMeeting(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEFECT_NOTICE_QUERY_KEY });
    },
  });
};

/** POST /api/defect-notices — raises a notice manually from the create form. */
export const useCreateDefectNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      context,
    }: {
      values: DefectNoticeFormValues;
      context: CreateDefectNoticeContext;
    }) => defectNoticeService.create(values, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEFECT_NOTICE_QUERY_KEY });
    },
  });
};

/** POST /api/defect-notices/close — marks the notice closed. */
export const useCloseDefectNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CloseDefectNoticeInput) => defectNoticeService.close(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEFECT_NOTICE_QUERY_KEY });
    },
  });
};

/** POST /api/defect-notices/accept — creates the notice from a project alert (alert type 6). */
export const useAcceptDefectNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AcceptDefectNoticeInput) => defectNoticeService.accept(input),
    onSuccess: () => {
      // Accepting creates the notice, so the register must refetch — same rule the CE
      // accept follows for its own register.
      queryClient.invalidateQueries({ queryKey: DEFECT_NOTICE_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};
