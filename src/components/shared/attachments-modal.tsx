'use client';

import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from '@ant-design/icons';
import { Button, Empty, Flex, Modal, notification, Skeleton, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  FILE_LABEL,
  FILE_TONE,
  fileKind,
  formatFileDate,
  formatFileSize,
} from '@/components/shared/attachment-list.utils';
import { downloadAttachment } from '@/hooks/modules/attachments';
import { useGetProjectEmailConversationDetails } from '@/hooks/modules/project';
import { useGetEarlyWarningAttachments } from '@/modules/early-warning/hooks/use-early-warnings';

export interface AttachmentModalItem {
  id?: string;
  name?: string;
  fileName?: string;
  url?: string;
  filePath?: string;
  fileExtension?: string;
  fileSizeBytes?: number;
  fileSizeMb?: number;
  fileSize?: number | string;
  size?: number | string;
  uploadedBy?: string;
  uploadedByName?: string;
  uploadedByRole?: string;
  uploadedOn?: string | Date | null;
  uploadedAt?: string | Date | null;
  createdOn?: string | Date | null;
  description?: string;
  contentType?: string;
}

export interface AttachmentsModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  infoTooltip?: string;
  items?: AttachmentModalItem[] | null;
  projectId?: string | null;
  conversationId?: string | null;
  entityId?: string | null;
  loading?: boolean;
}

const getFileIcon = (kind: string) => {
  switch (kind) {
    case 'pdf':
      return <FilePdfOutlined style={{ fontSize: 16 }} />;
    case 'word':
      return <FileWordOutlined style={{ fontSize: 16 }} />;
    case 'excel':
      return <FileExcelOutlined style={{ fontSize: 16 }} />;
    default:
      return <FileTextOutlined style={{ fontSize: 16 }} />;
  }
};

interface NormalizedAttachment {
  id: string;
  fileName: string;
  url: string;
  fileExtension: string;
  size: string | null;
  uploadedBy: string | null;
  uploadedOn: string | null;
}

