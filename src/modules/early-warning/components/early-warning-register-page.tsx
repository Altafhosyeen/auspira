'use client';

import { Col, Flex, Form, notification, Row } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import DocumentsUploadCard from '@/components/shared/documents-upload-card';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import { useGetProjectById } from '@/hooks/modules/project';
import {
  getPrimaryAlertEmail,
  type ProjectAlert,
  parseImpactAssessment,
  useGetProjectAlertById,
} from '@/hooks/modules/project-alerts';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { useProjectAlertBridgeStore } from '@/store/project-alert.store';
import { EARLY_WARNING_IMPACT_TYPE_OPTIONS } from '../constants/early-warning.constants';
import { useRegisterEarlyWarning } from '../hooks/use-early-warnings';
import type { RegisterEarlyWarningFormValues } from '../types/early-warning.types';
import EwThemeProvider from './ew-theme-provider';
import EwCommunicationDetailsCard from './register/ew-communication-details-card';
import EwFormActions from './register/ew-form-actions';
import EwFormHeader from './register/ew-form-header';
import EwMatterCard from './register/ew-matter-card';
import EwProjectContractCard from './register/ew-project-contract-card';
import EwSidebar from './register/ew-sidebar';

/** Split "a@x.com, b@x.com" / "a@x.com; b@x.com" into recipient parts for the submit context. */
const splitRecipients = (value?: string | null): string[] =>
  value
    ? value
        .split(/[,;]/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

// Best-effort mapping from the originating project alert onto the register form.
const toRegisterEwInitialValues = (
  alert: ProjectAlert,
  projectName?: string,
  projectReference?: string
): Partial<RegisterEarlyWarningFormValues> => {
  const primaryEmail = getPrimaryAlertEmail(alert);
  const impact = parseImpactAssessment(alert.impactAssessment);
  const impactTypes = (impact?.impactTypes ?? []).filter((type) =>
    EARLY_WARNING_IMPACT_TYPE_OPTIONS.some((option) => option.value === type)
  );

  return {
    ewReference: alert.earlyWarningReference || undefined,
    dateRaised: alert.createdOn ? dayjs(alert.createdOn) : dayjs(),
    projectName: projectName || 'Greenland',
    projectReference: projectReference || 'GR1N',
    raisedBy: primaryEmail?.emailSender ? [primaryEmail.emailSender] : undefined,
    to: splitRecipients(primaryEmail?.emailTo),
    cc: splitRecipients(primaryEmail?.emailCc),
    riskTitle: primaryEmail?.emailSubject || alert.title,
    riskDescription: primaryEmail?.description ?? alert.description ?? undefined,
    potentialImpact: impact?.potentialImpacts ?? undefined,
    proposedActions: impact?.proposedActions ?? undefined,
    keyDatesAffected: impact?.keyDatesAffected ?? undefined,
    source: primaryEmail ? `Email - ${primaryEmail.emailSender}` : 'Manual',
    impactTypes,
  };
};

interface EarlyWarningRegisterPageProps {
  /** Project-alert id when the form is opened from a signal; absent for manual raise. */
  projectAlertId?: string;
}

// Container — owns state & side effects; delegates rendering to presentational components.
const EarlyWarningRegisterPage = ({ projectAlertId }: EarlyWarningRegisterPageProps) => {
  const [form] = Form.useForm<RegisterEarlyWarningFormValues>();
  const router = useRouter();

  const selectedProjectId = useProjectStore((store) => store.selectedProjectId);

  const { data: project } = useGetProjectById({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  // Signal Review's "Accept & register" bridges the alert through this store rather than
  // the route. Read it once — a plain subscription would re-render with a now-cleared
  // value right after the effect below fires.
  const [pendingProjectAlert] = useState(
    () => useProjectAlertBridgeStore.getState().pendingProjectAlert
  );
  useEffect(() => {
    useProjectAlertBridgeStore.getState().setPendingProjectAlert(null);
  }, []);

  const alertId = projectAlertId ?? pendingProjectAlert?.id;
  const isAlertFlow = !!alertId;

  // The bridge store only survives an in-app navigation from Signal Review. A direct
  // load/refresh of the register route (alertId in the URL, store empty) refetches the
  // alert by id so the form still prefills and maps correctly.
  const needsAlertFetch = isAlertFlow && !pendingProjectAlert;
  const { data: fetchedAlert } = useGetProjectAlertById<ProjectAlert>({
    id: alertId ?? '',
    enabled: needsAlertFetch,
  });

  const sourceAlert = pendingProjectAlert ?? fetchedAlert;

  // Re-populate the form once the fetched alert arrives — initialValues only apply at
  // mount, before this async fetch resolves.
  useEffect(() => {
    if (fetchedAlert) {
      form.setFieldsValue(
        toRegisterEwInitialValues(fetchedAlert, project?.name, project?.referenceId)
      );
    }
  }, [fetchedAlert, project, form]);

  const currentUserEmail = useAuthStore((state) => state.user?.email);
  // Manual entry defaults Raised By to the logged-in user, which may still be hydrating
  // on first mount — hence this effect. Alert EWs keep the email's From verbatim.
  const alertEmailSender = sourceAlert ? getPrimaryAlertEmail(sourceAlert)?.emailSender : null;
  useEffect(() => {
    if (currentUserEmail && !alertEmailSender && !form.getFieldValue('raisedBy')) {
      form.setFieldValue('raisedBy', [currentUserEmail]);
    }
  }, [currentUserEmail, alertEmailSender, form]);

  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    options: recipientOptions,
    isLoading: isLoadingContacts,
    noRecipientsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  const alertImpact = useMemo(
    () => (sourceAlert ? parseImpactAssessment(sourceAlert.impactAssessment) : null),
    [sourceAlert]
  );

  // Live reference drives the "Register EW-015" button label per the design.
  const reference = Form.useWatch('ewReference', form);

  const { mutateAsync: registerEarlyWarning, isPending } = useRegisterEarlyWarning();

  const handleFinish = async (values: RegisterEarlyWarningFormValues) => {
    if (!selectedProjectId) {
      notification.error({ message: 'Select a project before registering an Early Warning.' });
      return;
    }

    try {
      await registerEarlyWarning({
        values,
        context: {
          projectId: selectedProjectId,
          projectAlertId: alertId,
          projectName: project?.name ?? '',
          projectReference: project?.referenceId ?? '',
          attachments,
          prefillImpacts: alertImpact?.potentialImpacts,
          prefillActions: alertImpact?.proposedActions,
          // Clause fields ride through when the EW originates from an alert (defaults to 15.1).
          clauseDescription: sourceAlert?.clauseDescription ?? undefined,
        },
      });
      notification.success({ message: 'Early Warning registered' });
      router.push('/contract-control-agent/early-warning');
    } catch {
      // Error toasts are handled globally by the api client.
    }
  };

  return (
    <EwThemeProvider>
      <Flex vertical gap={16}>
        <EwFormHeader
          clauseNumber={sourceAlert?.clauseNumber}
          clauseTitle={sourceAlert?.clauseTitle}
          clauseDescription={sourceAlert?.clauseDescription}
          bannerMessage={sourceAlert?.summary ?? undefined}
        />

        <Form<RegisterEarlyWarningFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            impactTypes: [],
            ...(pendingProjectAlert
              ? toRegisterEwInitialValues(pendingProjectAlert, project?.name, project?.referenceId)
              : {}),
          }}
          onFinish={handleFinish}
        >
          {isAlertFlow ? (
            <Row gutter={[16, 16]}>
              {/* Left column — the four form cards */}
              <Col xs={24} lg={16}>
                <Flex vertical gap={16}>
                  <EwProjectContractCard lockedDateRaised={isAlertFlow} />
                  <EwCommunicationDetailsCard
                    recipientOptions={recipientOptions}
                    isLoadingRecipients={isLoadingContacts}
                    noRecipientsHint={noRecipientsHint}
                  />
                  <EwMatterCard />
                  <DocumentsUploadCard files={attachments} onFilesChange={setAttachments} />
                </Flex>
              </Col>

              {/* Right column — alert-context sidebar + submit actions */}
              <Col xs={24} lg={8}>
                <Flex vertical gap={16}>
                  <EwSidebar
                    deadline={sourceAlert?.overdueDateTime}
                    showCommunicationCard={isAlertFlow}
                    projectId={sourceAlert?.projectId ?? selectedProjectId}
                    conversationId={sourceAlert?.conversationId}
                    subjectFallback={sourceAlert?.title}
                  />
                  <EwFormActions loading={isPending} reference={reference} />
                </Flex>
              </Col>
            </Row>
          ) : (
            <Flex vertical gap={16}>
              <EwProjectContractCard lockedDateRaised={false} />
              <EwCommunicationDetailsCard
                recipientOptions={recipientOptions}
                isLoadingRecipients={isLoadingContacts}
                noRecipientsHint={noRecipientsHint}
              />
              <EwMatterCard />
              <DocumentsUploadCard files={attachments} onFilesChange={setAttachments} />
              <Flex justify="flex-end" style={{ marginTop: 8 }}>
                <EwFormActions loading={isPending} reference={reference} block={false} />
              </Flex>
            </Flex>
          )}
        </Form>
      </Flex>
    </EwThemeProvider>
  );
};

export default EarlyWarningRegisterPage;
