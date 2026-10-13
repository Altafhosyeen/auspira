'use client';

import { ClockCircleOutlined, FileOutlined, MailOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import {
  DETAIL_TABS_ACTIVE_GRADIENT,
  type DetailTabConfig,
  DetailTabs,
} from '@/components/shared/detail-tabs';
import { APP_COLORS } from '@/constants/app.theme';
import {
  COMPENSATION_EVENT_DETAIL_TABS,
  type CompensationEventDetailTabKey,
} from '../constants/compensation-event-detail.constants';
import { DETAIL_SIZES } from '../constants/compensation-event-detail.theme';

const TAB_ICONS: Record<CompensationEventDetailTabKey, ReactNode> = {
  overview: <Icon icon="fluent:preview-link-24-regular" />,
  financials: <Icon icon="fluent-mdl2:financial" />,
  'email-thread': <MailOutlined />,
  documents: <FileOutlined />,
  'audit-trail': <ClockCircleOutlined />,
};

const TABS: DetailTabConfig<CompensationEventDetailTabKey>[] = COMPENSATION_EVENT_DETAIL_TABS.map(
  ({ key, label }) => ({ key, label, icon: TAB_ICONS[key] })
);

interface CompensationEventDetailTabsProps {
  activeKey: CompensationEventDetailTabKey;
  onChange: (key: CompensationEventDetailTabKey) => void;
  // How much each tab holds, rendered as zero-padded text after the label, e.g. "(06)".
  // A key left out of the map renders no count at all.
  counts?: Partial<Record<CompensationEventDetailTabKey, number>>;
}

// Presentational — the tinted tab bar with the gradient indicator under the active tab.
// Renders through the shared `DetailTabs`, the same tab strip the Request For Information
// detail screen uses, so both detail screens' tab strips render identically.
const CompensationEventDetailTabs = ({
  activeKey,
  onChange,
  counts,
}: CompensationEventDetailTabsProps) => (
  <DetailTabs
    tabs={TABS}
    activeKey={activeKey}
    onChange={onChange}
    counts={counts}
    barHeight={DETAIL_SIZES.tabBarHeight}
    indicatorHeight={DETAIL_SIZES.tabIndicatorHeight}
    tone={{
      tabBarBg: APP_COLORS.mainSoft,
      main: APP_COLORS.main,
      activeIndicator: DETAIL_TABS_ACTIVE_GRADIENT,
    }}
  />
);

export default CompensationEventDetailTabs;
