'use client';

import { MailOutlined } from '@ant-design/icons';
import { Card, Flex } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import EmailThreadList, { type EmailThreadListItem } from '@/components/shared/EmailThreadList';
import { PROJECT_DAILY_REPORT_DETAIL_COPY } from '../constants/project-daily-report.constants';
import { useGetProjectDailyReportConversations } from '../hooks/use-project-daily-reports';
import type { ProjectDailyReport } from '../types/project-daily-report.types';
import { toProjectDailyReportThreadMessages } from '../utils/project-daily-report.utils';

const COPY = {
  noMessages: 'No email threads yet',
  emptyDescription:
    'Correspondence linked to this daily site report will appear here once it arrives.',
  searchPlaceholder: 'Search by sender, subject or message...',
  noMatches: 'No email threads match this search',
  noMatchesDescription: 'Try a different search term.',
} as const;

interface ProjectDailyReportEmailThreadTabProps {
  report: ProjectDailyReport;
}

// Container — the Email Thread tab, reusing the shared `EmailThreadList` and
// `EmailThreadModal` every other detail screen's thread panel renders through (same pattern
// as the DN/EW/PMI/RFI detail's Email tabs). The conversations route is entity-scoped, so it
// is read with the report's own id — exactly what the PMI/EW/CE/DN Email tabs pass — not the
// record's `projectEmailId`.
const ProjectDailyReportEmailThreadTab = ({ report }: ProjectDailyReportEmailThreadTabProps) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // The conversations endpoint does its own `term` search over sender, subject and body, so
  // the box drives the request rather than filtering the rows already fetched. Debounced so
  // typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: conversations } = useGetProjectDailyReportConversations({
    entityId: report.id,
    term: debouncedTerm,
    enabled: !!report.id,
  });

  const thread = useMemo(
    () => toProjectDailyReportThreadMessages(conversations ?? []),
    [conversations]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleOpenThread = (selected: EmailThreadListItem) => {
    const item = thread.find((entry) => entry.id === selected.id);
    if (!item) return;
    setSelectedConversationId(item.conversationId ?? null);
    setSelectedSubject(item.subject ?? report.title);
    setModalOpen(true);
  };

  return (
    <>
      <Card
        title={
          <Flex align="center" gap={8}>
            <MailOutlined style={{ color: '#00355F' }} />
            {PROJECT_DAILY_REPORT_DETAIL_COPY.emailThreadTitle}
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
        projectId={report.projectId}
        conversationId={selectedConversationId}
        subjectFallback={selectedSubject ?? report.title}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default ProjectDailyReportEmailThreadTab;
