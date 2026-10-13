import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { QuotationTableRow } from '../types/compensation-event-quotation.types';
import { getCurrencySymbol } from '../utils/compensation-event-currency.utils';
import {
  BOXED_ROW_CELL_STYLE,
  DIVIDED_ROW_CELL_STYLE,
  formatQuotationAmount,
  isQuotationRowBoxed,
  QUOTATION_HEADER_CELL_STYLE,
} from '../utils/compensation-event-quotation.utils';
import CompensationEventQuotationGroupBox from './compensation-event-quotation-group-box';
import CompensationEventQuotationItemCell from './compensation-event-quotation-item-cell';

const { quotation } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationLinesTableProps {
  currency: string;
  rows: QuotationTableRow[];
  /** Null when the quotation named no figure at all — rendered as a dash, not as zero. */
  total: number | null;
  expandedRowKeys: string[];
  onToggleRow: (key: string) => void;
}

// Presentational — the priced breakdown itself: ITEM, AMOUNT, the boxed groups and the
// total row. A row's description is not given a column of its own; it hangs off an info
// icon beside the item name, so the names and figures get the full width. Shared by the quotation screens and the Financials tab's collapsed row,
// so it carries no heading of its own; whoever renders it frames it.
const CompensationEventQuotationLinesTable = ({
  currency,
  rows,
  total,
  expandedRowKeys,
  onToggleRow,
}: CompensationEventQuotationLinesTableProps) => {
  // A boxed group gives its whole row to the ITEM cell, so AMOUNT collapses away.
  const cellProps = (row: QuotationTableRow, columnIndex: number) => {
    if (isQuotationRowBoxed(row, expandedRowKeys)) {
      return columnIndex === 0
        ? { colSpan: 2, style: BOXED_ROW_CELL_STYLE }
        : { colSpan: 0, style: BOXED_ROW_CELL_STYLE };
    }
    return { style: DIVIDED_ROW_CELL_STYLE };
  };
  const headerCellProps = () => ({ style: QUOTATION_HEADER_CELL_STYLE });

  const columns: ColumnsType<QuotationTableRow> = [
    {
      title: quotation.columns.item,
      dataIndex: 'item',
      key: 'item',
      onCell: (row) => cellProps(row, 0),
      onHeaderCell: headerCellProps,
      render: (_item, row) =>
        isQuotationRowBoxed(row, expandedRowKeys) ? (
          <CompensationEventQuotationGroupBox
            row={row}
            currency={currency}
            onToggle={onToggleRow}
            hideDescription
          />
        ) : (
          <CompensationEventQuotationItemCell
            row={row}
            expanded={expandedRowKeys.includes(row.key)}
            onToggle={onToggleRow}
            showDescriptionHint
          />
        ),
    },
    {
      title: `${quotation.columns.amountPrefix} ${getCurrencySymbol(currency)}`,
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: QUOTATION_SIZES.amountColumnWidth,
      onCell: (row) => cellProps(row, 1),
      onHeaderCell: headerCellProps,
      render: (amount: number, row) => (
        <Typography.Text
          strong={row.isGroup}
          style={{
            color: row.isGroup ? QUOTATION_COLORS.amount : QUOTATION_COLORS.memberName,
            fontSize: row.isGroup ? QUOTATION_SIZES.cellFontSize : QUOTATION_SIZES.memberFontSize,
            whiteSpace: 'nowrap',
          }}
        >
          {formatQuotationAmount(amount, currency)}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Table<QuotationTableRow>
      columns={columns}
      dataSource={rows}
      rowKey="key"
      pagination={false}
      size="small"
      // A boxed row hands its whole width to the ITEM cell, so auto layout has nothing to
      // size AMOUNT from and drifts row to row — fixed layout pins every row to the
      // header's own auto / 22% split.
      tableLayout="fixed"
      locale={{ emptyText: quotation.noItems }}
      // The chevron lives inside the ITEM cell, so antd's own expand column is hidden
      // and expansion is driven from the container instead.
      expandable={{
        expandedRowKeys,
        showExpandColumn: false,
      }}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} align="right">
            <Typography.Text strong style={{ fontSize: QUOTATION_SIZES.totalFontSize }}>
              {quotation.total}
            </Typography.Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={1} align="right">
            <Typography.Text
              strong
              style={{
                color: QUOTATION_COLORS.amount,
                fontSize: QUOTATION_SIZES.totalFontSize,
                whiteSpace: 'nowrap',
              }}
            >
              {formatQuotationAmount(total, currency)}
            </Typography.Text>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  );
};

export default CompensationEventQuotationLinesTable;
