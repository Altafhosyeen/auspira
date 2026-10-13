import { InfoCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Divider, Flex, Tooltip, Typography } from 'antd';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import { formatQuotationAmount } from '../utils/compensation-event-quotation.utils';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';
import CompensationEventQuotationAmountRow from './compensation-event-quotation-amount-row';

const { riskAllowance: copy } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationRiskAllowanceProps {
  currency: string;
  riskAllowance: number;
  grandTotal: number | null;
  /** What the contractor priced the contingency for — omitted when they did not say. */
  description?: string;
}

// The allowance is read off the quotation, not set here — the screen only reports what
// the contractor priced, so both amounts are plain figures in the quotation's currency.
const CompensationEventQuotationRiskAllowance = ({
  currency,
  riskAllowance,
  grandTotal,
  description,
}: CompensationEventQuotationRiskAllowanceProps) => (
  <CompensationEventNoticeSectionCard
    icon={<SafetyCertificateOutlined />}
    title={copy.title}
    subtitle={description}
    gap={16}
    titleSuffix={
      <Tooltip title={copy.tooltip}>
        <InfoCircleOutlined style={{ color: QUOTATION_COLORS.textMuted }} />
      </Tooltip>
    }
    extra={
      <Typography.Text
        style={{
          color: QUOTATION_COLORS.amount,
          fontSize: QUOTATION_SIZES.totalFontSize,
          whiteSpace: 'nowrap',
        }}
      >
        {formatQuotationAmount(riskAllowance, currency)}
      </Typography.Text>
    }
  >
    <Flex vertical gap={16}>
      <Divider style={{ margin: 0, borderColor: QUOTATION_COLORS.rowDivider }} />

      <CompensationEventQuotationAmountRow
        emphasis
        label={copy.totalWithAllowance}
        amount={formatQuotationAmount(grandTotal, currency)}
      />
    </Flex>
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventQuotationRiskAllowance;
