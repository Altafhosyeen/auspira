'use client';

import { ClockCircleOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Flex, Tag, Typography } from 'antd';
import { AUDIT_TIMELINE, type AuditTagTone } from './audit-timeline.theme';

export interface AuditTimelineRowProps {
  // Headline of the entry — what happened.
  headline: string;
  // Timestamp, already formatted for display.
  timestamp: string;
  // Pill beside the headline; omitted when the entry has no stage/action to show.
  tag?: { label: string; tone: AuditTagTone } | null;
  // Email address the entry came in from, when it was email-sourced.
  sender?: string | null;
  // Auspira user who performed the action.
  actorName?: string | null;
  // Optional qualifier rendered after the actor (e.g. the actor's role).
  actorMeta?: string | null;
}

// Presentational — one logged activity as a timeline entry: headline with its tag,
// timestamp on the right, then the sender / performed-by line. Callers map their own
// entry shape onto these props, which is what keeps the two trails looking identical.
const AuditTimelineRow = ({
  headline,
  timestamp,
  tag,
  sender,
  actorName,
  actorMeta,
}: AuditTimelineRowProps) => (
  <Flex
    vertical
    gap={AUDIT_TIMELINE.itemGap}
    style={{ paddingBottom: AUDIT_TIMELINE.itemPaddingBottom }}
  >
    <Flex justify="space-between" align="flex-start" wrap="nowrap" gap={AUDIT_TIMELINE.headerGap}>
      <Flex
        align="center"
        gap={AUDIT_TIMELINE.titleGap}
        wrap="wrap"
        style={{ flex: 1, minWidth: 0 }}
      >
        <Typography.Text
          strong
          style={{ fontSize: AUDIT_TIMELINE.titleFontSize, color: AUDIT_TIMELINE.titleColor }}
        >
          {headline}
        </Typography.Text>
        {tag && (
          <Tag
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: AUDIT_TIMELINE.tagFontSize,
              padding: AUDIT_TIMELINE.tagPadding,
              borderRadius: AUDIT_TIMELINE.tagRadius,
              color: tag.tone.color,
              background: tag.tone.bgColor,
              borderColor: tag.tone.borderColor,
            }}
          >
            {tag.label}
          </Tag>
        )}
      </Flex>

      <Typography.Text
        type="secondary"
        style={{
          fontSize: AUDIT_TIMELINE.timeFontSize,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          marginTop: 2,
        }}
      >
        <ClockCircleOutlined style={{ marginRight: 4 }} />
        {timestamp}
      </Typography.Text>
    </Flex>

    <Flex align="center" gap={AUDIT_TIMELINE.metaGap} wrap="wrap">
      {sender && (
        <Typography.Text type="secondary" style={{ fontSize: AUDIT_TIMELINE.metaFontSize }}>
          <MailOutlined style={{ marginRight: 4 }} />
          Sender: <Typography.Text strong>{sender}</Typography.Text>
        </Typography.Text>
      )}
      {sender && actorName && <Typography.Text type="secondary">·</Typography.Text>}
      {actorName && (
        <Typography.Text type="secondary" style={{ fontSize: AUDIT_TIMELINE.metaFontSize }}>
          <UserOutlined style={{ marginRight: 4 }} />
          Performed by: <Typography.Text strong>{actorName}</Typography.Text>
        </Typography.Text>
      )}
      {actorMeta && (
        <>
          <Typography.Text type="secondary">·</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: AUDIT_TIMELINE.metaFontSize }}>
            {actorMeta}
          </Typography.Text>
        </>
      )}
    </Flex>
  </Flex>
);

export default AuditTimelineRow;
