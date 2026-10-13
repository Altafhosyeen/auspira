import {
  CalendarOutlined,
  FileTextOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AutoComplete, Col, DatePicker, Form, Input, Row } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { RecipientSelect } from '@/components/shared/RecipientSelect';
import {
  COMPENSATION_EVENT_NOTICE_COPY,
  NOTICE_DATE_FORMAT,
} from '../constants/compensation-event-notice.constants';
import CompensationEventNoticeFieldIcon from './compensation-event-notice-field-icon';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { sections, labels, placeholders } = COMPENSATION_EVENT_NOTICE_COPY;

interface CompensationEventNoticeBasicDetailsProps {
  // The project's contact persons — suggestions for every recipient field. The selects stay
  // free-text, so a one-off address that is not a project contact still goes through.
  recipientOptions?: DefaultOptionType[];
  recipientsLoading?: boolean;
  noRecipientsHint?: string;
}

// Matches on the address alone: the option label is a rich two-line node, so the default
// label-based filter has nothing to search.
const filterByAddress = (input: string, option?: DefaultOptionType) =>
  String(option?.value ?? '')
    .toLowerCase()
    .includes(input.toLowerCase());

const CompensationEventNoticeBasicDetails = ({
  recipientOptions,
  recipientsLoading,
  noRecipientsHint,
}: CompensationEventNoticeBasicDetailsProps) => (
  <CompensationEventNoticeSectionCard icon={<FileTextOutlined />} title={sections.basicDetails}>
    <Row gutter={[32, 8]}>
      <Col xs={24} md={12}>
        <Form.Item
          label={labels.to}
          name="to"
          // type 'array' is what makes `required` reject an emptied recipient list — without
          // it async-validator only rejects null/undefined, so [] would pass.
          rules={[{ required: true, type: 'array', message: 'A recipient is required' }]}
        >
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={placeholders.to}
            prefix={<CompensationEventNoticeFieldIcon icon={<UserOutlined />} />}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label={labels.from}
          name="from"
          rules={[{ required: true, message: 'A sender is required' }]}
        >
          {/* One sender, so this stays a single value — AutoComplete offers the same contact
              list while still accepting an address that is not on it. */}
          <AutoComplete options={recipientOptions} filterOption={filterByAddress}>
            <Input
              placeholder={placeholders.from}
              prefix={<CompensationEventNoticeFieldIcon icon={<UserOutlined />} />}
            />
          </AutoComplete>
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label={labels.bcc} name="bcc">
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={placeholders.bcc}
            prefix={<CompensationEventNoticeFieldIcon icon={<NumberOutlined />} />}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item label={labels.cc} name="cc">
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={placeholders.cc}
            prefix={<CompensationEventNoticeFieldIcon icon={<NumberOutlined />} />}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label={labels.dateIssued}
          name="dateIssued"
          rules={[{ required: true, message: 'Date issued is required' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format={NOTICE_DATE_FORMAT}
            prefix={<CompensationEventNoticeFieldIcon icon={<CalendarOutlined />} />}
            suffixIcon={null}
          />
        </Form.Item>
      </Col>
    </Row>
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventNoticeBasicDetails;
