'use client';

import { DownOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import { useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import type { ProjectEmail } from '@/components/contract/cross-reference-contract/EmailThreadModal/types';
import EmailThreadList, { type EmailThreadListItem } from '@/components/shared/EmailThreadList';
import { useProjectStore } from '@/store/project.store';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';
import { useRequestForInformationThread } from '../hooks/use-request-for-information';
import type { RequestForInformation } from '../types/request-for-information.types';
import { toRequestForInformationFallbackEmail } from '../utils/request-for-information.utils';
import RequestForInformationSectionCard from './request-for-information-section-card';

const COPY = {
  title: 'Email Thread',
  loadMore: 'Load More',
  noMessages: 'No email threads yet',
  emptyDescription: 'Correspondence linked to this request will appear here once it arrives.',
} as const;

const PAGE_SIZE = 5;

interface RequestForInformationEmailThreadTabProps {
  rfi: RequestForInformation;
}

// Container — the Email Thread tab: same shell and paging pattern as the Compensation
// Event detail's Email Thread tab, reusing its entity-conversations hook (entity-agnostic,
// keyed only by `entityId`) since the two screens share the same backend thread endpoint.
// The shared endpoint is the source of truth; the module's own mock thread only stands in
// while it has nothing for the id — which it always will for a mock RFI, since mock ids
// aren't real backend entities.
const RequestForInformationEmailThreadTab = ({ rfi }: RequestForInformationEmailThreadTabProps) => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { messages, conversations } = useRequestForInformationThread(rfi);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFallback, setSelectedFallback] = useState<ProjectEmail[] | undefined>(undefined);

  const visibleMessages = messages.slice(0, visibleCount);
  const hasMore = visibleCount < messages.length;

  const items: EmailThreadListItem[] = visibleMessages.map((item) => ({
    id: item.id,
    senderEmail: item.authorName,
    subject: item.subject,
    body: item.body,
    timestampUtc: item.sentAt,
  }));

  // Mock rows carry no real conversationId to fetch from the backend, so the modal is
  // handed the row's own content directly instead.
  const handleThreadClick = (selected: EmailThreadListItem) => {
    const item = messages.find((entry) => entry.id === selected.id);
    if (!item) return;
    const isMockRow = !conversations?.some((entry) => entry.conversationId === item.id);
    setSelectedConversationId(isMockRow ? null : item.id);
    setSelectedSubject(item.subject);
    setSelectedFallback(isMockRow ? [toRequestForInformationFallbackEmail(item)] : undefined);
    setModalOpen(true);
  };

  return (
    <>
      <RequestForInformationSectionCard icon={<LinkOutlined />} title={COPY.title} gap={16}>
        <EmailThreadList
          items={items}
          emptyTitle={COPY.noMessages}
          emptyDescription={COPY.emptyDescription}
          onSelect={handleThreadClick}
        />

        {messages.length > 0 && (
          <Flex align="center" justify="center" gap={16} wrap style={{ marginTop: 8 }}>
            <Typography.Text style={{ color: REGISTER_COLORS.textMuted, fontSize: 12 }}>
              {`Showing 1 to ${visibleMessages.length} of ${messages.length} messages`}
            </Typography.Text>

            {hasMore && (
              <Button
                type="primary"
                icon={<DownOutlined />}
                iconPosition="end"
                size="small"
                onClick={() =>
                  setVisibleCount((current) => Math.min(current + PAGE_SIZE, messages.length))
                }
              >
                {COPY.loadMore}
              </Button>
            )}
          </Flex>
        )}
      </RequestForInformationSectionCard>

      <EmailThreadModal
        open={modalOpen}
        projectId={selectedProjectId}
        conversationId={selectedConversationId}
        subjectFallback={selectedSubject}
        fallbackMessages={selectedFallback}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default RequestForInformationEmailThreadTab;
