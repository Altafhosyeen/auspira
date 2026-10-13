import { ArrowRightOutlined } from '@ant-design/icons';
import { Card, Flex } from 'antd';
import type { ReactNode } from 'react';
import PopconfirmButton from '@/components/shared/popconfirm-button';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';

const copy = REQUEST_FOR_INFORMATION_FORM_COPY;

interface RequestForInformationFormActionsProps {
  submitting?: boolean;
  onSubmit: () => void;
  /** Validates the form before the popconfirm opens. */
  onValidate?: () => unknown;
  confirmDescription?: ReactNode;
}

// Presentational — the full-width action bar beneath the Create RFI form.
const RequestForInformationFormActions = ({
  submitting = false,
  onSubmit,
  onValidate,
  confirmDescription,
}: RequestForInformationFormActionsProps) => (
  <Card styles={{ body: { padding: '16px 21px' } }}>
    <Flex align="center" justify="flex-end" gap={12} wrap>
      <PopconfirmButton
        type="primary"
        loading={submitting}
        confirmTitle={copy.confirmTitle}
        confirmDescription={confirmDescription}
        okText={copy.submit}
        beforeOpen={onValidate}
        onConfirm={onSubmit}
      >
        {copy.submit} <ArrowRightOutlined />
      </PopconfirmButton>
    </Flex>
  </Card>
);

export default RequestForInformationFormActions;
