import { BellOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { ReactNode } from 'react';
import PopconfirmButton from '@/components/shared/popconfirm-button';
import { DEFECT_NOTICE_FORM_COPY } from '../constants/defect-notice.constants';

interface DefectNoticeFormActionsProps {
  submitting?: boolean;
  onSubmit: () => void;
  /** Validates the form before the popconfirm opens. */
  onValidate?: () => unknown;
  confirmDescription?: ReactNode;
}

// Presentational — the action bar beneath the Create Defect Notice form. It sits outside any
// card so it reads as the form's own footer rather than a third section, the way the Create
// PMI screen ends; the bell trails the label.
const DefectNoticeFormActions = ({
  submitting = false,
  onSubmit,
  onValidate,
  confirmDescription,
}: DefectNoticeFormActionsProps) => (
  <Flex align="center" justify="flex-end" gap={12} wrap>
    <PopconfirmButton
      type="primary"
      icon={<BellOutlined />}
      iconPosition="end"
      loading={submitting}
      confirmTitle={DEFECT_NOTICE_FORM_COPY.confirmTitle}
      confirmDescription={confirmDescription}
      okText={DEFECT_NOTICE_FORM_COPY.submit}
      beforeOpen={onValidate}
      onConfirm={onSubmit}
    >
      {DEFECT_NOTICE_FORM_COPY.submit}
    </PopconfirmButton>
  </Flex>
);

export default DefectNoticeFormActions;
