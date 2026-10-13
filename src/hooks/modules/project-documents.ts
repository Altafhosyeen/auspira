import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants';
import { apiClient } from '@/lib/api/api-client';
import { AUSPIRA } from '@/lib/api/auspira-api';
import type { HelperFunctions } from '@/types';

// Kept as a matching literal rather than importing project.ts's PROJECT_QUERY_KEY — React
// Query keys match by value, and this file exists precisely to stay out of that legacy
// module (see architecture's 500-line file cap).
const PROJECT_QUERY_KEY = ['project'] as const;

/* ----------------------------- upload document ---------------------------- */

export const uploadDocument = async ({
  data,
  id,
  onProgress,
}: {
  data: FormData;
  id: string;
  onProgress?: (progress: number) => void;
}) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECTS.UPLOAD_DOCUMENT.replace(':id', String(id)),
    method: 'POST',
    body: data,
    isMultipart: true,
    onUploadProgress: (progressEvent: any) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      id,
      onProgress,
    }: {
      data: FormData;
      id: string;
      onProgress?: (progress: number) => void;
    }) => uploadDocument({ data, id, onProgress }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, variables.id] });
    },
    onError: (error) => {
      console.error('Failed to upload document:', error);
    },
  });
};

/* ---------------------------- get documents by project id --------------------------- */

export const getProjectDocuments = async <T = any>(id: string, skipLoader = false) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECTS.UPLOAD_DOCUMENT.replace(':id', String(id)),
    method: 'GET',
    skipLoader, // pass true only when the caller renders its own loading state
  });
};

export const useGetDocumentsByProjectId = <T = any>(
  { id, enabled, skipLoader }: { id: string; enabled: boolean; skipLoader?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, id, 'documents'],
    queryFn: async () => getProjectDocuments<T>(id, skipLoader),
    ...helpers,
    enabled, // Only run if id is provided
  });

/* ----------------------------- update document ---------------------------- */

export const updateDocument = async ({
  data,
  projectId,
  documentId,
}: {
  data: FormData;
  projectId: string;
  documentId: string | number;
}) => {
  return AUSPIRA<void>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT}/${projectId}/documents/${documentId}`,
    method: 'PUT',
    body: data,
    isMultipart: true,
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { data: FormData; projectId: string; documentId: string | number }) =>
      updateDocument(variables),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, variables.projectId] });
      queryClient.invalidateQueries({
        queryKey: [...PROJECT_QUERY_KEY, variables.projectId, 'documents'],
      });
    },
    onError: (error) => {
      console.error('Failed to update document:', error);
    },
  });
};

/* ----------------------------- Delete document ---------------------------- */

export const deleteDocument = async ({ documentId }: { documentId: string | number }) => {
  return AUSPIRA<void>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT_DOCUMENTS_BASE}/${documentId}`,
    method: 'DELETE',
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { documentId: string | number }) => deleteDocument(variables),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, variables.documentId] });
      queryClient.invalidateQueries({
        queryKey: [...PROJECT_QUERY_KEY, variables.documentId, 'documents'],
      });
    },
    onError: (error) => {
      console.error('Failed to delete document:', error);
    },
  });
};

/* ---------------------------- Download document --------------------------- */

export const downloadDocument = async ({
  documentId,
  fileName,
}: {
  documentId: string | number;
  fileName?: string;
}) => {
  const blob = await apiClient.get<Blob>(
    API_ENDPOINTS.PROJECT_DOCUMENTS.DOWNLOAD.replace(':id', String(documentId)),
    undefined,
    { responseType: 'blob', skipLoader: true }
  );

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName || `document-${documentId}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const useDownloadDocument = () =>
  useMutation({
    mutationFn: (variables: { documentId: string | number; fileName?: string }) =>
      downloadDocument(variables),
    onError: (error) => {
      console.error('Failed to download document:', error);
    },
  });

/* ---------------------------- GET DOCUMENT JSON --------------------------- */

export const getDocumentJson = async <T = any>({ documentId }: { documentId: string | number }) => {
  return AUSPIRA<T>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT_DOCUMENTS_BASE}/${documentId}/json`,
    method: 'GET',
    skipLoader: true, // consumers render their own loading state — avoid stacking the global overlay
  });
};

export const useGetDocumentJson = <T = any>(
  { documentId }: { documentId: string | number },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'document', documentId, 'json'],
    queryFn: async () => getDocumentJson<T>({ documentId }),
    ...helpers,
    enabled: !!documentId, // Only run if documentId is provided
  });

/* ------------------------------ PER DOC JSON  ------------------------------ */

export const getPerDocJson = async <T = any>({ documentId }: { documentId: number | string }) => {
  return AUSPIRA<T>({
    url: `/api/project-documents/${documentId}/json`,
    method: 'GET',
    skipLoader: true, // Custom flag to indicate skipping global loader
  });
};

export const useGetPerDocJson = <T = any>(
  { documentId }: { documentId: number | string },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'per-doc-json', documentId],
    queryFn: async () => getPerDocJson<T>({ documentId }),
    ...helpers,
    enabled: !!documentId, // Only run if documentId is provided
  });

/* -- GET single document by ID */

export const getDocumentById = async <T = any>({ documentId }: { documentId: number | string }) => {
  return AUSPIRA<T>({
    url: `${API_ENDPOINTS.PROJECTS.PROJECT_DOCUMENTS_BASE}/${documentId}`,
    method: 'GET',
  });
};

export const useGetDocumentById = <T = any>(
  { documentId, enabled }: { documentId: number | string; enabled: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_QUERY_KEY, 'document', documentId],
    queryFn: async () => getDocumentById<T>({ documentId }),
    ...helpers,
    enabled: !!documentId && enabled, // Only run if documentId is provided and enabled is true
  });
