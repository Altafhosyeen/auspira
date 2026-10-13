import { ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Popconfirm, Row, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';

const { actions, popconfirm } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationActionsProps {
  onAccept?: () => void;
  onProceedToAssessment?: () => void;
  onRequestRevision?: () => void;
  accepting?: boolean;
  /** Held closed until the quotation names a compensation event. */
  disabled?: boolean;
  /** The deadline has run out — the quotation can no longer be actioned either way. */
  overdue?: boolean;
  showProceedToAssessment?: boolean;
  /** Names the record in the Accept popconfirm — read off the API by the caller. */
  confirmDescription?: ReactNode;
}

const CompensationEventQuotationActions = ({
  onAccept,
  onProceedToAssessment,
  onRequestRevision,
  accepting = false,
  disabled = false,
  overdue = false,
  showProceedToAssessment = true,
  confirmDescription,
}: CompensationEventQuotationActionsProps) => {
  // An expired time bar closes the same three actions the missing link does, so both reasons
  // drive one lock — the tooltip names whichever applies, the deadline first since a link
  // picked after the window has closed still leaves the quotation unactionable.
  const locked = disabled || overdue;
  const reason = overdue ? actions.overdue : disabled ? actions.linkRequired : undefined;

  return (
    // One tooltip over the whole block: the reason is the same for all three, and a
    // disabled antd Button swallows the hover its own tooltip would need.
    <Tooltip title={reason}>
      <Flex vertical gap={12}>
        <Row gutter={12}>
          <Col span={showProceedToAssessment ? 12 : 24}>
            <Popconfirm
              title={popconfirm.accept.title}
              description={confirmDescription}
              okText={popconfirm.accept.okText}
              cancelText={popconfirm.cancel}
              okButtonProps={{ loading: accepting }}
              disabled={locked}
              onConfirm={onAccept}
            >
              <Button
                block
                type="primary"
                // The design puts the arrow after the label on both primary actions.
                iconPosition="end"
                icon={<ArrowRightOutlined />}
                loading={accepting}
                disabled={locked}
              >
                {actions.accept}
              </Button>
            </Popconfirm>
          </Col>
          {showProceedToAssessment && (
            <Col span={12}>
              <Button
                block
                type="primary"
                iconPosition="end"
                icon={<ArrowRightOutlined />}
                disabled={locked}
                onClick={onProceedToAssessment}
              >
                {actions.proceedToAssessment}
              </Button>
            </Col>
          )}
        </Row>

        <Button block icon={<ReloadOutlined />} disabled={locked} onClick={onRequestRevision}>
          {actions.requestRevision}
        </Button>
      </Flex>
    </Tooltip>
  );
};

export default CompensationEventQuotationActions;