export const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  open,
  onClose,
  title = 'Attachments',
  items,
  projectId,
  conversationId,
  entityId,
  loading: externalLoading,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: conversationDetails, isLoading: loadingConversation } =
    useGetProjectEmailConversationDetails({
      projectId: projectId ?? undefined,
      conversationId: conversationId ?? undefined,
    });

  const { data: entityAttachments, isLoading: loadingEntity } = useGetEarlyWarningAttachments({
    entityId: entityId ?? '',
    projectId: projectId ?? undefined,
    enabled: Boolean(entityId && open),
  });

  const rawList: any[] = useMemo(() => {
    if (items && items.length > 0) return items;
    if (conversationDetails?.[0]?.attachments?.length) {
      return conversationDetails[0].attachments;
    }
    if (entityAttachments?.length) {
      return entityAttachments;
    }
    return items ?? [];
  }, [items, conversationDetails, entityAttachments]);

  const isLoading =
    externalLoading ||
    (!items && Boolean(conversationId) && loadingConversation) ||
    (!items && Boolean(entityId) && loadingEntity);

  const normalizedItems: NormalizedAttachment[] = useMemo(() => {
    return rawList.map((raw, index) => {
      const fileName = raw.fileName || raw.name || raw.filename || `Attachment_${index + 1}`;
      const ext =
        raw.fileExtension || (fileName.includes('.') ? fileName.split('.').pop() || '' : '');
      const url = raw.filePath || raw.url || raw.fileUrl || '';

      const sizeNum =
        typeof raw.fileSizeBytes === 'number'
          ? raw.fileSizeBytes
          : typeof raw.fileSize === 'number'
            ? raw.fileSize
            : typeof raw.size === 'number'
              ? raw.size
              : undefined;

      const sizeStr =
        sizeNum !== undefined
          ? formatFileSize(sizeNum)
          : typeof raw.size === 'string'
            ? raw.size
            : typeof raw.fileSize === 'string'
              ? raw.fileSize
              : null;

      const rawDate = raw.uploadedAt || raw.uploadedOn || raw.createdOn || raw.uploadDate || null;
      const formattedDate = rawDate
        ? formatFileDate(typeof rawDate === 'string' ? rawDate : rawDate.toISOString()) || null
        : null;

      const uploadedBy = raw.uploadedByName || raw.uploadedBy || null;

      return {
        id: raw.id ? String(raw.id) : `att-${index}`,
        fileName,
        url,
        fileExtension: ext,
        size: sizeStr,
        uploadedBy,
        uploadedOn: formattedDate,
      };
    });
  }, [rawList]);

  const handleDownloadItem = useCallback(async (item: NormalizedAttachment) => {
    if (!item.url) {
      notification.warning({ message: 'Download URL is not available for this attachment.' });
      return;
    }
    setDownloadingId(item.id);
    try {
      await downloadAttachment({ url: item.url, fileName: item.fileName });
      notification.success({ message: `Downloading ${item.fileName}` });
    } catch {
      notification.error({ message: `Failed to download ${item.fileName}` });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const hasSize = useMemo(() => normalizedItems.some((i) => !!i.size), [normalizedItems]);
  const hasUploadedBy = useMemo(
    () => normalizedItems.some((i) => !!i.uploadedBy),
    [normalizedItems]
  );
  const hasUploadedOn = useMemo(
    () => normalizedItems.some((i) => !!i.uploadedOn),
    [normalizedItems]
  );

  const columns: ColumnsType<NormalizedAttachment> = useMemo(() => {
    const cols: ColumnsType<NormalizedAttachment> = [
      {
        title: 'File Name',
        dataIndex: 'fileName',
        key: 'fileName',
        render: (fileName, record) => {
          const kind = fileKind(record.fileExtension);
          const tone = FILE_TONE[kind];
          return (
            <Flex align="center" gap={10}>
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: tone.background,
                  color: tone.color,
                  flexShrink: 0,
                }}
              >
                {getFileIcon(kind)}
              </Flex>
              <Typography.Text strong className="text-sm text-slate-900" ellipsis title={fileName}>
                {fileName}
              </Typography.Text>
            </Flex>
          );
        },
      },
      {
        title: 'Type',
        dataIndex: 'fileExtension',
        key: 'fileExtension',
        width: 90,
        render: (ext) => {
          const kind = fileKind(ext);
          const tone = FILE_TONE[kind];
          return (
            <Tag
              style={{
                background: tone.background,
                color: tone.color,
                border: 'none',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: 11,
                padding: '2px 8px',
                margin: 0,
              }}
            >
              {FILE_LABEL[kind]}
            </Tag>
          );
        },
      },
    ];

    if (hasSize) {
      cols.push({
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        width: 100,
        render: (size) => (
          <Typography.Text type="secondary" className="text-xs">
            {size || '—'}
          </Typography.Text>
        ),
      });
    }

    if (hasUploadedBy) {
      cols.push({
        title: 'Uploaded By',
        dataIndex: 'uploadedBy',
        key: 'uploadedBy',
        render: (uploadedBy) => (
          <Typography.Text className="text-xs text-slate-700">{uploadedBy || '—'}</Typography.Text>
        ),
      });
    }

    if (hasUploadedOn) {
      cols.push({
        title: 'Uploaded On',
        dataIndex: 'uploadedOn',
        key: 'uploadedOn',
        width: 130,
        render: (uploadedOn) => (
          <Typography.Text type="secondary" className="text-xs">
            {uploadedOn || '—'}
          </Typography.Text>
        ),
      });
    }

    cols.push({
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'right',
      render: (_, record) => (
        <Button
          type="text"
          shape="circle"
          icon={<DownloadOutlined style={{ fontSize: 16, color: '#0F4C81' }} />}
          loading={downloadingId === record.id}
          onClick={() => handleDownloadItem(record)}
          aria-label={`Download ${record.fileName}`}
        />
      ),
    });

    return cols;
  }, [hasSize, hasUploadedBy, hasUploadedOn, downloadingId, handleDownloadItem]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      footer={null}
      width={720}
      centered
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ padding: '16px 0' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : normalizedItems.length === 0 ? (
        <div style={{ padding: '32px 0' }}>
          <Empty description="No attachments found." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <Table<NormalizedAttachment>
          columns={columns}
          dataSource={normalizedItems}
          rowKey="id"
          pagination={false}
          style={{ marginTop: 16 }}
          className="[&_.ant-table-thead_th]:!bg-[#F0F8FF] [&_.ant-table-thead_th]:!text-[#00355F] [&_.ant-table-thead_th]:!font-semibold [&_.ant-table-thead_th]:!py-3"
        />
      )}
    </Modal>
  );
};

export default AttachmentsModal;
