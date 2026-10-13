'use client';

import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';
import type { ReactNode } from 'react';
import { APP_THEME, SEMANTIC_COLORS } from '@/constants';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: APP_THEME.colors.accent9,
            colorPrimaryHover: APP_THEME.colors.accent10,
            colorInfo: APP_THEME.colors.accent9,
            colorBgBase: APP_THEME.colors.surface,
            colorBgContainer: APP_THEME.colors.surface,
            colorBgElevated: APP_THEME.colors.surface,
            colorBgLayout: APP_THEME.colors.gray1,

            // Interactive components (3-5)
            colorFill: APP_THEME.colors.gray5,
            colorFillSecondary: APP_THEME.colors.gray4,
            colorFillTertiary: APP_THEME.colors.gray3,
            colorFillQuaternary: APP_THEME.colors.gray2,

            // Borders and separators (6-8)
            colorBorder: APP_THEME.colors.gray7,
            colorBorderSecondary: APP_THEME.colors.gray6,

            // Accessible text (11-12)
            colorTextBase: APP_THEME.colors.gray12,
            colorText: APP_THEME.colors.gray12,
            colorTextSecondary: APP_THEME.colors.gray11,
            colorTextTertiary: APP_THEME.colors.gray10,
            colorTextQuaternary: APP_THEME.colors.gray9,

            colorError: SEMANTIC_COLORS.error,
            colorSuccess: SEMANTIC_COLORS.success,
            colorWarning: SEMANTIC_COLORS.warning,
            borderRadius: APP_THEME.radius.md,
            fontFamily: APP_THEME.fontFamily,
          },
          components: {
            Button: {
              borderRadius: APP_THEME.radius.md,
              controlHeight: 35,
              controlHeightLG: 40,
            },
            Input: {
              borderRadius: APP_THEME.radius.md,
              controlHeight: 35,
              controlHeightLG: 40,
            },
            Select: {
              borderRadius: APP_THEME.radius.md,
              controlHeight: 35,
              controlHeightLG: 40,
            },
            Card: {
              borderRadiusLG: APP_THEME.radius.md,
            },
            Table: {
              headerBg: SEMANTIC_COLORS.surfaceTableHeader,
            },
            Menu: {
              // The sidebar labels ("Compensation Event", "Operational Control
              // Agent") were clipped to an ellipsis by antd's default 20px/16px
              // row padding. Trimming it gives the text the room it needs.
              itemPaddingInline: 10,
              itemMarginInline: 0,
              itemHeight: 38,
              itemBorderRadius: APP_THEME.radius.md,
              itemBg: 'transparent',
              subMenuItemBg: 'transparent',
              itemColor: APP_THEME.colors.gray12,
              itemHoverBg: SEMANTIC_COLORS.surfaceMenuActive,
              itemSelectedBg: SEMANTIC_COLORS.surfaceMenuActive,
              itemSelectedColor: APP_THEME.colors.accent9,
              subMenuItemSelectedColor: APP_THEME.colors.accent9,
            },
          },
        }}
      >
        <ConfigProvider
          form={{
            requiredMark: (label: ReactNode, { required }: { required: boolean }) =>
              required ? (
                <>
                  {label}
                  <span style={{ color: SEMANTIC_COLORS.error, marginInlineStart: 4 }}>*</span>
                </>
              ) : (
                label
              ),
          }}
        >
          {children}
        </ConfigProvider>
      </ConfigProvider>
    </StyleProvider>
  );
}
