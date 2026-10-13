'use client';

import { Modal, Skeleton } from 'antd';
import { COMPENSATION_EVENT_EVIDENCE_COPY } from '../constants/compensation-event-evidence.constants';
import type { CompensationEventEvidenceFile } from '../types/compensation-event.types';
import CompensationEventEvidencePack from './compensation-event-evidence-pack';

interface CompensationEventAttachmentsModalProps {
  open: boolean;
  files: CompensationEventEvidenceFile[];
  loading?: boolean;
  onDownload?: (file: CompensationEventEvidenceFile) => void;
  onClose: () => void;
}

// The mail thread's files in the same searchable, per-row-download list the Documents tab
// already shows — the side rail's "View" opens it over whichever screen the PM is on,
// the way "View" on the Email Thread tile opens the conversation.
const CompensationEventAttachmentsModal = ({
  open,
  files,
  loading = false,
  onDownload,
  onClose,
}: CompensationEventAttachmentsModalProps) => (
  <Modal
    open={open}
    onCancel={onClose}
    title={null}
    // Tracks the viewport rather than a fixed width, like the thread viewer it sits beside.
    width="96vw"
    style={{ maxWidth: 1000 }}
    centered
    destroyOnHidden
    footer={null}
    // The panel inside draws its own rounded border, so the modal's default close button
    // lands on top of it — pull the body in and centre the X in that gutter instead, clear
    // of the panel's corner rather than straddling it.
    styles={{ container: { padding: '48px 24px 24px' } }}
    classNames={{ container: '[&_.ant-modal-close]:top-2 [&_.ant-modal-close]:end-4' }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 6 }} />
    ) : (
      <CompensationEventEvidencePack
        title={COMPENSATION_EVENT_EVIDENCE_COPY.attachmentsTitle}
        files={files}
        searchable={false}
        onDownload={onDownload}
      />
    )}
  </Modal>
);

export default CompensationEventAttachmentsModal;
