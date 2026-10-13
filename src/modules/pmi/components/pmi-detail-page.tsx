'use client';

import {
  ClockCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { Card, Col, Flex, Row } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { AttachmentList } from '@/components/shared/attachment-list';
import { AuditTrailList } from '@/components/shared/audit-trail';
import {
  AUDIT_ACTION_BY_ORDINAL,
  AUDIT_ACTION_LABELS,
} from '@/components/shared/audit-trail/audit-actions';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import EmailThreadList from '@/components/shared/EmailThreadList';
import { PMI_DETAIL_COPY, PMI_DETAIL_TABS, type PmiDetailTabKey } from '../constants/pmi.constants';
import {
  useDownloadPmiAttachment,
  useGetPmiAttachments,
  useGetPmiAuditTrail,
  useGetPmiConversations,
  useGetPmiDetail,
} from '../hooks/use-pmis';
import type { PmiThreadMessage } from '../utils/pmi-detail.utils';
import {
  toEmailThreadListItems,
  toLifecycleSteps,
  toSummaryRows,
  toThreadMessages,
} from '../utils/pmi-detail.utils';
import PmiCompensationEventTab from './pmi-compensation-event-tab';
import PmiDetailBanner from './pmi-detail-banner';
import PmiDetailHeader from './pmi-detail-header';
import PmiDetailSkeleton from './pmi-detail-skeleton';
import PmiDetailTabs from './pmi-detail-tabs';
import PmiLifecycle from './pmi-lifecycle';
import PmiSummaryCard from './pmi-summary-card';
import PmiThemeProvider from './pmi-theme-provider';

// The trail's action vocabulary, as the endpoint's own `actionType` ordinals.
const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_BY_ORDINAL).map(([ordinal, action]) => ({
  value: ordinal,
  label: AUDIT_ACTION_LABELS[action],
}));

const TAB_ICONS: Record<PmiDetailTabKey, React.ReactNode> = {
  Overview: <FileTextOutlined />,
  'Audit Trial': <ClockCircleOutlined />,
  Attachment: <PaperClipOutlined />,
  'Email Thread': <MailOutlined />,
  'Compensation Event': <FileTextOutlined />,
};

