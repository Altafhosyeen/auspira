'use client';

import { DownloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Empty, Flex, Typography } from 'antd';

export interface MeetingAttachmentItem {
  id: string;
  fileName: string;
  filePath?: string;
}

interface EwMeetingAttachmentsProps {
  attachments?: MeetingAttachmentItem[];
  onDownload?: (item: MeetingAttachmentItem) => void;
  /** Supplied instead of onDownload to offer a preview button rather than a save. */
  onView?: (item: MeetingAttachmentItem) => void;
  /** Inside a collapsible panel the title and outer frame are already drawn. */
  hideHeading?: boolean;
  /** Shown when there are no attachments. */
  emptyText?: string;
}

export const EwMeetingAttachments = ({
  attachments = [],
  onDownload,
  onView,
  hideHeading = false,
  emptyText = 'No attachments uploaded for this meeting.',
}: EwMeetingAttachmentsProps) => {
  const files = (
    <Flex vertical gap={8} style={{ padding: hideHeading ? 0 : 16 }}>
      {attachments.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
      ) : (
        attachments.map((item) => (
          <Card
            key={item.id}
            size="small"
            styles={{ body: { padding: '10px 16px' } }}
            className="transition-colors hover:border-[var(--theme-border)]"
          >
            <Flex justify="space-between" align="center" wrap gap={8}>
              <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                <FileTextOutlined
                  style={{ fontSize: 16, color: 'var(--ds-main-p)', flexShrink: 0 }}
                />
                <Typography.Text strong ellipsis>
                  {item.fileName}
                </Typography.Text>
              </Flex>

              {onView ? (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  disabled={!item.filePath}
                  onClick={() => onView(item)}
                >
                  View
                </Button>
              ) : (
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  disabled={!item.filePath}
                  onClick={() => onDownload?.(item)}
                >
                  Download
                </Button>
              )}
            </Flex>
          </Card>
        ))
      )}
    </Flex>
  );

  if (hideHeading) return files;

  return (
    <Flex
      vertical
      style={{ border: '1px solid var(--theme-border)', borderRadius: 8, overflow: 'hidden' }}
    >
      <Flex style={{ padding: '14px 16px' }}>
        <Typography.Text strong>
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </Typography.Text>
      </Flex>

      <Divider style={{ margin: 0 }} />

      {files}
    </Flex>
  );
};

export default EwMeetingAttachments;
