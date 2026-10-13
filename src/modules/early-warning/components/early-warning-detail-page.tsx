'use client';

import {
  ClockCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PaperClipOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { Button, Card, Col, Flex, Row } from 'antd';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { AttachmentList } from '@/components/shared/attachment-list';
import { AuditTrailList } from '@/components/shared/audit-trail';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import EmailThreadList from '@/components/shared/EmailThreadList';
import { useGetProjectById } from '@/hooks/modules/project';
import {
  EARLY_WARNING_DETAIL_COPY,
  EARLY_WARNING_DETAIL_TABS,
  type EarlyWarningDetailTab,
} from '../constants/early-warning.constants';
import {
  useDownloadEarlyWarningAttachment,
  useGetEarlyWarningAttachments,
  useGetEarlyWarningAuditTrail,
  useGetEarlyWarningConversations,
  useGetEarlyWarningDetail,
} from '../hooks/use-early-warnings';

import {
  isClosed,
  isDiscarded,
  toDetailHeader,
  toLifecycleSteps,
  toSummaryRows,
} from '../utils/early-warning-detail.utils';
import {
  type ThreadMessage,
  toEmailThreadListItems,
  toThreadMessages,
} from '../utils/early-warning-thread.utils';
import EarlyWarningCloseModal from './early-warning-close-modal';
import EarlyWarningDetailHeader from './early-warning-detail-header';
import EarlyWarningDetailSkeleton from './early-warning-detail-skeleton';
import EarlyWarningLifecycle from './early-warning-lifecycle';
import EarlyWarningLinkCeModal from './early-warning-link-ce-modal';
import EarlyWarningMeetingTab from './early-warning-meeting-tab';
import EarlyWarningRiskSummary from './early-warning-risk-summary';
import EarlyWarningTabs from './early-warning-tabs';
import EwThemeProvider from './ew-theme-provider';
import { EwCreateMeetingModal } from './meeting';
import EwIconChip from './register/ew-icon-chip';

const TAB_ICONS: Record<EarlyWarningDetailTab, React.ReactNode> = {
  Overview: <FileTextOutlined />,
  Email: <MailOutlined />,
  Meetings: <FileTextOutlined />,
  Document: <PaperClipOutlined />,
  'Audit Trial': <ClockCircleOutlined />,
};

// Container — owns state & side effects; delegates rendering to presentational components.
const EarlyWarningDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');
  const [activeTab, setActiveTab] = useState<EarlyWarningDetailTab>('Overview');
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [linkCeModalOpen, setLinkCeModalOpen] = useState(false);
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [createMeetingModalOpen, setCreateMeetingModalOpen] = useState(false);
  const [threadTerm, setThreadTerm] = useState('');
  const [attachmentTerm, setAttachmentTerm] = useState('');

  const { data: ew, isLoading } = useGetEarlyWarningDetail({ id, enabled: !!id });
  const { data: auditTrail } = useGetEarlyWarningAuditTrail({ id, enabled: !!id });
  const { data: conversations } = useGetEarlyWarningConversations({ id, enabled: !!id });
  const { data: attachments, refetch: refetchAttachments } = useGetEarlyWarningAttachments({
    entityId: id,
    projectId: ew?.projectId,
    enabled: !!id && !!ew?.projectId,
  });

  const { mutateAsync: downloadAttachment } = useDownloadEarlyWarningAttachment();

  const { data: project } = useGetProjectById({
    id: ew?.projectId ?? '',
    enabled: !!ew?.projectId,
  });

  const header = useMemo(() => (ew ? toDetailHeader(ew) : undefined), [ew]);
  const summaryRows = useMemo(() => (ew ? toSummaryRows(ew, project) : []), [ew, project]);
  const steps = useMemo(() => (ew ? toLifecycleSteps(ew) : []), [ew]);
  const allThread = useMemo(() => toThreadMessages(conversations ?? []), [conversations]);

  // Neither the conversations nor the attachments endpoint takes a `term`, so both tabs
  // narrow in the browser rather than through the API.
  const threadNeedle = threadTerm.trim().toLowerCase();
  const thread = useMemo(
    () =>
      threadNeedle
        ? allThread.filter(
            (message) =>
              message.sender.toLowerCase().includes(threadNeedle) ||
              message.subject?.toLowerCase().includes(threadNeedle) ||
              message.body.toLowerCase().includes(threadNeedle)
          )
        : allThread,
    [allThread, threadNeedle]
  );

  const attachmentNeedle = attachmentTerm.trim().toLowerCase();
  const filteredAttachments = useMemo(
    () =>
      attachmentNeedle
        ? (attachments ?? []).filter((attachment) =>
            attachment.fileName.toLowerCase().includes(attachmentNeedle)
          )
        : (attachments ?? []),
    [attachments, attachmentNeedle]
  );

  // The Document tab must re-read the API every time it is opened — files can be added
  // from elsewhere (e.g. meetings) between visits, so cached data may be stale.
  useEffect(() => {
    if (activeTab === 'Document') {
      void refetchAttachments();
    }
  }, [activeTab, refetchAttachments]);

  const handleClose = () => setCloseModalOpen(true);
  const handleCreateCe = () => setLinkCeModalOpen(true);
  const handleOpenThread = (message: ThreadMessage) => {
    setSelectedConversationId(
      message.conversationId ?? (message.id.startsWith('thread-') ? null : message.id)
    );
    setSelectedSubject(message.subject ?? ew?.title ?? null);
    setThreadModalOpen(true);
  };

  if (isLoading || !header || !ew) {
    return <EarlyWarningDetailSkeleton />;
  }

  const closed = isClosed(ew);
  // A discarded EW is terminal — every lifecycle action is blocked.
  const readOnly = closed || isDiscarded(ew);

  // Counted off the full lists, not the search-narrowed ones, so the badge always reads
  // how much the tab holds rather than how much the current search matched.
  const tabCounts: Partial<Record<EarlyWarningDetailTab, number>> = {
    ...(allThread.length > 0 && { Email: allThread.length }),
    ...((attachments?.length ?? 0) > 0 && { Document: attachments?.length }),
  };

  const mainContent = {
    Overview: <EarlyWarningRiskSummary rows={summaryRows} />,
    Email: (
      <Card
        title={
          <Flex align="center" gap={8}>
            <EwIconChip icon={<MailOutlined />} bordered />
            Email Threads
          </Flex>
        }
        extra={
          <DetailListToolbar
            term={threadTerm}
            onTermChange={setThreadTerm}
            searchPlaceholder="Search by sender, subject or message..."
            onClearAll={() => setThreadTerm('')}
          />
        }
      >
        <EmailThreadList
          items={toEmailThreadListItems(thread)}
          emptyTitle={threadNeedle ? 'No email threads match this search' : 'No email threads yet'}
          emptyDescription={
            threadNeedle
              ? 'Try a different search term.'
              : 'Messages linked to this early warning will appear here once they arrive.'
          }
          onSelect={(item) => {
            const original = thread.find((m) => m.id === item.id);
            if (original) handleOpenThread(original);
          }}
        />
      </Card>
    ),
    Meetings: (
      <EarlyWarningMeetingTab earlyWarningId={id} projectId={ew.projectId} readOnly={readOnly} />
    ),
    Document: (
      <AttachmentList
        attachments={filteredAttachments}
        reference={ew.reference?.trim() || undefined}
        emptyDescription={
          attachmentNeedle ? 'No documents match this search.' : 'No documents uploaded yet.'
        }
        extra={
          <DetailListToolbar
            term={attachmentTerm}
            onTermChange={setAttachmentTerm}
            searchPlaceholder="Search by file name..."
            onClearAll={() => setAttachmentTerm('')}
          />
        }
        onDownload={(attachment) =>
          downloadAttachment({ url: attachment.filePath, fileName: attachment.fileName })
        }
      />
    ),
    'Audit Trial': (
      <Card title="Audit Trail">
        <AuditTrailList entries={auditTrail ?? []} />
      </Card>
    ),
  }[activeTab];

  return (
    <EwThemeProvider>
      <Flex vertical gap={16}>
        <EarlyWarningDetailHeader
          header={{
            summary: ew.summary ?? '',
            title: ew.title ?? '',
            clauseNumber: ew.clauseNumber ?? '',
            clauseDescription: ew.clauseDescription ?? '',
          }}
          actions={
            !readOnly ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateMeetingModalOpen(true)}
              >
                Add Meeting
              </Button>
            ) : undefined
          }
        />

        <EarlyWarningTabs
          items={EARLY_WARNING_DETAIL_TABS.map((tab) => ({
            key: tab.key,
            label: tab.label,
            icon: TAB_ICONS[tab.key],
            count: tabCounts[tab.key],
          }))}
          active={activeTab}
          onChange={(key) => setActiveTab(key as EarlyWarningDetailTab)}
        />

        {activeTab === 'Overview' ? (
          <Flex vertical gap={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                {mainContent}
              </Col>
              <Col xs={24} lg={8}>
                <EarlyWarningLifecycle steps={steps} />
              </Col>
            </Row>

            {!readOnly && (
              <Flex gap={16} style={{ width: '100%' }}>
                <Button
                  style={{
                    flex: 1,
                    fontWeight: 600,
                  }}
                  onClick={handleClose}
                >
                  {EARLY_WARNING_DETAIL_COPY.actions.close}
                </Button>
                <Button
                  type="primary"
                  style={{
                    flex: 1,
                    fontWeight: 600,
                  }}
                  onClick={handleCreateCe}
                >
                  {EARLY_WARNING_DETAIL_COPY.actions.createCe}
                </Button>
              </Flex>
            )}
          </Flex>
        ) : (
          <Flex vertical gap={16}>
            {mainContent}
            {!readOnly && (
              <Flex gap={16} style={{ width: '100%' }}>
                <Button
                  style={{
                    flex: 1,
                    fontWeight: 600,
                  }}
                  onClick={handleClose}
                >
                  {EARLY_WARNING_DETAIL_COPY.actions.close}
                </Button>
                <Button
                  type="primary"
                  style={{
                    flex: 1,
                    fontWeight: 600,
                  }}
                  onClick={handleCreateCe}
                >
                  {EARLY_WARNING_DETAIL_COPY.actions.createCe}
                </Button>
              </Flex>
            )}
          </Flex>
        )}

        <EarlyWarningCloseModal
          open={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          earlyWarningId={id}
          reference={ew.reference ?? `EW-${id}`}
        />

        <EarlyWarningLinkCeModal
          open={linkCeModalOpen}
          onClose={() => setLinkCeModalOpen(false)}
          earlyWarningId={id}
          reference={ew.reference ?? `EW-${id}`}
        />

        <EmailThreadModal
          open={threadModalOpen}
          projectId={ew.projectId}
          conversationId={selectedConversationId}
          subjectFallback={selectedSubject ?? ew.title}
          onClose={() => setThreadModalOpen(false)}
        />

        <EwCreateMeetingModal
          open={createMeetingModalOpen}
          onClose={() => setCreateMeetingModalOpen(false)}
          earlyWarningId={id}
          projectId={ew.projectId}
        />
      </Flex>
    </EwThemeProvider>
  );
};

export default EarlyWarningDetailPage;
