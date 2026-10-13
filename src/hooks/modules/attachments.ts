import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { API_ENDPOINTS } from '@/constants/api.constants';

/* ------------------------- Download email attachment ------------------------ */

/**
 * Email attachments live in private storage, so their raw URLs are not directly
 * fetchable from the browser — the backend proxies them via
 * GET /api/attachments/download?Url=<storage url>.
 */
export const downloadAttachment = async ({ url, fileName }: { url: string; fileName?: string }) => {
  const blob = await apiClient.get<Blob>(API_ENDPOINTS.ATTACHMENTS.DOWNLOAD, undefined, {
    params: { Url: url },
    responseType: 'blob',
    skipLoader: true,
  });

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName || url.split('/').pop()?.split('?')[0] || 'attachment';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const useDownloadAttachment = () =>
  useMutation({
    mutationFn: downloadAttachment,
    onError: (error) => {
      console.error('Failed to download attachment:', error);
    },
  });
