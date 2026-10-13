'use client';

import {
  CheckOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, Input, Modal, notification, Result, Typography } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { AuditTrailList } from '@/components/shared/audit-trail';
import {
  AUDIT_ACTION_BY_ORDINAL,
  AUDIT_ACTION_LABELS,
} from '@/components/shared/audit-trail/audit-actions';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import { DETAIL_TABS_ACTIVE_GRADIENT, DetailTabs } from '@/components/shared/detail-tabs';
import { MENU_PATH } from '@/constants';
import { APP_COLORS } from '@/constants/app.theme';
import { EarlyWarningMeetingTab, EwCreateMeetingModal } from '@/modules/early-warning';
import {
  DEFECT_NOTICE_DETAIL_COPY,
  DEFECT_NOTICE_DETAIL_TABS,
  type DefectNoticeDetailTabKey,
} from '../constants/defect-notice.constants';
import { REGISTER_COLORS } from '../constants/defect-notice-register.theme';
import {
  useCloseDefectNotice,
  useCreateDefectNoticeMeeting,
  useGetDefectNoticeAttachments,
  useGetDefectNoticeAuditTrail,
  useGetDefectNoticeById,
  useGetDefectNoticeConversations,
  useGetDefectNoticeMeetings,
} from '../hooks/use-defect-notices';
import { DefectNoticeStatus } from '../types/defect-notice.types';
import DefectNoticeDetailHeader from './defect-notice-detail-header';
import DefectNoticeDetailSkeleton from './defect-notice-detail-skeleton';
import DefectNoticeDocumentTab from './defect-notice-document-tab';
import DefectNoticeEmailThread from './defect-notice-email-thread';
import DefectNoticeOverviewPanel from './defect-notice-overview-panel';
import DefectNoticeThemeProvider from './defect-notice-theme-provider';

// The trail's action vocabulary, as the endpoint's own `actionType` ordinals. Taken from
// the full enum, not from the rows on screen — once the endpoint narrows to one action the
// loaded rows no longer name the others.
const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_BY_ORDINAL).map(([ordinal, action]) => ({
  value: ordinal,
  label: AUDIT_ACTION_LABELS[action],
}));

const TAB_ICONS: Record<DefectNoticeDetailTabKey, React.ReactNode> = {
  Overview: <FileTextOutlined />,
  Email: <MailOutlined />,
  Meetings: <FileTextOutlined />,
  Document: <PaperClipOutlined />,
  'Audit Trial': <ClockCircleOutlined />,
};

// The Audit Trial tab — the shared `AuditTrailList` over the shared audit-log endpoint,
// exactly what the Early Warning and PMI detail screens render through. Both the search
// and the action filter are the endpoint's own, so neither narrows in the browser.
const DefectNoticeAuditContent = ({ noticeId }: { noticeId: string }) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  // The endpoint takes one actionType, so the dropdown holds at most one choice.
  const [action, setAction] = useState<string[]>([]);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: entries } = useGetDefectNoticeAuditTrail({
    id: noticeId,
    term: debouncedTerm,
    actionType: action.length ? Number(action[0]) : undefined,
    enabled: !!noticeId,
  });

  return (
    <Card
      title="Audit Trail"
      extra={
        <DetailListToolbar
          term={term}
          onTermChange={setTerm}
          searchPlaceholder="Search by user or details..."
          filterOptions={AUDIT_ACTION_OPTIONS}
          selected={action}
          // Only the newly ticked action survives — the endpoint narrows to one.
          onSelectedChange={(values) => setAction(values.slice(-1))}
          onClearAll={() => {
            setTerm('');
            setAction([]);
          }}
        />
      }
    >
      <AuditTrailList
        entries={entries ?? []}
        emptyDescription={
          debouncedTerm || action.length
            ? 'No activity matches this search.'
            : 'No audit activity yet'
        }
      />
    </Card>
  );
};

