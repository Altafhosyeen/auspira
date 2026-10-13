import { Card, Flex } from 'antd';
import type { ReactNode } from 'react';
import IconChip from '@/components/shared/icon-chip';

interface PmiFormSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

// Section shell — native antd Card head (icon chip + title), so the header padding and the
// rule under it match the shared Upload Documents card exactly. No custom header layout.
const PmiFormSectionCard = ({ icon, title, children }: PmiFormSectionCardProps) => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <IconChip icon={icon} outlined />
        {title}
      </Flex>
    }
  >
    {children}
  </Card>
);

export default PmiFormSectionCard;
