import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProgrammeComparison, ProgrammeData } from '@/components/contract/programme/types';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types';

// Kept as a matching literal rather than importing project.ts's PROJECT_QUERY_KEY — React
// Query keys match by value, and this file exists precisely to stay out of that legacy
// module (see architecture's 500-line file cap).
const PROJECT_QUERY_KEY = ['project'] as const;

/* ------------------------------- AI EXTRACT ------------------------------- */

export const aiExtract = async <T = any>({ projectId }: { projectId: number | string }) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.AI_EXTRACT.replace(':id', String(projectId)),
    method: 'POST',
    // The UI shows its own inline "Extracting…" indicator + button spinner — skip the
    // full-screen GlobalLoader so a second overlay doesn't stack on top.
    skipLoader: true,
  });
};

/** Shared mutation keys so components can observe an in-flight extraction via `useIsMutating`. */
export const AI_EXTRACT_MUTATION_KEY = ['ai-extract'] as const;
export const AI_EXTRACT_PRIMAVERA_MUTATION_KEY = ['ai-extract-primavera'] as const;

export const useAiExtract = <T = any>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AI_EXTRACT_MUTATION_KEY,
    mutationFn: ({ projectId }: { projectId: number | string }) => aiExtract<T>({ projectId }),
    onSuccess: (_data, variables) => {
      // Invalidates the query cache for the specific project using the ID from variables
      queryClient.invalidateQueries({
        queryKey: [...PROJECT_QUERY_KEY, variables.projectId],
      });
    },
  });
};

/* --------------------------- ONBOARDING COMPLETE -------------------------- */

export const completeOnboarding = async <T = any>({
  projectId,
}: {
  projectId: number | string;
}) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.ONBOARDING_COMPLETE.replace(':id', String(projectId)),
    method: 'PATCH',
  });
};

export const useCompleteOnboarding = <T = any>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId }: { projectId: number | string }) =>
      completeOnboarding<T>({ projectId }),
    onSuccess: (_data, variables) => {
      // Refresh project caches so the now-active project reflects everywhere
      // (lookup dropdown, list, and the project detail).
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, variables.projectId] });
    },
    onError: (error) => {
      console.error('Failed to complete onboarding:', error);
    },
  });
};

/* ------------------------- AI EXTRACT — PRIMAVERA ------------------------- */

export const aiExtractPrimavera = async <T = any>({
  projectId,
}: {
  projectId: number | string;
}) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.AI_EXTRACT_PRIMAVERA.replace(':id', String(projectId)),
    method: 'POST',
    // The UI shows its own inline "Extracting…" indicator + button spinner — skip the
    // full-screen GlobalLoader so a second overlay doesn't stack on top.
    skipLoader: true,
  });
};

export const useAiExtractPrimavera = <T = any>() => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AI_EXTRACT_PRIMAVERA_MUTATION_KEY,
    mutationFn: ({ projectId }: { projectId: number | string }) =>
      aiExtractPrimavera<T>({ projectId }),
    onSuccess: (_data, variables) => {
      // Refresh the programme comparison so the parsed panels render after extraction.
      queryClient.invalidateQueries({
        queryKey: [...PROJECT_QUERY_KEY, 'primavera-comparison', variables.projectId],
      });
    },
  });
};

/* ------------------------------ PRIMAVERA COMPARISON ------------------------------ */

export interface IProgrammeDocument<TJson> {
  documentId: string;
  fileName: string;
  version: number;
  uploadedAt: string;
  jsonData: TJson;
}

export interface IPrimaveraComparison {
  projectId: string;
  // Accepted programme JSON matches the contract programme `ProgrammeData` shape; the revised
  // programme is a comparison delta (`ProgrammeComparison`).
  acceptedProgramme: IProgrammeDocument<ProgrammeData> | null;
  revisedProgramme: IProgrammeDocument<ProgrammeComparison> | null;
}

export const getPrimaveraComparison = async <T = IPrimaveraComparison>({
  projectId,
}: {
  projectId: number | string;
}) => {
  // Hard guard: never hit the backend for an unsaved project (route id 'new') or empty id.
  if (!projectId || projectId === 'new') {
    throw new Error('getPrimaveraComparison called without a valid projectId');
  }
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PRIMAVERA_COMPARISON, { projectId }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetPrimaveraComparison = <T = IPrimaveraComparison>(
  { projectId, enabled }: { projectId: number | string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'primavera-comparison', projectId],
    queryFn: async () => getPrimaveraComparison<T>({ projectId }),
    ...helpers,
    // Only run for a real, persisted project — skip while creating (route id 'new').
    enabled: !!projectId && projectId !== 'new' && enabled,
  });
