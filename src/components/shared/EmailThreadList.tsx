'use client';

import { MailOutlined } from '@ant-design/icons';
import { Avatar, Button, Flex, Skeleton, Tag, Typography } from 'antd';
import {
  DirectionIcon,
  EMAIL_DIRECTION_COLORS,
  emailDirection,
  formatSentAt,
  initialsOf,
  personaColor,
  toSnippet,
} from '@/components/contract-control-agent/email-thread-list.utils';
import { EmptyState } from '@/components/shared/EmptyState';

/** One correspondence row. Direction is inferred from `senderEmail` vs `accountEmail` first
 *  and falls back to `body`/`boxType`/`source` — pass every one of them straight through from
 *  the backend message wherever it exists, rather than pre-deriving direction. */
export interface EmailThreadListItem {
  id: string;
  senderEmail: string;
  subject: string;
  body: string;
  timestampUtc: string;
  boxType?: number | string | null;
  source?: string | null;
  /** The mailbox the message was read from — a message sent by it is outbound. */
  accountEmail?: string | null;
}

interface EmailThreadListProps {
  items: EmailThreadListItem[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onSelect?: (item: EmailThreadListItem) => void;
}

/** Presentational — the shared correspondence list used by every thread panel in the app
 *  (Early Warning detail, Compensation Event detail). Rows are identical everywhere so a
 *  thread reads the same wherever it is surfaced; the surrounding panel chrome, paging and
 *  the modal a row opens stay with the caller. */
export default function EmailThreadList({
  items,
  isLoading,
  emptyTitle = 'No email threads yet',
  emptyDescription = 'Messages linked to this record will appear here once they arrive.',
  onSelect,
}: EmailThreadListProps) {
  if (isLoading) {
    return (
      <Flex vertical gap={8}>
        {['a', 'b', 'c'].map((slot) => (
          <div
            key={`thread-skeleton-${slot}`}
            style={{
              overflow: 'hidden',
              borderRadius: 0,
              border: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              padding: '12px 16px',
            }}
          >
            <Skeleton avatar active paragraph={{ rows: 2 }} title />
          </div>
        ))}
      </Flex>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<MailOutlined className="text-lg text-slate-700" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <Flex vertical gap={8}>
      {items.map((item) => {
        const sender = item.senderEmail || 'Unknown sender';
        const direction = emailDirection(item);
        return (
          <Button
            key={item.id}
            block
            onClick={() => onSelect?.(item)}
            style={{
              height: 'auto',
              padding: '12px 16px',
              borderRadius: 0,
              border: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              textAlign: 'left',
              display: 'block',
            }}
          >
            <Flex align="flex-start" gap={12} style={{ width: '100%' }}>
              <DirectionIcon direction={direction} />
              <Avatar
                size={38}
                style={{
                  backgroundColor: personaColor(sender),
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {initialsOf(sender)}
              </Avatar>

              <Flex vertical gap={2} flex={1} style={{ minWidth: 0 }}>
                <Typography.Text strong ellipsis style={{ fontSize: 14, color: '#242424' }}>
                  {sender}
                </Typography.Text>
                <Typography.Text strong ellipsis style={{ fontSize: 13, color: '#0078d4' }}>
                  {item.subject || '(no subject)'}
                </Typography.Text>
                <Typography.Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#3b3a39',
                    lineHeight: 1.5,
                    whiteSpace: 'normal',
                  }}
                >
                  {toSnippet(item.body || '') || '(no content)'}
                </Typography.Paragraph>
              </Flex>

              <Flex vertical align="flex-end" gap={6} style={{ flexShrink: 0, paddingLeft: 8 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {formatSentAt(item.timestampUtc)}
                </Typography.Text>
                <Tag
                  bordered={false}
                  style={{
                    margin: 0,
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backgroundColor: EMAIL_DIRECTION_COLORS[direction].background,
                    color: EMAIL_DIRECTION_COLORS[direction].text,
                  }}
                >
                  {direction === 'in' ? 'Inbound' : 'Outbound'}
                </Tag>
              </Flex>
            </Flex>
          </Button>
        );
      })}
    </Flex>
  );
}
