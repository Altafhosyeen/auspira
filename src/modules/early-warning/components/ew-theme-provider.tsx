'use client';

import { ConfigProvider } from 'antd';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { fontMap, radiusMap, sizeMap, useUISettings } from '@/store/ui-settings.store';
import { EW_REGISTER_THEME } from '../constants/early-warning-register.theme';

// Single antd theme root for every early-warning screen — runtime user
// preferences (size / radius / font) map straight into the ConfigProvider.
const EwThemeProvider = ({ children }: PropsWithChildren) => {
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
        // Button/Input/Select/Card radii — re-pin them here so the user's radius
        // knob actually wins inside this module.
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

export default EwThemeProvider;
