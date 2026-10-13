import { notification } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useCallback, useState } from 'react';
import { createDocumentUploadFormData } from '@/lib/utils/document-upload';
import { useDeleteDocument, useUploadDocument } from './project';

interface UseDocumentActionsOptions {
  projectId: string | undefined;
  onAfterUpload?: () => Promise<unknown> | void;
  onAfterDelete?: () => Promise<unknown> | void;
}

export interface DocumentActionsState {
  uploadingMap: Record<string, boolean>;
  deletingMap: Record<string, boolean>;
  progressMap: Record<string, number>;
  handleUpload: (docTypeId: string | number, file: RcFile) => Promise<void>;
  handleDelete: (documentId: string | number, typeKey?: string) => Promise<void>;
}

export function useDocumentActions({
  projectId,
  onAfterUpload,
  onAfterDelete,
}: UseDocumentActionsOptions): DocumentActionsState {
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const { mutateAsync: uploadDocument } = useUploadDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();

  const handleUpload = useCallback(
    async (docTypeId: string | number, file: RcFile) => {
      if (!projectId) {
        notification.error({ message: 'Project ID is missing' });
        return;
      }
      const key = String(docTypeId);
      setUploadingMap((prev) => ({ ...prev, [key]: true }));
      setProgressMap((prev) => ({ ...prev, [key]: 0 }));
      try {
        const formData = createDocumentUploadFormData(file, docTypeId);
        await uploadDocument({
          data: formData,
          id: projectId,
          onProgress: (progress: number) => {
            setProgressMap((prev) => ({ ...prev, [key]: progress }));
          },
        });
        notification.success({ message: 'Document uploaded successfully' });
        await onAfterUpload?.();
      } catch {
        notification.error({ message: 'Failed to upload document' });
      } finally {
        setUploadingMap((prev) => ({ ...prev, [key]: false }));
        setTimeout(() => setProgressMap((prev) => ({ ...prev, [key]: 0 })), 1500);
      }
    },
    [projectId, uploadDocument, onAfterUpload]
  );

  const handleDelete = useCallback(
    async (documentId: string | number, typeKey?: string) => {
      const key = typeKey ?? String(documentId);
      setDeletingMap((prev) => ({ ...prev, [key]: true }));
      try {
        await deleteDocument({ documentId: String(documentId) });
        await onAfterDelete?.();
      } catch {
        notification.error({ message: 'Failed to remove document' });
      } finally {
        setDeletingMap((prev) => ({ ...prev, [key]: false }));
      }
    },
    [deleteDocument, onAfterDelete]
  );

  return { uploadingMap, deletingMap, progressMap, handleUpload, handleDelete };
}
