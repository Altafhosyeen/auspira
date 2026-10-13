'use client';

import { FileAddOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Col, ConfigProvider, Flex, Form, notification, Row } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import { MENU_PATH } from '@/constants/routes.constants';
import { useGetEarlyWarningById } from '@/hooks/modules/early-warning';
import { useGetProjectById } from '@/hooks/modules/project';
import { useGetProjectAlertById } from '@/hooks/modules/project-alerts';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { useProjectAlertBridgeStore } from '@/store/project-alert.store';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';
import { NOTICE_THEME } from '../constants/compensation-event-notice.theme';
import { useAlertConversationDocuments } from '../hooks/use-alert-conversation-documents';
import { useCreateCompensationEventNotice } from '../hooks/use-compensation-events';
import { useGetEventClauseOptions } from '../hooks/use-event-clauses';
import type {
  CompensationEventNoticeFormValues,
  EarlyWarningNoticeSource,
} from '../types/compensation-event-notice.types';
import {
  splitContractClause,
  toCompensationEventNoticeInput,
} from '../utils/compensation-event-api.utils';
import {
  resolveClauseChip,
  toAlertClauseSource,
  toClauseNumber,
} from '../utils/compensation-event-clause.utils';
import { getTimeBarForDeadline, isTimeBarRunning } from '../utils/compensation-event-notice.utils';
import {
  getAlertClauseSource,
  getAlertDeadline,
  getAlertEventDetailLines,
  matchClauseOption,
  toAlertClauseOption,
  toEarlyWarningNoticeInitialValues,
  toNoticeInitialValues,
  withAlertClauseOption,
} from '../utils/compensation-event-notice-prefill.utils';
import CompensationEventAttachmentsModal from './compensation-event-attachments-modal';
import CompensationEventNoticeActions from './compensation-event-notice-actions';
import CompensationEventNoticeClauseBanner from './compensation-event-notice-clause-banner';
import CompensationEventNoticeDocumentsCommunication from './compensation-event-notice-documents-communication';
import CompensationEventNoticeForm from './compensation-event-notice-form';
import CompensationEventPageHeader from './compensation-event-page-header';

const copy = COMPENSATION_EVENT_NOTICE_COPY.messages;

interface CompensationEventNoticePageProps {
  // Set when the screen is opened from a signal ("Accept & register") — the notice is then
  // seeded from that alert instead of starting blank.
  projectAlertId?: string;
  // Set when the screen is opened from an Early Warning ("CE trigger identified — link CE").
  // The EW is the other prefill source; the clause comes from the modal that sent the user
  // here. Both ride the URL so a refresh does not lose the hand-off.
  earlyWarningId?: string;
  ceClause?: string;
}

