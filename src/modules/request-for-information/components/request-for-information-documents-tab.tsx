'use client';

import { notification } from 'antd';
import {
  type CompensationEventEvidenceFile,
  CompensationEventEvidencePack,
  useDownloadAttachment,
} from '@/modules/compensation-event';
import { useProjectStore } from '@/store/project.store';
import { useRequestForInformationDocuments } from '../hooks/use-request-for-information';
import type { RequestForInformation } from '../types/request-for-information.types';

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
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

interface RequestForInformationDocumentsTabProps {
  rfi: RequestForInformation;
}

// Container — the Documents tab: same evidence pack and download flow as the
// Compensation Event detail's Documents tab, reusing its entity-keyed attachments hook
// (entity-agnostic, keyed only by `entityId`/`projectId`) and evidence-pack component
// so both screens render an identical file list. The live attachments API is the source
// of truth; the module's own mock files only stand in while it has nothing for the id —
// which it always will for a mock RFI, since mock ids aren't real backend entities.
const RequestForInformationDocumentsTab = ({ rfi }: RequestForInformationDocumentsTabProps) => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { files, isLoading } = useRequestForInformationDocuments(rfi, selectedProjectId);
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
      notification.error({ message: COPY.downloadFailed });
    }
  };

  return (
    <CompensationEventEvidencePack files={files} loading={isLoading} onDownload={handleDownload} />
  );
};

export default RequestForInformationDocumentsTab;
