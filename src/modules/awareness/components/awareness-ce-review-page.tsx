'use client';

import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  UploadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { RefSelectProps, UploadFile, UploadProps } from 'antd';
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  notification,
  Popconfirm,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { useMemo, useRef, useState } from 'react';
import AppPageTitle from '@/components/shared/app-page-title';
import DocumentsCommunication, {
  isDeadlineOverdue,
} from '@/components/shared/documents-communication';
import IconChip from '@/components/shared/icon-chip';
import NoticeBanner from '@/components/shared/notice-banner';
import type { ProjectAlert, ProjectAlertEmail } from '@/hooks/modules/project-alerts';
import { parseAlertCompensationEvent, parseImpactAssessment } from '@/hooks/modules/project-alerts';
import {
  AWARENESS_CE_CLAUSE_OPTIONS,
  AWARENESS_CE_COPY,
  AWARENESS_CE_UPLOAD_ACCEPT,
  AWARENESS_DECISION_CONFIRM,
  AWARENESS_PALETTE,
} from '../constants/awareness.constants';
import { confidenceTier, fileExtension, isAllowedUpload } from '../utils/awareness.utils';
import AwarenessEmailCard from './awareness-email-card';
import AwarenessThemeProvider from './awareness-theme-provider';

interface AwarenessCeReviewPageProps {
  alert: ProjectAlert;
  email?: ProjectAlertEmail;
  emailBody: string;
  receivedLabel: string;
  attachments?: { id?: string; name?: string; url?: string }[] | null;
  reason: string;
  onReasonChange: (value: string) => void;
  /** Accepted — opens the Compensation Event notice seeded from this signal. */
  onAccept: () => void;
  /** Not Accepted — records the failed Cl.61.3 test and the reason against the alert. */
  onNotAccepted: (clause?: string) => void;
  /** Discard — soft-deletes the signal; needs a comment, forwards the clause if picked. */
  onDiscard: (clause?: string) => void;
  accepting: boolean;
  discarding: boolean;
  /** Soft-delete in flight — drives the Discard button only. */
  deleting: boolean;
}

// Only the three accepted document types get a glyph; the list is gated to them on upload,
// so the neutral fallback is a safety net rather than a case users should hit.
const UPLOAD_TYPE_ICON: Record<string, { Icon: typeof FilePdfOutlined; color: string }> = {
  pdf: { Icon: FilePdfOutlined, color: '#D92D20' },
  doc: { Icon: FileWordOutlined, color: '#2E5AAC' },
  docx: { Icon: FileWordOutlined, color: '#2E5AAC' },
  xls: { Icon: FileExcelOutlined, color: '#12805C' },
  xlsx: { Icon: FileExcelOutlined, color: '#12805C' },
};

const UploadTypeIcon = ({ fileName }: { fileName: string }) => {
  const { Icon, color } = UPLOAD_TYPE_ICON[fileExtension(fileName)] ?? {
    Icon: FileOutlined,
    color: AWARENESS_PALETTE.main,
  };
  return <Icon style={{ color, fontSize: 22 }} />;
};

