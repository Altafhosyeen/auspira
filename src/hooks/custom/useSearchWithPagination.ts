import { useCallback } from 'react';

export const useSearchWithPagination = <T>(
  setSearchValue: React.Dispatch<React.SetStateAction<T>>,
  setPaginationState: React.Dispatch<React.SetStateAction<{ current: number; pageSize: number }>>
) => {
  return useCallback(
    (nextValue: T) => {
      setSearchValue(nextValue);

      setPaginationState((prev) => (prev.current === 1 ? prev : { ...prev, current: 1 }));
    },
    [setSearchValue, setPaginationState]
  );
};
