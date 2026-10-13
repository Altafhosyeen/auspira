import { Avatar, Badge, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { NOTICE_COLORS, NOTICE_SIZES } from '../constants/compensation-event-notice.theme';

interface CompensationEventNoticeCommunicationTileProps {
  icon: ReactNode;
  title: string;
  // Rendered as a badge next to the heading — omitted on tiles that count nothing.
  count?: number;
  children: ReactNode;
}

// Bordered tile inside the Documents & Communication card — navy icon chip, a small
// navy heading and free-form body. The icon aligns with the heading rather than the
// tile's centre, so tiles with taller bodies keep the same visual rhythm.
const CompensationEventNoticeCommunicationTile = ({
  icon,
  title,
  count,
  children,
}: CompensationEventNoticeCommunicationTileProps) => (
  <Flex
    align="flex-start"
    gap={11}
    style={{
      border: `1px solid ${NOTICE_COLORS.border}`,
      borderRadius: 4,
      padding: '14px 8px',
    }}
  >
    <Avatar
      size={NOTICE_SIZES.tileIconChip}
      icon={icon}
      style={{
        backgroundColor: NOTICE_COLORS.main,
        flex: 'none',
        fontSize: NOTICE_SIZES.fieldIcon,
      }}
    />

    <Flex vertical gap={2} flex={1} style={{ minWidth: 0 }}>
      <Flex align="center" gap={8}>
        <Typography.Text strong style={{ color: NOTICE_COLORS.main, fontSize: 13 }}>
          {title}
        </Typography.Text>
        {!!count && (
          <Badge
            size="small"
            count={count}
            style={{ backgroundColor: NOTICE_COLORS.main, fontSize: 11 }}
          />
        )}
      </Flex>
      {children}
    </Flex>
  </Flex>
);

export default CompensationEventNoticeCommunicationTile;