// Compensation Event review (ProjectAlertType.CompensationEvent). Same email card and sidebar
// as the Early Warning review, but CE-worded assessment, an evidence upload, the Clause 61.3
// tests and a three-way decision footer.
const AwarenessCeReviewPage = ({
  alert,
  email,
  emailBody,
  receivedLabel,
  attachments,
  reason,
  onReasonChange,
  onAccept,
  onNotAccepted,
  onDiscard,
  accepting,
  discarding,
  deleting,
}: AwarenessCeReviewPageProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [clause, setClause] = useState<string | undefined>();
  const clauseSelectRef = useRef<RefSelectProps>(null);
  const commentRef = useRef<TextAreaRef>(null);
  // Which decision's popconfirm is open — controlled so each prerequisite is checked first.
  const [openConfirm, setOpenConfirm] = useState<'discard' | 'notAccepted' | 'accepted' | null>(
    null
  );
  const [reasonError, setReasonError] = useState(false);
  const [clauseOpen, setClauseOpen] = useState(false);

  const ceDetail = useMemo(
    () => parseAlertCompensationEvent(alert.compensationEvent),
    [alert.compensationEvent]
  );
  const impact = useMemo(
    () => parseImpactAssessment(alert.impactAssessment),
    [alert.impactAssessment]
  );

  // What the extractor actually read out of this mail, widest reading first: the alert precis
  // (falling back to its longer description, which carries the same account at more length),
  // then the CE draft's proposed effect — only when an impact assessment came back. Duplicates
  // collapse to one line; the constant is only the "nothing came back" line.
  const assessmentParagraphs = useMemo(() => {
    const narrative = alert.summary?.trim() || alert.description?.trim();
    const effect = impact ? ceDetail?.proposedEffectDescription?.trim() : undefined;
    const lines = [narrative, effect].filter(
      (line, index, all): line is string => !!line && all.indexOf(line) === index
    );
    return lines.length ? lines : [AWARENESS_CE_COPY.assessment.intro];
  }, [alert.summary, alert.description, impact, ceDetail?.proposedEffectDescription]);

  // Mitigation is the extractor's proposed actions; the note is dropped when it sent none.
  const mitigation = impact?.proposedActions?.trim();
  const confidence = alert.confidencePercentage ?? 0;
  const tier = confidenceTier(confidence, AWARENESS_CE_COPY.confidenceSubject);

  // antd hands back every picked file, so the disallowed ones are stripped here rather than
  // in `beforeUpload` — that keeps one rejection message per file and one source of truth.
  // The same pass drops repeat file names: the first occurrence keeps its slot, so an
  // already-uploaded document survives and the re-picked copy is the one rejected.
  const handleFileListChange: UploadProps['onChange'] = ({ fileList: next }) => {
    const seen = new Set<string>();
    const accepted: UploadFile[] = [];

    for (const file of next) {
      if (!isAllowedUpload(file.name)) {
        notification.error({ message: AWARENESS_CE_COPY.upload.rejected(file.name) });
        continue;
      }
      const key = file.name.trim().toLowerCase();
      if (seen.has(key)) {
        notification.error({ message: AWARENESS_CE_COPY.upload.duplicate(file.name) });
        continue;
      }
      seen.add(key);
      accepted.push(file);
    }

    setFileList(accepted);
  };

  const handleView = (file: UploadFile) => {
    const source = file.url || (file.originFileObj && URL.createObjectURL(file.originFileObj));
    if (source) window.open(source, '_blank', 'noopener,noreferrer');
  };

  const handleRemove = (target: UploadFile) =>
    setFileList((current) => current.filter((file) => file.uid !== target.uid));

  // The decision buttons stay enabled so the requirement is discoverable — clicking without
  // the prerequisite explains what is missing rather than leaving a dead control.
  // Once the Cl.61.3 window has run out the signal can no longer be reviewed either way, so the
  // whole action row locks rather than letting a decision be recorded against a dead deadline.
  const reviewLocked = isDeadlineOverdue(alert.overdueDateTime);

  // Each decision is one-way — accept raises a CE, the other two close the signal — so the
  // prerequisite is checked first and the popconfirm opens only once it is satisfied.

  // Discard reads the comment off the page, so the reason is visible while the decision is
  // being made. An empty comment marks the field and stops there.
  const handleDiscardClick = () => {
    setClauseOpen(false);
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setReasonError(true);
      commentRef.current?.focus();
      return;
    }
    setOpenConfirm('discard');
  };

  // The reason picker only concerns Not Accepted, so it stays off the page until that
  // decision is taken: the first click reveals it, and the click after it — once a reason
  // is actually chosen — is the one that asks for confirmation. Turning to either of the
  // other two decisions puts it away again, so the open field always belongs to the
  // decision being made.
  const handleNotAcceptedClick = () => {
    if (!clauseOpen) {
      setClauseOpen(true);
      return;
    }
    if (!clause) {
      notification.error({ message: AWARENESS_CE_COPY.actions.clauseRequired });
      clauseSelectRef.current?.focus();
      return;
    }
    setOpenConfirm('notAccepted');
  };

  const handleAcceptClick = () => {
    setClauseOpen(false);
    setOpenConfirm('accepted');
  };

  const closeConfirm = (open: boolean) => {
    if (!open) setOpenConfirm(null);
  };

  return (
    <AwarenessThemeProvider>
      <Flex vertical gap={16}>
        <AppPageTitle
          icon={<FileTextOutlined />}
          title={AWARENESS_CE_COPY.reviewTitle(alert.title)}
          clause={{
            number: alert.clauseNumber ?? ceDetail?.clauseNumber ?? AWARENESS_CE_COPY.clauseNumber,
            title: alert.clauseTitle ?? ceDetail?.clauseTitle ?? undefined,
            description:
              alert.clauseDescription ?? ceDetail?.clauseDescription ?? AWARENESS_CE_COPY.banner,
          }}
        />

        <NoticeBanner message={alert.description?.trim() || AWARENESS_CE_COPY.banner} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Flex vertical gap={16}>
              <AwarenessEmailCard
                title={AWARENESS_CE_COPY.emailCard}
                email={email}
                body={emailBody}
                receivedLabel={receivedLabel}
                attachments={attachments}
              />

              <Card title={AWARENESS_CE_COPY.assessment.title}>
                <Flex vertical gap={12}>
                  {assessmentParagraphs.map((paragraph) => (
                    <Typography.Text key={paragraph} type="secondary">
                      {paragraph}
                    </Typography.Text>
                  ))}
                  {mitigation && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {AWARENESS_CE_COPY.assessment.notePrefix} {mitigation}
                    </Typography.Text>
                  )}
                </Flex>
              </Card>

              <Card
                title={
                  <Flex align="center" gap={12}>
                    <IconChip icon={<UploadOutlined />} bordered size={32} />
                    <Typography.Text strong style={{ fontSize: 16, color: AWARENESS_PALETTE.main }}>
                      {AWARENESS_CE_COPY.uploadDocuments}
                    </Typography.Text>
                  </Flex>
                }
                extra={
                  <Upload
                    multiple
                    accept={AWARENESS_CE_UPLOAD_ACCEPT}
                    showUploadList={false}
                    fileList={fileList}
                    onChange={handleFileListChange}
                    beforeUpload={() => false}
                  >
                    <Button type="primary" icon={<UploadOutlined />}>
                      {AWARENESS_CE_COPY.upload.button}
                    </Button>
                  </Upload>
                }
              >
                {fileList.length ? (
                  <Flex vertical gap={8}>
                    {fileList.map((file) => (
                      <Flex
                        key={file.uid}
                        align="center"
                        gap={8}
                        style={{ border: '1px solid #E0E3E8', borderRadius: 8, padding: 8 }}
                      >
                        <UploadTypeIcon fileName={file.name} />
                        <Typography.Text ellipsis style={{ flex: 1, minWidth: 0 }}>
                          {file.name}
                        </Typography.Text>
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleView(file)}
                        >
                          {AWARENESS_CE_COPY.upload.view}
                        </Button>
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          aria-label={AWARENESS_CE_COPY.upload.remove}
                          onClick={() => handleRemove(file)}
                        />
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Typography.Text type="secondary">
                    {AWARENESS_CE_COPY.upload.empty} {AWARENESS_CE_COPY.upload.hint}
                  </Typography.Text>
                )}
              </Card>

              {clauseOpen && (
                <Card title={AWARENESS_CE_COPY.clauseSection}>
                  {/* Revealed by the button, so it takes focus straight away rather than
                      appearing somewhere above and waiting to be found. */}
                  <Select
                    ref={clauseSelectRef}
                    autoFocus
                    allowClear
                    value={clause}
                    onChange={setClause}
                    placeholder={AWARENESS_CE_COPY.clausePlaceholder}
                    style={{ width: '100%' }}
                    options={AWARENESS_CE_CLAUSE_OPTIONS.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                  />
                </Card>
              )}

              {/* The reason for rejecting sits on the page beside the decision it explains,
                  rather than behind a modal that hides it the moment it is written. */}
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
                      {AWARENESS_CE_COPY.comment}
                    </Typography.Text>
                  </Flex>
                  <Input.TextArea
                    ref={commentRef}
                    rows={4}
                    placeholder={AWARENESS_CE_COPY.commentPlaceholder}
                    value={reason}
                    onChange={(event) => {
                      onReasonChange(event.target.value);
                      if (reasonError && event.target.value.trim()) setReasonError(false);
                    }}
                    status={reasonError ? 'error' : undefined}
                    className="!bg-[#FFF5F5] !border-[#FECDCA] focus:!border-[#F04438] !text-sm !p-3"
                  />
                  {reasonError && (
                    <Typography.Text type="danger" style={{ fontSize: 12 }}>
                      {AWARENESS_CE_COPY.actions.commentRequired}
                    </Typography.Text>
                  )}
                </Flex>
              </Card>

              {/* The tooltip sits on the row, not the buttons — antd suppresses a disabled
                  button's own mouse events, so a per-button tooltip would never open. */}
              <Tooltip title={reviewLocked ? AWARENESS_CE_COPY.actions.overdue : ''}>
                <Flex gap={12} wrap>
                  <Popconfirm
                    title={AWARENESS_DECISION_CONFIRM.discard.title(
                      AWARENESS_CE_COPY.confidenceSubject
                    )}
                    description={alert.title}
                    okText={AWARENESS_DECISION_CONFIRM.discard.okText}
                    cancelText={AWARENESS_DECISION_CONFIRM.cancelText}
                    okButtonProps={{ danger: true, loading: deleting }}
                    open={openConfirm === 'discard'}
                    onOpenChange={closeConfirm}
                    onConfirm={() => onDiscard(clause)}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      style={{ flex: 1 }}
                      loading={deleting}
                      disabled={reviewLocked}
                      onClick={handleDiscardClick}
                    >
                      {AWARENESS_CE_COPY.actions.discard}
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title={AWARENESS_DECISION_CONFIRM.notAccepted.title}
                    description={alert.title}
                    okText={AWARENESS_DECISION_CONFIRM.notAccepted.okText}
                    cancelText={AWARENESS_DECISION_CONFIRM.cancelText}
                    okButtonProps={{ loading: discarding }}
                    open={openConfirm === 'notAccepted'}
                    onOpenChange={closeConfirm}
                    onConfirm={() => onNotAccepted(clause)}
                  >
                    <Button
                      icon={<CloseOutlined />}
                      style={{ flex: 1 }}
                      loading={discarding}
                      disabled={reviewLocked}
                      onClick={handleNotAcceptedClick}
                    >
                      {AWARENESS_CE_COPY.actions.notAccepted}
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title={AWARENESS_DECISION_CONFIRM.accepted.title}
                    description={alert.title}
                    okText={AWARENESS_DECISION_CONFIRM.accepted.okText}
                    cancelText={AWARENESS_DECISION_CONFIRM.cancelText}
                    okButtonProps={{ loading: accepting }}
                    open={openConfirm === 'accepted'}
                    onOpenChange={closeConfirm}
                    onConfirm={onAccept}
                  >
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      loading={accepting}
                      style={{ flex: 1 }}
                      disabled={reviewLocked}
                      onClick={handleAcceptClick}
                    >
                      {AWARENESS_CE_COPY.actions.accepted}
                    </Button>
                  </Popconfirm>
                </Flex>
              </Tooltip>
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <Flex vertical gap={16}>
              <DocumentsCommunication
                deadline={alert.overdueDateTime ?? null}
                projectId={alert.projectId}
                conversationId={alert.conversationId}
                subjectFallback={alert.title}
              />

              <Card title="Confidence Score">
                <Typography.Text strong style={{ color: tier.color, fontSize: 32 }}>
                  {confidence}%
                </Typography.Text>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {tier.label}
                </Typography.Text>
                <div
                  style={{ height: 6, background: '#EAECF0', borderRadius: 3, overflow: 'hidden' }}
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

export default AwarenessCeReviewPage;
