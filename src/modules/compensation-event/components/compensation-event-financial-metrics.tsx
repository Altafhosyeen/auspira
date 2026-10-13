'use client';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeliveredProcedureOutlined,
  FieldTimeOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import type { ReactNode } from 'react';
import { COMPENSATION_EVENT_FINANCIAL_LABELS } from '../constants/compensation-event-financials.constants';
import {
  FINANCIALS_COLORS,
  FINANCIALS_SIZES,
} from '../constants/compensation-event-financials.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import {
  type CompensationEventFinancials,
  DASH,
  formatOptionalQuoteValue,
  formatTimeImpactDays,
} from '../utils/compensation-event.utils';
import CompensationEventFinancialMetricCard from './compensation-event-financial-metric-card';

// The design tints only the signed magnitude and leaves the unit black. Both keep the
// tile's own value size, so this tile's figure reads at the same weight as the currency
// figures in the tiles beside it. The magnitude takes the variance colour once the
// assessment has moved the days either way, and stays navy while it has not.
const renderTimeImpact = (days: number | null, magnitudeColor: string): ReactNode => {
  if (days === null) return DASH;

  const [magnitude, unit] = formatTimeImpactDays(days).split(' ');

  return (
    <>
      <Typography.Text style={{ color: magnitudeColor }}>{magnitude}</Typography.Text>
      {` ${unit}`}
    </>
  );
};

interface CompensationEventFinancialMetricsProps {
  event: CompensationEvent;
  financials: CompensationEventFinancials;
}

// Presentational — the six tinted KPI tiles (3x2 grid) above the Financial Outcome table.
const CompensationEventFinancialMetrics = ({
  event,
  financials,
}: CompensationEventFinancialMetricsProps) => {
  const { costDifference, isIncreased, isDaysIncreased } = financials;
  // An increase is the favourable outcome to show here, so `isIncreased` reads green and
  // points up, a decrease red and down. With no direction at all (null) the tile shows a
  // dash, so it keeps the up/green treatment rather than flagging a fall that isn't there.
  const isDecrease = isIncreased === false;
  const differenceColor = isDecrease ? FINANCIALS_COLORS.negative : FINANCIALS_COLORS.positive;
  const differenceTone = isDecrease ? 'varianceAdverse' : 'varianceFavourable';
  const differenceIcon = isDecrease ? <ArrowDownOutlined /> : <ArrowUpOutlined />;

  // `isDaysIncreased` only ever flags a rise: true points the tile up in green. False is
  // "not increased", not "decreased" — a flat assessment reports it too — so it keeps the
  // neutral clock icon and navy figure rather than showing a fall that isn't there.
  const daysIcon = isDaysIncreased ? <ArrowUpOutlined /> : <FieldTimeOutlined />;
  const daysTone = isDaysIncreased ? 'varianceFavourable' : 'time';
  const daysColor = isDaysIncreased ? FINANCIALS_COLORS.positive : FINANCIALS_COLORS.navy;

  return (
    <Card
      styles={{ body: { padding: '14px 25px 14px 24px' } }}
      style={{ borderRadius: FINANCIALS_SIZES.cardRadius }}
    >
      <Row gutter={[FINANCIALS_SIZES.metricGutter, FINANCIALS_SIZES.metricGutter]}>
        <Col xs={24} md={12} xl={8}>
          <CompensationEventFinancialMetricCard
            tone="quote"
            icon={<DeliveredProcedureOutlined />}
            label={COMPENSATION_EVENT_FINANCIAL_LABELS.originalQuote}
            value={formatOptionalQuoteValue(financials.originalQuote, event.currency)}
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <CompensationEventFinancialMetricCard
            tone="approved"
            icon={<WalletOutlined />}
            label={COMPENSATION_EVENT_FINANCIAL_LABELS.approvedCost}
            value={formatOptionalQuoteValue(
              financials.approvedCost ?? financials.originalQuote,
              event.currency
            )}
            valueColor={FINANCIALS_COLORS.positive}
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <CompensationEventFinancialMetricCard
            tone={differenceTone}
            icon={differenceIcon}
            label={COMPENSATION_EVENT_FINANCIAL_LABELS.difference}
            value={formatOptionalQuoteValue(
              costDifference === null ? null : Math.abs(costDifference),
              event.currency
            )}
            valueColor={costDifference === null ? undefined : differenceColor}
          />
        </Col>
        {/* Fees and Risk Allowance fall back to zero rather than a dash: an absent
            allowance is an allowance of nothing, so the figure is known. The quote tiles
            above keep the dash — a missing quote is "not yet quoted", and a zero there
            would read as a real quotation of nothing. */}
        <Col xs={24} md={12} xl={8}>
          <CompensationEventFinancialMetricCard
            tone="fees"
            icon={<FileProtectOutlined />}
            label={COMPENSATION_EVENT_FINANCIAL_LABELS.fees}
            value={formatOptionalQuoteValue(financials.fees ?? 0, event.currency)}
            valueColor={FINANCIALS_COLORS.fees}
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <CompensationEventFinancialMetricCard
            tone="riskAllowance"
            icon={<SafetyCertificateOutlined />}
            label={COMPENSATION_EVENT_FINANCIAL_LABELS.riskAllowance}
            value={formatOptionalQuoteValue(financials.riskAllowance ?? 0, event.currency)}
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <CompensationEventFinancialMetricCard
            tone={daysTone}
            icon={daysIcon}
            label={COMPENSATION_EVENT_FINANCIAL_LABELS.timeImpact}
            value={renderTimeImpact(financials.approvedTimeImpactDays, daysColor)}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default CompensationEventFinancialMetrics;