// Container — owns state & side effects; delegates rendering to presentational components.
// Mirrors the Early Warning detail page's shape (header → tab strip → per-tab content with
// the close action riding the header) so the two detail screens behave identically.
const DefectNoticeDetailPage = ({ id }: { id: string }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DefectNoticeDetailTabKey>('Overview');
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');

  const { data: notice, isLoading, isError } = useGetDefectNoticeById({ id, enabled: !!id });
  const closeNotice = useCloseDefectNotice();
  const createMeeting = useCreateDefectNoticeMeeting();

  // Only an open notice can be closed — the action disappears once the record is settled.
  const canClose = Number(notice?.status) === DefectNoticeStatus.Open;

  // Mounted here purely to size the tab count badges, and deliberately without a term, so a
  // search inside a tab never shrinks the number on it. React Query dedupes on the shared
  // keys, so the unfiltered read each tab performs before anything is typed costs no extra
  // request. Same approach the Compensation Event and PMI detail pages take.
  const { data: allConversations } = useGetDefectNoticeConversations({
    entityId: notice?.id,
    enabled: !!notice?.id,
  });
  const { data: allMeetings } = useGetDefectNoticeMeetings({
    entityId: id,
    enabled: !!id,
  });
  const { data: allAttachments } = useGetDefectNoticeAttachments({
    entityId: notice?.id,
    projectId: notice?.projectId ?? '',
    enabled: !!notice?.id && !!notice?.projectId,
  });

  // A tab with nothing in it renders no badge at all — `DetailTabs` drops a zero rather
  // than showing a "(00)" that reads as a broken figure.
  const tabCounts = {
    Email: allConversations?.length ?? 0,
    Meetings: allMeetings?.length ?? 0,
    Document: allAttachments?.length ?? 0,
  };

  // The Document tab must re-read the API every time it is opened — files can be added
  // from elsewhere (e.g. meetings) between visits, so cached data may be stale.
  const [documentTabVisit, setDocumentTabVisit] = useState(0);
  useEffect(() => {
    if (activeTab === 'Document') setDocumentTabVisit((visit) => visit + 1);
  }, [activeTab]);

  const handleCloseConfirm = async () => {
    try {
      await closeNotice.mutateAsync({ defectNoticeId: id, closingNotes: closingNotes.trim() });
      setCloseModalOpen(false);
      setClosingNotes('');
      notification.success({ message: 'Defect notice closed' });
      router.push(MENU_PATH.CCA_DEFECT_NOTICES.pathname);
    } catch {
      // The global error handler surfaces the reason; keep the modal open.
      notification.error({ message: 'Could not close the defect notice. Please try again.' });
    }
  };

  // The close action rides the page header's right edge, where the Early Warning detail
  // puts "Add Meeting", so the record-level action reads as part of the title bar.
  const closeAction = canClose ? (
    <Button type="primary" icon={<CheckOutlined />} onClick={() => setCloseModalOpen(true)}>
      Mark as Closed
    </Button>
  ) : undefined;

  const mainContent = {
    Overview: <DefectNoticeOverviewPanel notice={notice!} />,
    Email: <DefectNoticeEmailThread notice={notice!} />,
    Meetings: (
      // The EW meeting tab reused whole — listing rides the shared
      // `GET /api/meetings/list/{entityId}` with the notice id as the entity id. Scheduling
      // is enabled through the notice's own booking endpoint (`POST
      // /api/meetings/defect-notice`) via the same invite modal; only the agreed-actions
      // workflow stays out of scope here, hence `hideActions` (readOnly false on purpose —
      // readOnly would hide the schedule entry point too).
      <EarlyWarningMeetingTab
        earlyWarningId={id}
        projectId={notice?.projectId ?? ''}
        hideActions
        emptyDescription="There are no meetings scheduled for this defect notice yet."
        renderCreateMeetingModal={({ open, onClose, onSuccess }) => (
          <EwCreateMeetingModal
            open={open}
            onClose={onClose}
            earlyWarningId={id}
            projectId={notice?.projectId ?? ''}
            onSuccess={onSuccess}
            booking={{
              entityIdField: 'DefectNoticeId',
              createMeeting: (formData) => createMeeting.mutateAsync(formData),
              isPending: createMeeting.isPending,
              title: 'New Defect Notice Meeting',
            }}
          />
        )}
      />
    ),
    Document: <DefectNoticeDocumentTab key={documentTabVisit} notice={notice!} />,
    'Audit Trial': <DefectNoticeAuditContent noticeId={id} />,
  }[activeTab];

  if (isError || (!isLoading && !notice)) {
    return <Result status="404" title={DEFECT_NOTICE_DETAIL_COPY.notFound} />;
  }

  return (
    <DefectNoticeThemeProvider>
      <Flex vertical gap={20}>
        {notice && <DefectNoticeDetailHeader notice={notice} actions={closeAction} />}

        {/* Same shared tab strip the Early Warning detail renders, in the same tab order —
          the two registers read as one product. */}
        <DetailTabs
          tabs={DEFECT_NOTICE_DETAIL_TABS.map(({ key, label }) => ({
            key,
            label,
            icon: TAB_ICONS[key],
          }))}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as DefectNoticeDetailTabKey)}
          counts={tabCounts}
          tone={{
            tabBarBg: APP_COLORS.mainSoft,
            main: REGISTER_COLORS.main,
            activeIndicator: DETAIL_TABS_ACTIVE_GRADIENT,
          }}
        />

        {isLoading || !notice ? <DefectNoticeDetailSkeleton /> : mainContent}

        <Modal
          open={closeModalOpen}
          title="Mark as Closed"
          okText="Close Notice"
          okButtonProps={{ loading: closeNotice.isPending }}
          onOk={handleCloseConfirm}
          onCancel={() => setCloseModalOpen(false)}
        >
          <Flex vertical gap={12}>
            <Typography.Text type="secondary">
              Closing settles this defect notice. Add any closing notes below — they are stored
              against the record.
            </Typography.Text>
            <Typography.Text strong>Closing notes</Typography.Text>
            <Input.TextArea
              value={closingNotes}
              onChange={(event) => setClosingNotes(event.target.value)}
              placeholder="Anything worth recording about how this defect was resolved..."
              autoSize={{ minRows: 3 }}
            />
          </Flex>
        </Modal>
      </Flex>
    </DefectNoticeThemeProvider>
  );
};

export default DefectNoticeDetailPage;
