import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types';

// Kept as a matching literal rather than importing project.ts's PROJECT_QUERY_KEY — React
// Query keys match by value, and this file exists precisely to stay out of that legacy
// module (see architecture's 500-line file cap).
const PROJECT_QUERY_KEY = ['project'] as const;

/* ----------------------------- PROJECT EMAILS ----------------------------- */

export const getProjectEmails = async <T = any>({ projectId }: { projectId: string }) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PROJECT_EMAIL, { projectId }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjectEmails = <T = any>(projectId?: string, helpers?: HelperFunctions<T>) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'project-emails', projectId],
    queryFn: () => getProjectEmails<T>({ projectId: projectId! }),
    enabled: !!projectId,
    ...helpers,
  });

export const getProjectEmailThread = async <T = any>({
  projectId,
  conversationId,
}: {
  projectId: string;
  conversationId: string;
}) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PROJECT_EMAIL_THREAD, { projectId, conversationId }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjectEmailThread = <T = any>(
  { projectId, conversationId }: { projectId?: string; conversationId?: string },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'project-email-thread', projectId, conversationId],
    queryFn: () =>
      getProjectEmailThread<T>({ projectId: projectId!, conversationId: conversationId! }),
    enabled: !!projectId && !!conversationId,
    ...helpers,
  });

export interface ProjectEmailConversationAttachment {
  url: string;
  name: string;
  contentType: string;
  fileExtension?: string;
  fileSizeBytes?: number;
  fileSizeMb?: number;
}

/** A single mail-thread's summary, as returned by GET /api/project-emails/conversation-details. */
export interface ProjectEmailConversationDetails {
  conversationId: string;
  totalEmailsCount: number;
  attachmentCount: number;
  attachments: ProjectEmailConversationAttachment[];
}

export const getProjectEmailConversationDetails = async <T = ProjectEmailConversationDetails[]>({
  projectId,
  conversationId,
}: {
  projectId: string;
  conversationId: string;
}) => {
  return AUSPIRA<T>({
    url: buildUrl(API_ENDPOINTS.PROJECTS.PROJECT_EMAIL_CONVERSATION_DETAILS, {
      projectId,
      conversationId,
    }),
    method: 'GET',
    skipLoader: true,
  });
};

export const useGetProjectEmailConversationDetails = <T = ProjectEmailConversationDetails[]>(
  { projectId, conversationId }: { projectId?: string; conversationId?: string },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [
      ...PROJECT_QUERY_KEY,
      'project-email-conversation-details',
      projectId,
      conversationId,
    ],
    queryFn: () =>
      getProjectEmailConversationDetails<T>({
        projectId: projectId!,
        conversationId: conversationId!,
      }),
    enabled: !!projectId && !!conversationId,
    ...helpers,
  });

/** Payload for POST /api/project-emails/send — sends a reply on the connected mail account. */
export interface SendProjectEmailRequest {
  projectEmailId: string;
  projectId: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}

export const sendProjectEmail = async (data: SendProjectEmailRequest) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECTS.PROJECT_EMAIL_SEND,
    method: 'POST',
    body: data,
  });
};

export const useSendProjectEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendProjectEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
    },
  });
};
