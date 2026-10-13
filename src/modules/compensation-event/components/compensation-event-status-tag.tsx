import { Tag } from 'antd';
import {
  COMPENSATION_EVENT_STATUS_COLORS,
  COMPENSATION_EVENT_STATUS_LABELS,
} from '../constants/compensation-event.constants';
import type { CompensationEventStatus } from '../types/compensation-event.types';

interface CompensationEventStatusTagProps {
  status: CompensationEventStatus;
}

const CompensationEventStatusTag = ({ status }: CompensationEventStatusTagProps) => (
  <Tag color={COMPENSATION_EVENT_STATUS_COLORS[status]}>
    {COMPENSATION_EVENT_STATUS_LABELS[status]}
  </Tag>
);

export default CompensationEventStatusTag;
