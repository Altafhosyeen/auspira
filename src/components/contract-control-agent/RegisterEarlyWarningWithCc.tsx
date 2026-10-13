'use client';

import { Form, notification } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import { MENU_PATH } from '@/constants';
import { useRegisterEarlyWarning } from '@/hooks/modules/early-warning-register';
import {
  type ProjectEmailConversationDetails,
  useGetProjectById,
  useGetProjectEmailConversationDetails,
} from '@/hooks/modules/project';
import {
  getPrimaryAlertEmail,
  type ProjectAlert,
  parseImpactAssessment,
} from '@/hooks/modules/project-alerts';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { useProjectAlertBridgeStore } from '@/store/project-alert.store';
import type { EvidenceItem, RegisterEwFormValues } from './early-warning-form.data';
import { EW_FORM_STYLES as S } from './early-warning-form.styles';
import {
  CommunicationDetailsCard,
  EvidenceCard,
  FormActions,
  FormHeader,
  ImpactAssessmentCard,
  PrefillBanner,
  ProjectContextCard,
} from './register-early-warning';

/** Split "a@x.com, b@x.com" / "a@x.com; b@x.com" into recipient tags for the Select. */
const splitRecipients = (value?: string | null): string[] =>
  value
    ? value
        .split(/[,;]/)
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

/**
 * Best-effort mapping from the originating project alert onto the register form's fields.
 * Only fields with a genuine source on the alert are set — the rest (first action, etc.)
 * have nothing to map from and are left for the user to fill in. Communication details mirror
 * the alert email exactly: From = the email's sender, To = who the email was sent to,
 * CC = the email's CC list, Subject = the email's subject.
 */
const toRegisterEwInitialValues = (alert: ProjectAlert): Partial<RegisterEwFormValues> => {
  const primaryEmail = getPrimaryAlertEmail(alert);
  const impact = parseImpactAssessment(alert.impactAssessment);
  return {
    ewReference: alert.earlyWarningReference || undefined,
    riskTitle: primaryEmail?.emailSubject || alert.title,
    riskDescription: alert.description ?? undefined,
    raisedBy: primaryEmail?.emailSender || undefined,
    // `to`/`cc` are typed as `string` but the underlying Select (mode="tags") actually stores string[].
    to: splitRecipients(primaryEmail?.emailTo) as unknown as string,
    cc: splitRecipients(primaryEmail?.emailCc) as unknown as string,
    dateRaised: dayjs(alert.createdOn),
    potentialImpacts: impact?.potentialImpacts,
    proposedActions: impact?.proposedActions,
    keyDatesAffected: impact?.keyDatesAffected,
    impactTypes: impact && impact.impactTypes.length > 0 ? impact.impactTypes : undefined,
  };
};

/** Maps the alert's mail-thread summary onto the evidence list — empty when there's none. */
const toAutoAttachedEvidence = (details?: ProjectEmailConversationDetails): EvidenceItem[] => {
  if (!details) return [];
  return [
    {
      id: 'email-thread',
      iconType: 'email' as const,
      label: `Email thread (${details.totalEmailsCount} msg${details.totalEmailsCount === 1 ? '' : 's'})`,
      isAuto: true,
    },
    ...details.attachments.map((attachment, index) => ({
      id: `attachment-${index}`,
      iconType: 'attachment' as const,
      label: attachment.name,
      isAuto: true,
      url: attachment.url,
    })),
  ];
};

