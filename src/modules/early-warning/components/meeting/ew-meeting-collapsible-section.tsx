'use client';

import { Collapse, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface EwMeetingCollapsibleSectionProps {
  title: string;
  /** Muted one-liner under the title telling the user what opening the panel shows. */
  description: string;
  children: ReactNode;
  /** Panels start closed so the meeting header and agreed actions stay on one screen. */
  defaultOpen?: boolean;
}

export const EwMeetingCollapsibleSection = ({
  title,
  description,
  children,
  defaultOpen = false,
}: EwMeetingCollapsibleSectionProps) => (
  <Collapse
    ghost
    expandIconPosition="end"
    defaultActiveKey={defaultOpen ? ['section'] : undefined}
    items={[
      {
        key: 'section',
        label: (
          <Flex vertical gap={2}>
            <Typography.Text strong>{title}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {description}
            </Typography.Text>
          </Flex>
        ),
        children,
      },
    ]}
  />
);

export default EwMeetingCollapsibleSection;
