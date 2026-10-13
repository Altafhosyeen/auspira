import { InfoCircleOutlined, ProfileOutlined } from '@ant-design/icons';
import { Divider, Empty, Flex, InputNumber, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { QuotationSummaryRow } from '../types/compensation-event-quotation.types';
import { getCurrencySymbol } from '../utils/compensation-event-currency.utils';
import { formatQuotationAmount } from '../utils/compensation-event-quotation.utils';
import CompensationEventAssessmentEditableCell from './compensation-event-assessment-editable-cell';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { lines: copy } = PM_ASSESSMENT_COPY;
const { quotation } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventAssessmentLinesProps {
  currency: string;
  rows: QuotationSummaryRow[];
  total: number | null;
  onLineChange: (key: string, amount: number) => void;
}

// The claimed lines as the PM assesses them — the same flat card the quotation screens
// show, except every row carries a pencil on its amount. Only the figure is editable: the
// label stays the contractor's own description of what they claimed, which is what the
// PM's number is being read against. Nothing is grouped by category, so every row here is
// a priced line the PM can reprice directly; the total stays derived, so an edit reprices
// the card immediately rather than leaving a stored total behind.
const CompensationEventAssessmentLines = ({
  currency,
  rows,
  total,
  onLineChange,
}: CompensationEventAssessmentLinesProps) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState(0);

  const symbol = getCurrencySymbol(currency);

  const startEditing = (row: QuotationSummaryRow) => {
    setEditingKey(row.key);
    // A row the quotation never priced opens at zero rather than at a dash the input
    // cannot hold.
    setDraft(row.amount ?? 0);
  };

  const commit = () => {
    if (editingKey) onLineChange(editingKey, draft);
    setEditingKey(null);
  };

  return (
    <CompensationEventNoticeSectionCard icon={<ProfileOutlined />} title={copy.title} gap={16}>
      {rows.length ? (
        <Flex vertical gap={QUOTATION_SIZES.summaryRowGap}>
          {rows.map((row) => {
            const editing = editingKey === row.key;

            return (
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

                <CompensationEventAssessmentEditableCell
                  align="flex-end"
                  label={`${copy.editRow} - ${row.label}`}
                  onEdit={() => startEditing(row)}
                  editor={
                    editing ? (
                      <InputNumber
                        autoFocus
                        prefix={symbol}
                        min={0}
                        controls={false}
                        value={draft}
                        onChange={(value) => setDraft(value ?? 0)}
                        onBlur={commit}
                        onPressEnter={commit}
                        // Matches the outlined chip's width so the row does not jump
                        // when the pencil swaps the figure for this input.
                        style={{ width: QUOTATION_SIZES.summaryAmountWidth }}
                      />
                    ) : null
                  }
                >
                  {/* Outlined to the same chip the read-only quotation card draws, so the
                      figure reads as a value the PM can act on rather than loose text. */}
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
                </CompensationEventAssessmentEditableCell>
              </Flex>
            );
          })}

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

export default CompensationEventAssessmentLines;
