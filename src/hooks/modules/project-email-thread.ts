import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types';

// Kept as a matching literal rather than importing `project.ts`'s own (unexported)
// PROJECT_QUERY_KEY — React Query keys match by value, and this file exists precisely
// to stay out of that 900+-line legacy module (see architecture's 500-line file cap).
const PROJECT_QUERY_KEY = ['project'] as const;

export interface ProjectEmailThreadParams {
  projectId: string;
  conversationId: string;
  /** Zero-based row offset. Omit along with `top` to fall back to `includeAll`. */
  skip?: number;
  /** Page size. Omit along with `skip` to fall back to `includeAll`. */
  top?: number;
  term?: string;
  /** Bypasses backend paging and returns every message — the default for callers
   *  (thread modal, attachments rail) that still do their own client-side paging. */
  includeAll?: boolean;
}

// Passing Skip/Top/IncludeAll can flip the backend onto its paged-endpoint code path,
// which wraps the same rows in a `{ items: [...], meta: { totalCount } }` envelope instead
// of a bare array — the shape every caller here has always assumed. Unwrap defensively so
// a plain array keeps flowing regardless of which shape this call happens to get back.
const unwrapThreadItems = (payload: unknown): { items: unknown[]; totalCount?: number } => {
  if (Array.isArray(payload)) return { items: payload };
  if (payload && typeof payload === 'object') {
    const envelope = payload as { items?: unknown; meta?: { totalCount?: number | string } };
    if (Array.isArray(envelope.items)) {
      const rawTotal = envelope.meta?.totalCount;
      const totalCount = rawTotal === undefined ? undefined : Number(rawTotal);
      return {
        items: envelope.items,
        totalCount: totalCount !== undefined && !Number.isNaN(totalCount) ? totalCount : undefined,
      };
    }
  }
  return { items: [] };
};

const normalizeThreadResponse = <T>(payload: unknown): T => {
  if (Array.isArray(payload)) return payload as T;
  return unwrapThreadItems(payload).items as T;
};

export const getProjectEmailThread = async <T = any>({
  projectId,
  conversationId,
  skip,
  top,
  term,
  includeAll,
}: ProjectEmailThreadParams) => {
  const data = await AUSPIRA<unknown>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PROJECT_EMAIL_THREAD, {
      projectId,
      conversationId,
      Skip: skip,
      Top: top,
      Term: term,
      IncludeAll: includeAll,
    }),
    method: 'GET',
    skipLoader: true,
  });
  return normalizeThreadResponse<T>(data);
};

export const useGetProjectEmailThread = <T = any>(
  {
    projectId,
    conversationId,
    skip,
    top,
    term,
    includeAll = true,
  }: {
    projectId?: string;
    conversationId?: string;
    skip?: number;
    top?: number;
    term?: string;
    includeAll?: boolean;
  },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [
      ...PROJECT_QUERY_KEY,
      'project-email-thread',
      projectId,
      conversationId,
      skip,
      top,
      term,
      includeAll,
    ],
    queryFn: () =>
      getProjectEmailThread<T>({
        projectId: projectId!,
        conversationId: conversationId!,
        skip,
        top,
        term,
        includeAll,
      }),
    enabled: !!projectId && !!conversationId,
    ...helpers,
  });

export interface ProjectEmailThreadPage<T> {
  items: T[];
  /** Total messages in the conversation, when the backend's paged envelope reports one. */
  totalCount?: number;
}

// Server-paged variant for UIs that page through a conversation instead of loading it whole
// (e.g. `EmailThreadModal`) — Skip/Top go straight to the backend, and the paged envelope's
// `meta.totalCount` (when present) comes back alongside the page's rows so the caller can
// size its pager without ever fetching every message.
export const getProjectEmailThreadPage = async <T = any>({
  projectId,
  conversationId,
  skip,
  top,
  term,
}: {
  projectId: string;
  conversationId: string;
  skip: number;
  top: number;
  term?: string;
}): Promise<ProjectEmailThreadPage<T>> => {
  const data = await AUSPIRA<unknown>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PROJECT_EMAIL_THREAD, {
      projectId,
      conversationId,
      Skip: skip,
      Top: top,
      Term: term,
    }),
    method: 'GET',
    skipLoader: true,
  });
  const { items, totalCount } = unwrapThreadItems(data);
  return { items: items as T[], totalCount };
};

export const useGetProjectEmailThreadPage = <T = any>(
  {
    projectId,
    conversationId,
    skip,
    top,
    term,
  }: {
    projectId?: string;
    conversationId?: string;
    skip: number;
    top: number;
    term?: string;
  },
  helpers?: HelperFunctions<ProjectEmailThreadPage<T>>
) =>
  useQuery<ProjectEmailThreadPage<T>>({
    queryKey: [
      ...PROJECT_QUERY_KEY,
      'project-email-thread-page',
      projectId,
      conversationId,
      skip,
      top,
      term,
    ],
    queryFn: () =>
      getProjectEmailThreadPage<T>({
        projectId: projectId!,
        conversationId: conversationId!,
        skip,
        top,
        term,
      }),
    enabled: !!projectId && !!conversationId,
    ...helpers,
  });
