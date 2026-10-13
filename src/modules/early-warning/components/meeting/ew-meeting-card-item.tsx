'use client';

import { Card, Divider, Flex, Tag, Typography } from 'antd';
import type { MeetingDto } from '../../types/early-warning-api.types';
import {
  formatMeetingDateTime,
  getMeetingDtoStatus,
  getMeetingStatusTagProps,
} from '../../utils/early-warning-meeting.utils';

interface EwMeetingCardItemProps {
  meeting: MeetingDto;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const EwMeetingCardItem = ({
  meeting,
  index,
  isSelected,
  onSelect,
}: EwMeetingCardItemProps) => {
  const status = getMeetingDtoStatus(meeting);
  const tagProps = getMeetingStatusTagProps(status);
  const formattedDateTime = formatMeetingDateTime(meeting.startTime, meeting.endTime);
  const title = meeting.subject || meeting.agenda || `Meeting ${index + 1}`;
  const actionsCount = meeting.actionsCount ?? 0;

  return (
    <Card
      onClick={onSelect}
      className="cursor-pointer transition-colors"
      // Inline styles win over antd's css-in-js card border/background so the
      // active card keeps its accent highlight and cards stay flat (no shadow).
      style={{
        boxShadow: 'none',
        ...(isSelected
          ? {
              borderColor: 'var(--theme-accent)',
              backgroundColor: 'var(--ds-surface-table-header)',
            }
          : undefined),
      }}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Flex vertical gap={6} style={{ padding: '14px 16px' }}>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Meeting {index + 1} · {status}
        </Typography.Text>

        <Typography.Text strong ellipsis>
          {title}
        </Typography.Text>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {formattedDateTime}
        </Typography.Text>

        <Flex style={{ marginTop: 2 }}>
          <Tag color={tagProps.color} bordered={false} style={{ margin: 0 }}>
            {tagProps.text}
          </Tag>
        </Flex>
      </Flex>

      <Divider style={{ margin: 0 }} />

      <Flex style={{ padding: '10px 16px' }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {actionsCount > 0 ? `${actionsCount} Actions` : 'No actions yet'}
        </Typography.Text>
      </Flex>
    </Card>
  );
};

export default EwMeetingCardItem;
