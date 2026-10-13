import { Avatar, Select, Tag, Typography } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { COMPOSE_EMAIL_LIMITS } from '../constants/compensation-event-email.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import { getRecipientInitials } from '../utils/compensation-event-email.utils';

interface CompensationEventRecipientSelectProps {
  value: string[];
  onChange: (recipients: string[]) => void;
  placeholder: string;
  options?: DefaultOptionType[];
  loading?: boolean;
  notFoundContent?: string;
}

// Presentational — a To/Cc/Bcc field: project contacts as suggestions, but `mode="tags"`
// keeps it free text so a one-off address that is not a project contact still goes through.
const CompensationEventRecipientSelect = ({
  value,
  onChange,
  placeholder,
  options,
  loading,
  notFoundContent,
}: CompensationEventRecipientSelectProps) => (
  <Select
    mode="tags"
    showSearch
    // Without this the chosen tag would render the two-line contact label, not the address.
    optionLabelProp="value"
    value={value}
    onChange={onChange}
    options={options}
    loading={loading}
    notFoundContent={notFoundContent}
    placeholder={placeholder}
    suffixIcon={
      <Typography.Text type="secondary" style={{ fontSize: QUOTATION_SIZES.memberFontSize }}>
        {`${value.length}/${COMPOSE_EMAIL_LIMITS.recipientsMaxLength}`}
      </Typography.Text>
    }
    maxTagCount="responsive"
    // Semicolons included so a recipient list pasted out of Outlook splits into tags.
    tokenSeparators={[',', ';', ' ']}
    tagRender={({ label, closable, onClose }) => (
      <Tag
        closable={closable}
        onClose={onClose}
        style={{ alignItems: 'center', display: 'inline-flex', gap: 6, paddingInline: 6 }}
      >
        <Avatar
          shape="square"
          size={QUOTATION_SIZES.memberAvatar}
          style={{
            backgroundColor: QUOTATION_COLORS.submittedBg,
            color: QUOTATION_COLORS.submittedText,
            fontSize: 9,
          }}
        >
          {getRecipientInitials(String(label))}
        </Avatar>
        {label}
      </Tag>
    )}
    style={{ width: '100%' }}
  />
);

export default CompensationEventRecipientSelect;
