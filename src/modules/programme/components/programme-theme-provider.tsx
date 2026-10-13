'use client';

import { ConfigProvider } from 'antd';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { EW_REGISTER_THEME } from '@/modules/early-warning/constants/early-warning-register.theme';
import { fontMap, radiusMap, sizeMap, useUISettings } from '@/store/ui-settings.store';

// Single antd theme root for the programme register — reuses the early-warning register theme
// so every CCA/OCA register renders identically. Runtime user preferences (size / radius /
// font) map straight into the ConfigProvider.
const ProgrammeThemeProvider = ({ children }: PropsWithChildren) => {
  const settings = useUISettings();

  const theme = useMemo(() => {
    const radius = radiusMap[settings.radius];
    return {
      ...EW_REGISTER_THEME,
      token: {
        ...EW_REGISTER_THEME.token,
        borderRadius: radius,
        fontFamily: fontMap[settings.font],
      },
      components: {
        ...EW_REGISTER_THEME.components,
        // Component tokens beat the global token, and the root providers pin
        // Button/Input/Select/Card radii — re-pin them here so the user's radius knob
        // actually wins inside this module.
        Button: { ...EW_REGISTER_THEME.components?.Button, borderRadius: radius },
        Input: { ...EW_REGISTER_THEME.components?.Input, borderRadius: radius },
        Select: { ...EW_REGISTER_THEME.components?.Select, borderRadius: radius },
        Card: { ...EW_REGISTER_THEME.components?.Card, borderRadiusLG: radius },
      },
    };
  }, [settings.radius, settings.font]);

  return (
    <ConfigProvider componentSize={sizeMap[settings.size]} theme={theme}>
      {children}
    </ConfigProvider>
  );
};

export default ProgrammeThemeProvider;
