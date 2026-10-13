'use client';

import {
  ClockCircleOutlined,
  FileOutlined,
  FileTextOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import {
  DETAIL_TABS_ACTIVE_GRADIENT,
  type DetailTabConfig,
  DetailTabs,
} from '@/components/shared/detail-tabs';
import { APP_COLORS } from '@/constants/app.theme';
import {
  REQUEST_FOR_INFORMATION_DETAIL_TABS,
  type RequestForInformationDetailTabKey,
} from '../constants/request-for-information.constants';

const TAB_ICONS: Record<RequestForInformationDetailTabKey, ReactNode> = {
  overview: <FileTextOutlined />,
  'email-thread': <MailOutlined />,
  document: <FileOutlined />,
  'audit-trail': <ClockCircleOutlined />,
};

const TABS: DetailTabConfig<RequestForInformationDetailTabKey>[] =
  REQUEST_FOR_INFORMATION_DETAIL_TABS.map(({ key, label }) => ({
    key,
    label,
    icon: TAB_ICONS[key],
  }));

interface RequestForInformationDetailTabsProps {
  activeKey: RequestForInformationDetailTabKey;
  onChange: (key: RequestForInformationDetailTabKey) => void;
  // How much each tab holds, rendered as zero-padded text after the label, e.g. "(06)" —
  // same pattern as the Compensation Event detail's tab strip. A key left out of the map
  // renders no count at all.
  counts?: Partial<Record<RequestForInformationDetailTabKey, number>>;
}

// Presentational — the tinted tab bar with an indicator under the active tab. Renders
// through the shared `DetailTabs`, the same tab strip the Compensation Event detail
// screen uses, so both detail screens' tab strips render identically.
const RequestForInformationDetailTabs = ({
  activeKey,
  onChange,
  counts,
}: RequestForInformationDetailTabsProps) => (
  <DetailTabs
    tabs={TABS}
    activeKey={activeKey}
    onChange={onChange}
    counts={counts}
    tone={{
      tabBarBg: APP_COLORS.mainSoft,
      main: APP_COLORS.main,
      activeIndicator: DETAIL_TABS_ACTIVE_GRADIENT,
    }}
  />
);

export default RequestForInformationDetailTabs;
