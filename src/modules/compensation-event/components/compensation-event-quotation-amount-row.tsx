import { Flex, Typography } from 'antd';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';

interface CompensationEventQuotationAmountRowProps {
  label: string;
  amount: string;
  /** The grand total is the only row the design draws in navy. */
  emphasis?: boolean;
}

const CompensationEventQuotationAmountRow = ({
  label,
  amount,
  emphasis,
}: CompensationEventQuotationAmountRowProps) => (
  <Flex align="center" justify="space-between" gap={16}>
    <Typography.Text
      strong={emphasis}
      style={{
        color: emphasis ? QUOTATION_COLORS.main : undefined,
        fontSize: emphasis ? QUOTATION_SIZES.totalFontSize : QUOTATION_SIZES.cellFontSize,
      }}
    >
      {label}
    </Typography.Text>
    <Typography.Text
      strong={emphasis}
      style={{
        color: emphasis ? QUOTATION_COLORS.main : QUOTATION_COLORS.amount,
        fontSize: emphasis ? QUOTATION_SIZES.totalFontSize : QUOTATION_SIZES.cellFontSize,
        whiteSpace: 'nowrap',
      }}
    >
      {amount}
    </Typography.Text>
  </Flex>
);

export default CompensationEventQuotationAmountRow;
