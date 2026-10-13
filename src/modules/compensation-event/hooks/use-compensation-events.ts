import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { HelperFunctions } from '@/types';
import { compensationEventService } from '../services/compensation-event.service';
import type {
  CompensationEvent,
  CompensationEventListResponse,
  CreateCompensationEventInput,
  UpdateCompensationEventInput,
} from '../types/compensation-event.types';
import type {
  CompensationEventLookupOption,
  CompensationEventLookupResponse,
  CompensationEventProjectListParams,
  CreateCompensationEventNoticeInput,
} from '../types/compensation-event-api.types';
import type { CompensationEventFinancials } from '../utils/compensation-event.utils';
import {
  toCompensationEvent,
  toCompensationEventFinancials,
  toCompensationEventListResponse,
  toCompensationEventLookupOptions,
  toNumber,
} from '../utils/compensation-event-api.utils';

export const COMPENSATION_EVENT_QUERY_KEY = ['compensation-event'] as const;

// The totals endpoint's two figures, parsed — the API may send either as a string.
export interface CompensationEventTotals {
  totalQuotedValue: number;
  totalQuotedDays: number;
}

// Imperative read of the same list the register renders — the Excel export runs it
// once with `includeAll` instead of reusing the table's paged rows.
export const getCompensationEvents = async (
  projectId: string,
  params?: CompensationEventProjectListParams
): Promise<CompensationEventListResponse> =>
  toCompensationEventListResponse(
    await compensationEventService.getListByProject(projectId, params)
  );

export const useGetCompensationEvents = (
  {
    projectId,
    params,
    enabled,
  }: { projectId?: string; params?: CompensationEventProjectListParams; enabled?: boolean },
  helpers?: HelperFunctions<CompensationEventListResponse>
) =>
  useQuery<CompensationEventListResponse>({
    queryKey: [
      ...COMPENSATION_EVENT_QUERY_KEY,
      projectId ?? '',
      params?.skip ?? 0,
      params?.top ?? 0,
      params?.term ?? '',
      params?.includeAll ?? false,
      params?.statuses?.join(',') ?? '',
    ],
    queryFn: () => getCompensationEvents(projectId!, params),
    // Paging swaps the query key — hold the previous page rather than flash an empty table.
    placeholderData: keepPreviousData,
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

export const useGetCompensationEventById = (
  { id, enabled }: { id: string; enabled?: boolean },
  helpers?: HelperFunctions<CompensationEvent>
) =>
  useQuery<CompensationEvent>({
    queryKey: [...COMPENSATION_EVENT_QUERY_KEY, id],
    queryFn: async () => toCompensationEvent(await compensationEventService.getById(id)),
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

// GET /api/compensation-events/{id}/financial — the final quotation's financial
// summary. The Financials tab falls back to its own client-derived figures whenever
// this query has no data (e.g. a CE with no quotation yet — 404s are not retried).
export const useGetCompensationEventFinancialSummary = (
  { id, enabled }: { id?: string; enabled?: boolean },
  helpers?: HelperFunctions<CompensationEventFinancials>
) =>
  useQuery<CompensationEventFinancials>({
    queryKey: [...COMPENSATION_EVENT_QUERY_KEY, id, 'financial'],
    queryFn: async () =>
      toCompensationEventFinancials(await compensationEventService.getFinancialSummary(id!)),
    // A 404 here means no quotation exists yet — that will not change on retry, so
    // only transient failures get the usual one retry.
    retry: (failureCount, error) =>
      (error as AxiosError)?.response?.status !== 404 && failureCount < 1,
    ...helpers,
    enabled: (enabled ?? true) && !!id,
  });

// Quoted value and days totalled across the project's accepted or assessed events. The
// backend totals these, so the register's tiles no longer depend on how many rows the
// client happened to fetch.
export const useGetCompensationEventTotals = (
  { projectId, enabled }: { projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<CompensationEventTotals>
) =>
  useQuery<CompensationEventTotals>({
    queryKey: [...COMPENSATION_EVENT_QUERY_KEY, 'totals', projectId],
    queryFn: async () => {
      const totals = await compensationEventService.getTotalsByProject(projectId!);
      return {
        totalQuotedValue: toNumber(totals.totalQuotedValue) ?? 0,
        totalQuotedDays: toNumber(totals.totalQuotedDays) ?? 0,
      };
    },
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/** Lightweight id/reference/title list for pickers — one row per CE on the project. */
export const useGetCompensationEventsLookup = (
  { projectId, enabled }: { projectId?: string; enabled?: boolean },
  helpers?: HelperFunctions<CompensationEventLookupResponse[]>
) =>
  useQuery<CompensationEventLookupResponse[]>({
    queryKey: [...COMPENSATION_EVENT_QUERY_KEY, 'lookup', projectId ?? ''],
    queryFn: () => compensationEventService.getLookupByProject(projectId!),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

// Same request and cache entry as `useGetCompensationEventsLookup`, mapped to antd
// Select options — the mapping runs per observer, so nothing is fetched twice.
export const useGetCompensationEventLookupOptions = ({
  projectId,
  enabled,
}: {
  projectId?: string;
  enabled?: boolean;
}) =>
  useQuery<CompensationEventLookupResponse[], Error, CompensationEventLookupOption[]>({
    queryKey: [...COMPENSATION_EVENT_QUERY_KEY, 'lookup', projectId ?? ''],
    queryFn: () => compensationEventService.getLookupByProject(projectId!),
    select: toCompensationEventLookupOptions,
    enabled: (enabled ?? true) && !!projectId,
  });

/** Field-level check — resolves `true` when the reference is free on this project. */
export const useVerifyCompensationEventReference = () =>
  useMutation({
    mutationFn: async ({ reference, projectId }: { reference: string; projectId?: string }) => {
      const result = await compensationEventService.verifyReference(reference, projectId);
      return result?.isAvailable === true;
    },
  });

export const useCreateCompensationEventNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompensationEventNoticeInput) =>
      compensationEventService.createNotice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
    },
  });
};

export const useCreateCompensationEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompensationEventInput) => compensationEventService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
    },
  });
};

export const useUpdateCompensationEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompensationEventInput }) =>
      compensationEventService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
    },
  });
};

export const useDeleteCompensationEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => compensationEventService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
    },
  });
};
