import { EditOutlined, ProfileOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Typography } from 'antd';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import {
  ASSESSMENT_COLORS,
  ASSESSMENT_SIZES,
} from '../constants/compensation-event-assessment.theme';
import { QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type {
  AssessmentBasis,
  AssessmentFigure,
} from '../types/compensation-event-assessment.types';
import { formatAssessmentFigure } from '../utils/compensation-event-assessment.utils';
import CompensationEventLabelValueRow from './compensation-event-label-value-row';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { summary } = PM_ASSESSMENT_COPY;

interface CompensationEventAssessmentSummaryProps {
  currency: string;
  contractorClaim: AssessmentFigure;
  pmAssessment: AssessmentFigure;
  basis: AssessmentBasis;
  onEdit?: () => void;
}

const CompensationEventAssessmentSummary = ({
  currency,
  contractorClaim,
  pmAssessment,
  basis,
  onEdit,
}: CompensationEventAssessmentSummaryProps) => {
  const figure = (value: AssessmentFigure) => (
    <Flex align="baseline" gap={8} wrap>
      <Typography.Text strong style={{ fontSize: QUOTATION_SIZES.cellFontSize }}>
        {formatAssessmentFigure(value, currency)}
      </Typography.Text>
      {value.note && (
        <Typography.Text type="secondary" style={{ fontSize: ASSESSMENT_SIZES.noteFontSize }}>
          {`(${value.note})`}
        </Typography.Text>
      )}
    </Flex>
  );

  return (
    <CompensationEventNoticeSectionCard
      icon={<ProfileOutlined />}
      title={summary.title}
      gap={12}
      extra={
        <Button icon={<EditOutlined />} onClick={onEdit}>
          {summary.edit}
        </Button>
      }
    >
      <div>
        <CompensationEventLabelValueRow
          label={summary.contractorClaim}
          value={figure(contractorClaim)}
          labelSpan={ASSESSMENT_SIZES.labelColumnSpan}
        />

        <Divider style={{ margin: '10px 0', borderColor: ASSESSMENT_COLORS.rowDivider }} />

        <CompensationEventLabelValueRow
          label={summary.pmAssessment}
          value={figure(pmAssessment)}
          labelSpan={ASSESSMENT_SIZES.labelColumnSpan}
        />

        <Divider style={{ margin: '10px 0', borderColor: ASSESSMENT_COLORS.rowDivider }} />

        <CompensationEventLabelValueRow
          label={summary.basis}
          labelSpan={ASSESSMENT_SIZES.labelColumnSpan}
          value={
            <Flex align="baseline" gap={6} wrap>
              <Typography.Text strong style={{ fontSize: QUOTATION_SIZES.cellFontSize }}>
                {basis.lead}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: ASSESSMENT_SIZES.noteFontSize }}>
                {basis.detail}
              </Typography.Text>
            </Flex>
          }
        />
      </div>
    </CompensationEventNoticeSectionCard>
  );
};

export default CompensationEventAssessmentSummary;
