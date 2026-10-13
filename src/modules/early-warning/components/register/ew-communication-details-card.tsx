'use client';

import { FileTextOutlined, NumberOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Flex, Form, Input, Row, Select } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { EARLY_WARNING_REGISTER_FORM_COPY } from '../../constants/early-warning.constants';
import type { RegisterEarlyWarningFormValues } from '../../types/early-warning.types';
import EwFieldIcon from './ew-field-icon';
import EwIconChip from './ew-icon-chip';

const { labels, sections } = EARLY_WARNING_REGISTER_FORM_COPY;

interface EwCommunicationDetailsCardProps {
  recipientOptions?: DefaultOptionType[];
  isLoadingRecipients?: boolean;
  noRecipientsHint?: string;
}

// "Communication Details" card — presentational; parent <Form> owns the values.
const EwCommunicationDetailsCard = ({
  recipientOptions,
  isLoadingRecipients,
  noRecipientsHint,
}: EwCommunicationDetailsCardProps) => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <EwIconChip icon={<FileTextOutlined />} />
        {sections.communicationDetails}
      </Flex>
    }
  >
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="to" label={labels.to}>
          <Select
            mode="tags"
            loading={isLoadingRecipients}
            options={recipientOptions}
            placeholder="David Thompson"
            tokenSeparators={[',', ';']}
            prefix={<EwFieldIcon icon={<UserOutlined />} />}
            notFoundContent={noRecipientsHint}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="raisedBy" label={labels.from}>
          <Select
            mode="tags"
            maxCount={1}
            loading={isLoadingRecipients}
            options={recipientOptions}
            placeholder="Sarah Mitchell"
            prefix={<EwFieldIcon icon={<UserOutlined />} />}
            notFoundContent={noRecipientsHint}
          />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="bcc" label={labels.bcc}>
          <Select
            mode="tags"
            loading={isLoadingRecipients}
            options={recipientOptions}
            placeholder="Add BCC recipients"
            tokenSeparators={[',', ';']}
            prefix={<EwFieldIcon icon={<NumberOutlined />} />}
            notFoundContent={noRecipientsHint}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="cc" label={labels.cc}>
          <Select
            mode="tags"
            loading={isLoadingRecipients}
            options={recipientOptions}
            placeholder="Add CC recipients"
            tokenSeparators={[',', ';']}
            prefix={<EwFieldIcon icon={<NumberOutlined />} />}
            notFoundContent={noRecipientsHint}
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="riskTitle"
      label={labels.subject}
      rules={[{ required: true, message: 'Enter subject' }]}
    >
      <Input
        prefix={<EwFieldIcon icon={<TagOutlined />} />}
        placeholder="Early Warning Notice (Clause 15.1) - ..."
      />
    </Form.Item>
  </Card>
);

export default EwCommunicationDetailsCard;
