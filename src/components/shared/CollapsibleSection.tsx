/**
 * Collapsible Section
 * Reusable Ant Design collapsible section with badge support
 */

import React from 'react';
import { Collapse, Typography } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Panel } = Collapse;

interface CollapsibleSectionProps {
  title: string | React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  badge,
  children,
  defaultOpen = false,
}) => {
  return (
    <Collapse
      defaultActiveKey={defaultOpen ? ['1'] : []}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      className="rounded-xl border border-gray-200"
    >
      <Panel
        key="1"
        header={
          <div className="flex items-center gap-2">
            {typeof title === 'string' ? (
              <Text className="text-theme-primary! font-semibold">{title}</Text>
            ) : (
              title
            )}
            {badge && <span className="text-blue-600">— {badge}</span>}
          </div>
        }
      >
        <div className="bg-white">{children}</div>
      </Panel>
    </Collapse>
  );
};

CollapsibleSection.displayName = 'CollapsibleSection';
