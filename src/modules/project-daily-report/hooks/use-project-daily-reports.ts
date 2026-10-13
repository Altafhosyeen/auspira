import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateAlertQueries } from '@/hooks/modules/project-alerts';
import type { HelperFunctions } from '@/types';
import { projectDailyReportService } from '../services/project-daily-report.service';
import type {
  AcceptDailySiteReportInput,
  DailySiteReportAttachmentDto,
  DailySiteReportAuditEntryDto,
  DailySiteReportConversationDto,
  ProjectDailyReport,
  ProjectDailyReportListParams,
  ProjectDailyReportListResponse,
} from '../types/project-daily-report.types';
import { downloadBlob } from '../utils/project-daily-report.utils';
import {
  toProjectDailyReport,
  toProjectDailyReportListResponse,
} from '../utils/project-daily-report-api.utils';

export const PROJECT_DAILY_REPORT_QUERY_KEY = ['project-daily-report'] as const;

const fetchListByProject = async (
  projectId: string,
  params?: ProjectDailyReportListParams
): Promise<ProjectDailyReportListResponse> => {
  const result = await projectDailyReportService.getListByProject(projectId, params);
  const mapped = toProjectDailyReportListResponse(result);
  return { count: mapped.count, next: null, previous: null, items: mapped.items };
};

// Standalone fetch — used by the Excel export, which needs the full register rather than the
// page on screen.
export const fetchProjectDailyReports = async (
  projectId: string,
  params?: ProjectDailyReportListParams
): Promise<ProjectDailyReportListResponse> => fetchListByProject(projectId, params);

/** The register, paged and searched server-side (Skip/Top/Term/IncludeAll). */
export const useGetProjectDailyReports = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: ProjectDailyReportListParams; enabled?: boolean },
  helpers?: HelperFunctions<ProjectDailyReportListResponse>
) =>
  useQuery<ProjectDailyReportListResponse>({
    queryKey: [
      ...PROJECT_DAILY_REPORT_QUERY_KEY,
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

/** One report, for the detail screen — GET /api/daily-site-reports/{id}. */
export const useGetProjectDailyReportById = (
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<ProjectDailyReport>
) =>
  useQuery<ProjectDailyReport>({
    queryKey: [...PROJECT_DAILY_REPORT_QUERY_KEY, 'detail', id],
    queryFn: async () => toProjectDailyReport(await projectDailyReportService.getById(id)),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Who did what on the report — the shared audit-log endpoint keyed on the report id. */
export const useGetProjectDailyReportAuditTrail = (
  {
    id,
    term,
    actionType,
    enabled,
  }: { id?: string; term?: string; actionType?: number; enabled?: boolean },
  helpers?: HelperFunctions<DailySiteReportAuditEntryDto[]>
) =>
  useQuery<DailySiteReportAuditEntryDto[]>({
    // Both narrowing values are the endpoint's own, so both belong in the key — otherwise a
    // search or a change of action would read the previous result straight out of the cache.
    queryKey: [
      ...PROJECT_DAILY_REPORT_QUERY_KEY,
      'audit-trail',
      id ?? '',
      term ?? '',
      actionType ?? '',
    ],
    queryFn: () => projectDailyReportService.getAuditTrail(id!, term, actionType),
    // Keeps the previous rows on screen while a new term is in flight, so the list does not
    // flash empty between keystrokes.
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

/** Attachments hanging off the report on its project. */
export const useGetProjectDailyReportAttachments = (
  {
    entityId,
    projectId,
    term,
    enabled,
  }: { entityId?: string; projectId?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<DailySiteReportAttachmentDto[]>
) =>
  useQuery<DailySiteReportAttachmentDto[]>({
    // `term` belongs in the key — without it every search would read the previous result
    // straight out of the cache instead of re-querying.
    queryKey: [
      ...PROJECT_DAILY_REPORT_QUERY_KEY,
      'attachments',
      entityId ?? '',
      projectId ?? '',
      term ?? '',
    ],
    queryFn: () => projectDailyReportService.getAttachmentsByEntity(entityId!, projectId!, term),
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!entityId && !!projectId,
  });

// POST /api/daily-site-reports/accept — creates the report from a project alert (alert type 7).
// Same signal-to-record flow the Defect Notice and Compensation Event accepts run.
export const useAcceptDailySiteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AcceptDailySiteReportInput) => projectDailyReportService.accept(input),
    onSuccess: () => {
      // Accepting creates the report, so the register must refetch — same rule the CE and DN
      // accepts follow for their own registers.
      queryClient.invalidateQueries({ queryKey: PROJECT_DAILY_REPORT_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

/** Download one attachment via its blob URL — fetches the file as a blob and saves it. */
export const useDownloadProjectDailyReportAttachment = () =>
  useMutation({
    mutationFn: async ({ url, fileName }: { url: string; fileName: string }) => {
      const blob = await projectDailyReportService.downloadAttachment(url);
      downloadBlob(blob, fileName);
    },
  });

// The report's mail threads, for the Email Thread tab. The conversations route is
// entity-scoped, so this takes the report's own id — the same id the PMI, Early Warning,
// Compensation Event and Defect Notice Email tabs pass.
export const useGetProjectDailyReportConversations = (
  { entityId, term, enabled }: { entityId?: string; term?: string; enabled?: boolean },
  helpers?: HelperFunctions<DailySiteReportConversationDto[]>
) =>
  useQuery<DailySiteReportConversationDto[]>({
    // `term` belongs in the key — without it every search would read the previous result
    // straight out of the cache instead of re-querying.
    queryKey: [...PROJECT_DAILY_REPORT_QUERY_KEY, 'conversations', entityId ?? '', term ?? ''],
    queryFn: () => projectDailyReportService.getConversations(entityId!, term),
    placeholderData: (previous) => previous,
    ...helpers,
    enabled: (enabled ?? true) && !!entityId,
  });
