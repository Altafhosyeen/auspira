import { Card, Descriptions } from 'antd';
import type { CompensationEvent } from '../types/compensation-event.types';
import { formatCompensationAmount } from '../utils/compensation-event.utils';
import CompensationEventStatusTag from './compensation-event-status-tag';

interface CompensationEventCardProps {
  event: CompensationEvent;
}

const CompensationEventCard = ({ event }: CompensationEventCardProps) => (
  <Card title={event.reference}>
    <Descriptions column={1} size="small">
      <Descriptions.Item label="Title">{event.title}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <CompensationEventStatusTag status={event.status} />
      </Descriptions.Item>
      <Descriptions.Item label="Amount">
        {formatCompensationAmount(event.amount, event.currency)}
      </Descriptions.Item>
      <Descriptions.Item label="Event date">{event.eventDate}</Descriptions.Item>
    </Descriptions>
  </Card>
);

export default CompensationEventCard;
