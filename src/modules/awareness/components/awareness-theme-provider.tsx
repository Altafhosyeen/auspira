'use client';

import { ConfigProvider } from 'antd';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { fontMap, radiusMap, sizeMap, useUISettings } from '@/store/ui-settings.store';
import { AWARENESS_THEME } from '../constants/awareness.constants';

// Single antd theme root for every awareness screen — runtime user
// preferences (size / radius / font) map straight into the ConfigProvider.
const AwarenessThemeProvider = ({ children }: PropsWithChildren) => {
  const settings = useUISettings();

  const theme = useMemo(
    () => ({
      ...AWARENESS_THEME,
      token: {
        ...AWARENESS_THEME.token,
        borderRadius: radiusMap[settings.radius],
        fontFamily: fontMap[settings.font],
      },
    }),
    [settings.radius, settings.font]
  );

  return (
    <ConfigProvider componentSize={sizeMap[settings.size]} theme={theme}>
      {children}
    </ConfigProvider>
  );
};

export default AwarenessThemeProvider;