// Container — owns the form instance, attachments and submit state; delegates
// rendering to the presentational section components.
const CompensationEventNoticePage = ({
  projectAlertId,
  earlyWarningId,
  ceClause,
}: CompensationEventNoticePageProps) => {
  const router = useRouter();
  const [form] = Form.useForm<CompensationEventNoticeFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const values = Form.useWatch([], form);

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const currentUserEmail = useAuthStore((state) => state.user?.email);
  const { data: project } = useGetProjectById({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  // The type select is a fixed enum lookup; only the clause list is project-scoped.
  const { data: clauseOptions, isLoading: clausesLoading } = useGetEventClauseOptions({
    projectId: selectedProjectId ?? undefined,
  });

  // Contact persons for the selected project — the To / From / CC / BCC suggestion lists.
  const {
    options: recipientOptions,
    isLoading: recipientsLoading,
    noRecipientsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  // Signal Review hands the alert over through the bridge store so the prefill lands with no
  // round trip; the ?alertId on the URL is the durable copy, so a refresh re-fetches it.
  const [bridgeAlert] = useState(() => {
    const pending = useProjectAlertBridgeStore.getState().pendingProjectAlert;
    return pending && (!projectAlertId || pending.id === projectAlertId) ? pending : null;
  });
  useEffect(() => {
    useProjectAlertBridgeStore.getState().setPendingProjectAlert(null);
  }, []);

  const { data: fetchedAlert } = useGetProjectAlertById({
    id: projectAlertId ?? '',
    enabled: !!projectAlertId && !bridgeAlert,
  });
  const sourceAlert = bridgeAlert ?? fetchedAlert ?? null;

  // The Early Warning a CE was raised off — the second prefill source. Fetched rather than
  // bridged: the EW detail screen the modal opened over has already loaded it, so React Query
  // serves it from cache on the shared key and a refresh still re-fetches it.
  const { data: earlyWarning } = useGetEarlyWarningById<EarlyWarningNoticeSource>({
    id: earlyWarningId ?? '',
    enabled: !!earlyWarningId,
  });

  // Seeded once — everything typed after that belongs to the user, so a late-arriving fetch
  // must not overwrite it. One ref for both sources: a notice is raised from a signal or from
  // an Early Warning, never from both.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!sourceAlert || prefilled.current) return;
    prefilled.current = true;
    form.setFieldsValue(toNoticeInitialValues(sourceAlert));
  }, [sourceAlert, form]);

  useEffect(() => {
    if (!earlyWarning || prefilled.current) return;
    prefilled.current = true;

    const values = toEarlyWarningNoticeInitialValues(earlyWarning);
    form.setFieldsValue({
      ...values,
      from: currentUserEmail || values.from,
    });
  }, [earlyWarning, form, currentUserEmail]);

  // The clause the PM already filled in on the Close Early Warning modal. It arrives with
  // the first render, so it is set on mount rather than waiting on the EW fetch — and only
  // on mount, so retyping it here sticks.
  const handoffSeeded = useRef(false);
  useEffect(() => {
    if (handoffSeeded.current) return;
    handoffSeeded.current = true;
    if (ceClause) form.setFieldValue('relevantContractClause', ceClause);
  }, [ceClause, form]);

  // The clause the extracted CE names, as an option of its own — the extractor quotes NEC
  // clauses ("60 - Compensation events") that a project's catalogue does not always carry,
  // and a value the select does not hold can be neither shown nor submitted.
  const alertClauseOption = useMemo(
    () => (sourceAlert ? toAlertClauseOption(sourceAlert) : undefined),
    [sourceAlert]
  );
  const clauseSelectOptions = useMemo(
    () => withAlertClauseOption(clauseOptions, alertClauseOption),
    [clauseOptions, alertClauseOption]
  );

  // The clause is matched separately: the project's clauses land after the form mounts, so
  // matching while they load would find nothing and leave the field blank.
  const clausePrefilled = useRef(false);
  useEffect(() => {
    if (!sourceAlert || clausesLoading || clausePrefilled.current) return;
    const clauseSource = getAlertClauseSource(sourceAlert);
    if (!clauseSource) return;

    clausePrefilled.current = true;
    // The catalogue entry when the project has one for that clause, else the signal's own
    // option — which `clauseSelectOptions` has already put in the list.
    const clause = matchClauseOption(clauseSource, clauseSelectOptions) ?? alertClauseOption?.value;
    if (clause) form.setFieldValue('relevantContractClause', clause);
  }, [sourceAlert, clauseSelectOptions, alertClauseOption, clausesLoading, form]);

  const documents = useAlertConversationDocuments(sourceAlert);

  const createNotice = useCreateCompensationEventNotice();

  // What the extractor read out of the mail that the form has no field for — shown read-only
  // in the side rail so it is not lost between the signal and the notice.
  const eventDetailLines = useMemo(
    () => (sourceAlert ? getAlertEventDetailLines(sourceAlert) : []),
    [sourceAlert]
  );

  // The headline chip follows the form: the clause the PM has actually picked, falling back
  // to the signal's own read while the field is still empty. The alert's sentence only rides
  // along while the picked clause is still the one the extractor named.
  const headerClause = useMemo(() => {
    const alertSource = toAlertClauseSource(sourceAlert);
    const reference = alertSource?.reference;
    const picked = values?.relevantContractClause?.trim() || ceClause?.trim();
    if (!picked) return resolveClauseChip(alertSource && { ...alertSource, reference });

    const { number, title } = splitContractClause(picked);
    const matchesAlert = toClauseNumber(picked) === toClauseNumber(alertSource?.clauseNumber);

    return resolveClauseChip({
      reference,
      clauseNumber: number,
      clauseTitle: title,
      clauseDescription: matchesAlert ? alertSource?.clauseDescription : undefined,
    });
  }, [sourceAlert, values?.relevantContractClause, ceClause]);

  // The signal owns the time bar, so it runs only on a notice opened from one. A notice
  // raised by hand is not answering anything on a clock — the issue date on the form is
  // the PM's own choice, not a deadline handed down — so no bar is shown at all.
  const alertDeadline = useMemo(() => getAlertDeadline(sourceAlert), [sourceAlert]);
  const timeBar = useMemo(
    () => (alertDeadline ? getTimeBarForDeadline(alertDeadline) : undefined),
    [alertDeadline]
  );
  // The documents tile drops itself when it has no clock, no thread and no files — the case for
  // a notice raised by hand. Mirror that here so the form takes the whole width instead of
  // leaving a two-thirds column beside an empty rail.
  const hasRail =
    isTimeBarRunning(timeBar) || !!documents.emailCount || !!documents.attachmentCount;

  const handleFileListChange: UploadProps['onChange'] = ({ fileList: nextFileList }) => {
    setFileList(nextFileList);
  };

  const handleViewFile = (file: UploadFile) => {
    const source = file.originFileObj ?? file.url;
    if (!source) return;

    if (typeof source === 'string') {
      window.open(source, '_blank', 'noopener');
      return;
    }

    const objectUrl = URL.createObjectURL(source);
    window.open(objectUrl, '_blank', 'noopener');
    // The new tab needs the handle alive long enough to load; release it after that.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  };

  const handleReplaceFile = (target: UploadFile, replacement: File) => {
    setFileList((current) =>
      current.map((file) =>
        file.uid === target.uid
          ? {
              ...file,
              name: replacement.name,
              size: replacement.size,
              type: replacement.type,
              // Keep the row's uid so the list identity survives the swap.
              originFileObj: Object.assign(replacement, {
                uid: file.uid,
              }) as UploadFile['originFileObj'],
            }
          : file
      )
    );
  };

  const handleRemoveFile = (target: UploadFile) => {
    setFileList((current) => current.filter((file) => file.uid !== target.uid));
  };

  const performFinish = async (formValues: CompensationEventNoticeFormValues) => {
    if (!selectedProjectId) {
      notification.error({ message: copy.noProject });
      return;
    }

    setSubmitting(true);
    try {
      await createNotice.mutateAsync(
        toCompensationEventNoticeInput(formValues, {
          projectId: selectedProjectId,
          // Links the created CE back to the signal it was accepted from.
          projectAlertId: sourceAlert?.id,
          // …and back to the Early Warning it was raised off, when it came from one. The EW's
          // own reference wins over the one quoted on a signal — it names the record this CE
          // is actually linked to.
          earlyWarningId: earlyWarning?.id ?? earlyWarningId,
          earlyWarningReference:
            earlyWarning?.reference ?? sourceAlert?.earlyWarningReference ?? undefined,
          projectName: project?.name,
          projectReference: project?.reference,
          attachments: fileList
            .map((file) => file.originFileObj)
            .filter((file): file is NonNullable<typeof file> => !!file),
        })
      );

      notification.success({ message: copy.submitted });
      form.resetFields();
      setFileList([]);
      // The notice now lives in the register — send the user there rather than leaving
      // them on an emptied form.
      router.push(MENU_PATH.COMPENSATION_EVENT.pathname);
    } catch {
      // The global error handler surfaces the reason; keep the form filled in.
      notification.error({ message: copy.submitFailed });
    } finally {
      setSubmitting(false);
    }
  };

  const descriptionOfEvent = Form.useWatch('descriptionOfEvent', form);

  return (
    <ConfigProvider theme={NOTICE_THEME}>
      <Flex vertical gap={24}>
        <CompensationEventPageHeader
          title={'Create Compensation Event'}
          clause={headerClause}
          icon={<FileAddOutlined />}
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={hasRail ? 16 : 24}>
            <Flex vertical gap={24}>
              {/* The signal's own summary when there is one; the standing NEC4 explainer
                  covers a notice raised by hand. */}
              <CompensationEventNoticeClauseBanner
                text={sourceAlert?.description ?? earlyWarning?.description ?? undefined}
              />
              {/* {sourceAlert && <Alert type="info" showIcon message={copy.prefilledFromSignal} />} */}
              <CompensationEventNoticeForm
                form={form}
                recipientOptions={recipientOptions}
                recipientsLoading={recipientsLoading}
                noRecipientsHint={noRecipientsHint}
                clauseOptions={clauseSelectOptions}
                clausesLoading={clausesLoading}
                fileList={fileList}
                onFileListChange={handleFileListChange}
                onViewFile={handleViewFile}
                onReplaceFile={handleReplaceFile}
                onRemoveFile={handleRemoveFile}
                onFinish={performFinish}
              />
            </Flex>
          </Col>

          {hasRail && (
            <Col xs={24} lg={8}>
              <Flex vertical gap={24}>
                <CompensationEventNoticeDocumentsCommunication
                  timeBar={timeBar}
                  emailCount={documents.emailCount}
                  attachmentCount={documents.attachmentCount}
                  eventDetailLines={eventDetailLines}
                  onOpenEmailThread={documents.openThread}
                  onViewAttachments={documents.openAttachments}
                />
              </Flex>
            </Col>
          )}
        </Row>

        {/* Submit closes the page rather than sitting in the side rail — it acts on the whole
            notice, so it runs the full width beneath the form. */}
        <CompensationEventNoticeActions
          submitting={submitting}
          onSubmit={() => form.submit()}
          onValidate={() => form.validateFields()}
          confirmDescription={descriptionOfEvent}
        />

        <EmailThreadModal
          open={documents.threadOpen}
          projectId={documents.projectId}
          conversationId={documents.conversationId}
          subjectFallback={sourceAlert?.title ?? earlyWarning?.title}
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

export default CompensationEventNoticePage;
