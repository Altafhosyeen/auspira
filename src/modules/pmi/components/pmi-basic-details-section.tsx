import { FileOutlined, NumberOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { RecipientSelect } from '@/components/shared/RecipientSelect';
import { EwFieldIcon } from '@/modules/early-warning';
import { PMI_FORM_COPY } from '../constants/pmi-form.constants';
import PmiFormSectionCard from './pmi-form-section-card';

const copy = PMI_FORM_COPY;

// Matches on the address alone: the contact option label is a rich two-line node, so the
// default label-based filter has nothing to search.
const filterByAddress = (input: string, option?: DefaultOptionType) =>
  String(option?.value ?? '')
    .toLowerCase()
    .includes(input.toLowerCase());

interface PmiBasicDetailsSectionProps {
  // The project's contact persons — suggestions for every recipient field. The selects stay
  // free-text, so a one-off address that is not a project contact still goes through.
  recipientOptions?: DefaultOptionType[];
  recipientsLoading?: boolean;
  noRecipientsHint?: string;
}

// Presentational — the "Basic Details" card: To / CC / BCC, three across like the design.
const PmiBasicDetailsSection = ({
  recipientOptions,
  recipientsLoading,
  noRecipientsHint,
}: PmiBasicDetailsSectionProps) => (
  <PmiFormSectionCard icon={<FileOutlined />} title={copy.basicDetailsTitle}>
    <Row gutter={[32, 8]}>
      <Col xs={24} md={8}>
        <Form.Item
          label={copy.to}
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
            placeholder={copy.toPlaceholder}
            prefix={<EwFieldIcon icon={<UserOutlined />} />}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item label={copy.cc} name="cc">
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={copy.ccPlaceholder}
            prefix={<EwFieldIcon icon={<NumberOutlined />} />}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item label={copy.bcc} name="bcc">
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={copy.bccPlaceholder}
            prefix={<EwFieldIcon icon={<NumberOutlined />} />}
          />
        </Form.Item>
      </Col>
    </Row>
  </PmiFormSectionCard>
);

export default PmiBasicDetailsSection;
