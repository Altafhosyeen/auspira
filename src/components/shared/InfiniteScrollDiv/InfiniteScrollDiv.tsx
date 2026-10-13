import React, { useCallback } from 'react';

type Props = {
  children: React.ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
  threshold?: number; // px from bottom
};

const InfiniteScrollDiv: React.FC<Props> = ({
  children,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
  threshold = 20,
}) => {
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;

      const isNearBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage?.();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]
  );

  return (
    <div className={className} onScroll={handleScroll}>
      {children}
    </div>
  );
};

export default InfiniteScrollDiv;
