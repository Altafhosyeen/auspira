'use client';

import {
  DownloadOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { APP_COLORS } from '@/constants/app.theme';
import { useGetProjectEmailConversationDetails } from '@/hooks/modules/project';
import { parseBackendDate } from '@/lib/utils';
import AttachmentsModal from './attachments-modal';

export interface DocumentsCommunicationProps {
  /** Deadline for the Time Bar countdown — only when provided. */
  deadline?: string | null;
  /** Render the block at all (alert-originated records). Defaults to true. */
  show?: boolean;
  /** Render the Time Bar tile. Defaults to true; set false for records with no deadline
   *  concept at all (e.g. a form raised by hand rather than answering a clock). */
  showTimeBar?: boolean;
  /** Project ID for email conversation queries */
  projectId?: string | null;
  /** Conversation ID for email thread & attachments */
  conversationId?: string | null;
  /** Fallback subject for the thread modal */
  subjectFallback?: string | null;
}

// Simple rounded icon — a small circular antd Button, icon-only, navy bg + white outline icon.
const TileIcon = ({ icon }: { icon: React.ReactNode }) => (
  <Button
    shape="circle"
    size="small"
    icon={icon}
    style={{
      width: 28,
      height: 28,
      minWidth: 28,
      padding: 0,
      border: 'none',
      background: APP_COLORS.main,
      color: '#FFFFFF',
    }}
  />
);

const formatDeadline = (value?: string | null) => {
  const date = parseBackendDate(value);
  return date
    ? date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;
};

// Whole days from today to the deadline: negative once the deadline has passed, 0 on the day.
// Exported so screens that gate their actions on the deadline read the same number the Time
// Bar tile shows, rather than recomputing it and drifting out of step.
export const daysLeft = (value?: string | null): number | null => {
  const due = parseBackendDate(value);
  if (!due) return null;
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
};

// A deadline that has run out, compared by calendar date and never by time of day: the whole
// of the deadline's own day counts as within the window, so a 28 Aug deadline is still open at
// 28 Aug 23:59 and closes on the 29th. Reading the same whole days the Time Bar tile counts
// keeps the label and the locked actions from disagreeing. A record with no deadline is never
// overdue — there is no clock to have expired — so a missing date leaves the actions open.
export const isDeadlineOverdue = (value?: string | null): boolean => {
  const days = daysLeft(value);
  return days !== null && days < 0;
};

// Time Bar / Email Thread / Attachment tiles, self-contained for all sidebars.
const DocumentsCommunication = ({
  deadline,
  show = true,
  showTimeBar = true,
  projectId,
  conversationId,
  subjectFallback,
}: DocumentsCommunicationProps) => {
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);

  const { data: conversationDetails } = useGetProjectEmailConversationDetails({
    projectId: projectId ?? undefined,
    conversationId: conversationId ?? undefined,
  });

  const attachments = useMemo(
    () => conversationDetails?.[0]?.attachments ?? [],
    [conversationDetails]
  );

  if (!show) return null;
  const days = daysLeft(deadline);
  const deadlineLabel = formatDeadline(deadline);
  const handleOpenThread = () => setThreadModalOpen(true);
  const handleOpenAttachments = () => setAttachmentModalOpen(true);

  return (
    <>
      <Card title="Documents & Communication">
        <Flex vertical gap={12}>
          {showTimeBar && (
            <Card size="small">
              <Flex align="flex-start" gap={12}>
                <TileIcon icon={<FieldTimeOutlined />} />

                <Flex vertical>
                  <Typography.Text
                    strong
                    style={{
                      color: '#00355F',
                    }}
                  >
                    Time Bar
                  </Typography.Text>
                  <Typography.Title level={3} style={{ margin: 0, color: '#ff8D28' }}>
                    {days !== null ? `${Math.max(days, 0)} days remaining` : '—'}
                  </Typography.Title>
                  {deadlineLabel && (
                    <Typography.Text type="secondary">Deadline · {deadlineLabel}</Typography.Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          )}

          <Card size="small">
            <Flex align="flex-start" gap={12}>
              <TileIcon icon={<MailOutlined />} />
              <Flex vertical gap={4} style={{ flex: 1 }}>
                <Typography.Text strong>Email Thread</Typography.Text>
                <Typography.Text type="secondary">
                  View related email conversations and communications.
                </Typography.Text>
                <Flex justify="flex-end">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    iconPosition="end"
                    onClick={handleOpenThread}
                  >
                    View
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          <Card size="small">
            <Flex align="flex-start" gap={12}>
              <TileIcon icon={<FileOutlined />} />
              <Flex vertical gap={4} style={{ flex: 1 }}>
                <Typography.Text strong>Attachment</Typography.Text>
                <Typography.Text type="secondary">
                  View and download all related attachments.
                </Typography.Text>
                <Flex justify="flex-end">
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    iconPosition="end"
                    onClick={handleOpenAttachments}
                  >
                    Download
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Card>

      <EmailThreadModal
        open={threadModalOpen}
        projectId={projectId}
        conversationId={conversationId}
        subjectFallback={subjectFallback ?? undefined}
        onClose={() => setThreadModalOpen(false)}
      />

      <AttachmentsModal
        open={attachmentModalOpen}
        projectId={projectId}
        conversationId={conversationId}
        items={attachments}
        onClose={() => setAttachmentModalOpen(false)}
      />
    </>
  );
};

export default DocumentsCommunication;
