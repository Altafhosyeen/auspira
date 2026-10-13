'use client';

import { CopyOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import { COMPENSATION_EVENT_REGISTER_COPY } from '../constants/compensation-event.constants';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/compensation-event-register.theme';

const { title, addLabel, exportLabel } = COMPENSATION_EVENT_REGISTER_COPY;

interface CompensationEventRegisterHeaderProps {
  // Set while the workbook is being built, so the button owns the wait.
  exporting?: boolean;
  exportDisabled?: boolean;
  onAdd: () => void;
  onExport: () => void;
}

// Presentational — title bar with the Add CE / Export actions.
const CompensationEventRegisterHeader = ({
  exporting = false,
  exportDisabled = false,
  onAdd,
  onExport,
}: CompensationEventRegisterHeaderProps) => (
  <Card styles={{ body: { padding: '17px 21px' } }}>
    <Flex align="center" justify="space-between" wrap gap={16}>
      <Flex align="center" gap={12} wrap>
        <CopyOutlined
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
          {title}
        </Typography.Title>
      </Flex>

      <Flex align="center" gap={12} wrap>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ height: 38, borderRadius: 6 }}
          onClick={onAdd}
        >
          {addLabel}
        </Button>

        <Button
          icon={<ExportOutlined />}
          style={{ height: 38, borderRadius: 6 }}
          loading={exporting}
          disabled={exportDisabled}
          onClick={onExport}
        >
          {exportLabel}
        </Button>
      </Flex>
    </Flex>
  </Card>
);

export default CompensationEventRegisterHeader;
