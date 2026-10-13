import { InfoCircleOutlined } from '@ant-design/icons';
import { Card, Flex, InputNumber, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import { ASSESSMENT_SIZES } from '../constants/compensation-event-assessment.theme';
import { NOTICE_COLORS, NOTICE_SIZES } from '../constants/compensation-event-notice.theme';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import CompensationEventAssessmentEditableCell from './compensation-event-assessment-editable-cell';

const { days: copy } = PM_ASSESSMENT_COPY;

// The same outlined chip the quotation cards draw around an amount, so the days figure
// sits on the amounts' right-hand axis and reads as a value rather than loose text.
const chipStyle = {
  border: `1px solid ${QUOTATION_COLORS.groupBoxBorder}`,
  borderRadius: QUOTATION_SIZES.summaryAmountRadius,
  color: QUOTATION_COLORS.amount,
  flex: 'none',
  fontSize: QUOTATION_SIZES.cellFontSize,
  minWidth: QUOTATION_SIZES.summaryAmountWidth,
  padding: `${QUOTATION_SIZES.summaryAmountPaddingBlock}px ${QUOTATION_SIZES.cellPaddingInline}px`,
  textAlign: 'center',
  whiteSpace: 'nowrap',
} as const;

interface CompensationEventAssessmentDaysProps {
  days?: number | null;
  onDaysChange?: (days: number | null) => void;
  /** Read on hover from an info icon beside the title. Omitted leaves the title bare. */
  hint?: string;
  /** The muted line under the title. Pass false where the design states the title alone. */
  showSubtitle?: boolean;
  // Already-worded figure stated instead of the input, e.g. "7 calendar days". Given one,
  // the card reports a number rather than collecting it, so it needs no `days`.
  readOnlyValue?: string;
}

// The time impact as a plain card rather than a section card, because the design gives
// this row no icon chip and no button of its own. It collects the PM's proposed days on
// the assessment screen, and reports the contractor's claimed days on the quotation
// screens, where the figure is theirs to state and not the PM's to edit.
const CompensationEventAssessmentDays = ({
  days = null,
  onDaysChange,
  hint,
  showSubtitle = true,
  readOnlyValue,
}: CompensationEventAssessmentDaysProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(0);

  const startEditing = () => {
    // Opens at zero rather than at a null the input cannot hold.
    setDraft(days ?? 0);
    setEditing(true);
  };

  const commit = () => {
    onDaysChange?.(draft);
    setEditing(false);
  };

  return (
    <Card
      styles={{
        body: {
          padding: `${NOTICE_SIZES.cardPaddingBlock}px ${NOTICE_SIZES.cardPaddingInline}px`,
        },
      }}
    >
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Flex vertical>
          <Flex align="center" gap={6}>
            <Typography.Text strong style={{ fontSize: ASSESSMENT_SIZES.cardTitleFontSize }}>
              {copy.title}
            </Typography.Text>
            {/* No icon rather than an empty tooltip where the screen explains itself. */}
            {!!hint && (
              <Tooltip title={hint}>
                <InfoCircleOutlined
                  style={{
                    color: NOTICE_COLORS.textMuted,
                    flex: 'none',
                    fontSize: QUOTATION_SIZES.hintFontSize,
                  }}
                />
              </Tooltip>
            )}
          </Flex>
          {showSubtitle && (
            <Typography.Text type="secondary" style={{ fontSize: ASSESSMENT_SIZES.noteFontSize }}>
              {copy.subtitle}
            </Typography.Text>
          )}
        </Flex>

        {readOnlyValue ? (
          <Typography.Text style={chipStyle}>{readOnlyValue}</Typography.Text>
        ) : (
          <CompensationEventAssessmentEditableCell
            align="flex-end"
            label={copy.edit}
            onEdit={startEditing}
            editor={
              editing ? (
                <InputNumber
                  autoFocus
                  min={0}
                  controls={false}
                  placeholder={copy.placeholder}
                  value={draft}
                  onChange={(value) => setDraft(value ?? 0)}
                  onBlur={commit}
                  onPressEnter={commit}
                  // Matches the chip's width so the row does not jump when the pencil
                  // swaps the figure for this input.
                  style={{ width: QUOTATION_SIZES.summaryAmountWidth }}
                />
              ) : null
            }
          >
            {/* A figure the PM has not set yet reads as a dash rather than a bare zero,
                which would state an assessed impact of none. */}
            <Typography.Text style={chipStyle}>
              {days === null ? copy.empty : `${days} ${copy.unit}`}
            </Typography.Text>
          </CompensationEventAssessmentEditableCell>
        )}
      </Flex>
    </Card>
  );
};

export default CompensationEventAssessmentDays;
