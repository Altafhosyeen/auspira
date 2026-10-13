'use client';

import { MailOutlined } from '@ant-design/icons';
import { Card, Flex } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import EmailThreadList, { type EmailThreadListItem } from '@/components/shared/EmailThreadList';
import { useGetDefectNoticeConversations } from '../hooks/use-defect-notices';
import type { DefectNotice } from '../types/defect-notice.types';
import { toDefectNoticeThreadMessages } from '../utils/defect-notice.utils';

const COPY = {
  title: 'Email Threads',
  noMessages: 'No email threads yet',
  emptyDescription: 'Correspondence linked to this defect notice will appear here once it arrives.',
  searchPlaceholder: 'Search by sender, subject or message...',
  noMatches: 'No email threads match this search',
  noMatchesDescription: 'Try a different search term.',
} as const;

interface DefectNoticeEmailThreadProps {
  notice: DefectNotice;
}

// Container — the Email tab, reusing the shared `EmailThreadList` and `EmailThreadModal`
// every other detail screen's thread panel renders through (same pattern as the EW/PMI/
// RFI detail's Email tabs). The conversations route is entity-scoped, so it is read with
// the notice's own id — exactly what the PMI/EW/CE Email tabs pass.
const DefectNoticeEmailThread = ({ notice }: DefectNoticeEmailThreadProps) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // The conversations endpoint does its own `term` search over sender, subject and body,
  // so the box drives the request rather than filtering the rows already fetched.
  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: conversations } = useGetDefectNoticeConversations({
    entityId: notice.id,
    term: debouncedTerm,
    enabled: !!notice.id,
  });

  const thread = useMemo(() => toDefectNoticeThreadMessages(conversations ?? []), [conversations]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleOpenThread = (selected: EmailThreadListItem) => {
    const item = thread.find((entry) => entry.id === selected.id);
    if (!item) return;
    setSelectedConversationId(item.conversationId ?? null);
    setSelectedSubject(item.subject ?? notice.title);
    setModalOpen(true);
  };

  return (
    <>
      <Card
        title={
          <Flex align="center" gap={8}>
            <MailOutlined style={{ color: '#00355F' }} />
            {COPY.title}
          </Flex>
        }
        extra={
          <DetailListToolbar
            term={term}
            onTermChange={setTerm}
            searchPlaceholder={COPY.searchPlaceholder}
            onClearAll={() => setTerm('')}
          />
        }
      >
        <EmailThreadList
          items={thread.map((message) => ({
            id: message.id,
            senderEmail: message.authorName,
            subject: message.subject ?? '',
            body: message.body,
            timestampUtc: message.sentAt,
          }))}
          emptyTitle={term.trim() ? COPY.noMatches : COPY.noMessages}
          emptyDescription={term.trim() ? COPY.noMatchesDescription : COPY.emptyDescription}
          onSelect={handleOpenThread}
        />
      </Card>

      <EmailThreadModal
        open={modalOpen}
        projectId={notice.projectId}
        conversationId={selectedConversationId}
        subjectFallback={selectedSubject ?? notice.title}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default DefectNoticeEmailThread;
