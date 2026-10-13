'use client';

import {
  DownloadOutlined,
  DownOutlined,
  FileImageOutlined,
  FileOutlined,
  FileTextOutlined,
  FileWordOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Flex, Tag, Tooltip, Typography } from 'antd';
import { type ReactNode, useState } from 'react';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import {
  FILE_TONE,
  type FileKind,
  fileKind,
  fileTypeLabel,
  formatFileDate,
  formatFileSize,
} from './attachment-list.utils';

/** One attachment row, in the shape the shared attachments endpoint returns. */
export interface AttachmentListItem {
  id: string;
  fileName: string;
  fileExtension?: string | null;
  /** The blob storage URL — pass this to the download endpoint as its `url` query. */
  filePath: string;
  uploadedByName?: string | null;
  uploadedAt?: string | null;
  fileSizeBytes?: number | string | null;
}

interface AttachmentListProps {
  attachments: AttachmentListItem[];
  onDownload: (attachment: AttachmentListItem) => void;
  /** Card title — defaults to the shared "Documents / Attachments" label. */
  title?: string;
  /** Trailing header content pinned to the right of the title — e.g. the search/filter toolbar. */
  extra?: ReactNode;
  // Tagged on every row beside the file name — e.g. "CE-0027" — so a file lifted out of the
  // row (downloaded, quoted into a mail) still says which record it belongs to. Omitted
  // where the record has no short reference to show.
  reference?: string;
  emptyDescription?: string;
  /** The noun used in the "Showing 1 to N of M …" footer. */
  activityLabel?: string;
  loadMoreLabel?: string;
}

const PAGE_SIZE = 6;

const KIND_ICONS: Record<FileKind, ReactNode> = {
  pdf: <FileOutlined />,
  excel: <FileOutlined />,
  word: <FileWordOutlined />,
  powerpoint: <FileOutlined />,
  image: <FileImageOutlined />,
  text: <FileTextOutlined />,
  zip: <FileOutlined />,
  other: <FileOutlined />,
};

// Documents / Attachments table — name (30%, ellipsis + tooltip), type,
// uploaded by, uploaded at, size + download. Paginated client-side ("Load More").
export const AttachmentList = ({
  attachments,
  onDownload,
  title = 'Documents / Attachments',
  extra,
  reference,
  emptyDescription = 'No documents uploaded yet.',
  activityLabel = 'activities',
  loadMoreLabel = 'Load More',
}: AttachmentListProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = attachments.slice(0, visibleCount);

  const COLUMN_HEADS = [
    { label: 'Name', width: undefined },
    { label: 'Type', width: 80 },
    { label: 'Uploaded By', width: 180 },
    { label: 'Uploaded At', width: 170 },
    { label: 'Size', width: 90 },
    // Wide enough for the "ACTIONS" heading itself; header and button are both
    // centred on the column so they read as one aligned stack.
    { label: 'Actions', width: 72, align: 'center' as const },
  ];

  return (
    <Card
      title={
        <Flex align="center" gap={10}>
          <IconChip icon={<PaperClipOutlined />} bordered />
          <Typography.Text strong style={{ fontSize: 16 }}>
            {title}
          </Typography.Text>
        </Flex>
      }
      extra={extra}
      styles={{
        body: { padding: 24 },
      }}
    >
      {attachments.length === 0 ? (
        <div style={{ padding: '32px 0' }}>
          <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <Flex vertical>
          {/* Column headings */}
          <Flex align="center" gap={16} style={{ paddingBottom: 12 }}>
            {COLUMN_HEADS.map(({ label, width, align }) => (
              <Typography.Text
                key={label}
                type="secondary"
                style={{
                  width,
                  flex: width ? 'none' : 1,
                  flexShrink: 0,
                  // Typography.Text renders an inline span; textAlign only takes
                  // effect once the cell is a block box.
                  display: 'block',
                  textAlign: align,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </Typography.Text>
            ))}
          </Flex>
          <Flex vertical>
            {visible.map((attachment, index) => {
              const kind = fileKind(attachment.fileExtension);
              const tone = FILE_TONE[kind];
              return (
                <Flex
                  key={attachment.id}
                  align="center"
                  gap={16}
                  style={{
                    padding: '16px 0',
                    borderTop: index === 0 ? 'none' : '1px solid var(--theme-border)',
                  }}
                >
                  <Flex align="center" gap={10} style={{ flex: 1, minWidth: 0 }}>
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: tone.background,
                        color: tone.color,
                        flexShrink: 0,
                      }}
                    >
                      {KIND_ICONS[kind]}
                    </Flex>
                    {/* The name takes the slack and the tag keeps its size — a long file
                        name is clipped by its own ellipsis rather than squeezing the
                        reference out. */}
                    <Flex align="center" gap={6} style={{ minWidth: 0, flex: 1 }}>
                      <Tooltip title={attachment.fileName}>
                        <Typography.Text strong ellipsis style={{ fontSize: 14, minWidth: 0 }}>
                          {attachment.fileName}
                        </Typography.Text>
                      </Tooltip>
                      {!!reference && (
                        <Tag
                          bordered={false}
                          style={{
                            background: APP_COLORS.mainSoft,
                            borderRadius: 4,
                            color: APP_COLORS.main,
                            flex: 'none',
                            fontSize: 11,
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {reference}
                        </Tag>
                      )}
                    </Flex>
                  </Flex>
                  <Flex style={{ width: 80, flexShrink: 0, justifyContent: 'flex-start' }}>
                    <Tag
                      bordered={false}
                      style={{
                        color: tone.color,
                        background: tone.background,
                        fontWeight: 600,
                        fontSize: 11,
                        padding: '1px 8px',
                      }}
                    >
                      {fileTypeLabel(attachment.fileExtension)}
                    </Tag>
                  </Flex>
                  <Typography.Text
                    type="secondary"
                    style={{ width: 180, flexShrink: 0, fontSize: 13 }}
                  >
                    {attachment.uploadedByName || '—'}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ width: 170, flexShrink: 0, fontSize: 13 }}
                  >
                    {formatFileDate(attachment.uploadedAt)}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ width: 90, flexShrink: 0, fontSize: 13 }}
                  >
                    {formatFileSize(attachment.fileSizeBytes)}
                  </Typography.Text>
                  <Flex align="center" justify="center" style={{ width: 72, flexShrink: 0 }}>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => onDownload(attachment)}
                      aria-label={`Download ${attachment.fileName}`}
                    />
                  </Flex>
                </Flex>
              );
            })}
          </Flex>

          <Flex justify="center" align="center" gap={16} style={{ paddingTop: 24 }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Showing 1 to {visible.length} of {attachments.length} {activityLabel}
            </Typography.Text>
            {visible.length < attachments.length && (
              <Button
                type="primary"
                icon={<DownOutlined />}
                iconPosition="end"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                {loadMoreLabel}
              </Button>
            )}
          </Flex>
        </Flex>
      )}
    </Card>
  );
};
