'use client';

import { CheckOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import PopconfirmButton from '@/components/shared/popconfirm-button';
import { EARLY_WARNING_REGISTER_FORM_COPY } from '../../constants/early-warning.constants';

interface EwFormActionsProps {
  loading?: boolean;
  /** Live reference — the primary button reads "Register EW-015" per the design. */
  reference?: string;
  block?: boolean;
}

const EwFormActions = ({ loading, reference, block = true }: EwFormActionsProps) => {
  // Rendered inside the register Form, so it validates and submits that form itself.
  const form = Form.useFormInstance();
  const riskTitle = Form.useWatch('riskTitle', form);
  const notifyLabel = reference
    ? `Notify ${reference}`
    : EARLY_WARNING_REGISTER_FORM_COPY.actions.notify;

  return (
    <PopconfirmButton
      block={block}
      type="primary"
      loading={loading}
      icon={<CheckOutlined />}
      iconPosition="end"
      style={!block ? { minWidth: 160 } : undefined}
      confirmTitle={`${notifyLabel}?`}
      confirmDescription={riskTitle}
      okText={EARLY_WARNING_REGISTER_FORM_COPY.actions.notify}
      beforeOpen={() => form.validateFields()}
      onConfirm={() => form.submit()}
    >
      {notifyLabel}
    </PopconfirmButton>
  );
};

export default EwFormActions;
