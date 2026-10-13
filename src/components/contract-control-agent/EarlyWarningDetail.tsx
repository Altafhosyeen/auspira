'use client';

import { Badge, Skeleton, Tabs } from 'antd';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import { MENU_PATH } from '@/constants';
import { EarlyWarningStatus } from '@/constants/enum.constant';
import {
  useGetEarlyWarningAuditTrail,
  useGetEarlyWarningById,
  useGetEarlyWarningConversations,
} from '@/hooks/modules/early-warning';
import { useGetRiskReductionMeetingsByEarlyWarningId } from '@/hooks/modules/risk-reduction-meeting';
import EarlyWarningAfterMeetingCard from './EarlyWarningAfterMeetingCard';
import EarlyWarningAuditTrailTab from './EarlyWarningAuditTrailTab';
import EarlyWarningDetailHeader from './EarlyWarningDetailHeader';
import EarlyWarningOverviewTab from './EarlyWarningOverviewTab';
import EarlyWarningThreadsPanel from './EarlyWarningThreadsPanel';
import { DETAIL_TABS, type TabType } from './early-warning-detail.data';
import {
  type ApiEarlyWarningDetail,
  toDetailHeader,
  toLifecycleSteps,
  toSummaryRows,
} from './early-warning-detail.map';
import RiskReductionMeetingTable from './RiskReductionMeetingTable';
import { toRrmRows } from './risk-reduction-meeting.map';

export default function EarlyWarningDetail() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');

  const [activeTab, setActiveTab] = React.useState<TabType>(DETAIL_TABS[0]);

  const { data: earlyWarning, isLoading } = useGetEarlyWarningById<ApiEarlyWarningDetail>({
    id,
    enabled: !!id,
  });

  const header = React.useMemo(
    () => (earlyWarning ? toDetailHeader(earlyWarning) : undefined),
    [earlyWarning]
  );
  const summaryRows = React.useMemo(
    () => (earlyWarning ? toSummaryRows(earlyWarning) : []),
    [earlyWarning]
  );
  // The lifecycle rows carry no actor, so the timeline reads "who did this" off the audit trail.
  const { data: auditTrail } = useGetEarlyWarningAuditTrail({ id, enabled: !!id });
  const lifecycleSteps = React.useMemo(
    () => (earlyWarning ? toLifecycleSteps(earlyWarning, auditTrail) : []),
    [earlyWarning, auditTrail]
  );

  // Mounted again here (RiskReductionMeetingTable / EarlyWarningThreadsPanel also query these)
  // purely to size the tab count badges — React Query dedupes on the shared query keys, so this
  // costs no extra request.
  const { data: rrmData } = useGetRiskReductionMeetingsByEarlyWarningId({ earlyWarningId: id });
  const meetingsCount = React.useMemo(() => toRrmRows(rrmData).length, [rrmData]);

  const { data: conversations } = useGetEarlyWarningConversations({ id, enabled: !!id });
  const threadsCount = Array.isArray(conversations) ? conversations.length : 0;

  const tabBadgeCount: Partial<Record<TabType, number>> = {
    'Email Threads': threadsCount,
    'Early Warning Meeting': meetingsCount,
  };

  const openRiskReductionMeeting = () =>
    router.push(`${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}/risk-reduction-meeting/${id}`);

  const closed = earlyWarning?.status === EarlyWarningStatus.Closed;
  const linkedToCE = lifecycleSteps.some(
    (step) => step.title === 'Link to CE' && step.status === 'completed'
  );

  const tabPanels: Record<TabType, React.ReactNode> = {
    Overview: (
      <EarlyWarningOverviewTab
        summaryRows={summaryRows}
        lifecycleSteps={lifecycleSteps}
        status={earlyWarning?.status}
      />
    ),
    'Email Threads': (
      <EarlyWarningThreadsPanel
        earlyWarningId={id}
        projectId={earlyWarning?.projectId}
        closed={closed}
      />
    ),
    'Early Warning Meeting': (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskReductionMeetingTable earlyWarningId={id} />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <EarlyWarningAfterMeetingCard
            earlyWarningId={id}
            closed={closed}
            linkedToCE={linkedToCE}
          />
        </div>
      </div>
    ),
    'Audit Trail': <EarlyWarningAuditTrailTab closed={closed} />,
  };

  if (isLoading || !header) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <div>
      <EarlyWarningDetailHeader header={header} onPrimaryAction={openRiskReductionMeeting} />

      <div className="contract-tabs [&_.ant-tabs-nav-list]:w-auto! [&_.ant-tabs-nav-list]:gap-6! [&_.ant-tabs-tab-active::after]:h-1! [&_.ant-tabs-tab-active::after]:shadow-[0_1px_6px_rgba(124,58,237,0.45)]! [&_.ant-tabs-tab-btn]:text-[15px]! [&_.ant-tabs-tab:not(.ant-tabs-tab-active)_.ant-tabs-tab-btn]:font-medium! [&_.ant-tabs-tab:not(.ant-tabs-tab-active)_.ant-tabs-tab-btn]:text-slate-600!">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabType)}
          items={DETAIL_TABS.map((tab) => {
            const badgeCount = tabBadgeCount[tab];
            return {
              key: tab,
              label: (
                <span className="flex items-center gap-2 px-1 py-0.5">
                  {tab}
                  {!!badgeCount && <Badge count={badgeCount} color="var(--ds-main-p)" />}
                </span>
              ),
              children: tabPanels[tab],
            };
          })}
        />
      </div>
    </div>
  );
}
