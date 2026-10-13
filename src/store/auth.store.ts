import { IUser } from '@/types/system/users.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
