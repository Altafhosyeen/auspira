'use client';

import { InfoCircleFilled } from '@ant-design/icons';
import { Button, Form, Modal, notification } from 'antd';
import { AlignLeft, FileText, Mail, User, X } from 'lucide-react';
import type React from 'react';
import { useSendProjectEmail } from '@/hooks/modules/project';
import {
  getPrimaryAlertEmail,
  humanizeCamelCase,
  type ProjectAlert,
  parseMissingInformation,
} from '@/hooks/modules/project-alerts';
import { useAuthStore } from '@/store/auth.store';
import DraftReplyCard, { type DraftReplyField } from './DraftReplyCard';
import RequestedFieldsCard from './RequestedFieldsCard';
import type { MissingField } from './request-missing-info.data';

/** Fields the send form binds to via antd `Form.Item name=` — matches `SendProjectEmailRequest`. */
interface SendReplyFormValues {
  to: string[];
  subject: string;
  body: string;
}

/** Split "a@x.com, b@x.com" / "a@x.com; b@x.com" into recipient tags for the `to` Select. */
const splitRecipients = (value?: string | null): string[] =>
  value
    ? value
        .split(/[,;]/)
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

interface RequestMissingInfoModalProps {
  open: boolean;
  alert: ProjectAlert | null;
  onClose: () => void;
}

/** Cycled by index so each requested field gets a distinct severity dot. */
const DOT_PALETTE = ['bg-error', 'bg-badge-warning', 'bg-warning', 'bg-badge-info', 'bg-main-p'];

/** Drafts the reply body from the alert's real gaps rather than a canned message. */
const buildReplyBody = (
  alert: ProjectAlert,
  gaps: { label: string; description: string }[],
  senderName: string
) => {
  const clause = alert.clauseDescription || 'NEC4 Clause 15.1';
  const gapLines = gaps
    .map((gap, index) => `${index + 1}. ${gap.description || gap.label}`)
    .join('\n');

  return `Dear Team,

Thank you for your email regarding "${alert.title}".

Auspira has identified this communication as a possible Early Warning under ${clause}. Before we can formally register this matter, please provide the following:

${gapLines || 'Further detail to support the assessment above.'}

Please reply at your earliest convenience. In the meantime, we will arrange a Early Warning Meeting under Clause 15.4.

This response does not constitute formal acceptance of a Compensation Event.

Kind regards,
${senderName}`;
};

/** Full-screen variant of the "Request Missing Information" flow, launched from the
 * "Ask contractor for missing info" decision on the signal review screen. */