// Container — owns state & side effects; delegates rendering to presentational components.
const PmiDetailPage = () => {
  const params = useParams();
  const id = String(params?.id ?? '');
  const [activeTab, setActiveTab] = useState<PmiDetailTabKey>('Overview');
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [auditTerm, setAuditTerm] = useState('');
  const [debouncedAuditTerm, setDebouncedAuditTerm] = useState('');
  // The endpoint takes one actionType, so the dropdown holds at most one choice.
  const [auditAction, setAuditAction] = useState<string[]>([]);
  const [attachmentTerm, setAttachmentTerm] = useState('');
  const [debouncedAttachmentTerm, setDebouncedAttachmentTerm] = useState('');
  const [threadTerm, setThreadTerm] = useState('');
  const [debouncedThreadTerm, setDebouncedThreadTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: pmi, isLoading } = useGetPmiDetail({ id, enabled: !!id });
  const { data: auditTrail } = useGetPmiAuditTrail({
    id,
    term: debouncedAuditTerm,
    actionType: auditAction.length ? Number(auditAction[0]) : undefined,
    enabled: !!id,
  });
  const { data: conversations } = useGetPmiConversations({
    id,
    term: debouncedThreadTerm,
    enabled: !!id,
  });
  const { data: attachments, refetch: refetchAttachments } = useGetPmiAttachments({
    entityId: id,
    term: debouncedAttachmentTerm,
    projectId: pmi?.projectId,
    enabled: !!id && !!pmi?.projectId,
  });

  // Mounted purely to size the tab count badges, so a search inside a tab never shrinks
  // the number on it. React Query dedupes on the shared keys, so the unfiltered read the
  // tab itself performs (before anything is typed) costs no extra request. Same approach
  // the Compensation Event detail page takes for its badges.
  const { data: allConversations } = useGetPmiConversations({ id, enabled: !!id });
  const { data: allAttachments } = useGetPmiAttachments({
    entityId: id,
    projectId: pmi?.projectId,
    enabled: !!id && !!pmi?.projectId,
  });

  const { mutateAsync: downloadAttachment } = useDownloadPmiAttachment();

  const summaryRows = useMemo(() => (pmi ? toSummaryRows(pmi) : []), [pmi]);
  const steps = useMemo(() => toLifecycleSteps(pmi?.lifecycle), [pmi?.lifecycle]);
  const thread = useMemo(() => toThreadMessages(conversations ?? []), [conversations]);

  // A tab with nothing in it renders no badge at all — `DetailTabs` drops a zero rather
  // than showing a "(00)" that reads as a broken figure.
  const tabCounts = useMemo(
    () => ({
      'Email Thread': toThreadMessages(allConversations ?? []).length,
      Attachment: allAttachments?.length ?? 0,
    }),
    [allConversations, allAttachments]
  );

  // The record's clause — shown as the title-bar chip, tooltip carries the full title.
  const clause = useMemo(() => {
    if (!pmi?.clauseNumber) return undefined;
    return {
      number: pmi.clauseNumber,
      title: pmi.clauseTitle ?? undefined,
    };
  }, [pmi?.clauseNumber, pmi?.clauseTitle]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedAuditTerm(auditTerm.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [auditTerm]);

  // The conversations endpoint does its own `term` search over sender, subject and body,
  // so the box drives the request rather than filtering the rows already fetched.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedThreadTerm(threadTerm.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [threadTerm]);

  // The attachments endpoint does its own `term` search, so the box drives the request
  // rather than filtering in place — debounced so typing does not fire one per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedAttachmentTerm(attachmentTerm.trim()),
      400
    );
    return () => window.clearTimeout(timeoutId);
  }, [attachmentTerm]);

  // The Attachment tab must re-read the API every time it is opened — files can be
  // added from elsewhere (e.g. meetings) between visits, so cached data may be stale.
  useEffect(() => {
    if (activeTab === 'Attachment') {
      void refetchAttachments();
    }
  }, [activeTab, refetchAttachments]);

  const handleOpenThread = (message: PmiThreadMessage) => {
    setSelectedConversationId(
      message.conversationId ?? (message.id.startsWith('thread-') ? null : message.id)
    );
    setSelectedSubject(message.subject ?? pmi?.title ?? null);
    setThreadModalOpen(true);
  };

  if (isLoading || !pmi) {
    return <PmiDetailSkeleton />;
  }

  const mainContent = {
    Overview: <PmiSummaryCard rows={summaryRows} />,
    'Audit Trial': (
      <Card
        title={
          <Flex align="center" gap={8}>
            <ClockCircleOutlined />
            {PMI_DETAIL_COPY.auditTitle}
          </Flex>
        }
        extra={
          <DetailListToolbar
            term={auditTerm}
            onTermChange={setAuditTerm}
            searchPlaceholder="Search by user or details..."
            filterOptions={AUDIT_ACTION_OPTIONS}
            selected={auditAction}
            // Only the newly ticked action survives — the endpoint narrows to one.
            onSelectedChange={(values) => setAuditAction(values.slice(-1))}
            onClearAll={() => {
              setAuditTerm('');
              setAuditAction([]);
            }}
          />
        }
      >
        <AuditTrailList
          entries={auditTrail ?? []}
          emptyDescription={
            debouncedAuditTerm || auditAction.length
              ? 'No activity matches this search.'
              : PMI_DETAIL_COPY.auditEmpty
          }
        />
      </Card>
    ),
    Attachment: (
      <AttachmentList
        attachments={attachments ?? []}
        reference={pmi.reference?.trim() || undefined}
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
    'Email Thread': (
      <Card
        title={
          <Flex align="center" gap={8}>
            <MailOutlined />
            {PMI_DETAIL_COPY.emailTitle}
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
          emptyTitle={
            threadTerm.trim() ? PMI_DETAIL_COPY.threadNoMatches : PMI_DETAIL_COPY.threadEmptyTitle
          }
          emptyDescription={
            threadTerm.trim()
              ? 'Try a different search term.'
              : PMI_DETAIL_COPY.threadEmptyDescription
          }
          onSelect={(item) => {
            const original = thread.find((m) => m.id === item.id);
            if (original) handleOpenThread(original);
          }}
        />
      </Card>
    ),
    'Compensation Event': (
      <PmiCompensationEventTab
        compensationEventId={pmi.compensationEventId}
        compensationEventReference={pmi.compensationEventReference}
      />
    ),
  }[activeTab];

  return (
    <PmiThemeProvider>
      <Flex vertical gap={16}>
        <PmiDetailHeader clause={clause} />

        <PmiDetailBanner text={pmi.details} />

        <PmiDetailTabs
          items={PMI_DETAIL_TABS.map((tab) => ({
            key: tab.key,
            label: tab.label,
            icon: TAB_ICONS[tab.key],
          }))}
          active={activeTab}
          onChange={(key) => setActiveTab(key as PmiDetailTabKey)}
          counts={tabCounts}
        />

        {activeTab === 'Overview' ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              {mainContent}
            </Col>
            <Col xs={24} lg={8}>
              <PmiLifecycle steps={steps} />
            </Col>
          </Row>
        ) : (
          <Flex vertical gap={16}>
            {mainContent}
          </Flex>
        )}

        <EmailThreadModal
          open={threadModalOpen}
          projectId={pmi.projectId}
          conversationId={selectedConversationId}
          subjectFallback={selectedSubject ?? pmi.title}
          onClose={() => setThreadModalOpen(false)}
        />
      </Flex>
    </PmiThemeProvider>
  );
};

export default PmiDetailPage;
