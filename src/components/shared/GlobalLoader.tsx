'use client';

import { Spin } from 'antd';
import { useLoadingStore } from '@/store/loading.store';

export function GlobalLoader() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center transition-all duration-200"
      style={{
        zIndex: 9999,
        backgroundColor: isLoading ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
        pointerEvents: isLoading ? 'auto' : 'none',
        opacity: isLoading ? 1 : 0,
      }}
    >
      {isLoading && <Spin size="large" />}
    </div>
  );
}
