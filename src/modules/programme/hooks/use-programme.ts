import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useGetProjectEmailConversationDetails } from '@/hooks/modules/project';
import {
  getPrimaryAlertEmail,
  invalidateAlertQueries,
  useGetProjectAlertById,
  useGetProjectAlerts,
} from '@/hooks/modules/project-alerts';
import type { HelperFunctions } from '@/types';
import { programmeService } from '../services/programme.service';
import type {
  AcceptProgrammeInput,
  ProgrammeAlertDetail,
  ProgrammeHealthResponseDto,
  ProgrammeListPageResultDto,
  ProgrammeListParams,
  ProgrammeRegisterListResponse,
  ProgrammeRegisterRow,
} from '../types/programme.types';
import {
  downloadBlob,
  matchBySourceIds,
  programmeFileName,
  toProgrammeRegisterListResponse,
} from '../utils/programme-api.utils';

export const PROGRAMME_QUERY_KEY = ['programme'] as const;

const fetchProgrammeSummary = async (
  projectId: string,
  params?: ProgrammeListParams
): Promise<ProgrammeRegisterListResponse> => {
  const result = await programmeService.getSummaryByProject(projectId, params);
  const mapped = toProgrammeRegisterListResponse(result);
  return { count: mapped.count, next: null, previous: null, items: mapped.items };
};

// Standalone fetch — used by the Excel export, which needs the whole register rather than the
// page on screen.
export const fetchProgrammeSummaries = async (
  projectId: string,
  params?: ProgrammeListParams
): Promise<ProgrammeRegisterListResponse> => fetchProgrammeSummary(projectId, params);

// The Program Health register, paged and searched server-side (Skip/Top/Term/IncludeAll).
// Both the list screen and the detail's Programme Register tab read this one endpoint, so the
// two surfaces can never disagree about what revisions exist.
export const useGetProgrammeSummary = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: ProgrammeListParams; enabled?: boolean },
  helpers?: HelperFunctions<ProgrammeRegisterListResponse>
) =>
  useQuery<ProgrammeRegisterListResponse>({
    queryKey: [
      ...PROGRAMME_QUERY_KEY,
      'summary',
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.includeAll ?? false,
    ],
    queryFn: () => fetchProgrammeSummary(projectId!, params),
    // Paging swaps the query key — hold the previous page rather than flash an empty table.
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/** The full programme health records for a project — version, extractor json, source email. */
export const useGetProgrammeList = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: ProgrammeListParams; enabled?: boolean },
  helpers?: HelperFunctions<ProgrammeListPageResultDto>
) =>
  useQuery<ProgrammeListPageResultDto>({
    queryKey: [
      ...PROGRAMME_QUERY_KEY,
      'list',
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.includeAll ?? false,
    ],
    queryFn: () => programmeService.getListByProject(projectId!, params),
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/** GET /api/programme/{id} — one stored record by its own id. */
export const useGetProgrammeById = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<ProgrammeHealthResponseDto>
) =>
  useQuery<ProgrammeHealthResponseDto>({
    queryKey: [...PROGRAMME_QUERY_KEY, 'record', id ?? ''],
    queryFn: () => programmeService.getById(id!),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

// The alert a stored record was accepted from, matched on the source conversation/project-email
// id — the pair the alert-mode join reads in the other direction. Fetched only when the record
// carries such an id, so alert mode never pays for it.
//
// The page has to be wide on purpose: the accepted programme's signal sits wherever it was
// raised in the project's alert history, and the endpoint pages server-side. Left to its own
// default page size the match misses on any project with more alerts than one page, and the
// Programme Received tab — which reads the alert for its title, sender, subject and due date —
// renders nothing at all. Same reason `ProgrammeDetailPage` pins the status lookup's page size.
const ALERT_LOOKUP_PAGE_SIZE = 100;

export const useGetProgrammeRecordAlert = (record?: ProgrammeHealthResponseDto) => {
  const { data } = useGetProjectAlerts(
    {
      projectId: record?.projectId ?? '',
      params: { includeAll: true, top: ALERT_LOOKUP_PAGE_SIZE },
      enabled: !!record?.conversationId || !!record?.projectEmailId,
    },
    { retry: false }
  );

  return useMemo(
    () => (record ? matchBySourceIds(data?.items, record) : undefined),
    [data?.items, record]
  );
};

// Program Health has no entity of its own yet — it reads the shared ProjectAlert by id,
// the same record the Awareness "Open" action navigates with. Kept as its own hook (rather
// than importing the awareness module's) so the two modules stay independent per
// .agents/architecture.md.
//
// The response is typed as the enriched alert: the backend hangs `programme`,
// `aiProgrammeHealthCheck`, `variance` and `obligations` off a Programee alert, and the detail
// tabs render straight off those four objects.
//
export const useGetProgrammeAlert = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<ProgrammeAlertDetail>
) =>
  useGetProjectAlertById<ProgrammeAlertDetail>(
    { id: id ?? '', enabled: (enabled ?? true) && !!id },
    helpers
  );

/** Sender/recipient + attachments for the alert's source email, for the Programme Received tab. */
export const useProgrammeEmail = (
  alert?: ProgrammeAlertDetail,
  record?: ProgrammeHealthResponseDto | null
) => {
  // The stored record carries the same mail-thread id as the alert it came from, so the
  // attachments still resolve from the register side when the alert itself cannot be joined.
  const { data: conversationDetails } = useGetProjectEmailConversationDetails({
    projectId: alert?.projectId ?? record?.projectId,
    conversationId: alert?.conversationId ?? record?.conversationId ?? undefined,
  });

  const email = useMemo(() => (alert ? getPrimaryAlertEmail(alert) : undefined), [alert]);
  const attachments = useMemo(
    () => conversationDetails?.[0]?.attachments ?? [],
    [conversationDetails]
  );

  return { email, attachments };
};

// The register's download action. A row's `fileUrl` is a private blob URL, so the bytes are
// fetched off it through the shared attachments endpoint rather than opened in a new tab —
// the route the PMI, Defect Notice and Daily Site Report downloads go through. Takes the row
// itself, and names the file after its URL, since the summary carries no file name.
export const useDownloadProgrammeFile = () => {
  const mutation = useMutation({
    mutationFn: async (row: ProgrammeRegisterRow) => {
      if (!row.fileUrl) return;
      const blob = await programmeService.downloadAttachment(row.fileUrl);
      downloadBlob(blob, programmeFileName(row.reference, row.fileUrl));
    },
  });

  // The row in flight comes off the mutation's own variables — no separate state to keep in
  // step, and only that row's action spins.
  return {
    ...mutation,
    downloadingId: mutation.isPending ? mutation.variables?.id : undefined,
  };
};

// POST /api/programme/accept — accepts the programme behind a project alert (alert type 8)
// and stores it against the project, which is what makes it appear on Program Health. Same
// signal-to-record flow the Defect Notice and Daily Site Report accepts run, except this one
// takes no attachments.
export const useAcceptProgramme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AcceptProgrammeInput) => programmeService.accept(input),
    onSuccess: () => {
      // Accepting creates the programme record, so Program Health must refetch — the same
      // rule the DN and PDR accepts follow for their own registers.
      queryClient.invalidateQueries({ queryKey: PROGRAMME_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};
