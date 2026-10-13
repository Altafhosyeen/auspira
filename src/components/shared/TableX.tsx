import { Table, TableProps } from 'antd';
import type { AnyObject } from 'antd/es/_util/type';
interface Props<T extends AnyObject = AnyObject> extends TableProps<T> {
  activeRowID?: number | string | null;
}
const TableX = <T extends AnyObject = AnyObject>(props: Props<T>) => {
  // Get unique row key (supports function, string, or fallback to record.key)
  const getRowKey = (record: any, index?: number) => {
    const { rowKey } = props;
    if (typeof rowKey === 'function') return rowKey(record, index);
    if (typeof rowKey === 'string') return record?.[rowKey];
    return record?.key;
  };
  // Only highlight row if it's selected and modal is open
  const shouldHighlight = (record: any, index?: number): boolean => {
    return props.activeRowID != null && props.activeRowID === getRowKey(record, index);
  };
  // Combine class names with conditional highlighting
  const applyHighlightClass = (base?: string, highlight?: boolean) =>
    [base, highlight ? '!bg-blue-100' : ''].filter(Boolean).join(' ');
  // Enhance column cells to add highlight class
  const withCellHighlight =
    (originalOnCell?: (record: any, index?: number) => any) => (record: any, index?: number) => {
      const cellProps = originalOnCell?.(record, index) || {};
      return {
        ...cellProps,
        className: applyHighlightClass(cellProps.className, shouldHighlight(record, index)),
      };
    };
  // Enhance all columns
  const columns = props.columns?.map?.((col) => ({
    ...col,
    onCell: withCellHighlight(col.onCell),
  }));
  // Enhance rowSelection if provided
  const rowSelection = props.rowSelection
    ? {
        ...props.rowSelection,
        onCell: withCellHighlight(props.rowSelection.onCell),
      }
    : undefined;
  return <Table<T> {...props} columns={columns} rowSelection={rowSelection} />;
};
export default TableX;
