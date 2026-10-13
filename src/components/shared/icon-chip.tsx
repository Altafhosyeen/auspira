'use client';

import { Avatar, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { APP_COLORS } from '@/constants/app.theme';

interface IconChipProps {
  icon: ReactNode;
  /** Defaults to the square chip; circles for the sidebar items. */
  shape?: 'square' | 'circle';
  size?: number;
  /** White, bordered chip for section headers. */
  bordered?: boolean;
  /** Soft-blue chip that keeps its fill and gains the same border. */
  outlined?: boolean;
}

// Soft-blue chip with navy icon (mirrors the Figma cards). antd Avatar backgrounds come
// from the alias tokens `colorTextPlaceholder` / `colorTextLightSolid`.
const IconChip = ({ icon, shape = 'square', size = 32, bordered, outlined }: IconChipProps) => (
  <ConfigProvider
    theme={{
      token: {
        colorTextPlaceholder: bordered ? '#FFFFFF' : APP_COLORS.mainSoft,
        colorTextLightSolid: APP_COLORS.main,
      },
      components: { Avatar: { borderRadius: 8 } },
    }}
  >
    <Avatar
      shape={shape}
      size={size}
      icon={icon}
      style={bordered || outlined ? { border: `1px solid ${APP_COLORS.cardBorder}` } : undefined}
    />
  </ConfigProvider>
);

export default IconChip;
