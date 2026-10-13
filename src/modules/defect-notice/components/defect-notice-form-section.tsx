import { Card, Flex } from 'antd';
import type { ReactNode } from 'react';
import IconChip from '@/components/shared/icon-chip';

interface DefectNoticeFormSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

// Section shell — native antd Card head (icon chip + title), so the header padding and the
// rule under it match the shared Upload Documents card and the Create PMI screen's own
// sections. The hand-rolled header this replaced sat inside the body padding, which is what
// made the cards read as a different family and left them without a rule under the title.
const DefectNoticeFormSection = ({ icon, title, children }: DefectNoticeFormSectionProps) => (
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

export default DefectNoticeFormSection;
