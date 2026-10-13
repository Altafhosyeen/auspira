'use client';

import { ExportOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import { REQUEST_FOR_INFORMATION_REGISTER_COPY } from '../constants/request-for-information.constants';
import {
  REGISTER_COLORS,
  REGISTER_SIZES,
} from '../constants/request-for-information-register.theme';

const { bannerTitle, addLabel, exportLabel } = REQUEST_FOR_INFORMATION_REGISTER_COPY;

interface RequestForInformationRegisterHeaderProps {
  exporting?: boolean;
  exportDisabled?: boolean;
  onAdd: () => void;
  onExport: () => void;
}

// Presentational — the page-level title bar with the Export / Add RFI actions.
const RequestForInformationRegisterHeader = ({
  exporting = false,
  exportDisabled = false,
  onAdd,
  onExport,
}: RequestForInformationRegisterHeaderProps) => (
  <Card styles={{ body: { padding: '12px 16px' } }}>
    <Flex align="center" justify="space-between" wrap gap={16}>
      <Flex align="center" gap={12} wrap>
        <ProfileOutlined
          style={{ color: REGISTER_COLORS.main, fontSize: REGISTER_SIZES.headerIconSize }}
        />
        <Typography.Title
          level={2}
          style={{
            margin: 0,
            color: REGISTER_COLORS.main,
            fontSize: REGISTER_SIZES.titleFontSize,
            fontWeight: 700,
          }}
        >
          {bannerTitle}
        </Typography.Title>
      </Flex>

      <Flex align="center" gap={12} wrap>
        <Button
          icon={<ExportOutlined />}
          className="h-9.5 rounded-md"
          loading={exporting}
          disabled={exportDisabled}
          onClick={onExport}
        >
          {exportLabel}
        </Button>

        <Button type="primary" icon={<PlusOutlined />} className="h-9.5 rounded-md" onClick={onAdd}>
          {addLabel}
        </Button>
      </Flex>
    </Flex>
  </Card>
);

export default RequestForInformationRegisterHeader;
