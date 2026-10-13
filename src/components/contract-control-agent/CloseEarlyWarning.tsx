'use client';

import { CheckCircleFilled, PushpinFilled } from '@ant-design/icons';
import { Form, Input, notification, Select } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { MENU_PATH } from '@/constants';
import { ContractEntityType } from '@/constants/enum.constant';
import { useGetClosingReasons } from '@/hooks/modules/closing-reasons';
import { useCloseEarlyWarning, useGetEarlyWarningById } from '@/hooks/modules/early-warning';
import { useGetEventClauseOptions } from '@/modules/compensation-event';
import {
  CLOSE_EW_COPY,
  CLOSE_EW_INITIAL_VALUES,
  type CloseEwFormValues,
} from './close-early-warning.data';
import type { ApiEarlyWarningDetail } from './early-warning-detail.map';

const { TextArea } = Input;

const CARD = 'flex h-full flex-col rounded-lg border border-slate-200/80 bg-white shadow-sm';
// Uppercase field labels — size/line-height from the `ds-micro` root token, weight/tracking layered on.
const FIELD_LABEL = 'ds-micro mb-1.5 block font-bold tracking-wider text-slate-400 uppercase';

const { header, banner, close, link } = CLOSE_EW_COPY;

export type DecisionOption = 'close' | 'link';

export default function CloseEarlyWarning({
  decision,
  earlyWarningId,
  onFinished,
}: {
  decision: DecisionOption;
  earlyWarningId?: string;
  /** Called once the modal has done its work — the EW was closed, or the CE hand-off was
   * started — so the caller can dismiss it. */
  onFinished?: () => void;
}) {
  const router = useRouter();
  const [form] = Form.useForm<CloseEwFormValues>();

  // Already fetched by the Early Warning detail screen this modal opens over, so React Query
  // serves it from cache on the shared key — read here for the record's own reference and
  // project rather than threading both through every card that renders this form.
  const { data: earlyWarning } = useGetEarlyWarningById<ApiEarlyWarningDetail>({
    id: earlyWarningId ?? '',
    enabled: !!earlyWarningId,
  });
  const reference = earlyWarning?.reference;

  // The clause catalogue is configured per project — the same list the CE notice form picks from,
  // narrowed to the Compensation Event clauses, since that is the notice this hand-off raises.
  const { data: clauseOptions, isLoading: isClausesLoading } = useGetEventClauseOptions({
    projectId: earlyWarning?.projectId,
    entityType: ContractEntityType.CompensationEvent,
    enabled: decision === 'link',
  });

  const { data: closingReasons, isLoading: isClosingReasonsLoading } = useGetClosingReasons({
    entityType: ContractEntityType.EarlyWarning,
    enabled: decision === 'close',
  });
  const closureReasonOptions = (closingReasons ?? []).map((reason) => ({
    value: reason.id,
    label: reason.title,
  }));

  const { mutateAsync: closeEarlyWarning, isPending: isClosing } = useCloseEarlyWarning();

  const handleClose = async () => {
    if (!earlyWarningId) return;
    try {
      const values = await form.validateFields(['closureReason', 'closureNotes']);
      const closingReason =
        closingReasons?.find((reason) => reason.id === values.closureReason)?.title ?? '';

      await closeEarlyWarning({
        earlyWarningId,
        closingReason,
        closingNotes: values.closureNotes,
      });
      notification.success({ message: 'Early warning closed.' });
      onFinished?.();
    } catch {
      // Either a form validation error (fields are marked inline) or the axios
      // interceptor already surfaced a global error toast on failure.
    }
  };

  // The CE is not created here: the notice form is where a CE is raised, so the clause and
  // reference picked here are handed to it on the URL together with the EW to seed it from,
  // and that form's own submit makes the create call. The EW is left open — a linked CE is
  // not a closure, and the two records stay separate by design.
  const handleCreateLinkedCe = async () => {
    if (!earlyWarningId) return;
    try {
      const values = await form.validateFields(['ceTriggerType']);

      const params = new URLSearchParams({
        earlyWarningId,
        ceClause: values.ceTriggerType ?? '',
      });
      onFinished?.();
      router.push(`${MENU_PATH.COMPENSATION_EVENT.pathname}/new?${params.toString()}`);
    } catch {
      // Validation error only — the fields are marked inline.
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={CLOSE_EW_INITIAL_VALUES}
      className="[&_.ant-form-item]:mb-0!"
    >
      {/* --- Selected Decision --- */}
      {decision === 'close' ? (
        <section className={CARD}>
          <div className="badge-success flex items-center gap-2 rounded-t-lg px-5 py-3.5">
            <CheckCircleFilled className="text-base" />
            <h3 className="ds-body-strong">{close.title}</h3>
          </div>
          <div className="flex flex-1 flex-col gap-5 p-5">
            <div>
              <label className={FIELD_LABEL} htmlFor="closureReason">
                {close.reasonLabel}
              </label>
              <Form.Item
                name="closureReason"
                rules={[{ required: true, message: 'Select a closure reason' }]}
              >
                <Select
                  id="closureReason"
                  options={closureReasonOptions}
                  loading={isClosingReasonsLoading}
                  className="w-full"
                />
              </Form.Item>
            </div>

            <div>
              <label className={FIELD_LABEL} htmlFor="closureNotes">
                {close.notesLabel}
              </label>
              <Form.Item name="closureNotes">
                <TextArea id="closureNotes" rows={4} placeholder={close.notesPlaceholder} />
              </Form.Item>
            </div>

            <button
              type="button"
              disabled={isClosing || !earlyWarningId}
              onClick={handleClose}
              className="bg-main-p ds-body-strong mt-auto w-full rounded py-2.5 text-center text-white! transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClosing ? 'Closing…' : close.submit}
            </button>
          </div>
        </section>
      ) : (
        <section className={CARD}>
          <div className="badge-accent flex items-center gap-2 rounded-t-lg px-5 py-3.5">
            <PushpinFilled className="text-base" />
            <h3 className="ds-body-strong">{link.title}</h3>
          </div>
          <div className="flex flex-1 flex-col gap-5 p-5">
            <p className="ds-caption text-slate-500">{link.body(reference)}</p>

            <div className="badge-accent ds-caption rounded-lg p-3.5 font-semibold">
              {link.rule(reference)}
            </div>

            <div>
              <label className={FIELD_LABEL} htmlFor="ceTriggerType">
                {link.triggerLabel}
              </label>
              <Form.Item
                name="ceTriggerType"
                rules={[{ required: true, message: 'Select the clause the CE is raised under' }]}
              >
                <Select
                  id="ceTriggerType"
                  options={clauseOptions ?? []}
                  loading={isClausesLoading}
                  placeholder={link.triggerPlaceholder}
                  notFoundContent={isClausesLoading ? 'Loading…' : link.triggerEmpty}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  className="w-full"
                />
              </Form.Item>
            </div>

            <button
              type="button"
              disabled={!earlyWarningId}
              onClick={handleCreateLinkedCe}
              className="bg-warning ds-body-strong mt-auto w-full rounded py-2.5 text-center text-white! transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {link.submit(reference)}
            </button>
          </div>
        </section>
      )}
    </Form>
  );
}
