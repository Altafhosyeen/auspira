'use client';

import type { ReactNode } from 'react';
import { DetailTabs } from '@/components/shared/detail-tabs';
import { PMI_DETAIL_COLORS, PMI_DETAIL_SIZES } from '../constants/pmi-detail.theme';

export interface PmiDetailTabItem {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface PmiDetailTabsProps {
  items: PmiDetailTabItem[];
  active: string;
  onChange: (key: string) => void;
  // How much each tab holds, rendered as zero-padded text after the label, e.g. "(06)".
  // A key left out of the map renders no count at all.
  counts?: Record<string, number | undefined>;
}

// Shared tinted tab bar with the gradient indicator under the active tab — renders through
// the same `DetailTabs` strip the Early Warning and Compensation Event detail screens use,
// so every detail screen's tab strip renders identically.
const PmiDetailTabs = ({ items, active, onChange, counts }: PmiDetailTabsProps) => (
  <DetailTabs
    tabs={items.map(({ key, label, icon }) => ({ key, label, icon }))}
    activeKey={active}
    onChange={onChange}
    counts={counts}
    barHeight={PMI_DETAIL_SIZES.tabBarHeight}
    indicatorHeight={PMI_DETAIL_SIZES.tabIndicatorHeight}
    tone={{
      tabBarBg: PMI_DETAIL_COLORS.tabBarBg,
      main: PMI_DETAIL_COLORS.main,
      activeIndicator: PMI_DETAIL_COLORS.activeTabGradient,
    }}
  />
);

export default PmiDetailTabs;
