import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UISettingsSize = 'small' | 'medium' | 'large';
export type UISettingsRadius = 'square' | 'small' | 'medium' | 'large';
export type UISettingsFont = 'system' | 'inter' | 'geist';

export interface UISettings {
  size: UISettingsSize;
  radius: UISettingsRadius;
  font: UISettingsFont;
}

/** Antd's componentSize prop expects "middle" — map the friendlier "medium" onto it. */
export const sizeMap: Record<UISettingsSize, 'small' | 'middle' | 'large'> = {
  small: 'small',
  medium: 'middle',
  large: 'large',
};

export const radiusMap: Record<UISettingsRadius, number> = {
  square: 0,
  small: 4,
  medium: 8,
  large: 14,
};

export const fontMap: Record<UISettingsFont, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  // Inter ships through next/font as a CSS variable — resolve it so it actually renders.
  inter: 'var(--font-inter), "Inter", sans-serif',
  geist: '"Geist", sans-serif',
};

interface UIStore extends UISettings {
  setSettings: (settings: Partial<UISettings>) => void;
}

export const useUISettings = create<UIStore>()(
  persist(
    (set) => ({
      size: 'medium',
      radius: 'medium',
      font: 'inter',

      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'new-ui-settings',
    }
  )
);
