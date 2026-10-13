import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { QuotationTableRow } from '../types/compensation-event-quotation.types';
import { formatQuotationAmount } from '../utils/compensation-event-quotation.utils';
import CompensationEventQuotationItemCell from './compensation-event-quotation-item-cell';

interface CompensationEventQuotationGroupBoxProps {
  row: QuotationTableRow;
  currency: string;
  onToggle: (key: string) => void;
  // The assessment screen drops its editable cells into the same two slots, so a boxed
  // row keeps the block's alignment whether it is being read or edited.
  description?: ReactNode;
  amount?: ReactNode;
  // The read-only table drops the DESCRIPTION column and moves the text to an info icon
  // beside the item name, so the block lays out two slots instead of three.
  hideDescription?: boolean;
}

// A collapsed group — the frame lifts it out of the table into an outlined block, so it
// spans all three columns and lays the same three widths out again inside its border. The
// cell it sits in is cleared of its own padding (see BOXED_ROW_CELL_STYLE), so the block
// carries no horizontal margin of its own either — it fills the cell exactly, and its
// border lands flush with the header row's own band, the same edge every other row's
// content is inset from. Never a flex `gap` on the row inside, which would drift the split
// the header actually draws.
const CompensationEventQuotationGroupBox = ({
  row,
  currency,
  onToggle,
  description,
  amount,
  hideDescription,
}: CompensationEventQuotationGroupBoxProps) => (
  <div
    style={{
      border: `1px solid ${QUOTATION_COLORS.groupBoxBorder}`,
      borderRadius: QUOTATION_SIZES.groupBoxRadius,
      margin: `${QUOTATION_SIZES.groupBoxGap}px 0`,
      padding: `${QUOTATION_SIZES.groupBoxPaddingBlock}px 0`,
    }}
  >
    <Flex align="center" className="px-1.5!">
      {/* With DESCRIPTION gone the name takes the slack the middle slot used to hold, so
          the block still ends its amount on the AMOUNT column's own edge. */}
      <div
        style={{
          boxSizing: 'border-box',
          flex: hideDescription ? 1 : 'none',
          minWidth: 0,
          paddingRight: QUOTATION_SIZES.cellPaddingInline,
          width: hideDescription ? undefined : QUOTATION_SIZES.itemColumnWidth,
        }}
      >
        <CompensationEventQuotationItemCell
          row={row}
          expanded={false}
          onToggle={onToggle}
          showDescriptionHint={hideDescription}
        />
      </div>

      {!hideDescription && (
        <div
          style={{
            flex: 1,
            minWidth: 0,
            paddingInline: QUOTATION_SIZES.cellPaddingInline,
          }}
        >
          {description ?? (
            <Typography.Text type="secondary" style={{ fontSize: QUOTATION_SIZES.memberFontSize }}>
              {row.description}
            </Typography.Text>
          )}
        </div>
      )}

      <div
        style={{
          boxSizing: 'border-box',
          paddingLeft: QUOTATION_SIZES.cellPaddingInline,
          textAlign: 'right',
          width: QUOTATION_SIZES.amountColumnWidth,
        }}
      >
        {amount ?? (
          <Typography.Text
            strong
            style={{
              color: QUOTATION_COLORS.amount,
              fontSize: QUOTATION_SIZES.cellFontSize,
              whiteSpace: 'nowrap',
            }}
          >
            {formatQuotationAmount(row.amount, currency)}
          </Typography.Text>
        )}
      </div>
    </Flex>
  </div>
);

export default CompensationEventQuotationGroupBox;
