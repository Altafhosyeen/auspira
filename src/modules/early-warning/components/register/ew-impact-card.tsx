'use client';

import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Flex, Form, Input, Row } from 'antd';
import {
  EARLY_WARNING_IMPACT_TYPE_OPTIONS,
  EARLY_WARNING_REGISTER_FORM_COPY,
} from '../../constants/early-warning.constants';
import type { RegisterEarlyWarningFormValues } from '../../types/early-warning.types';
import EwFieldIcon from './ew-field-icon';
import EwIconChip from './ew-icon-chip';

const { labels, sections } = EARLY_WARNING_REGISTER_FORM_COPY;

// "Impact Assessment" card — presentational; time/cost free-text folds into
// PotentialImpacts at submit (see toRegisterEarlyWarningRequest).
const EwImpactCard = () => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <EwIconChip icon={<FileTextOutlined />} />
        {sections.impactAssessment}
      </Flex>
    }
  >
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="timeImpact" label={labels.timeImpact}>
          <Input
            prefix={<EwFieldIcon icon={<EditOutlined />} />}
            placeholder="e.g. 3-4 weeks (estimated)"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="costImpact" label={labels.costImpact}>
          <Input
            prefix={<EwFieldIcon icon={<EditOutlined />} />}
            placeholder="e.g. TBC - awaiting contractor estimate"
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="keyDatesAffected"
      label={labels.keyDatesAffected}
    >
      <Input
        prefix={<EwFieldIcon icon={<EditOutlined />} />}
        placeholder="e.g. Section 1 Completion - 14 August 2026"
      />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues> name="impactTypes" label={labels.impactTypes}>
      <Checkbox.Group options={EARLY_WARNING_IMPACT_TYPE_OPTIONS} />
    </Form.Item>
  </Card>
);

export default EwImpactCard;
