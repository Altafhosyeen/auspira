'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Card, Flex, Form, Input } from 'antd';
import { EARLY_WARNING_REGISTER_FORM_COPY } from '../../constants/early-warning.constants';
import type { RegisterEarlyWarningFormValues } from '../../types/early-warning.types';
import EwIconChip from './ew-icon-chip';

const { labels, sections } = EARLY_WARNING_REGISTER_FORM_COPY;

// "Early Warning Matter" card — presentational; parent <Form> owns the values.
const EwMatterCard = () => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <EwIconChip icon={<FileTextOutlined />} />
        {sections.earlyWarningMatter}
      </Flex>
    }
  >
    <Form.Item<RegisterEarlyWarningFormValues>
      name="riskDescription"
      label={labels.descriptionOfMatter}
    >
      <Input.TextArea rows={4} placeholder="Describe the matter..." />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="potentialImpact"
      label={labels.potentialImpact}
    >
      <Input.TextArea rows={3} placeholder="Describe potential impact..." />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="proposedActions"
      label={labels.proposedMitigationActions}
    >
      <Input.TextArea rows={3} placeholder="Describe proposed mitigation actions..." />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="keyDatesAffected"
      label={labels.keyDatesAffected}
    >
      <Input.TextArea rows={2} placeholder={labels.keyDatesPlaceholder} />
    </Form.Item>
  </Card>
);

export default EwMatterCard;
