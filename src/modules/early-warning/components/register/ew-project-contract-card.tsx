'use client';

import { CalendarOutlined, FileTextOutlined, NumberOutlined, TagOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Flex, Form, Input, Row } from 'antd';
import {
  DATE_RAISED_DISPLAY_FORMAT,
  EARLY_WARNING_REGISTER_FORM_COPY,
} from '../../constants/early-warning.constants';
import type { RegisterEarlyWarningFormValues } from '../../types/early-warning.types';
import EwFieldIcon from './ew-field-icon';
import EwIconChip from './ew-icon-chip';

const { labels, sections } = EARLY_WARNING_REGISTER_FORM_COPY;

interface EwProjectContractCardProps {
  /** Alert flow: reference and date may be locked/pre-filled. */
  lockedDateRaised?: boolean;
}

// "Project Contract" card — presentational; parent <Form> owns the values.
const EwProjectContractCard = ({ lockedDateRaised }: EwProjectContractCardProps) => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <EwIconChip icon={<FileTextOutlined />} />
        {sections.projectContract}
      </Flex>
    }
  >
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item<RegisterEarlyWarningFormValues>
          name="dateRaised"
          label={labels.date}
          rules={[{ required: true, message: 'Select date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format={DATE_RAISED_DISPLAY_FORMAT}
            prefix={<EwFieldIcon icon={<CalendarOutlined />} />}
            disabled={lockedDateRaised}
            suffixIcon={null}
          />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="projectName" label={labels.projectName}>
          <Input prefix={<EwFieldIcon icon={<NumberOutlined />} />} placeholder="Greenland" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues>
          name="projectReference"
          label={labels.contractReference}
        >
          <Input prefix={<EwFieldIcon icon={<TagOutlined />} />} placeholder="GR1N" />
        </Form.Item>
      </Col>
    </Row>
  </Card>
);

export default EwProjectContractCard;