export default function RegisterEarlyWarningWithCc() {
  const [form] = Form.useForm<RegisterEwFormValues>();
  const router = useRouter();
  const params = useParams();
  // Route is `/early-warning-register/[id]`, where the id is the literal "new" when the user
  // raises an EW manually and a project-alert id when the form is opened from an alert. The
  // test has to be on the id — comparing `params` itself (an object) never matched, so create
  // mode sent "new" through as the alert id.
  const routeId = String(params?.id ?? '');

  // Signal Review's "Accept & register" bridges the alert through this store rather than the
  // route, since the URL stays the literal `/new`. Read it once (a plain subscription would
  // re-render this component with a now-cleared value right after the effect below fires,
  // flickering the alert-linked panels away a frame after they first appeared).
  const [pendingProjectAlert] = React.useState(
    () => useProjectAlertBridgeStore.getState().pendingProjectAlert
  );
  React.useEffect(() => {
    useProjectAlertBridgeStore.getState().setPendingProjectAlert(null);
  }, []);

  const projectAlertId = routeId === 'new' ? pendingProjectAlert?.id : routeId;
  const currentUserEmail = useAuthStore((state) => state.user?.email);
  // Alert-generated EWs mirror the alert email's communication details verbatim (From = the
  // email's sender), so "From" only falls back to the logged-in user when there is no alert
  // sender to show — i.e. manual entry, or an alert whose email carries no sender.
  const alertEmailSender = pendingProjectAlert
    ? getPrimaryAlertEmail(pendingProjectAlert)?.emailSender
    : null;
  // The auth store can still be hydrating when this form first mounts, so `initialValues` alone
  // (applied only once, on mount) can miss it — keep the disabled field in sync as it arrives.
  React.useEffect(() => {
    if (currentUserEmail && !alertEmailSender) form.setFieldValue('raisedBy', currentUserEmail);
  }, [currentUserEmail, alertEmailSender, form]);
  // Raised by hand rather than promoted from an alert, so there is no alert to derive clause
  // references, auto-attached evidence or a follow-up action from — those panels have nothing
  // to show and are hidden rather than rendered empty.
  const isManualEntry = !projectAlertId;
  // Attachments live outside the antd Form because they are File objects streamed as multipart
  // parts rather than form field values.

  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [threadModalOpen, setThreadModalOpen] = React.useState(false);

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  const { data: projectEmailConversationDetails } = useGetProjectEmailConversationDetails({
    projectId: selectedProjectId ?? undefined,
    conversationId: pendingProjectAlert?.conversationId ?? undefined,
  });
  const autoAttachedEvidence = toAutoAttachedEvidence(projectEmailConversationDetails?.[0]);

  const { data: project } = useGetProjectById({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  // Contact persons for the selected project — the To / Cc / Bcc suggestion lists.
  const {
    options: recipientOptions,
    isLoading: isLoadingContacts,
    noRecipientsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  const { mutate: registerEarlyWarning, isPending } = useRegisterEarlyWarning();

  const handleFinish = (values: RegisterEwFormValues) => {
    if (!selectedProjectId) {
      notification.error({ message: 'Select a project before registering an Early Warning.' });
      return;
    }

    registerEarlyWarning(
      {
        data: values,
        context: {
          projectId: selectedProjectId,
          projectAlertId,
          // Extractor output, not a form field — read straight off the alert the form was
          // prefilled from, so a manually raised EW simply sends none.
          summary: pendingProjectAlert?.summary ?? undefined,
          clauseDescription: pendingProjectAlert?.clauseDescription ?? undefined,
          projectName: project?.name ?? '',
          projectReference: project?.referenceId ?? '',
          attachments,
        },
      },
      {
        onSuccess: () => {
          router.push(`${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}`);
        },
      }
    );
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        raisedBy: currentUserEmail,
        ...(pendingProjectAlert ? toRegisterEwInitialValues(pendingProjectAlert) : {}),
      }}
      onFinish={handleFinish}
      requiredMark
      className="[&_.ant-form-item]:mb-0! [&_.ant-form-item-label]:pb-2!"
    >
      <FormHeader
        clauseBadge={pendingProjectAlert?.clauseDescription}
        clauseNumber={pendingProjectAlert?.clauseNumber}
      />
      {pendingProjectAlert && <PrefillBanner />}
      <div className={S.grid}>
        {/* Left Column: Form Details */}
        <div className={S.leftColumn}>
          <ProjectContextCard projectName={project?.name} projectReference={project?.referenceId} />
          <CommunicationDetailsCard
            recipientOptions={recipientOptions}
            isLoadingRecipients={isLoadingContacts}
            noRecipientsHint={noRecipientsHint}
          />
          <ImpactAssessmentCard />
        </div>

        {/* Right Column: Information Pane */}
        <div className={S.rightColumn}>
          <EvidenceCard
            files={attachments}
            onFilesChange={setAttachments}
            showAutoAttached={!isManualEntry}
            autoAttachedItems={autoAttachedEvidence}
            onEmailThreadClick={
              pendingProjectAlert?.conversationId ? () => setThreadModalOpen(true) : undefined
            }
          />
          {/* {!isManualEntry && <FirstActionCard />} */}
          <FormActions loading={isPending} />
        </div>
      </div>

      <EmailThreadModal
        open={threadModalOpen}
        projectId={selectedProjectId}
        conversationId={pendingProjectAlert?.conversationId}
        subjectFallback={pendingProjectAlert?.projectAlertEmails?.[0]?.emailSubject ?? undefined}
        onClose={() => setThreadModalOpen(false)}
      />
    </Form>
  );
}
