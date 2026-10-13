'use client';

import { InfoCircleFilled } from '@ant-design/icons';
import { Button, Form, Modal, notification } from 'antd';
import { AlignLeft, FileText, Mail, User, X } from 'lucide-react';
import type React from 'react';
import DraftReplyCard, {
  type DraftReplyField,
} from '@/components/contract-control-agent/early-watchtower/request-missing-info/DraftReplyCard';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import { useSendProjectEmail } from '@/hooks/modules/project';
import { toDisplayReference } from '@/lib/utils/org-dashboard.utils';
import { useAuthStore } from '@/store/auth.store';
import type { WatchtowerRow } from '@/types/dashboard/org-dashboard.types';

interface SendTaskEmailFormValues {
  to: string[];
  subject: string;
  body: string;
}

export interface SendTaskEmailModalProps {
  open: boolean;
  row: WatchtowerRow | null;
  onClose: () => void;
}

/** Compensation Event variant of the "Request Missing Information" flow — just the draft-reply
 * card (no requested-fields sidebar) with a plain "Send Email" action, since a CE task has no
 * missing-information gaps to request. */
export const SendTaskEmailModal: React.FC<SendTaskEmailModalProps> = ({ open, row, onClose }) => {
  const task = row?.task;
  const user = useAuthStore((state) => state.user);
  const [form] = Form.useForm<SendTaskEmailFormValues>();
  const { mutate: sendProjectEmail, isPending: isSending } = useSendProjectEmail();
  const {
    options: recipientOptions,
    isLoading: isLoadingRecipients,
    noRecipientsHint,
  } = useRecipientOptions(task?.projectId);

  const senderAccount = user?.email ?? '';
  const senderLabel = senderAccount ? `${senderAccount} (your account)` : 'your account';
  const assignedEmail = task?.assignedUsers[0]?.email;
  const displayReference = toDisplayReference(task?.reference);

  const initialValues: SendTaskEmailFormValues = {
    to: assignedEmail ? [assignedEmail] : [],
    subject: task?.title ?? '',
    body: task?.description
      ? task.description
      : task
        ? `Dear Team,\n\nThis is a note regarding Compensation Event${displayReference ? ` ${displayReference}` : ''}: "${task.title}".\n\nKind regards,\n${user?.fullName ?? ''}`
        : '',
  };

  const draftFields: DraftReplyField[] = [
    {
      key: 'from',
      label: 'From',
      icon: <Mail className="h-3.5 w-3.5" />,
      value: senderLabel,
      disabled: true,
    },
    {
      key: 'to',
      label: 'To',
      icon: <User className="h-3.5 w-3.5" />,
      type: 'tags',
      name: 'to',
      rules: [{ required: true, type: 'array', message: 'At least one recipient is required' }],
      options: recipientOptions,
      loading: isLoadingRecipients,
      notFoundContent: noRecipientsHint,
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

  const handleSend = (values: SendTaskEmailFormValues) => {
    if (!task) return;

    sendProjectEmail(
      {
        projectEmailId: '',
        projectId: task.projectId,
        to: values.to.join(', '),
        subject: values.subject,
        body: values.body,
      },
      {
        onSuccess: () => {
          notification.success({ message: 'Email sent.' });
          onClose();
        },
        onError: () => {
          notification.error({ message: 'Failed to send the email. Please try again.' });
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
      width={900}
      centered
    >
      <div className="flex h-full flex-col">
        {/* --- Header --- */}
        <header className="shrink-0 border-b border-gray-100 px-6 py-4 sm:px-8">
          <div className="mx-auto flex w-full items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ds-heading-2 text-text tracking-tight">Send Email</h1>
                {displayReference && (
                  <span className="badge-success border-badge-success-soft ds-micro rounded-md border px-2 py-0.5 font-mono font-bold tracking-wider whitespace-nowrap">
                    {displayReference}
                  </span>
                )}
              </div>
              <p className="ds-body text-icon mt-1.5">{task?.title}</p>
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

        {/* --- Body --- */}
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSend}
          className="mx-auto w-full flex-1 px-6 py-6 sm:px-8"
        >
          {/* Info banner */}
          <div className="badge-info border-badge-info-soft mb-6 flex items-start gap-3 rounded-xl border p-4">
            <InfoCircleFilled className="text-badge-info mt-0.5 shrink-0 text-base" />
            <div className="ds-body leading-relaxed">
              This will be sent from your connected Microsoft account (
              <span className="font-semibold">{senderAccount}</span>). A copy is stored
              automatically as evidence.
            </div>
          </div>

          <DraftReplyCard fields={draftFields} />

          {/* --- Footer action row --- */}
          <div className="mt-6 flex justify-end">
            <Button type="primary" htmlType="submit" loading={isSending}>
              Send Email
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default SendTaskEmailModal;
