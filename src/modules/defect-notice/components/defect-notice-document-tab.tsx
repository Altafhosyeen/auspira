'use client';

import { notification } from 'antd';
import { useEffect, useState } from 'react';
import { AttachmentList } from '@/components/shared/attachment-list';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import {
  useDownloadDefectNoticeAttachment,
  useGetDefectNoticeAttachments,
} from '../hooks/use-defect-notices';
import type { DefectNotice } from '../types/defect-notice.types';

const COPY = {
  unavailable: 'This file cannot be downloaded yet.',
  searchPlaceholder: 'Search by file name...',
} as const;

interface DefectNoticeDocumentTabProps {
  notice: DefectNotice;
}

// Container — the Document tab, reusing the shared `AttachmentList` every other detail
// screen's Documents tab renders through, fed by the same shared attachments endpoint the
// PMI/EW details read.
const DefectNoticeDocumentTab = ({ notice }: DefectNoticeDocumentTabProps) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // The attachments endpoint does its own `term` search, so the box drives the request
  // rather than filtering in place — debounced so typing does not fire one per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: attachments } = useGetDefectNoticeAttachments({
    entityId: notice.id,
    projectId: notice.projectId ?? '',
    term: debouncedTerm,
    enabled: !!notice.id && !!notice.projectId,
  });

  const { mutateAsync: downloadAttachment } = useDownloadDefectNoticeAttachment();

  const handleDownload = (attachment: { filePath: string; fileName: string }) => {
    if (!attachment.filePath) {
      notification.info({ message: COPY.unavailable });
      return;
    }
    void downloadAttachment({ url: attachment.filePath, fileName: attachment.fileName });
  };

  return (
    <AttachmentList
      attachments={attachments ?? []}
      onDownload={handleDownload}
      reference={notice.reference?.trim() || undefined}
      extra={
        <DetailListToolbar
          term={term}
          onTermChange={setTerm}
          searchPlaceholder={COPY.searchPlaceholder}
          onClearAll={() => setTerm('')}
        />
      }
    />
  );
};

export default DefectNoticeDocumentTab;
