import { CheckCircleOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Divider, Empty, Flex, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  CONTRACTOR_QUOTATION_COPY,
  QUOTATION_SUBMITTED_DATE_FORMAT,
} from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { QuotationSummaryRow } from '../types/compensation-event-quotation.types';
import { formatQuotationAmount } from '../utils/compensation-event-quotation.utils';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { quotation } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationSummaryCardProps {
  submittedOn: string;
  currency: string;
  rows: QuotationSummaryRow[];
  /** Null when the quotation named no figure at all — rendered as a dash, not as zero. */
  total: number | null;
  /** Muted line under the title, e.g. "Submitted - Version 2". */
  note?: string;
}

// The quotation stated flat: one row per priced line exactly as the contractor sent it,
// then the total. Deliberately not grouped by category — a category is a filing detail of
// the wire, not something the PM reads a price off, so it is left to the info icon beside
// each label rather than given a heading row and a chevron of its own.
const CompensationEventQuotationSummaryCard = ({
  submittedOn,
  currency,
  rows,
  total,
  note,
}: CompensationEventQuotationSummaryCardProps) => {
  return (
    <CompensationEventNoticeSectionCard
      icon={<FileTextOutlined />}
      title={quotation.title}
      subtitle={note}
      extra={
        <Tag
          bordered
          icon={<CheckCircleOutlined />}
          style={{
            margin: 0,
            borderRadius: 20,
            padding: '2px 8px',
            backgroundColor: QUOTATION_COLORS.submittedBg,
            borderColor: QUOTATION_COLORS.submittedBorder,
            color: QUOTATION_COLORS.submittedText,
          }}
        >
          {`${quotation.submittedPrefix} ${dayjs(submittedOn).format(QUOTATION_SUBMITTED_DATE_FORMAT)}`}
        </Tag>
      }
      headerDivider
      gap={16}
    >
      {rows.length ? (
        <Flex vertical gap={QUOTATION_SIZES.summaryRowGap}>
          {rows.map((row) => (
            <Flex key={row.key} align="center" justify="space-between" gap={16}>
              <Flex align="center" gap={6} style={{ minWidth: 0 }}>
                <Typography.Text
                  strong
                  style={{
                    color: QUOTATION_COLORS.amount,
                    fontSize: QUOTATION_SIZES.summaryLabelFontSize,
                  }}
                >
                  {row.label}
                </Typography.Text>
                {/* A line the quotation left unexplained gets no icon rather than an
                    empty tooltip. */}
                {!!row.hint && (
                  <Tooltip title={row.hint}>
                    <InfoCircleOutlined
                      style={{
                        color: QUOTATION_COLORS.textMuted,
                        flex: 'none',
                        fontSize: QUOTATION_SIZES.hintFontSize,
                      }}
                    />
                  </Tooltip>
                )}
              </Flex>

              {/* The figure is a read-only report of what the contractor priced, so the
                  chip is an outline only — it must not read as an editable field. */}
              <Typography.Text
                style={{
                  border: `1px solid ${QUOTATION_COLORS.groupBoxBorder}`,
                  borderRadius: QUOTATION_SIZES.summaryAmountRadius,
                  color: QUOTATION_COLORS.amount,
                  flex: 'none',
                  fontSize: QUOTATION_SIZES.cellFontSize,
                  minWidth: QUOTATION_SIZES.summaryAmountWidth,
                  padding: `${QUOTATION_SIZES.summaryAmountPaddingBlock}px ${QUOTATION_SIZES.cellPaddingInline}px`,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatQuotationAmount(row.amount, currency)}
              </Typography.Text>
            </Flex>
          ))}

          <Divider style={{ margin: 0, borderColor: QUOTATION_COLORS.rowDivider }} />

          <Flex align="center" justify="space-between" gap={16}>
            <Typography.Text
              strong
              style={{ color: QUOTATION_COLORS.main, fontSize: QUOTATION_SIZES.totalFontSize }}
            >
              {quotation.total}
            </Typography.Text>
            {/* Borderless, but carrying the row chips' width and padding so the total
                centres on the same axis as the figures it sums. */}
            <Typography.Text
              strong
              style={{
                color: QUOTATION_COLORS.main,
                flex: 'none',
                fontSize: QUOTATION_SIZES.totalFontSize,
                minWidth: QUOTATION_SIZES.summaryAmountWidth,
                paddingInline: QUOTATION_SIZES.cellPaddingInline,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {formatQuotationAmount(total, currency)}
            </Typography.Text>
          </Flex>
        </Flex>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={quotation.noItems} />
      )}
    </CompensationEventNoticeSectionCard>
  );
};

export default CompensationEventQuotationSummaryCard;
