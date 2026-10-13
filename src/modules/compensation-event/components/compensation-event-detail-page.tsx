'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ConfigProvider, Flex, Result, Skeleton } from 'antd';
import { useMemo, useState } from 'react';
import { AUDIT_LOG_QUERY_KEY } from '@/hooks/modules/audit-log';
import {
  COMPENSATION_EVENT_DETAIL_COPY,
  type CompensationEventDetailTabKey,
} from '../constants/compensation-event-detail.constants';
import { REGISTER_THEME } from '../constants/compensation-event-register.theme';
import { ATTACHMENTS_QUERY_KEY } from '../hooks/use-attachments';
import { useCompensationEventDocuments } from '../hooks/use-compensation-event-documents';
import {
  COMPENSATION_EVENT_QUERY_KEY,
  useGetCompensationEventById,
} from '../hooks/use-compensation-events';
import {
  PROJECT_EMAIL_QUERY_KEY,
  useGetEntityConversations,
} from '../hooks/use-project-email-thread';
import { QUOTATION_QUERY_KEY } from '../hooks/use-quotations';
import { resolveCompensationEventConversationThread } from '../utils/project-email.utils';
import CompensationEventAuditTrailTab from './compensation-event-audit-trail-tab';
import CompensationEventDetailBanner from './compensation-event-detail-banner';
import CompensationEventDetailHeader from './compensation-event-detail-header';
import CompensationEventDetailTabs from './compensation-event-detail-tabs';
import CompensationEventDocumentsTab from './compensation-event-documents-tab';
import CompensationEventEmailThreadTab from './compensation-event-email-thread-tab';
import CompensationEventFinancialsTab from './compensation-event-financials-tab';
import CompensationEventOverviewTab from './compensation-event-overview-tab';

// Which query keys each tab reads. Switching to a tab marks these stale so the tab
// re-requests its data every time it is opened rather than rendering the cached copy.
const TAB_QUERY_KEYS: Record<CompensationEventDetailTabKey, readonly unknown[][]> = {
  overview: [[...QUOTATION_QUERY_KEY]],
  financials: [[...COMPENSATION_EVENT_QUERY_KEY]],
  'email-thread': [[...PROJECT_EMAIL_QUERY_KEY]],
  documents: [[...ATTACHMENTS_QUERY_KEY], [...PROJECT_EMAIL_QUERY_KEY]],
  'audit-trail': [[...AUDIT_LOG_QUERY_KEY]],
};

// Container — owns the fetch and the active tab; delegates rendering to the
// presentational sections.
const CompensationEventDetailPage = ({ id }: { id: string }) => {
  const [activeTab, setActiveTab] = useState<CompensationEventDetailTabKey>('overview');
  const { data: event, isLoading, isError } = useGetCompensationEventById({ id });
  const queryClient = useQueryClient();

  // Every tab switch refetches the tab being opened. The queries are left mounted and
  // simply invalidated, so the tab keeps showing its previous rows while the new response
  // is in flight instead of flashing an empty skeleton on each switch.
  const handleTabChange = (key: CompensationEventDetailTabKey) => {
    setActiveTab(key);

    for (const queryKey of TAB_QUERY_KEYS[key]) {
      queryClient.invalidateQueries({ queryKey });
    }
  };

  // Mounted here as well as inside the tab itself, purely to size the tab's count badge —
  // React Query dedupes on the shared query keys, so the tab costs no extra request when
  // it is opened. Same approach the Early Warning detail page takes for its tab badges.
  const { data: conversations } = useGetEntityConversations({ entityId: id });
  const threadCount = useMemo(
    () => resolveCompensationEventConversationThread(conversations ?? [], event?.thread).length,
    [conversations, event]
  );

  // Same reasoning as `threadCount` above — mounted here purely to size the Documents tab's
  // count badge; React Query dedupes against the tab's own mount of the same hook.
  const { files: documents } = useCompensationEventDocuments(event);

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (isError || !event)
    return <Result status="404" title={COMPENSATION_EVENT_DETAIL_COPY.notFound} />;

  const renderTabContent = () => {
    if (activeTab === 'overview') return <CompensationEventOverviewTab event={event} />;

    if (activeTab === 'financials') return <CompensationEventFinancialsTab event={event} />;

    if (activeTab === 'email-thread') return <CompensationEventEmailThreadTab event={event} />;

    if (activeTab === 'documents') return <CompensationEventDocumentsTab event={event} />;

    return <CompensationEventAuditTrailTab event={event} />;
  };

  return (
    <ConfigProvider theme={REGISTER_THEME}>
      <Flex vertical gap={20}>
        <CompensationEventDetailHeader event={event} />

        <CompensationEventDetailBanner text={event.summary || event.description} />

        <CompensationEventDetailTabs
          activeKey={activeTab}
          onChange={handleTabChange}
          counts={{ 'email-thread': threadCount, documents: documents.length }}
        />

        {renderTabContent()}
      </Flex>
    </ConfigProvider>
  );
};

export default CompensationEventDetailPage;
