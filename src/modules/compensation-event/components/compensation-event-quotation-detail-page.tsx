'use client';

import { FileOutlined } from '@ant-design/icons';
import { Col, ConfigProvider, Flex, notification, Result, Row, Skeleton } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { isDeadlineOverdue } from '@/components/shared/documents-communication';
import { QuotationStatus } from '@/constants/enum.constant';
import { MENU_PATH } from '@/constants/routes.constants';
import { useGetProjectTasksByEntity } from '@/hooks/modules/project-tasks';
import { toLocalDayjs } from '@/lib/utils/datetime';
import {
  useAcceptPmiQuotation,
  useGetPmiDetail,
  useRequestPmiQuotationRevision,
} from '@/modules/pmi';
import { useProjectStore } from '@/store/project.store';
import { useQuotationLinkBridgeStore } from '@/store/quotation.store';
import {
  CONTRACTOR_QUOTATION_COPY,
  QUOTATION_STATUS_LABELS,
} from '../constants/compensation-event-quotation.constants';
import { QUOTATION_THEME } from '../constants/compensation-event-quotation.theme';
import { useGetCompensationEventById } from '../hooks/use-compensation-events';
import { useCompensationEventDocuments } from '../hooks/use-conversation-documents';
import { useAcceptQuotation, useRequestQuotationRevision } from '../hooks/use-quotation';
import { useGetQuotationById } from '../hooks/use-quotations';
import { resolveClauseChip } from '../utils/compensation-event-clause.utils';
import { getTimeBarForDeadline } from '../utils/compensation-event-notice.utils';
import {
  buildQuotationSummaryRows,
  formatQuotationDaysClaimed,
  getQuotationSummaryRowsTotal,
  toContractorQuotation,
} from '../utils/compensation-event-quotation.utils';
import CompensationEventAssessmentDays from './compensation-event-assessment-days';
import CompensationEventAttachmentsModal from './compensation-event-attachments-modal';
import CompensationEventNoticeClauseBanner from './compensation-event-notice-clause-banner';
import CompensationEventNoticeDocumentsCommunication from './compensation-event-notice-documents-communication';
import CompensationEventPageHeader from './compensation-event-page-header';
import CompensationEventQuotationActions from './compensation-event-quotation-actions';
import CompensationEventQuotationProgrammeImpact from './compensation-event-quotation-programme-impact';
import CompensationEventQuotationSubmittedBy from './compensation-event-quotation-submitted-by';
import CompensationEventQuotationSummaryCard from './compensation-event-quotation-summary-card';
import CompensationEventRequestRevisionModal from './compensation-event-request-revision-modal';

const { quotation: quotationCopy, detail: detailCopy } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationDetailPageProps {
  /** The quotation's own id — GET /api/quotations/{id} is the whole screen. */
  id: string;
}

