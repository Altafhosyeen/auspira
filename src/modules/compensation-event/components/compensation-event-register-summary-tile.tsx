import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Tooltip, Typography } from 'antd';
import type { ReactNode } from 'react';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/compensation-event-register.theme';

interface CompensationEventRegisterSummaryTileProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: ReactNode;
  subtitle: string;
  detailIcon: ReactNode;
  detail: string;
}

// Presentational — one tile of the register summary strip: a circular icon, the label
// (with an info-icon tooltip carrying the subtitle) and big value, then a small detail row underneath.
const CompensationEventRegisterSummaryTile = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
}: CompensationEventRegisterSummaryTileProps) => (
  <Flex align="flex-start" gap={16}>
    <Flex
      align="center"
      justify="center"
      style={{
        background: iconBg,
        borderRadius: '50%',
        color: iconColor,
        flex: 'none',
        fontSize: REGISTER_SIZES.summaryIconFontSize,
        height: REGISTER_SIZES.summaryIconSize,
        width: REGISTER_SIZES.summaryIconSize,
      }}
    >
      {icon}
    </Flex>

    <Flex vertical gap={4}>
      <Flex align="center" gap={6}>
        <Typography.Text style={{ color: REGISTER_COLORS.text, fontSize: 14, fontWeight: 600 }}>
          {label}
        </Typography.Text>
        <Tooltip title={subtitle}>
          <InfoCircleOutlined style={{ color: REGISTER_COLORS.subtitle, fontSize: 12 }} />
        </Tooltip>
      </Flex>

      <Typography.Text
        style={{
          color: REGISTER_COLORS.main,
          fontSize: REGISTER_SIZES.summaryValueFontSize,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {value}
      </Typography.Text>

      {/* <Flex align="center" gap={6} style={{ color: REGISTER_COLORS.subtitle, fontSize: 12 }}>
        {detailIcon}
        <Typography.Text style={{ color: REGISTER_COLORS.subtitle, fontSize: 12 }}>
          {detail}
        </Typography.Text>
      </Flex> */}
    </Flex>
  </Flex>
);

export default CompensationEventRegisterSummaryTile;
