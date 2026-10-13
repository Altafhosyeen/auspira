import { Form, Input } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { RecipientSelect } from '@/components/shared/RecipientSelect';
import { SectionCard } from '../EarlyWarningFormControls';
import { EW_FORM_COPY } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { sections, labels } = EW_FORM_COPY;

interface CommunicationDetailsCardProps {
  /** Project contact persons from GET /api/projects/:id/contact-persons — the To/Cc/Bcc suggestions. */
  recipientOptions?: DefaultOptionType[];
  isLoadingRecipients?: boolean;
  /** Shown in place of the dropdown when there is nothing to suggest. */
  noRecipientsHint?: React.ReactNode;
}

/**
 * Alert-generated EWs prefill To/CC/BCC/Subject from the originating alert email, but the
 * prefill is only a starting point — the notice still has to be addressed by hand whenever the
 * source email carried no recipients, so these stay editable in both modes. Only "From" is
 * fixed (see below).
 */
export const CommunicationDetailsCard = ({
  recipientOptions,
  isLoadingRecipients,
  noRecipientsHint,
}: CommunicationDetailsCardProps) => (
  <SectionCard title={sections.communicationDetails}>
    <div className={S.row2}>
      <Form.Item
        label={labels.to}
        name="to"
        rules={[{ required: true, type: 'array', message: 'At least one recipient is required' }]}
      >
        <RecipientSelect
          placeholder="Enter recipient emails"
          options={recipientOptions}
          loading={isLoadingRecipients}
          notFoundContent={noRecipientsHint}
        />
      </Form.Item>
      {/* DisabledTooltip wraps the Form.Item, not the Input directly — Form.Item clones its
          immediate child to inject value/onChange, and DisabledTooltip doesn't forward those
          through, so wrapping the Input itself would silently break the field's value display. */}
      <DisabledTooltip
        disabled
        reason="This is filled in automatically from the sender and can't be edited."
      >
        <Form.Item
          label={labels.raisedBy}
          name="raisedBy"
          rules={[{ required: true, message: 'From is required' }]}
        >
          {/* Alert mode: the alert email's sender. Manual mode: the logged-in user. Never editable. */}
          <Input disabled />
        </Form.Item>
      </DisabledTooltip>
    </div>

    <div className={S.row2}>
      <Form.Item label={labels.cc} name="cc">
        <RecipientSelect
          placeholder="Add CC recipients..."
          options={recipientOptions}
          loading={isLoadingRecipients}
          notFoundContent={noRecipientsHint}
        />
      </Form.Item>
      <Form.Item label={labels.bcc} name="bcc">
        <RecipientSelect
          placeholder="Add BCC recipients..."
          options={recipientOptions}
          loading={isLoadingRecipients}
          notFoundContent={noRecipientsHint}
        />
      </Form.Item>
    </div>

    <Form.Item
      label={labels.riskTitle}
      name="riskTitle"
      rules={[{ required: true, message: 'Subject is required' }]}
    >
      <Input placeholder="Early Warning Notice - ..." />
    </Form.Item>
  </SectionCard>
);
