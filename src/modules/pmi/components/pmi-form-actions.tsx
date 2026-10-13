import { BellOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { ReactNode } from 'react';
import PopconfirmButton from '@/components/shared/popconfirm-button';

interface PmiFormActionsProps {
  submitting?: boolean;
  /** Button label — "Notify Compensation Event" for the scope/key-date PMI, "Notify" otherwise. */
  label: string;
  onSubmit: () => void;
  /** Validates the form before the popconfirm opens. */
  onValidate?: () => unknown;
  confirmDescription?: ReactNode;
}

// Presentational — the action bar beneath the Create PMI form. One submit button; the
// caller names it based on the selected PMI type (scope/key-date instructions notify a
// compensation event, everything else just notifies). Both post the same register API.
const PmiFormActions = ({
  submitting = false,
  label,
  onSubmit,
  onValidate,
  confirmDescription,
}: PmiFormActionsProps) => (
  <Flex align="center" justify="flex-end" gap={12} wrap>
    <PopconfirmButton
      type="primary"
      icon={<BellOutlined />}
      loading={submitting}
      confirmTitle={`${label} this PMI?`}
      confirmDescription={confirmDescription}
      okText={label}
      beforeOpen={onValidate}
      onConfirm={onSubmit}
    >
      {label}
    </PopconfirmButton>
  </Flex>
);

export default PmiFormActions;
