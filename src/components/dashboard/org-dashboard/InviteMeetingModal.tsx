'use client';

import { Form, Input, Modal, notification } from 'antd';
import { Users, X } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import ButtonX from '@/components/antd/ButtonX';
import { RecipientSelect, useRecipientOptions } from '@/components/shared/RecipientSelect';
import { useSendRiskReductionMeetingInvite } from '@/hooks/modules/early-warning';
import { toDisplayReference } from '@/lib/utils/org-dashboard.utils';
import { useAuthStore } from '@/store/auth.store';
import type { WatchtowerRow } from '@/types/dashboard/org-dashboard.types';

/* ─── Composer chrome ───────────────────────────────────────────────────────
   Defined once rather than repeated per field: FROM, TO, CC, SUBJECT and BODY are
   five renderings of the same control, and the previous per-field copies had already
   drifted (three different border colours, two radii, two focus tints). */

/** The small uppercase caption above each field. slate-500, not slate-400 — at 10px the lighter
 *  tone lands near 2.8:1 on white, under the WCAG AA floor (same rule the dashboard panels follow). */
const FIELD_LABEL = 'text-[10px] font-bold tracking-[0.09em] text-slate-500 uppercase';

/** Border, radius, type and interaction states shared by every input in the composer. */
const FIELD_BOX =
  'w-full rounded-lg! border-slate-200! text-[13.5px]! leading-5! text-slate-700! transition-colors duration-200 hover:border-slate-300! focus:border-main-p! focus:shadow-none!';

/** Tightens antd's default label gutter so the caption sits close over its field. */
const FIELD_ITEM = 'mb-0 [&_.ant-form-item-label]:pb-1.5 [&_.ant-form-item-row]:gap-0';

/** Small pill shared by every tag in the header's early-warning fact row — colour comes from
 *  the caller (row.badgeClass / row.tagClass / slate tints) so all pills share one shape. */
const META_TAG =
  'inline-flex items-center rounded-md px-2 py-[3px] text-[11px] leading-4 font-semibold whitespace-nowrap';

/** `RecipientSelect` renders an antd Select, whose inner `.ant-select-selector` carries its own
 *  border and padding — strip those so the wrapper's `FIELD_BOX` is the only visible chrome. */
const RECIPIENT_FIELD = `${FIELD_BOX} border focus-within:border-main-p! [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!px-2.5 [&_.ant-select-selector]:!py-1.5 [&_.ant-select-selector]:!shadow-none`;

export interface InviteMeetingModalProps {
  open: boolean;
  row: WatchtowerRow | null;
  onClose: () => void;
}

interface InviteFormValues {
  to: string[];
  cc?: string[];
  subject: string;
  summary: string;
}