// Container — the register already knows which compensation event the quotation belongs
// to, so this screen has no reference picker. Accept/revise/proceed act on the quotation
// id alone (the backend's own accept/revision DTOs need nothing else), and only show
// while the quotation is still pending review.
const CompensationEventQuotationDetailPage = ({
  id,
}: CompensationEventQuotationDetailPageProps) => {
  const { data: dto, isLoading } = useGetQuotationById({ id });
  const router = useRouter();
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const acceptQuotation = useAcceptQuotation();
  const requestRevision = useRequestQuotationRevision();
  const acceptPmiQuotation = useAcceptPmiQuotation();
  const requestPmiRevision = useRequestPmiQuotationRevision();
  const setLinkedReference = useQuotationLinkBridgeStore(
    (store) => store.setLinkedCompensationEventReference
  );
  const setLinkedQuotationId = useQuotationLinkBridgeStore((store) => store.setLinkedQuotationId);

  const quotation = useMemo(() => (dto ? toContractorQuotation(dto) : undefined), [dto]);

  // Which family the quotation belongs to is read off the record itself: a PMI quotation
  // names its instruction, a CE quotation its compensation event — exactly one is set.
  const isPmi = !!dto?.projectManagerInstructionId;

  // The linked record resolves the confirm subject, the clause chip and the mail rail's
  // scoping — whichever type the quotation prices.
  const compensationEventId = dto?.compensationEventId;
  const { data: compensationEvent } = useGetCompensationEventById({
    id: compensationEventId ?? '',
    enabled: !isPmi && !!compensationEventId,
  });
  const { data: linkedPmi } = useGetPmiDetail({
    id: dto?.projectManagerInstructionId ?? '',
    enabled: isPmi && !!dto?.projectManagerInstructionId,
  });
  // One view over both record types, fully normalised: the same fields with the same
  // optionality whichever family the quotation belongs to, so every consumer — subject,
  // clause chip, banner, documents hook — reads one shape without null-coalescing.
  const linkedSubject = useMemo(() => {
    if (isPmi) {
      return linkedPmi
        ? {
            id: linkedPmi.id,
            projectId: linkedPmi.projectId,
            reference: linkedPmi.reference,
            title: linkedPmi.title,
            summary: undefined,
            description: linkedPmi.details,
            clauseNumber: linkedPmi.clauseNumber ?? undefined,
            clauseTitle: linkedPmi.clauseTitle ?? undefined,
            clauseDescription: undefined,
          }
        : undefined;
    }
    return compensationEvent
      ? {
          id: compensationEvent.id,
          projectId: compensationEvent.projectId,
          reference: compensationEvent.reference,
          title: compensationEvent.title,
          summary: compensationEvent.summary,
          description: compensationEvent.description,
          clauseNumber: compensationEvent.clauseNumber ?? undefined,
          clauseTitle: compensationEvent.clauseTitle ?? undefined,
          clauseDescription: compensationEvent.clauseDescription ?? undefined,
        }
      : undefined;
  }, [isPmi, linkedPmi, compensationEvent]);

  // Only the Watchtower queue links here with `from=watchtower`; every other entry point
  // (the CE register, the financial summary) leaves the deadline lookup unfetched.
  const searchParams = useSearchParams();
  const fromWatchtower = searchParams.get('from') === 'watchtower';
  // The queue row carries its own lifecycle stage so the lookup asks for that stage's task
  // rather than every task on the entity. A link raised without one stays unnarrowed.
  const rawStage = searchParams.get('stage');
  const stage = rawStage && Number.isFinite(Number(rawStage)) ? Number(rawStage) : undefined;
  // The task lookup is scoped to the project selected in the header dropdown — the queue the
  // link came from is itself listed per selected project, so that is the project whose tasks
  // this deadline belongs to.
  const selectedProjectId = useProjectStore((store) => store.selectedProjectId);

  const { data: entityTasks } = useGetProjectTasksByEntity({
    projectId: selectedProjectId ?? undefined,
    entityId: linkedSubject?.id,
    stage,
    enabled: fromWatchtower && !!selectedProjectId,
  });

  // The queue row's own task is the first the endpoint returns.
  const dueTask = entityTasks?.[0];

  const documents = useCompensationEventDocuments({
    compensationEventId: isPmi ? undefined : (compensationEventId ?? undefined),
    projectId: linkedSubject?.projectId,
  });

  // The queue's deadline is read as the same Time Bar tile the notice screen shows, so the
  // clock the queue row was tracking keeps its own look once the quotation is opened.
  const dueDateTime = dueTask?.dueDateTime ?? dueTask?.dueDate;
  const timeBar = useMemo(
    () =>
      fromWatchtower && dueDateTime ? getTimeBarForDeadline(toLocalDayjs(dueDateTime)) : undefined,
    [fromWatchtower, dueDateTime]
  );

  // Counted in whole days off the same deadline the tile reads, so "0 days remaining" always
  // means the actions are still open and the lock lands the day after the deadline.
  const overdue = !!timeBar && isDeadlineOverdue(dueDateTime);

  // The rail carries the deadline tile, the mail thread and its files, and — while the
  // quotation is still pending — the accept/revise/proceed actions; with none of them there
  // is no rail, and the quotation itself takes the whole row.
  const isPendingReview = dto?.status === QuotationStatus.PendingReview;
  const hasDocuments = !!(documents.emailCount || documents.attachmentCount || timeBar);
  const hasRail = hasDocuments || isPendingReview;

  // The card states the quotation flat, so there is nothing to expand — the rows are just
  // the priced lines in the order the contractor sent them, with the allowance last.
  const rows = useMemo(
    () =>
      buildQuotationSummaryRows(
        quotation?.lines ?? [],
        quotation?.riskAllowance ?? 0,
        quotation?.declaredTotal
      ),
    [quotation]
  );
  const total = useMemo(() => getQuotationSummaryRowsTotal(rows), [rows]);

  // The backend's accept/revision DTOs only read the quotation's own id — the rest of
  // AcceptQuotationInput/RequestQuotationRevisionInput is UI-side context the register's
  // signal-based screen fills in and this record view has none of. PMI quotations go
  // through the PMI endpoints, which take the quotation id alone.
  const performAccept = async () => {
    if (!dto) return;

    try {
      if (isPmi) {
        await acceptPmiQuotation.mutateAsync({ quotationId: dto.id });
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.accepted });
        router.replace('/contract-control-agent/project-management-instruction');
      } else {
        await acceptQuotation.mutateAsync({
          quotationId: dto.id,
          clauseNumber: linkedSubject?.clauseNumber,
          clauseTitle: linkedSubject?.clauseTitle,
          clauseDescription: linkedSubject?.clauseDescription ?? undefined,
        });
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.accepted });
        // Accepting settles the quotation, so this record view no longer reflects what the
        // user can act on — land them on the register, same as a revision request does.
        router.replace(MENU_PATH.COMPENSATION_EVENT.pathname);
      }
    } catch {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.acceptFailed });
    }
  };

  // The modal collects no subject of its own — the endpoint still requires one, so every
  // request goes out under the same fixed line.
  const performSendRevisionRequest = async (values: { comment: string; attachments: File[] }) => {
    if (!dto) return;

    try {
      if (isPmi) {
        await requestPmiRevision.mutateAsync({
          quotationId: dto.id,
          subject: CONTRACTOR_QUOTATION_COPY.revisionEmail.subject,
          description: values.comment,
          attachments: values.attachments,
        });
        setRevisionModalOpen(false);
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionRequested });
        router.replace('/contract-control-agent/project-management-instruction');
      } else {
        await requestRevision.mutateAsync({
          quotationId: dto.id,
          subject: CONTRACTOR_QUOTATION_COPY.revisionEmail.subject,
          description: values.comment,
          attachments: values.attachments,
          clauseNumber: linkedSubject?.clauseNumber,
          clauseTitle: linkedSubject?.clauseTitle,
          clauseDescription: linkedSubject?.clauseDescription ?? undefined,
        });
        setRevisionModalOpen(false);
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionRequested });
        // The event now sits in the register awaiting the revised quotation, so send the
        // user there rather than leaving them on the superseded quotation.
        router.replace(MENU_PATH.COMPENSATION_EVENT.pathname);
      }
    } catch {
      // Keep the modal open so the comment is not lost on a failed send.
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionFailed });
    }
  };

  // Both actions are one-way from the contractor's side — accepting settles the record and
  // a revision request re-opens it — so each popconfirm names the linked record from the API.
  const confirmDescription =
    linkedSubject?.title || linkedSubject?.reference || quotation?.reference;

  // directly, and the reference still rides the bridge store as a fast-path fallback.
  const handleProceedToAssessment = () => {
    if (!linkedSubject || !dto) return;
    setLinkedReference(linkedSubject.reference);
    setLinkedQuotationId(dto.id);
    router.push(`/contract-control-agent/compensation-event/${dto.id}/assessment`);
  };

  // Where the quotation stands — it has no slot of its own on screen, so it rides the card's
  // muted line. The revision number sat here too but read as noise next to the reference.
  const note = useMemo(
    () => (dto?.status == null ? '' : QUOTATION_STATUS_LABELS[dto.status]),
    [dto?.status]
  );

  // The quotation carries no clause of its own — the record it prices is what cites one.
  const headerClause = useMemo(() => resolveClauseChip(linkedSubject), [linkedSubject]);

  // The quotation names itself by the event it prices; the screen's own copy is only the
  // fallback for a response that carries no reference.
  const header = (
    <CompensationEventPageHeader
      title={
        quotation?.reference?.trim()
          ? `${quotationCopy.titlePrefix} ${quotation.reference.trim()}`
          : quotationCopy.title
      }
      clause={headerClause}
      icon={<FileOutlined />}
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
          <Result status="info" title={detailCopy.notFound} />
        </Flex>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={QUOTATION_THEME}>
      <Flex vertical gap={24}>
        {header}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={hasRail ? 16 : 24}>
            <Flex vertical gap={24}>
              {/* The compensation event's own summary, when the API sent one; the
                  standing explainer covers a record raised with none. */}
              <CompensationEventNoticeClauseBanner
                text={
                  linkedSubject?.summary?.trim() ||
                  linkedSubject?.description?.trim() ||
                  detailCopy.banner
                }
              />

              <CompensationEventQuotationSummaryCard
                // The page header already names the event, so this card doesn't repeat it.
                submittedOn={quotation.submittedOn}
                currency={quotation.currency}
                rows={rows}
                total={total}
                note={note || undefined}
              />

              {/* The delay the contractor claimed, stated rather than collected — the
                  quotation is their submission, so the PM proposes their own figure on
                  the assessment screen instead of editing this one. */}
              <CompensationEventAssessmentDays
                readOnlyValue={formatQuotationDaysClaimed(quotation.delayClaimedDays)}
                hint={CONTRACTOR_QUOTATION_COPY.quotation.daysHint}
                showSubtitle={false}
              />

              <CompensationEventQuotationProgrammeImpact entries={quotation.programmeImpact} />

              <CompensationEventQuotationSubmittedBy submissions={quotation.submittedBy} />
            </Flex>
          </Col>

          {hasRail && (
            <Col xs={24} lg={8}>
              <Flex vertical gap={16}>
                {hasDocuments && (
                  <CompensationEventNoticeDocumentsCommunication
                    timeBar={timeBar}
                    emailCount={documents.emailCount}
                    attachmentCount={documents.attachmentCount}
                    onOpenEmailThread={documents.openThread}
                    onViewAttachments={documents.openAttachments}
                  />
                )}

                {isPendingReview && (
                  <CompensationEventQuotationActions
                    onAccept={performAccept}
                    confirmDescription={confirmDescription}
                    accepting={isPmi ? acceptPmiQuotation.isPending : acceptQuotation.isPending}
                    onProceedToAssessment={handleProceedToAssessment}
                    showProceedToAssessment
                    onRequestRevision={() => setRevisionModalOpen(true)}
                    disabled={!linkedSubject}
                    overdue={overdue}
                  />
                )}
              </Flex>
            </Col>
          )}
        </Row>

        <EmailThreadModal
          open={documents.threadOpen}
          projectId={documents.projectId}
          conversationId={documents.conversationId}
          subjectFallback={linkedSubject?.title ?? quotation.reference}
          onClose={documents.closeThread}
        />

        <CompensationEventAttachmentsModal
          open={documents.attachmentsOpen}
          files={documents.attachmentFiles}
          loading={documents.attachmentsLoading}
          onDownload={documents.downloadFile}
          onClose={documents.closeAttachments}
        />

        <CompensationEventRequestRevisionModal
          open={revisionModalOpen}
          sending={requestRevision.isPending}
          onCancel={() => setRevisionModalOpen(false)}
          onConfirm={performSendRevisionRequest}
          confirmDescription={confirmDescription}
        />
      </Flex>
    </ConfigProvider>
  );
};

export default CompensationEventQuotationDetailPage;
