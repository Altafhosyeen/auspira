'use client';

import { FileOutlined } from '@ant-design/icons';
import { Col, ConfigProvider, Flex, Result, Row, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { useGetProjectAlertById } from '@/hooks/modules/project-alerts';
import { useGetPmiDetail } from '@/modules/pmi';
import { useProjectStore } from '@/store/project.store';
import { useQuotationLinkBridgeStore } from '@/store/quotation.store';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_THEME } from '../constants/compensation-event-quotation.theme';
import { useAlertConversationDocuments } from '../hooks/use-alert-conversation-documents';
import { useGetCompensationEventById } from '../hooks/use-compensation-events';
import { useQuotationLinkActions } from '../hooks/use-quotation-link-actions';
import {
  type QuotationLinkKind,
  useQuotationLinkOptions,
} from '../hooks/use-quotation-link-options';
import {
  resolveAlertClauseChip,
  toAlertClauseSource,
} from '../utils/compensation-event-clause.utils';
import {
  buildQuotationSummaryRows,
  formatQuotationDaysClaimed,
  getQuotationSummaryRowsTotal,
} from '../utils/compensation-event-quotation.utils';
import { toContractorQuotationFromAlert } from '../utils/compensation-event-quotation-alert.utils';
import CompensationEventAssessmentDays from './compensation-event-assessment-days';
import CompensationEventAttachmentsModal from './compensation-event-attachments-modal';
import CompensationEventNoticeClauseBanner from './compensation-event-notice-clause-banner';
import CompensationEventNoticeDocumentsCommunication from './compensation-event-notice-documents-communication';
import CompensationEventPageHeader from './compensation-event-page-header';
import CompensationEventQuotationActions from './compensation-event-quotation-actions';
import CompensationEventQuotationLinkCards from './compensation-event-quotation-link-cards';
import CompensationEventQuotationProgrammeImpact from './compensation-event-quotation-programme-impact';
import CompensationEventQuotationSubmittedBy from './compensation-event-quotation-submitted-by';
import CompensationEventQuotationSummaryCard from './compensation-event-quotation-summary-card';
import CompensationEventRequestRevisionModal from './compensation-event-request-revision-modal';

interface CompensationEventQuotationPageProps {
  // The signal the quotation arrived on — the screen is read off that alert.
  id: string;
  // The accept/revision endpoints take the alert the quotation arrived on; the route
  // already carries it, so this only overrides which alert they act on.
  projectAlertId?: string;
}

