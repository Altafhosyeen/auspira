'use client';

import React, { useState } from 'react';
import { Drawer, Upload, Button, Popconfirm, notification } from 'antd';
import {
  CloseOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import { useRouter } from 'nextjs-toploader/app';
import { useUploadDocument, useDeleteDocument } from '@/hooks/modules/project';
import { createSupportingDocUploadFormData } from '@/lib/utils/document-upload';
import { REQUIRED_DOCS } from '@/constants/project.constants';

export interface SupportingDoc {
  id: string | number;
  filename: string;
  title: string;
  size?: string;
  addedOn?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  documentLabel: string;
  ParentId: string | number | null;
  documentType: string | number | null;
  projectId: string;
  supportingDocs: SupportingDoc[];
  onAfterChange: () => void;
  /** When false, the per-document delete action is hidden (e.g. onboarding completed). */
  canDelete?: boolean;
}

const EXT: Record<string, { bg: string; label: string }> = {
  pdf: { bg: 'bg-red-500', label: 'PDF' },
  doc: { bg: 'bg-blue-500', label: 'DOC' },
  docx: { bg: 'bg-blue-500', label: 'DOC' },
  xls: { bg: 'bg-green-600', label: 'XLS' },
  xlsx: { bg: 'bg-green-600', label: 'XLS' },
  dwg: { bg: 'bg-slate-700', label: 'DWG' },
  zip: { bg: 'bg-amber-500', label: 'ZIP' },
};

function extStyle(filename: string) {
  const ext = (filename.split('.').pop() ?? '').toLowerCase();
  return EXT[ext] ?? { bg: 'bg-blue-400', label: 'FILE' };
}

export function SupportingDocumentsDrawer({
  open,
  onClose,
  documentLabel,
  ParentId,
  documentType,
  projectId,
  supportingDocs,
  onAfterChange,
  canDelete = true,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const { mutateAsync: uploadDoc } = useUploadDocument();
  const { mutateAsync: deleteDoc } = useDeleteDocument();

  const viewUrlTemplate = REQUIRED_DOCS.find((d) => String(d.id) === String(documentType))?.url;

  const handleView = (id: string | number) => {
    if (!viewUrlTemplate) return;
    const url = viewUrlTemplate.replace(':id', String(id));
    router.push(`${url}${url.includes('?') ? '&' : '?'}projectId=${projectId}`);
  };

  const handleUpload = async (file: RcFile) => {
    if (!ParentId) {
      notification.warning({ message: 'Upload the main document first' });
      return Upload.LIST_IGNORE;
    }
    setUploading(true);
    try {
      const fd = createSupportingDocUploadFormData(file, ParentId, documentType ?? '');
      await uploadDoc({ data: fd, id: projectId });
      notification.success({ message: 'Supporting document uploaded' });
      onAfterChange();
    } catch {
      notification.error({ message: 'Failed to upload' });
    } finally {
      setUploading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const handleDelete = async (id: string | number) => {
    setDeletingId(String(id));
    try {
      await deleteDoc({ documentId: String(id) });
      // Wait for animation to complete before removing from DOM
      await new Promise((resolve) => setTimeout(resolve, 200));
      onAfterChange();
    } catch {
      notification.error({ message: 'Failed to remove' });
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={380}
      destroyOnClose
      closable={false}
      title={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <PaperClipOutlined className="ds-body-large!" />
            </div>
            <div className="min-w-0">
              <p className="ds-body-large! text-text truncate font-semibold!">{documentLabel}</p>
              <p className="ds-caption! text-gray-400">Supporting documents</p>
            </div>
          </div>
          <Button
            type="text"
            aria-label="Close"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          />
        </div>
      }
      styles={{
        header: { padding: '14px 16px', borderBottom: '1px solid var(--theme-border)' },
        body: { padding: 16, background: 'var(--ds-surface-subtle)', overflowY: 'scroll' },
      }}
    >
      {/* Drop zone */}

      <div>
        <Upload.Dragger
          showUploadList={false}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip"
          beforeUpload={handleUpload}
          disabled={uploading}
          className="mb-4"
          style={{ background: 'var(--theme-surface)', borderRadius: 12 }}
        >
          <div className="py-6 text-center">
            <CloudUploadOutlined className="ds-heading-1! text-gray-300" />
            <p className="ds-body! mt-3 text-gray-600">Drag and drop files here</p>
            <p className="ds-body! text-gray-600">
              or <span className="text-main-p font-medium!">browse</span>
            </p>
            <p className="ds-caption! mt-1.5 text-gray-400">
              PDF, DOCX, XLSX, DWG, ZIP · up to 50 MB
            </p>
          </div>
        </Upload.Dragger>
      </div>

      {/* Info */}

      {supportingDocs.length === 0 ? (
        <p className="ds-caption! mt-2! text-gray-400">
          {ParentId
            ? 'No supporting documents yet. Upload files above.'
            : 'Upload the main document first to add supporting files.'}
        </p>
      ) : (
        <ul className="space-y-! mt-2">
          {supportingDocs.map((doc) => {
            const { bg, label } = extStyle(doc.filename || doc.title || '');
            const isDeleting = deletingId === String(doc.id);
            return (
              <li
                key={doc.id}
                className="mt-2! flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5"
                style={{
                  opacity: isDeleting ? 0 : 1,
                  transform: isDeleting ? 'translateX(-20px)' : 'translateX(0)',
                  transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                }}
              >
                <div
                  className={`ds-micro! flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold! text-white ${bg}`}
                >
                  {label}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="ds-caption! text-text truncate font-semibold!">
                    {doc.filename || doc.title || 'Document'}
                  </p>
                  {(doc.size || doc.addedOn) && (
                    <p className="ds-micro! mt-0.5 text-gray-400">
                      {[doc.size, doc.addedOn ? `Added ${doc.addedOn}` : '']
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {viewUrlTemplate && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(doc.id)}
                      className="opacity-50 hover:opacity-100"
                    />
                  )}

                  {canDelete == true && (
                    <Popconfirm
                      title="Remove document?"
                      okText="Remove"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      onConfirm={() => handleDelete(doc.id)}
                      disabled={isDeleting}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        loading={isDeleting}
                        className="opacity-50 hover:opacity-100"
                      />
                    </Popconfirm>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}

SupportingDocumentsDrawer.displayName = 'SupportingDocumentsDrawer';
