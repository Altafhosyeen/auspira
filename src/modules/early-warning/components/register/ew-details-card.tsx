'use client';

import { CalendarOutlined, EditOutlined, FileTextOutlined, MailOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Flex, Form, Input, Row, Select, Typography } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import {
  DATE_RAISED_DISPLAY_FORMAT,
  EARLY_WARNING_REGISTER_FORM_COPY,
} from '../../constants/early-warning.constants';
import type { RegisterEarlyWarningFormValues } from '../../types/early-warning.types';
import EwFieldIcon from './ew-field-icon';
import EwIconChip from './ew-icon-chip';

const { labels, sections } = EARLY_WARNING_REGISTER_FORM_COPY;

interface EwDetailsCardProps {
  recipientOptions?: DefaultOptionType[];
  isLoadingRecipients?: boolean;
  /** Shown as dropdown hint when the project has no contact persons yet. */
  noRecipientsHint?: string;
  /** Reference pre-assigned by the backend (alert flow) — read-only "Auto-ref" note. */
  autoReference?: string;
  /** Alert flow: date and source are pre-filled and read-only. */
  lockedDateRaised?: boolean;
}

// "Early Warning Details" card — presentational; the parent <Form> owns the values.
const EwDetailsCard = ({
  recipientOptions,
  isLoadingRecipients,
  noRecipientsHint,
  autoReference,
  lockedDateRaised,
}: EwDetailsCardProps) => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <EwIconChip icon={<FileTextOutlined />} />
        {sections.earlyWarningDetails}
      </Flex>
    }
    extra={
      autoReference ? (
        <Typography.Text type="secondary">
          {labels.autoRef} {autoReference}
        </Typography.Text>
      ) : undefined
    }
  >
    <Form.Item<RegisterEarlyWarningFormValues> name="ewReference" hidden>
      <Input />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues> name="raisedBy" label={labels.raisedBy}>
      <Select
        mode="tags"
        maxCount={1}
        loading={isLoadingRecipients}
        options={recipientOptions}
        placeholder="Contractor (Build Co Ltd)"
        notFoundContent={noRecipientsHint}
      />
    </Form.Item>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="to" label={labels.to}>
          <Select
            mode="tags"
            loading={isLoadingRecipients}
            options={recipientOptions}
            placeholder="Recipients"
            tokenSeparators={[',', ';']}
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
            tokenSeparators={[',', ';']}
            notFoundContent={noRecipientsHint}
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item<RegisterEarlyWarningFormValues> name="bcc" label={labels.bcc}>
      <Select
        mode="tags"
        loading={isLoadingRecipients}
        options={recipientOptions}
        tokenSeparators={[',', ';']}
        notFoundContent={noRecipientsHint}
      />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="riskTitle"
      label={labels.riskTitle}
      rules={[{ required: true, message: 'Enter the risk title' }]}
    >
      <Input prefix={<EwFieldIcon icon={<EditOutlined />} />} />
    </Form.Item>

    <Form.Item<RegisterEarlyWarningFormValues>
      name="riskDescription"
      label={labels.riskDescription}
    >
      <Input.TextArea rows={4} />
    </Form.Item>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues>
          name="dateRaised"
          label={labels.dateRaised}
          rules={[{ required: true, message: 'Pick the date raised' }]}
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
      <Col span={12}>
        <Form.Item<RegisterEarlyWarningFormValues> name="source" label={labels.source}>
          <Input prefix={<EwFieldIcon icon={<MailOutlined />} />} disabled={lockedDateRaised} />
        </Form.Item>
      </Col>
    </Row>
  </Card>
);

export default EwDetailsCard;
