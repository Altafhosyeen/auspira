'use client';

import type { PropsWithChildren } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { APP_THEME, SEMANTIC_COLORS, TYPOGRAPHY } from '../constants';

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: SEMANTIC_COLORS['main-p'],
          colorInfo: SEMANTIC_COLORS['main-p'],
          colorText: SEMANTIC_COLORS.text,
          colorSuccess: SEMANTIC_COLORS.success,
          colorError: SEMANTIC_COLORS.error,
          colorIcon: SEMANTIC_COLORS.icon,
          colorBgBase: APP_THEME.colors.surface,
          colorBgContainer: APP_THEME.colors.surface,
          colorBgLayout: APP_THEME.colors.background,
          colorBorder: APP_THEME.colors.border,
          colorBorderSecondary: APP_THEME.colors.border,
          borderRadius: APP_THEME.radius.sm,
          fontFamily: APP_THEME.fontFamily,

          // Text styles (design-system type scale)
          fontSize: TYPOGRAPHY.body.size, // 14 — Body
          lineHeight: TYPOGRAPHY.body.line / TYPOGRAPHY.body.size,
          fontSizeLG: TYPOGRAPHY.bodyLarge.size, // 16 — Body Large
          fontSizeHeading1: TYPOGRAPHY.heading1.size, // 28
          fontSizeHeading2: TYPOGRAPHY.heading2.size, // 20
          fontSizeHeading3: TYPOGRAPHY.heading3.size, // 18
          fontSizeHeading4: TYPOGRAPHY.bodyLarge.size, // 16
          fontSizeHeading5: TYPOGRAPHY.body.size, // 14
          fontSizeSM: TYPOGRAPHY.caption.size, // 12 — Caption
        },
        components: {
          Layout: {
            bodyBg: APP_THEME.colors.background,
            headerBg: APP_THEME.colors.surface,
            siderBg: APP_THEME.colors.text,
            triggerBg: APP_THEME.colors.primary,
          },
          Menu: {
            itemBg: 'transparent',
            itemColor: APP_THEME.colors.text,
            itemSelectedColor: APP_THEME.colors.primary,
            darkItemBg: 'transparent',
            darkItemColor: APP_THEME.sider.itemColor,
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: APP_THEME.sider.itemSelectedBg,
            darkItemSelectedColor: APP_THEME.sider.itemSelectedColor,
            darkItemHoverColor: APP_THEME.sider.itemHoverColor,
            activeBarBorderWidth: 0,
            collapsedIconSize: 18,
          },
          Button: {
            borderRadius: APP_THEME.radius.sm,
            colorPrimary: APP_THEME.colors.primary,
          },
          Input: {
            borderRadius: APP_THEME.radius.sm,
            activeBorderColor: APP_THEME.colors.primary,
          },
          Card: {
            borderRadiusLG: APP_THEME.radius.lg,
          },
          Popconfirm: {
            zIndexPopup: 1080,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
