import { DownloadOutlined, MailOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import { type ReactNode, useState } from 'react';
import AttachmentsModal from '@/components/shared/attachments-modal';
import IconChip from '@/components/shared/icon-chip';
import { downloadAttachment } from '@/hooks/modules/attachments';
import type { ProjectAlertEmail } from '@/hooks/modules/project-alerts';
import { AWARENESS_PALETTE } from '../constants/awareness.constants';

interface AwarenessEmailCardProps {
  title: string;
  email?: ProjectAlertEmail;
  body: string;
  receivedLabel: string;
  attachments?: { id?: string; name?: string; url?: string }[] | null;
}

const META_LABEL_WIDTH = 140;
const META_ROW_GAP = 48;

// One metadata line, label and value together. No hover tooltip: the values are shown in
// full, so a popup would only cover the rows above it.
const MetaRow = ({
  label,
  value,
  strong,
  children,
}: {
  label: string;
  value?: string | null;
  strong?: boolean;
  children?: ReactNode;
}) => (
  <Flex gap={META_ROW_GAP} align="center" style={{ width: '100%', minWidth: 0 }}>
    <Typography.Text
      type="secondary"
      style={{ fontSize: 14, width: META_LABEL_WIDTH, flexShrink: 0 }}
    >
      {label}
    </Typography.Text>
    {children ?? (
      <Typography.Text strong={strong} ellipsis style={{ flex: 1, minWidth: 0, display: 'block' }}>
        {value || '—'}
      </Typography.Text>
    )}
  </Flex>
);

// "Contractor Email - As Received" — identical for every alert type, so both the Early
// Warning and Compensation Event reviews render this one card.
const AwarenessEmailCard = ({
  title,
  email,
  body,
  receivedLabel,
  attachments,
}: AwarenessEmailCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const singleAttachment = attachments?.length === 1 ? attachments[0] : undefined;

  return (
    <>
      <Card
        title={
          <Flex align="center" gap={12}>
            <IconChip icon={<MailOutlined />} bordered size={40} />
            <Typography.Text strong style={{ fontSize: 16, color: AWARENESS_PALETTE.main }}>
              {title}
            </Typography.Text>
          </Flex>
        }
        extra={<Typography.Text type="secondary">{receivedLabel}</Typography.Text>}
        styles={{ body: { padding: 0 } }}
      >
        <Flex vertical gap={16} style={{ padding: '24px' }}>
          <MetaRow label="From" value={email?.emailSender} />

          <MetaRow label="To" value={email?.emailTo} />

          <MetaRow label="Subject" value={email?.emailSubject} strong />

          <MetaRow label="Attachment">
            {attachments && attachments.length > 0 ? (
              singleAttachment ? (
                <Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
                  <Typography.Link
                    ellipsis
                    style={{ minWidth: 0, display: 'inline-block', maxWidth: 360 }}
                    onClick={() => setModalOpen(true)}
                  >
                    {singleAttachment.name || 'Attachment'}
                  </Typography.Link>
                  {singleAttachment.url && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      title="Download attachment"
                      style={{ color: '#0F4C81', padding: '0 4px', height: 'auto' }}
                      onClick={() =>
                        downloadAttachment({
                          url: singleAttachment.url!,
                          fileName: singleAttachment.name,
                        })
                      }
                    />
                  )}
                </Flex>
              ) : (
                <Flex align="center" gap={12} wrap style={{ flex: 1, minWidth: 0 }}>
                  <Button
                    size="small"
                    icon={<PaperClipOutlined />}
                    onClick={() => setModalOpen(true)}
                  >
                    {attachments.length} Attachments
                  </Button>

                  <Button
                    size="small"
                    type="link"
                    icon={<DownloadOutlined />}
                    style={{ padding: 0, fontSize: 12 }}
                    onClick={async () => {
                      for (const att of attachments) {
                        if (att.url) {
                          await downloadAttachment({ url: att.url, fileName: att.name });
                        }
                      }
                    }}
                  >
                    Download all
                  </Button>
                </Flex>
              )
            ) : (
              <Typography.Text type="secondary" style={{ flex: 1, minWidth: 0 }}>
                —
              </Typography.Text>
            )}
          </MetaRow>
        </Flex>

        <ExpandableEmailBody text={body} />
      </Card>

      <AttachmentsModal open={modalOpen} onClose={() => setModalOpen(false)} items={attachments} />
    </>
  );
};

const ExpandableEmailBody = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.split('\n').length > 8 || text.length > 350;

  return (
    <div style={{ padding: '0 24px 24px' }}>
      <Typography.Paragraph
        className={`!m-0 !leading-relaxed !whitespace-pre-wrap !text-slate-800 ${
          !expanded && isLong ? 'line-clamp-[8]' : ''
        }`}
      >
        {text}
      </Typography.Paragraph>
      {isLong && (
        <Flex justify="start" style={{ marginTop: 8 }}>
          <Button
            type="link"
            size="small"
            onClick={() => setExpanded((prev) => !prev)}
            style={{ padding: 0 }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        </Flex>
      )}
    </div>
  );
};

export default AwarenessEmailCard;
