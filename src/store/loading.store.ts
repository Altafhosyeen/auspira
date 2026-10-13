import { create } from 'zustand';

interface LoadingState {
  requestCount: number;
  incrementRequest: () => void;
  decrementRequest: () => void;
  isLoading: boolean;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  requestCount: 0,
  isLoading: false,
  incrementRequest: () =>
    set((state) => ({
      requestCount: state.requestCount + 1,
      isLoading: true,
    })),
  decrementRequest: () =>
    set((state) => {
      const newCount = Math.max(0, state.requestCount - 1);
      return {
        requestCount: newCount,
        isLoading: newCount > 0,
      };
    }),
}));
