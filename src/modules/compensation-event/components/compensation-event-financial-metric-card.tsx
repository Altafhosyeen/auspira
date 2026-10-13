import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import {
  type CompensationEventFinancialTone,
  FINANCIALS_CARD_TONES,
  FINANCIALS_COLORS,
  FINANCIALS_SIZES,
} from '../constants/compensation-event-financials.theme';

interface CompensationEventFinancialMetricCardProps {
  tone: CompensationEventFinancialTone;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueColor?: string;
}

// Presentational — one tinted KPI tile of the Financials metric strip.
const CompensationEventFinancialMetricCard = ({
  tone,
  icon,
  label,
  value,
  valueColor,
}: CompensationEventFinancialMetricCardProps) => {
  const palette = FINANCIALS_CARD_TONES[tone];

  return (
    <Flex
      vertical
      gap={FINANCIALS_SIZES.metricCardGap}
      style={{
        background: palette.background,
        border: `1px solid ${palette.border}`,
        borderRadius: FINANCIALS_SIZES.cardRadius,
        height: FINANCIALS_SIZES.metricCardHeight,
        padding: '22px 14px 21px',
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{
          background: palette.chip,
          borderRadius: FINANCIALS_SIZES.metricChipRadius,
          color: palette.icon,
          flex: 'none',
          fontSize: FINANCIALS_SIZES.metricIconFontSize,
          height: FINANCIALS_SIZES.metricChip,
          width: FINANCIALS_SIZES.metricChip,
        }}
      >
        {icon}
      </Flex>

      <Typography.Text
        style={{ fontSize: FINANCIALS_SIZES.metricLabelFontSize, fontWeight: 500, lineHeight: 1.2 }}
      >
        {label}
      </Typography.Text>

      <Flex align="baseline" gap={8} wrap>
        <Typography.Text
          style={{
            color: valueColor ?? FINANCIALS_COLORS.value,
            fontSize: FINANCIALS_SIZES.metricValueFontSize,
            fontWeight: 700,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography.Text>
      </Flex>
    </Flex>
  );
};

export default CompensationEventFinancialMetricCard;
