import { Flex } from 'antd';
import type { ReactNode } from 'react';
import PopconfirmButton from '@/components/shared/popconfirm-button';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';

const { actions } = COMPENSATION_EVENT_NOTICE_COPY;

interface CompensationEventNoticeActionsProps {
  submitting?: boolean;
  onSubmit: () => void;
  /** Validates the form before the popconfirm opens. */
  onValidate?: () => unknown;
  confirmDescription?: ReactNode;
}

// Page footer — the notice's single primary button, sized to its label and set to the
// trailing edge rather than stretched across the form.
const CompensationEventNoticeActions = ({
  submitting,
  onSubmit,
  onValidate,
  confirmDescription,
}: CompensationEventNoticeActionsProps) => (
  <Flex justify="flex-end">
    <PopconfirmButton
      type="primary"
      // The design puts the icon after the label.
      iconPosition="end"
      loading={submitting}
      confirmTitle={actions.confirmTitle}
      confirmDescription={confirmDescription}
      okText={actions.spreadSheet}
      beforeOpen={onValidate}
      onConfirm={onSubmit}
    >
      {actions.spreadSheet}
    </PopconfirmButton>
  </Flex>
);

export default CompensationEventNoticeActions;
