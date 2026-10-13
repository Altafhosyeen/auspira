import { ArrowRightOutlined } from '@ant-design/icons';
import { Flex, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import PopconfirmButton from '@/components/shared/popconfirm-button';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';

const { actions } = PM_ASSESSMENT_COPY;

interface CompensationEventAssessmentActionsProps {
  reference: string;
  implementing?: boolean;
  /** Held closed until the assessment names the compensation event it implements. */
  disabled?: boolean;
  onImplement: () => void;
  /** Checks the assessment before the popconfirm opens. */
  onValidate?: () => unknown;
  confirmDescription?: ReactNode;
}

const CompensationEventAssessmentActions = ({
  reference,
  implementing,
  disabled = false,
  onImplement,
  onValidate,
  confirmDescription,
}: CompensationEventAssessmentActionsProps) => (
  <Flex vertical gap={16}>
    {/* The tooltip sits over the block, because a disabled antd Button swallows the hover its own tooltip would need. */}
    <Tooltip title={disabled ? actions.linkRequired : undefined}>
      <PopconfirmButton
        block
        type="primary"
        iconPosition="end"
        icon={<ArrowRightOutlined />}
        loading={implementing}
        disabled={disabled}
        confirmTitle={actions.confirmTitle}
        confirmDescription={confirmDescription}
        okText={actions.implementPrefix}
        beforeOpen={onValidate}
        onConfirm={onImplement}
      >
        {/* The event is only named once the quotation screen has linked one. */}
        {`${actions.implementPrefix} ${reference}`.trim()}
      </PopconfirmButton>
    </Tooltip>
  </Flex>
);

export default CompensationEventAssessmentActions;
