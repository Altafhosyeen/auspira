import { Card, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface DetailHeaderProps {
  icon: ReactNode;
  title: string;
  color: string;
  iconFontSize: number;
  titleFontSize: number;
  /** Trailing content after the title — e.g. a clause chip. */
  extra?: ReactNode;
}

// Presentational — the title bar: icon, title and an optional trailing chip. Shared by
// every detail screen's header (Compensation Event, Request For Information) so they
// stay one component instead of per-module copies that can drift apart.
export const DetailHeader = ({
  icon,
  title,
  color,
  iconFontSize,
  titleFontSize,
  extra,
}: DetailHeaderProps) => (
  <Card styles={{ body: { padding: '17px 21px' } }}>
    <Flex align="center" gap={12} wrap>
      <span style={{ color, fontSize: iconFontSize, display: 'flex' }}>{icon}</span>
      <Typography.Title
        level={2}
        style={{ margin: 0, color, fontSize: titleFontSize, fontWeight: 700 }}
      >
        {title}
      </Typography.Title>

      {extra}
    </Flex>
  </Card>
);
