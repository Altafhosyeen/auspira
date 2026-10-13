'use client';
import { Table, type TableProps } from 'antd';

type TableXProps<T extends object> = Omit<TableProps<T>, 'pagination'> & {
  pagination?: TableProps<T>['pagination'];
  pageSize?: number;
  stickyHeader?: boolean;
  defaultScrollY?: number;
};

function TableX<T extends object>({
  pagination,
  pageSize = 10,
  rowKey,
  scroll,
  sticky,
  stickyHeader = true,
  defaultScrollY = 420,
  ...props
}: TableXProps<T>) {
  const defaultPagination: Exclude<TableProps<T>['pagination'], boolean> = {
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
  };

  const resolvedPagination = (() => {
    if (pagination === false) {
      return false;
    }

    if (pagination === undefined) {
      return defaultPagination;
    }

    return {
      ...defaultPagination,
      ...pagination,
    };
  })();

  const resolvedRowKey: TableProps<T>['rowKey'] =
    rowKey ??
    ((record: T) => {
      const candidate = record as { id?: string | number; key?: string | number };
      return candidate.id ?? candidate.key ?? JSON.stringify(record);
    });

  const resolvedScroll: TableProps<T>['scroll'] = stickyHeader
    ? {
        y: defaultScrollY,
        ...scroll,
      }
    : scroll;

  const resolvedSticky: TableProps<T>['sticky'] = stickyHeader ? (sticky ?? true) : sticky;

  return (
    <Table
      {...props}
      rowKey={resolvedRowKey}
      pagination={resolvedPagination}
      scroll={resolvedScroll}
      sticky={resolvedSticky}
    />
  );
}

export default TableX;
