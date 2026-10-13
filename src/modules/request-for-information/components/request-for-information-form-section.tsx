import { FileTextOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { FORM_COLORS, FORM_SIZES } from '../constants/request-for-information-form.theme';

interface RequestForInformationFormSectionProps {
  title: string;
  children: ReactNode;
}

// Presentational — the "icon + heading" card shell every form section on the Create RFI
// screen shares (Basic Details, Request For Information, RFI Details).
const RequestForInformationFormSection = ({
  title,
  children,
}: RequestForInformationFormSectionProps) => (
  <Card
    styles={{
      body: {
        padding: `${FORM_SIZES.cardPaddingBlock}px ${FORM_SIZES.cardPaddingInline}px`,
      },
    }}
  >
    <Flex vertical gap={10}>
      <Flex align="center" gap={5}>
        <FileTextOutlined style={{ color: FORM_COLORS.main, fontSize: 16 }} />
        <Typography.Text strong style={{ color: FORM_COLORS.main, fontSize: 16 }}>
          {title}
        </Typography.Text>
      </Flex>

      {children}
    </Flex>
  </Card>
);

export default RequestForInformationFormSection;