// Container — owns the fetch; every total is derived from the quotation's own lines and
// allowance rather than read off a pre-computed figure.
const CompensationEventQuotationPage = ({
  id,
  projectAlertId,
}: CompensationEventQuotationPageProps) => {
  const { data: alert, isLoading } = useGetProjectAlertById({ id });

  // Which record type the quotation belongs to is read off the refs the extractor wrote
  // onto the signal, not the alert type: a CE reference names a compensation event, a PMI
  // reference a project manager's instruction, and both/neither leave it to the PM to pick.
  const [pickedKind, setPickedKind] = useState<Exclude<QuotationLinkKind, 'both'> | undefined>();
  const hasCeRef = Boolean(alert?.compensationEventReference?.trim());
  const hasPmiRef = Boolean(alert?.pmiReference?.trim());
  const linkKind: QuotationLinkKind =
    pickedKind ?? (hasCeRef && !hasPmiRef ? 'ce' : hasPmiRef && !hasCeRef ? 'pmi' : 'both');
  const isPmi = linkKind === 'pmi';

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [linkedEventId, setLinkedEventId] = useState<string>();
  // Set once the picked event has actually been confirmed against the alert — a fresh
  // pick from the dropdown clears it, so the Confirm button reappears for the new choice.
  const [confirmedEventId, setConfirmedEventId] = useState<string>();
  // The id confirm handed back — once it lands, the register's own record of the
  // quotation replaces the extractor's guess at what the mail said.
  const [confirmedQuotationId, setConfirmedQuotationId] = useState<string>();

  // Only the seeded match is read back, never a manual pick. On a reload the picker is
  // seeded from the mail's reference, and this read is the only way to tell a link the PM
  // already confirmed from one still waiting on the button. A pick from the dropdown needs
  // no such read: `performConfirmReference` takes the quotation id straight off the confirm
  // response. Fetching on every pick would spend two requests answering a question the PM
  // has not asked yet — and a picked event that already carries a quotation would swap the
  // figures on screen for that other quotation's before the link was ever confirmed.
  const seededEventId = pickedKind ? undefined : linkedEventId;

  const { data: linkedEvent } = useGetCompensationEventById({
    id: seededEventId ?? '',
    enabled: !isPmi && !!seededEventId,
  });

  const { data: linkedPmi } = useGetPmiDetail({
    id: seededEventId ?? '',
    enabled: isPmi && !!seededEventId,
  });

  // Guarded on the same id the reads above used, so a result that arrived for the seeded
  // match can never be applied to a record the PM picked after it.
  useEffect(() => {
    if (!seededEventId) return;
    if (isPmi) {
      if (!linkedPmi?.quotationId || linkedPmi.id !== seededEventId) return;
      setConfirmedEventId(linkedPmi.id);
      setConfirmedQuotationId(linkedPmi.quotationId);
    } else {
      if (!linkedEvent?.quotationId || linkedEvent.id !== seededEventId) return;
      setConfirmedEventId(linkedEvent.id);
      setConfirmedQuotationId(linkedEvent.quotationId);
    }
  }, [isPmi, linkedPmi, linkedEvent, seededEventId]);

  // Always the extractor's own read of the alert's mail — this screen is the signal's
  // view of the quotation, so it never swaps in the register's persisted record even
  // once the link is confirmed.
  const quotation = useMemo(
    () => (alert ? toContractorQuotationFromAlert(alert) : undefined),
    [alert]
  );

  const router = useRouter();
  const selectedProjectId = useProjectStore((store) => store.selectedProjectId);
  const setLinkedReference = useQuotationLinkBridgeStore(
    (store) => store.setLinkedCompensationEventReference
  );
  const setLinkedQuotationId = useQuotationLinkBridgeStore((store) => store.setLinkedQuotationId);
  const setLinkedProjectAlertId = useQuotationLinkBridgeStore(
    (store) => store.setLinkedProjectAlertId
  );

  // The quotation arrived as a mail on this alert's thread, so the side rail lists that
  // thread and its files alongside the time bar.
  const documents = useAlertConversationDocuments(alert);

  // The mail's reference is free text the extractor copied out of it, so it only counts as
  // a link once it matches one of the project's own events/instructions; the picker is how
  // the PM settles it when it does not.
  const {
    ceOptions,
    pmiOptions,
    matchedCeId,
    matchedPmiId,
    linkedReference,
    isLoading: eventOptionsLoading,
  } = useQuotationLinkOptions({
    kind: linkKind,
    quotationReference: quotation?.reference,
    linkedEventId,
  });

  // The lookup resolves after mount, so a match seeds the picker when it lands — never
  // over an event the PM has already picked. It is only a text match though, so the PM
  // still has to hit Confirm to actually link the quotation to it. When the signal names
  // neither (or both), the cards stay empty and the PM settles the kind by picking.
  useEffect(() => {
    // Only the extractor's own kind seeds. Once the PM has picked, `pickedKind` owns the
    // choice and this must not fire again — picking changes `linkKind`, so without the
    // guard the effect re-runs on every pick and re-seeds the reference just cleared.
    if (pickedKind) return;
    const matched = linkKind === 'pmi' ? matchedPmiId : linkKind === 'ce' ? matchedCeId : undefined;
    if (!matched) return;
    setLinkedEventId((current) => current ?? matched);
  }, [pickedKind, linkKind, matchedCeId, matchedPmiId]);

  // Both endpoints are keyed on the alert; the route id is that alert, so an explicit
  // ?alertId only has to override it.
  const alertId = projectAlertId ?? alert?.id;

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

  // A fresh pick from the dropdown always needs its own confirmation, even if it happens
  // to be the reference the matcher already seeded. The pick also settles which record
  // type the quotation belongs to when the signal left it open.
  const handleReferenceChange =
    (kind: Exclude<QuotationLinkKind, 'both'>) => (compensationEventId?: string) => {
      // `allowClear` fires with no id. Clearing has to release the kind as well, or a
      // signal that named neither record stays locked to whichever card was picked first
      // and the other one never comes back.
      setPickedKind(compensationEventId ? kind : undefined);
      setLinkedEventId(compensationEventId);
      setConfirmedEventId(undefined);
      setConfirmedQuotationId(undefined);
    };

  // Accept, link and revision are one-way, so each button asks through a popconfirm that
  // names the record — the alert's own title from the API.
  const confirmDescription = alert?.title;

  // The route still carries the confirmed quotation's id — accept/revision key on it — but
  // the assessment screen's card reads off this alert, same as this screen does, so the
  // alert id rides the bridge store alongside the reference. Only reached once the event is
  // actually confirmed, same as Accept/Request revision.
  const handleProceedToAssessment = () => {
    if (!confirmedEventId || !linkedReference || !confirmedQuotationId || !alert) return;
    setLinkedReference(linkedReference);
    setLinkedQuotationId(confirmedQuotationId);
    setLinkedProjectAlertId(alert.id);
    router.push(`/contract-control-agent/compensation-event/${confirmedQuotationId}/assessment`);
  };

  // The signal names itself and explains its own clause; the screen's own copy is only
  // the fallback for the title, and the clause chip is dropped when the alert carries none.
  const headerClause = useMemo(() => resolveAlertClauseChip(alert), [alert]);
  // Every quotation action sends the clause it was raised under back to the backend —
  // the alert's own read of it, same source the header chip resolves from.
  const alertClauseSource = useMemo(() => toAlertClauseSource(alert), [alert]);

  // Confirm/accept/revision all key on the alert and the confirmed link, so they live
  // together in one hook rather than being spelled out again per action here.
  const {
    performConfirmReference,
    performSendRevisionRequest,
    performAccept,
    confirmingCe,
    confirmingPmi,
    accepting,
    sendingRevision,
  } = useQuotationLinkActions({
    alertId,
    linkedEventId,
    confirmedQuotationId,
    isPmi,
    alertClauseSource,
    onConfirmed: (eventId, quotationId) => {
      setConfirmedEventId(eventId);
      setConfirmedQuotationId(quotationId);
    },
    onRevisionSent: () => setRevisionModalOpen(false),
  });

  const header = (
    <CompensationEventPageHeader
      title={alert?.title?.trim() || CONTRACTOR_QUOTATION_COPY.header.title}
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
          <Result status="info" title={CONTRACTOR_QUOTATION_COPY.notFound} />
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
            <Flex vertical gap={24}>
              {/* The extractor's summary of the mail, when it read one off the signal. */}
              <CompensationEventNoticeClauseBanner
                text={
                  alert?.summary?.trim() ||
                  alert?.description?.trim() ||
                  CONTRACTOR_QUOTATION_COPY.banner
                }
              />

              {/* The rail's link card already names the linked event, so the heading
                  here stays bare rather than repeating the reference. */}
              <CompensationEventQuotationSummaryCard
                submittedOn={quotation.submittedOn}
                currency={quotation.currency}
                rows={rows}
                total={total}
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

          <Col xs={24} lg={8}>
            <Flex vertical gap={16}>
              <CompensationEventNoticeDocumentsCommunication
                timeBar={quotation.timeBar}
                emailCount={documents.emailCount}
                attachmentCount={documents.attachmentCount}
                onOpenEmailThread={documents.openThread}
                onViewAttachments={documents.openAttachments}
              />

              <CompensationEventQuotationLinkCards
                linkKind={linkKind}
                reference={quotation.reference}
                ceOptions={ceOptions}
                pmiOptions={pmiOptions}
                optionsLoading={eventOptionsLoading}
                selectedReferenceId={linkedEventId}
                confirmedReferenceId={confirmedEventId}
                onReferenceChange={handleReferenceChange}
                onConfirmReference={performConfirmReference}
                confirmingCe={confirmingCe}
                confirmingPmi={confirmingPmi}
              />

              {/* Held back entirely until the picked event is confirmed — acting on a
                  reference that was never linked would settle the wrong compensation event. */}
              {confirmedEventId && (
                <CompensationEventQuotationActions
                  onAccept={performAccept}
                  accepting={accepting}
                  confirmDescription={confirmDescription}
                  onProceedToAssessment={handleProceedToAssessment}
                  showProceedToAssessment
                  onRequestRevision={() => setRevisionModalOpen(true)}
                  disabled={!linkedReference}
                />
              )}
            </Flex>
          </Col>
        </Row>

        <EmailThreadModal
          open={documents.threadOpen}
          projectId={documents.projectId}
          conversationId={documents.conversationId}
          subjectFallback={alert?.title}
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
          sending={sendingRevision}
          onCancel={() => setRevisionModalOpen(false)}
          onConfirm={performSendRevisionRequest}
          confirmDescription={confirmDescription}
        />
      </Flex>
    </ConfigProvider>
  );
};

export default CompensationEventQuotationPage;
