import { MessageOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import { ASSESSMENT_SIZES } from '../constants/compensation-event-assessment.theme';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { comment } = PM_ASSESSMENT_COPY;

interface CompensationEventAssessmentCommentProps {
  value: string;
  onChange: (comment: string) => void;
}

// The PM's note on the assessment — the frame gives it a card of its own with nothing
// but the box, so the 63.7 verdict is carried by the clause banner underneath.
const CompensationEventAssessmentComment = ({
  value,
  onChange,
}: CompensationEventAssessmentCommentProps) => (
  <CompensationEventNoticeSectionCard icon={<MessageOutlined />} title={comment.title} gap={16}>
    <Input.TextArea
      value={value}
      rows={ASSESSMENT_SIZES.reasoningRows}
      placeholder={comment.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventAssessmentComment;
