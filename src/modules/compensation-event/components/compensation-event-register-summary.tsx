import { CalendarOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Skeleton } from 'antd';
import { COMPENSATION_EVENT_REGISTER_SUMMARY_COPY } from '../constants/compensation-event.constants';
import {
  REGISTER_SIZES,
  REGISTER_SUMMARY_TONES,
} from '../constants/compensation-event-register.theme';
import { formatQuoteValue } from '../utils/compensation-event.utils';
import CompensationEventRegisterSummaryTile from './compensation-event-register-summary-tile';

// The unit is stepped down from the figure so the number carries the tile and "Days" reads
// as the unit on it. Singular on ±1, matching the register's own DURATION column.
const renderDurationImpact = (days: number) => (
  <>
    {`${days > 0 ? '+' : ''}${days}`}
    <span style={{ fontSize: REGISTER_SIZES.summaryValueUnitFontSize }}>
      {` ${Math.abs(days) === 1 ? 'Day' : 'Days'}`}
    </span>
  </>
);

const {
  quotationValueLabel,
  quotationValueSubtitle,
  quotationCountSuffix,
  durationImpactLabel,
  durationImpactSubtitle,
  durationCountSuffix,
} = COMPENSATION_EVENT_REGISTER_SUMMARY_COPY;

interface CompensationEventRegisterSummaryProps {
  // Sum of every quotation value across the register (unfiltered baseline), and how many
  // of the events actually carry a quotation.
  totalQuotationValue: number;
  quotationCount: number;
  currency: string;
  // Sum of every event's time impact in days, and how many events it spans.
  totalDurationImpactDays: number;
  eventCount: number;
  // The two headline figures are fetched; while they are in flight the tiles show a
  // placeholder rather than a zero, which would read as a real total.
  isLoading?: boolean;
}

const VALUE_PLACEHOLDER = (
  <Skeleton.Input active size="small" style={{ height: 28, minWidth: 120 }} />
);

// Presentational — the two-tile strip above the register toolbar: total quotation value
// and total programme duration impact, each with a small detail line underneath.
const CompensationEventRegisterSummary = ({
  totalQuotationValue,
  quotationCount,
  currency,
  totalDurationImpactDays,
  eventCount,
  isLoading,
}: CompensationEventRegisterSummaryProps) => (
  <Card styles={{ body: { padding: '20px 24px' } }}>
    <Flex align="stretch">
      <div style={{ flex: 1 }}>
        <CompensationEventRegisterSummaryTile
          icon={<DollarOutlined />}
          iconBg={REGISTER_SUMMARY_TONES.quotationValue.chip}
          iconColor={REGISTER_SUMMARY_TONES.quotationValue.icon}
          label={quotationValueLabel}
          value={isLoading ? VALUE_PLACEHOLDER : formatQuoteValue(totalQuotationValue, currency)}
          subtitle={quotationValueSubtitle}
          detailIcon={<FileTextOutlined />}
          detail={quotationCountSuffix(quotationCount)}
        />
      </div>

      <Divider type="vertical" style={{ height: 'auto', margin: '0 24px' }} />

      <div style={{ flex: 1 }}>
        <CompensationEventRegisterSummaryTile
          icon={<CalendarOutlined />}
          iconBg={REGISTER_SUMMARY_TONES.durationImpact.chip}
          iconColor={REGISTER_SUMMARY_TONES.durationImpact.icon}
          label={durationImpactLabel}
          value={isLoading ? VALUE_PLACEHOLDER : renderDurationImpact(totalDurationImpactDays)}
          subtitle={durationImpactSubtitle}
          detailIcon={<FileTextOutlined />}
          detail={durationCountSuffix(eventCount)}
        />
      </div>
    </Flex>
  </Card>
);

export default CompensationEventRegisterSummary;
