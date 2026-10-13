import { EyeOutlined, FieldTimeOutlined, FileOutlined, MailOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';
import { NOTICE_COLORS, NOTICE_SIZES } from '../constants/compensation-event-notice.theme';
import type { NoticeTimeBar } from '../types/compensation-event-notice.types';
import { formatDaysRemaining, isTimeBarRunning } from '../utils/compensation-event-notice.utils';
import CompensationEventNoticeCommunicationTile from './compensation-event-notice-communication-tile';

const { documents } = COMPENSATION_EVENT_NOTICE_COPY;

// Tile bodies sit a step below the heading in the design.
const bodyStyle = { fontSize: 12 } as const;

interface CompensationEventNoticeDocumentsCommunicationProps {
  // Left out on a screen that reports a record rather than a deadline — the quotation
  // detail page reads a submitted quotation, which no longer has a clock to run. A bar
  // with no deadline yet is dropped the same way, by `isTimeBarRunning`.
  timeBar?: NoticeTimeBar;
  // Each tile is dropped when its count is zero — a notice raised by hand has no thread
  // and no files, and an empty tile with a dead link is worse than no tile at all.
  emailCount?: number;
  attachmentCount?: number;
  // Read-only lines from the signal's compensation event payload — empty when the notice
  // was not opened from a signal, and the tile is then left out.
  eventDetailLines?: string[];
  onOpenEmailThread?: () => void;
  onViewAttachments?: () => void;
}

const CompensationEventNoticeDocumentsCommunication = ({
  timeBar,
  emailCount,
  attachmentCount,
  onOpenEmailThread,
  onViewAttachments,
}: CompensationEventNoticeDocumentsCommunicationProps) => {
  const showTimeBar = isTimeBarRunning(timeBar);

  // Every tile is conditional, so a record with no deadline, no thread and no files would
  // otherwise leave a card holding nothing but its own heading.
  if (!showTimeBar && !emailCount && !attachmentCount) return null;

  return (
    <Card
      styles={{
        body: {
          padding: `${NOTICE_SIZES.railPaddingBlock}px ${NOTICE_SIZES.railPaddingInline}px`,
        },
      }}
    >
      <Flex vertical gap={20}>
        <Typography.Text strong style={{ color: NOTICE_COLORS.main, fontSize: 16 }}>
          {documents.title}
        </Typography.Text>

        {showTimeBar && (
          <CompensationEventNoticeCommunicationTile
            icon={<FieldTimeOutlined />}
            title={documents.timeBar.label}
          >
            <Typography.Text strong style={{ color: NOTICE_COLORS.timeBar, fontSize: 20 }}>
              {formatDaysRemaining(timeBar.daysRemaining)}
            </Typography.Text>
            <Typography.Text type="secondary" style={bodyStyle}>
              {`${documents.timeBar.deadlinePrefix} ${timeBar.deadlineLabel}`}
            </Typography.Text>
          </CompensationEventNoticeCommunicationTile>
        )}

        {/* {!!eventDetailLines?.length && (
        <CompensationEventNoticeCommunicationTile
          icon={<ProfileOutlined />}
          title={documents.signalDetails.title}
        >
          {eventDetailLines.map((line) => (
            <Typography.Text key={line} type="secondary" style={bodyStyle}>
              {line}
            </Typography.Text>
          ))}
        </CompensationEventNoticeCommunicationTile>
      )} */}

        {!!emailCount && (
          <CompensationEventNoticeCommunicationTile
            icon={<MailOutlined />}
            title={documents.emailThread.title}
            count={emailCount}
          >
            <Typography.Text type="secondary" style={bodyStyle}>
              {documents.emailThread.body}
            </Typography.Text>
            <Flex justify="flex-end">
              {/* The design puts the icon after the label on both tile links. */}
              <Typography.Link onClick={onOpenEmailThread} style={bodyStyle}>
                {documents.emailThread.action} <EyeOutlined />
              </Typography.Link>
            </Flex>
          </CompensationEventNoticeCommunicationTile>
        )}

        {!!attachmentCount && (
          <CompensationEventNoticeCommunicationTile
            icon={<FileOutlined />}
            title={documents.attachments.title}
            count={attachmentCount}
          >
            <Typography.Text type="secondary" style={bodyStyle}>
              {documents.attachments.body}
            </Typography.Text>
            {/* "View" opens the list, where each row downloads itself — the same single
              link the Email Thread tile carries, so both tiles read the same way. */}
            <Flex justify="flex-end">
              <Typography.Link onClick={onViewAttachments} style={bodyStyle}>
                {documents.attachments.action} <EyeOutlined />
              </Typography.Link>
            </Flex>
          </CompensationEventNoticeCommunicationTile>
        )}
      </Flex>
    </Card>
  );
};

export default CompensationEventNoticeDocumentsCommunication;
