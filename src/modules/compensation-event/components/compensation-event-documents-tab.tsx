'use client';

import { notification } from 'antd';
import { useEffect, useState } from 'react';
import { useDownloadAttachment } from '../hooks/use-attachments';
import { useCompensationEventDocuments } from '../hooks/use-compensation-event-documents';
import type {
  CompensationEvent,
  CompensationEventEvidenceFile,
} from '../types/compensation-event.types';
import CompensationEventEvidencePack from './compensation-event-evidence-pack';

const COPY = {
  downloadFailed: 'Download failed. Please try again.',
  unavailable: 'This file cannot be downloaded yet.',
} as const;

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // The click starts the transfer asynchronously — release the handle after that.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

// Container — the Documents tab: lists the CE's attachments from the attachments API
// and streams each file down through the shared download endpoint. Falls back to the
// event's own evidence rows whenever the API serves none.
const CompensationEventDocumentsTab = ({ event }: { event: CompensationEvent }) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { files, isLoading } = useCompensationEventDocuments(event, debouncedTerm);
  const downloadAttachment = useDownloadAttachment();

  const handleDownload = async (file: CompensationEventEvidenceFile) => {
    if (!file.filePath) {
      notification.info({ message: COPY.unavailable });
      return;
    }

    try {
      const blob = await downloadAttachment.mutateAsync(file.filePath);
      triggerBrowserDownload(blob, file.name);
    } catch {
      // The global error handler surfaces the API reason; keep this message for the
      // cases (e.g. a 400 from a malformed URL) where there is none to surface.
      notification.error({ message: COPY.downloadFailed });
    }
  };

  return (
    <CompensationEventEvidencePack
      files={files}
      loading={isLoading}
      reference={event.reference?.trim() || undefined}
      term={term}
      onTermChange={setTerm}
      onDownload={handleDownload}
    />
  );
};

export default CompensationEventDocumentsTab;
