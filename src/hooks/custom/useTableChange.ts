'use client';
import { useCallback } from 'react';
import type { TableProps } from 'antd';

type PaginationState = {
  current: number;
  pageSize: number;
};

type TableOnChange<T> = NonNullable<TableProps<T>['onChange']>;

interface Options<T> {
  onChangeExtra?: (params: {
    pagination: Parameters<TableOnChange<T>>[0];
    filters: Parameters<TableOnChange<T>>[1];
    sorter: Parameters<TableOnChange<T>>[2];
  }) => void;
}

export const useTableChange = <T>(
  setPaginationState: React.Dispatch<React.SetStateAction<PaginationState>>,
  options?: Options<T>
): TableProps<T>['onChange'] => {
  return useCallback(
    (
      pagination: Parameters<TableOnChange<T>>[0],
      filters: Parameters<TableOnChange<T>>[1],
      sorter: Parameters<TableOnChange<T>>[2]
    ) => {
      setPaginationState((prev) => {
        const current = pagination.current ?? prev.current;
        const pageSize = pagination.pageSize ?? prev.pageSize;

        if (current === prev.current && pageSize === prev.pageSize) {
          return prev;
        }

        return { current, pageSize };
      });

      // 👉 Optional external handler
      options?.onChangeExtra?.({
        pagination,
        filters,
        sorter,
      });
    },
    [setPaginationState, options]
  );
};
