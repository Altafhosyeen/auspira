'use client';

import { CopyOutlined, ExportOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  ConfigProvider,
  Flex,
  notification,
  Radio,
  Result,
  Row,
  Skeleton,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { MENU_PATH } from '@/constants';
import { useGetProjectAlertById } from '@/hooks/modules/project-alerts';
import { exportToXlsx } from '@/lib/utils';
import { useGetPmiDetail } from '@/modules/pmi';
import { COMPENSATION_EVENT_EXPORT_COPY } from '../constants/compensation-event.constants';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import { QUOTATION_COLORS, QUOTATION_THEME } from '../constants/compensation-event-quotation.theme';
import { useGetCompensationEventById } from '../hooks/use-compensation-events';
import { useCompensationEventDocuments } from '../hooks/use-conversation-documents';
import { useProceedWithAssessment } from '../hooks/use-quotation';
import { useGetQuotationById } from '../hooks/use-quotations';
import type { QuotationLine } from '../types/compensation-event-quotation.types';
import { buildAssessedQuotationItems } from '../utils/compensation-event-assessment.utils';
import { resolveClauseChip } from '../utils/compensation-event-clause.utils';
import {
  buildAssessmentExportColumns,
  buildAssessmentExportRows,
} from '../utils/compensation-event-export.utils';
import {
  buildQuotationSummaryRows,
  getQuotationSummaryRowsTotal,
  setQuotationRowAmount,
  toContractorQuotation,
} from '../utils/compensation-event-quotation.utils';
import { toContractorQuotationFromAlert } from '../utils/compensation-event-quotation-alert.utils';
import CompensationEventAssessmentActions from './compensation-event-assessment-actions';
import CompensationEventAssessmentComment from './compensation-event-assessment-comment';
import CompensationEventAssessmentDays from './compensation-event-assessment-days';
import CompensationEventAssessmentLines from './compensation-event-assessment-lines';
import CompensationEventAssessmentUpload from './compensation-event-assessment-upload';
import CompensationEventAttachmentsModal from './compensation-event-attachments-modal';
import CompensationEventNoticeClauseBanner from './compensation-event-notice-clause-banner';
import CompensationEventNoticeDocumentsCommunication from './compensation-event-notice-documents-communication';
import CompensationEventPageHeader from './compensation-event-page-header';

interface CompensationEventAssessmentPageProps {
  // The quotation's own id — the whole screen is read off `GET /api/quotations/{id}`,
  // same as the register's read-only quotation detail view, unless `projectAlertId` below
  // says this was reached from the alert-driven quotation screen instead.
  id: string;
  // The compensation event reference, when the quotation screen already resolved one —
  // used only until the quotation's own `ceReference` lands from the fetch above.
  compensationEventReference?: string;
  // Set when this screen was reached from the alert-driven quotation screen — its card
  // reads off this alert rather than the register's persisted quotation, so the
  // assessment card is seeded off the same alert to keep the two screens showing the
  // same figures rather than each reading a different record.
  projectAlertId?: string;
}

// Container — owns the assessed line amounts, the proposed days and the PM's comment.
// The claimed lines come off the quotation; every total is derived from `lines`, so
// editing an amount reprices the card rather than drifting from a stored total.
const CompensationEventAssessmentPage = ({
  id,
  compensationEventReference,
  projectAlertId,
}: CompensationEventAssessmentPageProps) => {
  const proceedWithAssessment = useProceedWithAssessment();
  const route = useRouter();

  // The route id is always the quotation's own id — accept/revision/implement all key on
  // it — so this fetch still runs even when the card below reads off the alert instead.
  const { data: quotationDto, isLoading: quotationLoading } = useGetQuotationById({ id });

  const { data: alert, isLoading: alertLoading } = useGetProjectAlertById({
    id: projectAlertId ?? '',
    enabled: !!projectAlertId,
  });

  // The alert-driven quotation screen's card always reads off the alert, confirmed or
  // not — this screen matches it rather than showing the register's persisted figures a
  // click away from the extractor's.
  const quotation = useMemo(() => {
    if (projectAlertId) return alert ? toContractorQuotationFromAlert(alert) : undefined;
    return quotationDto ? toContractorQuotation(quotationDto) : undefined;
  }, [projectAlertId, alert, quotationDto]);

  // The quotation names the event it prices but not the project it sits on, and the mail
  // rail needs both — the project to scope the thread, the event to resolve it.
  const compensationEventId = quotationDto?.compensationEventId;
  const { data: compensationEvent, isLoading: eventLoading } = useGetCompensationEventById({
    id: compensationEventId ?? '',
    enabled: !!compensationEventId,
  });
  // A PMI quotation names its instruction instead — the reference and project come off the
  // linked PMI, so the header names it and the mail rail scopes to the same project.
  const pmiId = quotationDto?.projectManagerInstructionId;
  const { data: linkedPmi } = useGetPmiDetail({
    id: pmiId ?? '',
    enabled: !!pmiId,
  });

  const isLoading =
    quotationLoading ||
    (!!compensationEventId && eventLoading) ||
    (!!projectAlertId && alertLoading);

  // The register's own reference wins once the record lands — the quotation screen's guess
  // (or the quotation's own `ceReference`) is only the fallback until then. Whichever
  // family the quotation belongs to, exactly one of the two lookups resolves.
  const reference =
    compensationEvent?.reference ??
    linkedPmi?.reference ??
    compensationEventReference ??
    quotationDto?.ceReference ??
    '';

  const documents = useCompensationEventDocuments({
    compensationEventId: compensationEventId ?? undefined,
    projectId: compensationEvent?.projectId ?? linkedPmi?.projectId,
  });

  const [lines, setLines] = useState<QuotationLine[]>([]);
  // The quoted cost and the risk allowance are rows of the card in their own right rather
  // than priced lines, so the PM's figure for each is held beside the lines.
  const [quotationAmount, setQuotationAmount] = useState<number | null>(null);
  const [riskAllowance, setRiskAllowance] = useState(0);
  const [days, setDays] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  // The PM records the assessment either as the editable line-item form or as a single
  // uploaded document — `isFile`/`quotationFile` on the wire mirror this toggle. The
  // line-item values still travel either way, since the backend prices off `items`.
  const [assessmentMethod, setAssessmentMethod] = useState<'form' | 'document'>('form');
  const [assessmentDocument, setAssessmentDocument] = useState<File | null>(null);

  // The claimed lines and the claimed delay are the PM's starting point, so both are
  // seeded once per quotation — a background refetch must not throw away an assessment
  // the PM is part way through.
  const seededQuotationId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!quotation || seededQuotationId.current === id) return;
    seededQuotationId.current = id;
    setLines(quotation.lines);
    setQuotationAmount(quotation.declaredTotal ?? null);
    setRiskAllowance(quotation.riskAllowance);
    // A quotation that claimed no time impact leaves the field empty rather than seeding
    // a zero the PM never proposed.
    setDays(quotation.delayClaimedDays || null);
  }, [quotation, id]);

  // The assessment states the same three rows the quotation card does — the quoted cost,
  // the priced lines and the allowance — each of them the PM's to reprice.
  const rows = useMemo(
    () => buildQuotationSummaryRows(lines, riskAllowance, quotationAmount),
    [lines, riskAllowance, quotationAmount]
  );
  const total = useMemo(() => getQuotationSummaryRowsTotal(rows), [rows]);
  // The card shows a dash when the PM has priced nothing; what gets exported and sent is
  // still a figure, and an assessment that priced nothing is an assessment for zero.
  const assessedTotal = total ?? 0;

  // The pencil reprices a row and nothing else — the description stays the contractor's
  // own words, so the PM's assessment is read against what was actually claimed. The
  // quoted cost and the allowance are not priced lines, so each is repriced on its own.
  const handleLineChange = (key: string, amount: number) => {
    if (key === 'quotation-amount') {
      setQuotationAmount(amount);
      return;
    }

    if (key === 'risk-allowance') {
      setRiskAllowance(amount);
      return;
    }

    setLines((current) => setQuotationRowAmount(current, key, amount));
  };

  // The workbook is the assessment as it stands on screen — the priced rows the PM has
  // edited, then the total, the proposed days and their comment. Nothing is fetched, so
  // it also works before the assessment has been implemented.
  const handleExport = () => {
    try {
      const stamp = dayjs().format(COMPENSATION_EVENT_EXPORT_COPY.fileTimestampFormat);
      const prefix = reference ? `${reference}-` : '';

      exportToXlsx({
        fileName: `${prefix}${COMPENSATION_EVENT_EXPORT_COPY.assessmentFileSuffix}-${stamp}`,
        sheetName: COMPENSATION_EVENT_EXPORT_COPY.assessmentSheetName,
        columns: buildAssessmentExportColumns(quotation?.currency),
        rows: buildAssessmentExportRows(lines, {
          total: assessedTotal,
          days,
          comment,
          quotationAmount,
          riskAllowance,
        }),
      });
    } catch {
      notification.error({ message: PM_ASSESSMENT_COPY.messages.exportFailed });
    }
  };

  // What the PM ends up sending is what the screen shows: the total is summed off the
  // assessed lines, and every priced row travels as its own item. The route id is the
  // quotation's own id, so it is always what the endpoint is keyed on.
  const isFile = assessmentMethod === 'document';

  // Checked before the popconfirm opens, so it only ever asks about an implementable assessment.
  const validateImplement = () => {
    if (!reference) {
      notification.error({ message: PM_ASSESSMENT_COPY.actions.linkRequired });
      return false;
    }
    if (isFile && !assessmentDocument) {
      notification.error({ message: PM_ASSESSMENT_COPY.messages.documentRequired });
      return false;
    }
    return true;
  };

  const performImplement = async () => {
    try {
      await proceedWithAssessment.mutateAsync({
        quotationId: id,
        assessedTotalCost: assessedTotal,
        // The field opens on the contractor's claimed delay and the PM edits it down or
        // up; empty means no time impact was claimed and none was assessed.
        assessedClaimDays: days ?? 0,
        comments: comment.trim(),
        items: buildAssessedQuotationItems(lines, { quotationAmount, riskAllowance }),
        isFile,
        quotationFile: isFile ? assessmentDocument : null,
        // The screen no longer collects supporting documents; the field stays on the
        // request so the payload shape the backend expects is unchanged.
        additionalFiles: [],
      });
      notification.success({ message: PM_ASSESSMENT_COPY.messages.implemented });
      // The assessment is the last step on this signal — land the PM back on the register,
      // where the event now shows as implemented.
      route.push(MENU_PATH.COMPENSATION_EVENT.pathname);
    } catch {
      // The global error handler surfaces the reason; keep the PM on their assessment.
      notification.error({ message: PM_ASSESSMENT_COPY.messages.implementFailed });
    }
  };

  // The compensation event names its own clause; the reference is whichever event the
  // quotation prices, so the chip names that one rather than the extractor's claim.
  const headerClause = useMemo(
    () => resolveClauseChip({ ...compensationEvent, reference: reference || undefined }),
    [compensationEvent, reference]
  );

  // The clause chip and the Implement button already name the event under assessment,
  // so the title stays bare rather than repeating the reference a third time.
  const header = (
    <CompensationEventPageHeader
      clause={headerClause}
      icon={<CopyOutlined />}
      title={PM_ASSESSMENT_COPY.header.title}
      extra={
        <Button icon={<ExportOutlined />} disabled={rows.length === 0} onClick={handleExport}>
          {PM_ASSESSMENT_COPY.header.export}
        </Button>
      }
    />
  );

  if (isLoading) {
    return (
      <ConfigProvider theme={QUOTATION_THEME}>
        <Flex vertical gap={24}>
          {header}
          <Skeleton active paragraph={{ rows: 8 }} />
        </Flex>
      </ConfigProvider>
    );
  }

  if (!quotation) {
    return (
      <ConfigProvider theme={QUOTATION_THEME}>
        <Flex vertical gap={24}>
          {header}
          <Result status="info" title={PM_ASSESSMENT_COPY.notFound} />
        </Flex>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={QUOTATION_THEME}>
      <Flex vertical gap={24}>
        {header}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Flex vertical gap={16}>
              {/* The compensation event's own summary, when the API sent one. */}
              <CompensationEventNoticeClauseBanner
                text={
                  compensationEvent?.summary?.trim() ||
                  compensationEvent?.description?.trim() ||
                  PM_ASSESSMENT_COPY.banner
                }
              />

              <Flex align="center" justify="end" gap={8}>
                <Tooltip title={PM_ASSESSMENT_COPY.method.tooltip}>
                  <InfoCircleOutlined style={{ color: QUOTATION_COLORS.textMuted }} />
                </Tooltip>
                <Radio.Group
                  value={assessmentMethod}
                  onChange={(event) => setAssessmentMethod(event.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { label: PM_ASSESSMENT_COPY.method.form, value: 'form' },
                    { label: PM_ASSESSMENT_COPY.method.document, value: 'document' },
                  ]}
                />
              </Flex>

              {assessmentMethod === 'form' ? (
                <>
                  <CompensationEventAssessmentLines
                    currency={quotation.currency}
                    rows={rows}
                    total={total}
                    onLineChange={handleLineChange}
                  />

                  <CompensationEventAssessmentDays
                    days={days}
                    onDaysChange={setDays}
                    hint={PM_ASSESSMENT_COPY.days.subtitle}
                    showSubtitle={false}
                  />
                </>
              ) : (
                <CompensationEventAssessmentUpload
                  file={assessmentDocument}
                  onFileChange={setAssessmentDocument}
                />
              )}

              <CompensationEventAssessmentComment value={comment} onChange={setComment} />
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <Flex vertical gap={16}>
              <CompensationEventNoticeDocumentsCommunication
                timeBar={quotation.timeBar}
                emailCount={documents.emailCount}
                attachmentCount={documents.attachmentCount}
                onOpenEmailThread={documents.openThread}
                onViewAttachments={documents.openAttachments}
              />
              <CompensationEventAssessmentActions
                reference={reference}
                implementing={proceedWithAssessment.isPending}
                disabled={!reference}
                onValidate={validateImplement}
                onImplement={performImplement}
                confirmDescription={compensationEvent?.title || reference}
              />
            </Flex>
          </Col>
        </Row>

        <EmailThreadModal
          open={documents.threadOpen}
          projectId={documents.projectId}
          conversationId={documents.conversationId}
          subjectFallback={compensationEvent?.title ?? quotation.reference}
          onClose={documents.closeThread}
        />

        <CompensationEventAttachmentsModal
          open={documents.attachmentsOpen}
          files={documents.attachmentFiles}
          loading={documents.attachmentsLoading}
          onDownload={documents.downloadFile}
          onClose={documents.closeAttachments}
        />
      </Flex>
    </ConfigProvider>
  );
};

export default CompensationEventAssessmentPage;
