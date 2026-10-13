'use client';

import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  DeliveredProcedureOutlined,
  FileTextOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Skeleton, Typography } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { DetailLifecycleRail } from '@/components/shared/detail-lifecycle-rail';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  type CompensationEventFinancials,
  CompensationEventStatusTag,
  DASH,
  FINANCIALS_CARD_TONES,
  FINANCIALS_COLORS,
  FINANCIALS_SIZES,
  formatDayCount,
  formatOptionalQuoteValue,
  OVERVIEW_COLORS,
  OVERVIEW_STEPPER_COLORS,
  toCeLifecycleSteps,
  useGetCompensationEventById,
  useGetCompensationEventFinancialSummary,
} from '@/modules/compensation-event';
import { PMI_DETAIL_COPY } from '../constants/pmi.constants';

interface PmiCompensationEventTabProps {
  /** The linked CE id when one exists on the PMI record. */
  compensationEventId?: string | null;
  compensationEventReference?: string | null;
}

// The trend arrow beside a difference figure — points at the direction the backend
// flags. An increase costs the project money, so up reads red and down green, for the
// days figure exactly as for the cost one.
const trendIcon = (increased: boolean | null | undefined) => {
  if (increased === null || increased === undefined) return null;
  return increased ? (
    <ArrowUpOutlined style={{ color: FINANCIALS_COLORS.negative, fontSize: 12 }} />
  ) : (
    <ArrowDownOutlined style={{ color: FINANCIALS_COLORS.positive, fontSize: 12 }} />
  );
};

interface ImpactTileProps {
  tone: keyof typeof FINANCIALS_CARD_TONES;
  icon: React.ReactNode;
  label: string;
  cost: string;
  /** "10 Days claimed" / "— assessed" — the claim priced into this figure. */
  days: number | null | undefined;
  daysSuffix: string;
  daysTrend?: boolean | null;
}

// One tinted figure tile of the Financial Impact strip — the cost as the headline, the
// claim days it was priced on as a quiet sub-line. Same visual language as the CE
// Financials tab's metric tiles, so the two screens read as one product.
const ImpactTile = ({ tone, icon, label, cost, days, daysSuffix, daysTrend }: ImpactTileProps) => {
  const palette = FINANCIALS_CARD_TONES[tone];

  return (
    <Flex
      vertical
      gap={8}
      style={{
        background: palette.background,
        border: `1px solid ${palette.border}`,
        padding: '16px 20px',
      }}
    >
      <Flex align="center" gap={8}>
        <Flex
          align="center"
          justify="center"
          style={{
            background: palette.chip,
            borderRadius: FINANCIALS_SIZES.metricChipRadius,
            color: palette.icon,
            flex: 'none',
            fontSize: 14,
            height: 26,
            width: 26,
          }}
        >
          {icon}
        </Flex>
        <Typography.Text style={{ fontWeight: 500 }}>{label}</Typography.Text>
      </Flex>

      <Typography.Text style={{ fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {cost}
      </Typography.Text>

      <Flex align="center" gap={6}>
        {trendIcon(daysTrend)}
        <Typography.Text type="secondary">
          {days === null || days === undefined ? DASH : formatDayCount(days)} {daysSuffix}
        </Typography.Text>
      </Flex>
    </Flex>
  );
};

// Compensation Event tab — reads the linked CE straight from the compensation-event API
// (same hooks the CE detail screen uses) and renders its financials and API-driven
// lifecycle rail. Pure antd components, no module-specific styling.
const PmiCompensationEventTab = ({
  compensationEventId,
  compensationEventReference,
}: PmiCompensationEventTabProps) => {
  const router = useRouter();

  const { data: event, isLoading } = useGetCompensationEventById({
    id: compensationEventId ?? '',
    enabled: !!compensationEventId,
  });
  const { data: financials } = useGetCompensationEventFinancialSummary({
    id: compensationEventId ?? '',
    enabled: !!compensationEventId,
  });

  if (!compensationEventId) {
    return (
      <Card>
        <EmptyState
          icon={<FileTextOutlined className="text-lg text-slate-400" />}
          title="No linked compensation event"
          description={PMI_DETAIL_COPY.noCompensationEvent}
        />
      </Card>
    );
  }

  if (isLoading || !event) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const reference = event.reference || compensationEventReference || '';
  const description = event.summary || event.description;
  const steps = toCeLifecycleSteps(event.lifecycle);
  const f: CompensationEventFinancials | undefined = financials;

  return (
    <Flex vertical gap={16}>
      {/* CE banner card */}
      <Card>
        <Flex vertical gap={12}>
          <Flex align="center" justify="space-between" gap={12} wrap>
            <Flex align="center" gap={10}>
              <FileTextOutlined />
              <Typography.Text strong>Compensation Event {reference}</Typography.Text>
              {event.status && <CompensationEventStatusTag status={event.status} />}
            </Flex>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => router.push(`/contract-control-agent/compensation-event/${event.id}`)}
            >
              {PMI_DETAIL_COPY.viewCompensationEvent}
            </Button>
          </Flex>
          {description && (
            <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
          )}
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Financial Impact — three tinted tiles: what the contractor quoted, what was
            assessed, and the difference, each carrying its claim days as a sub-line and
            the difference pointing at the direction the backend flags. */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Flex align="center" gap={8}>
                <FileTextOutlined />
                Financial Impact
              </Flex>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <ImpactTile
                  tone="quote"
                  icon={<DeliveredProcedureOutlined />}
                  label="Original Quote"
                  cost={formatOptionalQuoteValue(f?.originalQuote, event.currency)}
                  days={f?.originalTimeImpactDays}
                  daysSuffix="claimed"
                />
              </Col>
              <Col xs={24} md={8}>
                <ImpactTile
                  tone="approved"
                  icon={<WalletOutlined />}
                  label="Approved Cost"
                  cost={formatOptionalQuoteValue(f?.approvedCost, event.currency)}
                  days={f?.approvedTimeImpactDays}
                  daysSuffix="assessed"
                />
              </Col>
              <Col xs={24} md={8}>
                <ImpactTile
                  tone="varianceFavourable"
                  icon={trendIcon(f?.isIncreased) ?? <WalletOutlined />}
                  label="Difference"
                  cost={formatOptionalQuoteValue(
                    f?.costDifference === null || f?.costDifference === undefined
                      ? null
                      : Math.abs(f.costDifference),
                    event.currency
                  )}
                  days={f?.differenceInDays}
                  daysSuffix="difference"
                  daysTrend={f?.isDaysIncreased}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Lifecycle rail — the linked CE's own `lifecycle[]`, through the shared rail. */}
        <Col xs={24} lg={8}>
          <DetailLifecycleRail
            title={PMI_DETAIL_COPY.lifecycleTitle}
            steps={steps}
            tone={{
              navy: OVERVIEW_COLORS.navy,
              muted: OVERVIEW_COLORS.muted,
              value: OVERVIEW_COLORS.value,
              complete: OVERVIEW_STEPPER_COLORS.complete,
              pending: OVERVIEW_STEPPER_COLORS.pending,
              current: OVERVIEW_STEPPER_COLORS.current,
            }}
            divider
          />
        </Col>
      </Row>

      {/* Raised-by metadata — the DTO carries no PM field yet, so only the raiser renders. */}
      {event.raisedByName && (
        <Card>
          <Flex align="center" gap={12}>
            <Typography.Text type="secondary">Raised By</Typography.Text>
            <Typography.Text strong>{event.raisedByName}</Typography.Text>
          </Flex>
        </Card>
      )}
    </Flex>
  );
};

export default PmiCompensationEventTab;
