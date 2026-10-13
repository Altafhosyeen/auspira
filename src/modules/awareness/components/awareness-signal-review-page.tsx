'use client';

import {
  CheckOutlined,
  DeleteOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Flex, Input, notification, Popconfirm, Row, Typography } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useMemo, useState } from 'react';
import AppPageTitle from '@/components/shared/app-page-title';
import DocumentsCommunication from '@/components/shared/documents-communication';
import DocumentsUploadCard from '@/components/shared/documents-upload-card';
import NoticeBanner from '@/components/shared/notice-banner';
import { MENU_PATH, ProjectAlertType } from '@/constants';
import { useGetProjectEmailConversationDetails } from '@/hooks/modules/project';
import { getPrimaryAlertEmail, parseImpactAssessment } from '@/hooks/modules/project-alerts';
import { toLocalDayjs } from '@/lib/utils';
import { useAcceptDefectNotice } from '@/modules/defect-notice';
import { useAcceptDailySiteReport } from '@/modules/project-daily-report';
import { useProjectAlertBridgeStore } from '@/store/project-alert.store';
import {
  AWARENESS_ASSESSMENT_COPY,
  AWARENESS_DECISION_CONFIRM,
} from '../constants/awareness.constants';
import {
  useAcceptCompensationEvent,
  useAcceptEarlyWarning,
  useDiscardAlert,
  useGetAwarenessAlert,
  useNotAcceptedAlert,
} from '../hooks/use-awareness';
import {
  confidenceTier,
  DEFAULT_ROUTE_META,
  ROUTE_META,
  toEmailText,
} from '../utils/awareness.utils';
import { toAssessmentView } from '../utils/awareness-assessment.utils';
import AwarenessCeReviewPage from './awareness-ce-review-page';
import AwarenessEmailCard from './awareness-email-card';
import AwarenessSignalReviewSkeleton from './awareness-signal-review-skeleton';
import AwarenessThemeProvider from './awareness-theme-provider';

