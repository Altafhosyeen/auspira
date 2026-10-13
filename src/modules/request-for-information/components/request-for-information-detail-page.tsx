'use client';

import { ConfigProvider, Flex, Result, Skeleton } from 'antd';
import { useState } from 'react';
import { useProjectStore } from '@/store/project.store';
import {
  REQUEST_FOR_INFORMATION_DETAIL_COPY,
  type RequestForInformationDetailTabKey,
} from '../constants/request-for-information.constants';
import { REGISTER_THEME } from '../constants/request-for-information-register.theme';
import {
  useGetRequestForInformationById,
  useRequestForInformationDocuments,
  useRequestForInformationThread,
} from '../hooks/use-request-for-information';
import RequestForInformationAuditTrailTab from './request-for-information-audit-trail-tab';
import RequestForInformationDetailBanner from './request-for-information-detail-banner';
import RequestForInformationDetailHeader from './request-for-information-detail-header';
import RequestForInformationDetailTabs from './request-for-information-detail-tabs';
import RequestForInformationDocumentsTab from './request-for-information-documents-tab';
import RequestForInformationEmailThreadTab from './request-for-information-email-thread-tab';
import RequestForInformationOverviewTab from './request-for-information-overview-tab';

// Container — owns the fetch and the active tab; delegates rendering to the
// presentational sections. Mirrors the Compensation Event detail page's container shape
// (fetch → tab strip → `renderTabContent`) so the two detail screens behave identically.
const RequestForInformationDetailPage = ({ id }: { id: string }) => {
  const [activeTab, setActiveTab] = useState<RequestForInformationDetailTabKey>('overview');
  const { data: rfi, isLoading, isError } = useGetRequestForInformationById({ id });
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  // Mounted here as well as inside each tab, purely to size the tab strip's count badges —
  // React Query dedupes on the shared query keys, so this costs no extra request once a
  // tab is opened. Same approach the Compensation Event detail page takes for its badges.
  const { messages: threadMessages } = useRequestForInformationThread(rfi);
  const { files: documents } = useRequestForInformationDocuments(rfi, selectedProjectId);

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (isError || !rfi)
    return <Result status="404" title={REQUEST_FOR_INFORMATION_DETAIL_COPY.notFound} />;

  const renderTabContent = () => {
    if (activeTab === 'email-thread') return <RequestForInformationEmailThreadTab rfi={rfi} />;

    if (activeTab === 'document') return <RequestForInformationDocumentsTab rfi={rfi} />;

    if (activeTab === 'audit-trail') return <RequestForInformationAuditTrailTab rfi={rfi} />;

    return <RequestForInformationOverviewTab rfi={rfi} />;
  };

  return (
    <ConfigProvider theme={REGISTER_THEME}>
      <Flex vertical gap={20}>
        <RequestForInformationDetailHeader rfi={rfi} />

        <RequestForInformationDetailBanner description={rfi.description} />

        <RequestForInformationDetailTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          counts={{ 'email-thread': threadMessages.length, document: documents.length }}
        />

        {renderTabContent()}
      </Flex>
    </ConfigProvider>
  );
};

export default RequestForInformationDetailPage;