const RequestMissingInfoModal: React.FC<RequestMissingInfoModalProps> = ({
  open,
  alert,
  onClose,
}) => {
  const user = useAuthStore((state) => state.user);
  const [form] = Form.useForm<SendReplyFormValues>();
  const { mutate: sendProjectEmail, isPending: isSending } = useSendProjectEmail();

  // The reply goes to whoever sent the original contractor email — `projectAlertEmails[0]`.
  const primaryEmail = alert ? getPrimaryAlertEmail(alert) : undefined;
  const gaps = parseMissingInformation(alert?.missingInformation).map((item) => ({
    label: humanizeCamelCase(item.label),
    description: item.description,
  }));

  const senderAccount = user?.email ?? '';
  const senderLabel = senderAccount ? `${senderAccount} (your account)` : 'your account';

  const requestedFields: MissingField[] = gaps.map((gap, index) => ({
    id: String(index),
    label: gap.label,
    dotClass: DOT_PALETTE[index % DOT_PALETTE.length],
  }));

  const initialValues: SendReplyFormValues = {
    to: splitRecipients(primaryEmail?.emailSender),
    subject: primaryEmail?.emailSubject
      ? `Re: ${primaryEmail.emailSubject} [Information Required]`
      : `Re: ${alert?.title ?? ''} [Information Required]`,
    body: alert ? buildReplyBody(alert, gaps, user?.fullName ?? '') : '',
  };

  const draftFields: DraftReplyField[] = [
    {
      key: 'from',
      label: 'From',
      icon: <Mail className="h-3.5 w-3.5" />,
      value: senderLabel,
      disabled: true,
      disabledReason: 'Replies are always sent from your connected Microsoft account.',
    },
    {
      key: 'to',
      label: 'To',
      icon: <User className="h-3.5 w-3.5" />,
      type: 'tags',
      name: 'to',
      rules: [{ required: true, type: 'array', message: 'At least one recipient is required' }],
    },
    {
      key: 'subject',
      label: 'Subject',
      icon: <FileText className="h-3.5 w-3.5" />,
      name: 'subject',
      rules: [{ required: true, message: 'Subject is required' }],
    },
    {
      key: 'body',
      label: 'Body',
      icon: <AlignLeft className="h-3.5 w-3.5" />,
      type: 'textarea',
      rows: 20,
      name: 'body',
      rules: [{ required: true, message: 'Body is required' }],
    },
  ];

  const handleSend = (values: SendReplyFormValues) => {
    if (!alert) return;

    sendProjectEmail(
      {
        projectEmailId: primaryEmail?.projectEmailId ?? alert.projectEmailId ?? '',
        projectId: alert.projectId,
        to: values.to.join(', '),
        cc: primaryEmail?.emailCc ?? '',
        subject: values.subject,
        body: values.body,
      },
      {
        onSuccess: () => {
          notification.success({ message: 'Reply sent to the contractor.' });
          onClose();
        },
        onError: () => {
          notification.error({ message: 'Failed to send the reply. Please try again.' });
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
      destroyOnHidden
      // width="100vw"
      // style={{ top: 0, maxWidth: '100vw', margin: 0, padding: 0 }}
      // styles={{
      //   container: {
      //     borderRadius: 0,
      //     padding: 0,
      //     height: '100vh',
      //     display: 'flex',
      //     flexDirection: 'column',
      //   },

      //   body: { flex: 1, minHeight: 0, overflowY: 'auto' },
      //   mask: { backgroundColor: 'rgba(0, 0, 0, 0.65)' },
      // }}
      width={1400}
      centered
    >
      <div className="flex h-full flex-col">
        {/* --- Header --- */}
        <header className="shrink-0 border-b border-gray-100 px-6 py-4 sm:px-10">
          <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ds-heading-2 text-text tracking-tight">
                  Request Missing Information
                </h1>
                <span className="badge-success border-badge-success-soft ds-micro rounded-md border px-2 py-0.5 font-mono font-bold tracking-wider whitespace-nowrap">
                  {alert?.clauseDescription}
                </span>
              </div>
              <p className="ds-body text-icon mt-1.5">
                Auspira has drafted a reply to the contractor asking for the {gaps.length} missing
                field{gaps.length === 1 ? '' : 's'} before registering this EW
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* --- Scrollable body --- */}
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSend}
          className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 sm:px-10"
        >
          {/* Info banner */}
          <div className="badge-info border-badge-info-soft mb-6 flex items-start gap-3 rounded-xl border p-4">
            <InfoCircleFilled className="text-badge-info mt-0.5 shrink-0 text-base" />
            <div className="ds-body leading-relaxed">
              This will be sent from your connected Microsoft account (
              <span className="font-semibold">{senderAccount}</span>). A copy is stored
              automatically as evidence — even before the EW is formally registered.
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DraftReplyCard fields={draftFields} />
            </div>
            <div className="space-y-4 lg:col-span-1">
              <RequestedFieldsCard fields={requestedFields} />
              <Button type="primary" block htmlType="submit" loading={isSending}>
                Send &amp; create EW record (awaiting info)
              </Button>
            </div>
          </div>
        </Form>

        {/* --- Footer action row --- */}
      </div>
    </Modal>
  );
};

export default RequestMissingInfoModal;
