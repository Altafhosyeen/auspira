'use client';

import { Flex, Result } from 'antd';
import { useMemo, useState } from 'react';
import {
  PROJECT_DAILY_REPORT_DETAIL_COPY,
  type ProjectDailyReportDetailTabKey,
} from '../constants/project-daily-report.constants';
import {
  useGetProjectDailyReportAttachments,
  useGetProjectDailyReportById,
  useGetProjectDailyReportConversations,
} from '../hooks/use-project-daily-reports';
import ProjectDailyReportAuditTrailTab from './project-daily-report-audit-trail-tab';
import ProjectDailyReportDetailBanner from './project-daily-report-detail-banner';
import ProjectDailyReportDetailHeader from './project-daily-report-detail-header';
import ProjectDailyReportDetailTabs from './project-daily-report-detail-tabs';
import ProjectDailyReportDocumentTab from './project-daily-report-document-tab';
import ProjectDailyReportEmailThreadTab from './project-daily-report-email-thread-tab';
import ProjectDailyReportOverviewPanel from './project-daily-report-overview-panel';
import ProjectDailyReportThemeProvider from './project-daily-report-theme-provider';

// Container — owns the fetch and the active tab; delegates rendering to the presentational
// sections. Mirrors the Defect Notice detail page's container shape (fetch → header →
// banner → tab strip → `renderTabContent`) so every detail screen behaves identically.
const ProjectDailyReportDetailPage = ({ id }: { id: string }) => {
  const [activeTab, setActiveTab] = useState<ProjectDailyReportDetailTabKey>('overview');
  const { data: report, isLoading, isError } = useGetProjectDailyReportById({ id, enabled: !!id });

  // Mounted here purely to size the tab count badges, and deliberately without a term, so a
  // search inside a tab never shrinks the number on it. React Query dedupes on the shared
  // keys, so the unfiltered read each tab performs before anything is typed costs no extra
  // request. Same approach the Defect Notice and Compensation Event detail pages take.
  const { data: allConversations } = useGetProjectDailyReportConversations({
    entityId: report?.id,
    enabled: !!report?.id,
  });
  const { data: allAttachments } = useGetProjectDailyReportAttachments({
    entityId: report?.id,
    projectId: report?.projectId ?? '',
    enabled: !!report?.id && !!report?.projectId,
  });

  // A tab with nothing in it renders no badge at all — `DetailTabs` drops a zero rather than
  // showing a "(00)" that reads as a broken figure.
  const counts = useMemo<Partial<Record<ProjectDailyReportDetailTabKey, number>>>(() => {
    const threadCount = allConversations?.length ?? 0;
    const documentCount = allAttachments?.length ?? 0;

    return {
      ...(threadCount > 0 && { 'email-thread': threadCount }),
      ...(documentCount > 0 && { document: documentCount }),
    };
  }, [allConversations, allAttachments]);

  const renderTabContent = useMemo(
    () => () => {
      if (!report) return null;

      if (activeTab === 'email-thread') return <ProjectDailyReportEmailThreadTab report={report} />;

      if (activeTab === 'document') return <ProjectDailyReportDocumentTab report={report} />;

      if (activeTab === 'audit-trail')
        return <ProjectDailyReportAuditTrailTab reportId={report.id} />;

      // The Overview tab is the summary card alone — this record has no lifecycle stages to
      // rail, so nothing sits beside it.
      return <ProjectDailyReportOverviewPanel report={report} />;
    },
    [activeTab, report]
  );

  if (!isLoading && (isError || !report)) {
    return <Result status="404" title={PROJECT_DAILY_REPORT_DETAIL_COPY.notFound} />;
  }

  return (
    <ProjectDailyReportThemeProvider>
      <Flex vertical gap={20}>
        <ProjectDailyReportDetailHeader />

        <ProjectDailyReportDetailBanner text={PROJECT_DAILY_REPORT_DETAIL_COPY.overviewBanner} />

        <ProjectDailyReportDetailTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          counts={counts}
        />

        {isLoading || !report ? null : renderTabContent()}
      </Flex>
    </ProjectDailyReportThemeProvider>
  );
};

export default ProjectDailyReportDetailPage;
