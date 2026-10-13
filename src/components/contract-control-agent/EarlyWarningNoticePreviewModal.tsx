'use client';

import React from 'react';
import { Modal, notification } from 'antd';
import { Download } from 'lucide-react';
import ButtonX from '@/components/antd/ButtonX';
import EarlyWarningNoticePreview from './EarlyWarningNoticePreview';
import type { EarlyWarningFormValues } from './EarlyWarningNoticeFormOld';

interface Props {
  open: boolean;
  values: EarlyWarningFormValues | null;
  onClose: () => void;
  onDownload?: () => void;
}

const EarlyWarningNoticePreviewModal = ({ open, values, onClose, onDownload }: Props) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    // TODO: wire to PDF export when available
    notification.info({ message: 'PDF download coming soon' });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1000}
      centered
      footer={null}
      styles={{ body: { maxHeight: '90vh', overflowY: 'auto', paddingTop: 8 } }}
    >
      {values && <EarlyWarningNoticePreview values={values} />}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <ButtonX htmlType="button" size="large" onClick={onClose}>
          Close Preview
        </ButtonX>
        <ButtonX
          type="primary"
          htmlType="button"
          size="large"
          icon={<Download size={16} />}
          className="bg-[#1e3a5f]! px-6! font-semibold!"
          onClick={handleDownload}
        >
          Download PDF
        </ButtonX>
      </div>
    </Modal>
  );
};

export default EarlyWarningNoticePreviewModal;