// Container — review a signal (Early Warning email); Confirm registers it directly.
const AwarenessSignalReviewPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  // Both types that accept in place — Defect Notice and Daily Site Report — carry optional
  // evidence files (same shared uploader the PMI create form uses); they ride the accept
  // multipart as `Attachments`. One state serves both, since an alert is only ever one type.
  const [acceptFiles, setAcceptFiles] = useState<File[]>([]);
  // Which decision's popconfirm is open — controlled so Discard can check its comment first.
  const [openConfirm, setOpenConfirm] = useState<'discard' | 'confirm' | null>(null);

  const { data: alert, isLoading } = useGetAwarenessAlert({ id, enabled: !!id });
  const { data: conversationDetails } = useGetProjectEmailConversationDetails({
    projectId: alert?.projectId,
    conversationId: alert?.conversationId ?? undefined,
  });
  const attachments = useMemo(
    () => conversationDetails?.[0]?.attachments ?? [],
    [conversationDetails]
  );
  const { mutateAsync: accept, isPending: accepting } = useAcceptEarlyWarning();
  const { mutateAsync: acceptCompensationEvent, isPending: acceptingCe } =
    useAcceptCompensationEvent();
  // A Defect Notice signal (alert type 6) accepts straight into the DN register — the
  // backend creates the notice from the alert, same pattern as the CE accept.
  const { mutateAsync: acceptDefectNotice, isPending: acceptingDefectNotice } =
    useAcceptDefectNotice();
  // A Daily Site Report signal (alert type 7) accepts the same way, into the PDR register.
  const { mutateAsync: acceptDailySiteReport, isPending: acceptingDailySiteReport } =
    useAcceptDailySiteReport();
  const { mutateAsync: notAccepted, isPending: notAccepting } = useNotAcceptedAlert();
  const { mutateAsync: discard, isPending: discarding } = useDiscardAlert();

  const email = useMemo(() => (alert ? getPrimaryAlertEmail(alert) : undefined), [alert]);
  const impact = useMemo(
    () => (alert ? parseImpactAssessment(alert.impactAssessment) : null),
    [alert]
  );
  const confidence = alert?.confidencePercentage ?? 0;
  // Name the alert's own type — without this every review reads "…likely an Early Warning",
  // even for Defect Notices and PMIs. The CE screen passes its subject the same way.
  const tier = confidenceTier(confidence, ROUTE_META[alert?.alertType ?? -1]?.label ?? 'Signal');
  const receivedLabel = useMemo(() => {
    const created = toLocalDayjs(alert?.createdOn);
    if (!created.isValid()) return '';
    const day = created.isSame(dayjs(), 'day') ? 'Today' : created.format('DD MMM YYYY');
    return `${day} · ${created.format('hh:mm A')}`;
  }, [alert]);

  if (isLoading || !alert) {
    return <AwarenessSignalReviewSkeleton />;
  }

  // Type-aware Accept: Early Warning, Compensation Event, Defect Notice and Daily Site Report
  // each accept through their own endpoint and land on their register; other types fall back
  // to the awareness list for now.
  const handleConfirm = async () => {
    try {
      if (alert.alertType === ProjectAlertType.EarlyWarning) {
        await accept({ projectAlertId: alert.id, conversationId: alert.conversationId });
        router.push('/contract-control-agent/early-warning');
        return;
      }
      if (alert.alertType === ProjectAlertType.CompensationEvent) {
        await acceptCompensationEvent({ projectAlertId: alert.id });
        notification.success({ message: 'Compensation event accepted' });
        router.push(MENU_PATH.COMPENSATION_EVENT.pathname);
        return;
      }
      if (alert.alertType === ProjectAlertType.DefectNotice) {
        await acceptDefectNotice({ projectAlertId: alert.id, attachments: acceptFiles });
        notification.success({ message: 'Defect notice accepted' });
        setAcceptFiles([]);
        router.push(MENU_PATH.CCA_DEFECT_NOTICES.pathname);
        return;
      }
      if (alert.alertType === ProjectAlertType.DailySiteReport) {
        await acceptDailySiteReport({ projectAlertId: alert.id, attachments: acceptFiles });
        notification.success({ message: 'Daily site report accepted' });
        setAcceptFiles([]);
        router.push(MENU_PATH.OCA_REPORTING.pathname);
        return;
      }
      router.push('/projects/awareness');
    } catch {
      // handled globally
    }
  };

  const runDiscard = async (trimmedReason: string) => {
    try {
      await discard({ projectAlertId: alert.id, notAcceptReason: trimmedReason });
      notification.success({ message: 'Signal discarded' });
      router.push('/projects/awareness');
    } catch {
      // handled globally
    }
  };

  // Discard destroys the signal, so the comment is required up front and the popconfirm
  // only opens once it is filled.
  const handleDiscardClick = () => {
    if (!reason.trim()) {
      setReasonError(true);
      notification.error({ message: 'Please provide a reason before discarding.' });
      return;
    }
    setReasonError(false);
    setOpenConfirm('discard');
  };

  const closeConfirm = (open: boolean) => {
    if (!open) setOpenConfirm(null);
  };

  // Compensation Events fail a specific Cl.61.3 test — it travels in `notAcceptReasonTitle`,
  // separate from the PM's free-text comment.
  const handleNotAcceptedWithClause = async (clause?: string) => {
    try {
      await notAccepted({
        projectAlertId: alert.id,
        notAcceptReason: reason.trim(),
        notAcceptReasonTitle: clause,
        isNotAccept: true,
      });
      notification.success({ message: 'Compensation event marked not accepted' });
      router.push(MENU_PATH.COMPENSATION_EVENT.pathname);
    } catch {
      // handled globally
    }
  };

  // Discard soft-deletes the alert — a different endpoint to Not Accepted, which keeps the
  // record and raises it in NotAccepted status. The clause is optional here but still sent
  // when the PM picked one.
  const handleCeDiscard = async (clause?: string) => {
    try {
      await discard({
        projectAlertId: alert.id,
        notAcceptReason: reason.trim(),
        notAcceptReasonTitle: clause,
      });
      notification.success({ message: 'Signal discarded' });
      router.push(MENU_PATH.COMPENSATION_EVENT.pathname);
    } catch {
      // handled globally
    }
  };

  const handleNotify = () => {
    if (alert.alertType === ProjectAlertType.EarlyWarning) {
      useProjectAlertBridgeStore.getState().setPendingProjectAlert(alert);
      router.push(`/contract-control-agent/early-warning/register?alertId=${alert.id}`);
      return;
    }
    if (alert.alertType === ProjectAlertType.CompensationEvent) {
      router.push(`/contract-control-agent/compensation-event/new?alertId=${alert.id}`);
      return;
    }
    router.push('/projects/awareness');
  };

  const emailBody = toEmailText(email?.emailBody) || alert.description || 'No email body.';
  const routeMeta = ROUTE_META[alert.alertType] ?? DEFAULT_ROUTE_META;
  // What the extractor read out of this mail, or null when it read nothing — the card is
  // dropped rather than rendered empty. Same treatment for every type this screen handles
  // (Compensation Events review on their own screen).
  const assessment = toAssessmentView(alert, impact);
  // Types accepted in place, rather than confirmed through a prefill flow: these carry an
  // evidence uploader and a single Confirm action.
  const acceptsInPlace =
    alert.alertType === ProjectAlertType.DefectNotice ||
    alert.alertType === ProjectAlertType.DailySiteReport;
  // Only EW and CE have a Confirm & Notify prefill flow today.
  const showNotifyAction =
    alert.alertType === ProjectAlertType.EarlyWarning ||
    alert.alertType === ProjectAlertType.CompensationEvent;

  // Confirm settles through whichever endpoint this alert's type owns, so the spinner has to
  // follow the mutation actually in flight rather than the Early Warning one alone.
  const confirming =
    alert.alertType === ProjectAlertType.DefectNotice
      ? acceptingDefectNotice
      : alert.alertType === ProjectAlertType.DailySiteReport
        ? acceptingDailySiteReport
        : accepting;

  // Compensation Events get their own review screen; every other type keeps this one.
  if (alert.alertType === ProjectAlertType.CompensationEvent) {
    return (
      <AwarenessCeReviewPage
        alert={alert}
        email={email}
        emailBody={emailBody}
        receivedLabel={receivedLabel}
        attachments={attachments}
        reason={reason}
        onReasonChange={setReason}
        onAccept={handleConfirm}
        onNotAccepted={handleNotAcceptedWithClause}
        onDiscard={handleCeDiscard}
        accepting={acceptingCe}
        discarding={notAccepting}
        deleting={discarding}
      />
    );
  }

  return (
    <AwarenessThemeProvider>
      <Flex vertical gap={16}>
        <AppPageTitle
          icon={<FileTextOutlined />}
          title={`Review - ${routeMeta.label} Email`}
          clause={{
            number: alert.clauseNumber ?? '',
            description: alert.clauseDescription ?? '',
          }}
        />

        <NoticeBanner message={alert.summary ?? ''} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Flex vertical gap={16}>
              <AwarenessEmailCard
                title="Contractor Email - As Received"
                email={email}
                body={emailBody}
                receivedLabel={receivedLabel}
                attachments={attachments}
              />

              {assessment && (
                <Card title={AWARENESS_ASSESSMENT_COPY.title}>
                  <Flex vertical gap={12}>
                    {assessment.paragraphs.map((paragraph) => (
                      <Typography.Text key={paragraph} type="secondary">
                        {paragraph}
                      </Typography.Text>
                    ))}
                    {assessment.findings.length > 0 && (
                      <Flex vertical gap={8}>
                        {assessment.findings.map((finding) => (
                          <Typography.Text key={finding.label}>
                            • <strong>{finding.label}:</strong> {finding.value}
                          </Typography.Text>
                        ))}
                      </Flex>
                    )}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {assessment.note}
                    </Typography.Text>
                  </Flex>
                </Card>
              )}

              <Card
                className="!bg-[#FEF1F1] !border-[#FECDCA]"
                styles={{ body: { padding: '20px 24px' } }}
              >
                <Flex vertical gap={16}>
                  <Flex align="center" gap={12}>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                      style={{ background: '#FEF1F1', borderColor: '#FECDCA' }}
                    >
                      <WarningOutlined style={{ color: '#D92D20', fontSize: 18 }} />
                    </span>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      Comment
                    </Typography.Text>
                  </Flex>
                  <Input.TextArea
                    rows={4}
                    placeholder="Add a reason for not accepting..."
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      if (reasonError && event.target.value.trim()) {
                        setReasonError(false);
                      }
                    }}
                    status={reasonError ? 'error' : undefined}
                    className="!bg-[#FFF5F5] !border-[#FECDCA] focus:!border-[#F04438] !text-sm !p-3"
                  />
                  {reasonError && (
                    <Typography.Text type="danger" style={{ fontSize: 12 }}>
                      Reason is required when discarding a signal.
                    </Typography.Text>
                  )}
                </Flex>
              </Card>

              {/* Defect Notice and Daily Site Report accepts take evidence — the same shared
                  uploader the PMI create form uses; the files ride the accept multipart as
                  `Attachments`. */}
              {acceptsInPlace && (
                <DocumentsUploadCard
                  files={acceptFiles}
                  onFilesChange={setAcceptFiles}
                  title="Upload Documents"
                />
              )}

              {/* Action buttons — Discard, Confirm and Confirm & Notify in one row.
                  Confirm & Notify only exists for types with a prefill flow (EW / CE);
                  Defect Notices are accepted or discarded in place. */}
              <Flex gap={12}>
                <Popconfirm
                  title={AWARENESS_DECISION_CONFIRM.discard.title(routeMeta.label)}
                  description={alert.title}
                  okText={AWARENESS_DECISION_CONFIRM.discard.okText}
                  cancelText={AWARENESS_DECISION_CONFIRM.cancelText}
                  okButtonProps={{ danger: true, loading: discarding }}
                  open={openConfirm === 'discard'}
                  onOpenChange={closeConfirm}
                  onConfirm={() => runDiscard(reason.trim())}
                >
                  <Button
                    danger
                    style={{ flex: 1 }}
                    icon={<DeleteOutlined />}
                    loading={discarding}
                    onClick={handleDiscardClick}
                  >
                    Discard
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title={AWARENESS_DECISION_CONFIRM.confirm.title(routeMeta.label)}
                  description={alert.title}
                  okText={AWARENESS_DECISION_CONFIRM.confirm.okText}
                  cancelText={AWARENESS_DECISION_CONFIRM.cancelText}
                  okButtonProps={{ loading: confirming }}
                  open={openConfirm === 'confirm'}
                  onOpenChange={closeConfirm}
                  onConfirm={handleConfirm}
                >
                  <Button
                    type="primary"
                    style={{ flex: 1 }}
                    icon={<CheckOutlined />}
                    // Confirm settles through whichever endpoint this alert's type owns, so the
                    // spinner follows that type's own mutation rather than the Early Warning one.
                    loading={confirming}
                    onClick={() => setOpenConfirm('confirm')}
                  >
                    Confirm
                  </Button>
                </Popconfirm>
                {showNotifyAction && (
                  <Button
                    type="primary"
                    style={{ flex: 1 }}
                    loading={accepting}
                    onClick={handleNotify}
                  >
                    Confirm & Notify
                  </Button>
                )}
              </Flex>
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <Flex vertical gap={16}>
              <DocumentsCommunication
                deadline={alert?.overdueDateTime ?? null}
                projectId={alert?.projectId}
                conversationId={alert?.conversationId}
                subjectFallback={alert?.title}
              />

              <Card title="Confidence Score">
                <Typography.Text strong style={{ color: tier.color, fontSize: 32 }}>
                  {confidence}%
                </Typography.Text>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {tier.label}
                </Typography.Text>
                <div
                  style={{
                    height: 6,
                    background: '#EAECF0',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(confidence, 100)}%`,
                      height: '100%',
                      background: '#C0392B',
                    }}
                  />
                </div>
              </Card>
            </Flex>
          </Col>
        </Row>
      </Flex>
    </AwarenessThemeProvider>
  );
};

export default AwarenessSignalReviewPage;
