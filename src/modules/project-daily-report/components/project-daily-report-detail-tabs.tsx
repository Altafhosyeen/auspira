'use client';

import {
  ClockCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import {
  DETAIL_TABS_ACTIVE_GRADIENT,
  type DetailTabConfig,
  DetailTabs,
} from '@/components/shared/detail-tabs';
import { APP_COLORS } from '@/constants/app.theme';
import {
  PROJECT_DAILY_REPORT_DETAIL_TABS,
  type ProjectDailyReportDetailTabKey,
} from '../constants/project-daily-report.constants';

const TAB_ICONS: Record<ProjectDailyReportDetailTabKey, ReactNode> = {
  overview: <FileTextOutlined />,
  'email-thread': <MailOutlined />,
  document: <PaperClipOutlined />,
  'audit-trail': <ClockCircleOutlined />,
};

const TABS: DetailTabConfig<ProjectDailyReportDetailTabKey>[] =
  PROJECT_DAILY_REPORT_DETAIL_TABS.map(({ key, label }) => ({ key, label, icon: TAB_ICONS[key] }));

interface ProjectDailyReportDetailTabsProps {
  activeKey: ProjectDailyReportDetailTabKey;
  onChange: (key: ProjectDailyReportDetailTabKey) => void;
  // How much each tab holds, rendered as zero-padded text after the label, e.g. "(02)".
  // A key left out of the map renders no count at all — which is how a tab holding
  // nothing stays bare, since a key present with 0 would still render "(00)".
  counts?: Partial<Record<ProjectDailyReportDetailTabKey, number>>;
}

// Presentational — the tinted tab bar with an indicator under the active tab. Renders
// through the shared `DetailTabs`, the same tab strip the Defect Notice/CE/RFI/Early
// Warning detail screens use.
const ProjectDailyReportDetailTabs = ({
  activeKey,
  onChange,
  counts,
}: ProjectDailyReportDetailTabsProps) => (
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

export default ProjectDailyReportDetailTabs;