export const InviteMeetingModal: React.FC<InviteMeetingModalProps> = ({ open, row, onClose }) => {
  const [form] = Form.useForm<InviteFormValues>();
  const { mutate: sendInvite, isPending } = useSendRiskReductionMeetingInvite();
  const user = useAuthStore((state) => state.user);

  const senderAccount = user?.email ?? '';
  const senderLabel = `${senderAccount} (your account)`;

  const {
    options: recipientOptions,
    isLoading: isLoadingRecipients,
    noRecipientsHint,
  } = useRecipientOptions(row?.task?.projectId);

  const assigneeName = row?.task?.assignedUsers?.[0]?.fullName;
  const displayReference = toDisplayReference(row?.task?.reference);

  /* `getTaskDueTag` returns either a due phrase ("Overdue", "Due Today", "Due in N Days") or a
     bare date ("22 Aug 2026") — only the bare date needs the "Due" prefix to read as a fact. */
  const dueLabel = row
    ? row.tag === 'Overdue' || row.tag.startsWith('Due')
      ? row.tag
      : `Due ${row.tag}`
    : '';

  // Pre-fills Subject/Body with a professional draft on open so the sender edits a real email
  // instead of writing one from a blank field — re-runs per `row.id` so a different matter's
  // invite never inherits the previous one's draft.
  useEffect(() => {
    if (!open || !row) return;
    const senderName = user?.fullName || senderAccount;

    form.setFieldsValue({
      subject: `Early Warning Meeting Request`,
      summary: [
        `Dear Team,`,
        ``,
        `I am writing to request an Early Warning Meeting regarding , in line with our early warning procedure.`,
        `${dueLabel} — please let me know your availability at the earliest opportunity so we can review the matter, discuss its impact and agree on any mitigation actions.`,
        ``,
        `Kind regards,`,
        senderName,
      ].join('\n'),
    });
  }, [open, row, dueLabel, user?.fullName, senderAccount, form]);

  const handleClose = () => {
    if (isPending) return;
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: InviteFormValues) => {
    /* The invite is sent against the early warning itself — for EW-typed watchtower tasks the
       backend links it via `entityId`. */
    const groupId = row?.task?.entityId;
    if (!groupId) {
      notification.error({ message: 'This task is not linked to an early warning.' });
      return;
    }
    sendInvite(
      {
        groupId,
        data: {
          to: values.to.join(', '),
          cc: values.cc?.join(', '),
          subject: values.subject,
          summary: values.summary,
        },
      },
      {
        onSuccess: () => {
          notification.success({
            message: 'Meeting Invite Sent',
          });
          form.resetFields();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={null}
      footer={null}
      centered
      width={720}
      destroyOnClose
      maskClosable={!isPending}
      closable={false}
      bodyStyle={{ padding: '0px' }}
      /* The modal content IS the card — no inner bordered box. Nesting one produced a double
         frame with a visible gutter between it and the modal edge; banding header/body/footer
         instead lets the composer fill the popup the way the reference design does. */
      className="[&_.ant-modal-content]:!overflow-hidden [&_.ant-modal-content]:!rounded-xl [&_.ant-modal-content]:!p-0"
    >
      {/* Header band — title row, with the matter's key facts as a row of tags aligned
          under the title text so the sender can see which early warning this meeting is for. */}
      <div className="border-b border-slate-100 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50">
              <Users className="h-5 w-5 text-violet-600" aria-hidden="true" />
            </span>
            <p className="mt-3.5! truncate text-[16px] leading-tight font-bold text-slate-900">
              Early Warning Meeting Request
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            aria-label="Close"
            className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* pl-[52px] = icon width (40px) + gap (12px), so the tags sit flush with the title. */}
        {row && (
          <div className="flex flex-wrap items-center gap-1.5 pl-[52px]">
            {displayReference && (
              <span className={`${META_TAG} bg-slate-100 text-slate-600`}>{displayReference}</span>
            )}
            {assigneeName && (
              <span className={`${META_TAG} bg-slate-100 text-slate-600`}>{assigneeName}</span>
            )}
            <span className={`${META_TAG} ${row.tagClass}`}>{dueLabel}</span>
            {row.overdueSince && (
              <span className={`${META_TAG} bg-rose-50 text-rose-600`}>{row.overdueSince}</span>
            )}
          </div>
        )}
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        {/* Field band — scrolls on short viewports so the header and action bar stay put. */}
        <div className="max-h-[62vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* FROM — read-only: the sender is always the signed-in account, so it renders as a
              filled box rather than a control that looks editable. */}
          <div className="flex flex-col">
            <span className={`mb-1.5 ${FIELD_LABEL}`}>From</span>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13.5px] leading-5 text-slate-500">
              {senderLabel}
            </div>
          </div>

          <Form.Item
            name="to"
            label={<span className={FIELD_LABEL}>To</span>}
            rules={[{ required: true, type: 'array', message: 'Enter at least one recipient' }]}
            className={FIELD_ITEM}
          >
            <RecipientSelect
              placeholder="Recipient email address"
              options={recipientOptions}
              loading={isLoadingRecipients}
              notFoundContent={noRecipientsHint}
              size="large"
              className={RECIPIENT_FIELD}
            />
          </Form.Item>

          <Form.Item
            name="cc"
            label={<span className={FIELD_LABEL}>Cc</span>}
            className={FIELD_ITEM}
          >
            <RecipientSelect
              placeholder="Optional recipient cc address"
              options={recipientOptions}
              loading={isLoadingRecipients}
              notFoundContent={noRecipientsHint}
              size="large"
              className={RECIPIENT_FIELD}
            />
          </Form.Item>

          <Form.Item
            name="subject"
            label={<span className={FIELD_LABEL}>Subject</span>}
            rules={[{ required: true, message: 'Please enter a subject' }]}
            className={FIELD_ITEM}
          >
            <Input placeholder="Subject line" className={`${FIELD_BOX} px-3.5! py-2.5!`} />
          </Form.Item>

          <Form.Item
            name="summary"
            label={<span className={FIELD_LABEL}>Body</span>}
            rules={[{ required: true, message: 'Please provide the email body' }]}
            className={FIELD_ITEM}
          >
            <Input.TextArea
              rows={10}
              placeholder="Write your message here..."
              className={`${FIELD_BOX} resize-none bg-white! px-4! py-3.5! font-sans leading-[1.7]!`}
            />
          </Form.Item>
        </div>

        {/* Action band — its own tinted strip across the full width, per the reference. */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <ButtonX
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="h-10! rounded-lg! px-5! text-[13.5px]! font-semibold!"
          >
            Send
          </ButtonX>
        </div>
      </Form>
    </Modal>
  );
};

InviteMeetingModal.displayName = 'InviteMeetingModal';
