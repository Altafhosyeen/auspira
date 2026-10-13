import { ExclamationCircleOutlined, InfoCircleOutlined, TagOutlined } from '@ant-design/icons';
import { Col, Form, Input, Row, Select } from 'antd';
import {
  COMPENSATION_EVENT_NOTICE_COPY,
  COMPENSATION_EVENT_TYPE_OPTIONS,
  DESCRIPTION_MAX_LENGTH,
} from '../constants/compensation-event-notice.constants';
import type { EventClauseOption } from '../types/event-clause.types';
import CompensationEventNoticeFieldIcon from './compensation-event-notice-field-icon';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { sections, labels, placeholders, clauseHint, clauseEmpty } = COMPENSATION_EVENT_NOTICE_COPY;

interface CompensationEventNoticeEventInformationProps {
  clauseOptions?: EventClauseOption[];
  clausesLoading?: boolean;
}

const CompensationEventNoticeEventInformation = ({
  clauseOptions,
  clausesLoading,
}: CompensationEventNoticeEventInformationProps) => (
  <CompensationEventNoticeSectionCard
    icon={<ExclamationCircleOutlined />}
    title={sections.eventInformation}
  >
    <Row gutter={[32, 8]}>
      <Col xs={24} md={12}>
        <Form.Item
          label={labels.compensationEventType}
          name="compensationEventType"
          rules={[{ required: true, message: 'Compensation event type is required' }]}
        >
          <Select
            placeholder={placeholders.compensationEventType}
            showSearch={{ optionFilterProp: 'label' }}
            prefix={<CompensationEventNoticeFieldIcon icon={<TagOutlined />} />}
            options={COMPENSATION_EVENT_TYPE_OPTIONS}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label={labels.relevantContractClause}
          name="relevantContractClause"
          extra={clauseHint}
          rules={[{ required: true, message: 'Relevant contract clause is required' }]}
        >
          <Select
            placeholder={placeholders.relevantContractClause}
            showSearch={{ optionFilterProp: 'label' }}
            loading={clausesLoading}
            prefix={<CompensationEventNoticeFieldIcon icon={<InfoCircleOutlined />} />}
            options={clauseOptions ?? []}
            notFoundContent={clausesLoading ? undefined : clauseEmpty}
          />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label={labels.descriptionOfEvent}
          name="descriptionOfEvent"
          rules={[{ required: true, message: 'Description of event is required' }]}
        >
          <Input.TextArea
            rows={10}
            maxLength={DESCRIPTION_MAX_LENGTH}
            showCount
            placeholder={placeholders.descriptionOfEvent}
          />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label={labels.proposedEffect}
          name="proposedEffect"
          rules={[{ required: true, message: 'Proposed effect is required' }]}
        >
          <Input.TextArea
            rows={10}
            maxLength={DESCRIPTION_MAX_LENGTH}
            showCount
            placeholder={placeholders.proposedEffect}
          />
        </Form.Item>
      </Col>
    </Row>
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventNoticeEventInformation;
