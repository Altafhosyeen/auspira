'use client';

import type { ReactNode } from 'react';
import { DetailTabs } from '@/components/shared/detail-tabs';
import { EW_COLORS, EW_SIZES } from '../constants/early-warning-register.theme';

export interface EarlyWarningTabItem {
  key: string;
  label: string;
  /** Optional zero-padded count rendered after the label, e.g. "(06)". */
  count?: number;
  icon?: ReactNode;
}

interface EarlyWarningTabsProps {
  items: EarlyWarningTabItem[];
  active: string;
  onChange: (key: string) => void;
}

// Shared tinted tab bar with the gradient indicator under the active tab — used by the
// register and detail screens. Renders through the shared `DetailTabs`, the same tab
// strip the Compensation Event and Request For Information detail screens use, so every
// detail screen's tab strip renders identically.
const EarlyWarningTabs = ({ items, active, onChange }: EarlyWarningTabsProps) => (
  <DetailTabs
    tabs={items.map(({ key, label, icon }) => ({ key, label, icon }))}
    activeKey={active}
    onChange={onChange}
    counts={Object.fromEntries(items.map(({ key, count }) => [key, count]))}
    barHeight={EW_SIZES.tabBarHeight}
    indicatorHeight={EW_SIZES.tabIndicatorHeight}
    tone={{
      tabBarBg: EW_COLORS.mainSoft,
      main: EW_COLORS.main,
      activeIndicator: EW_COLORS.activeTabGradient,
    }}
  />
);

export default EarlyWarningTabs;
