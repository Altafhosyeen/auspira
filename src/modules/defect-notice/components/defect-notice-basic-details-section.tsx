import { FileOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { RecipientSelect } from '@/components/shared/RecipientSelect';
import { DEFECT_NOTICE_FORM_COPY } from '../constants/defect-notice.constants';
import DefectNoticeFormSection from './defect-notice-form-section';

const copy = DEFECT_NOTICE_FORM_COPY;

const filterByAddress = (input: string, option?: DefaultOptionType) =>
  String(option?.value ?? '')
    .toLowerCase()
    .includes(input.toLowerCase());

interface DefectNoticeBasicDetailsSectionProps {
  // The project's contact persons — suggestions for every recipient field, same source
  // (`useRecipientOptions`) every other notice form uses. The fields stay free-text, so a
  // one-off address that is not a project contact still goes through.
  recipientOptions?: DefaultOptionType[];
  recipientsLoading?: boolean;
  noRecipientsHint?: string;
}

// Presentational — the "Basic Details" card: To / CC / BCC.
const DefectNoticeBasicDetailsSection = ({
  recipientOptions,
  recipientsLoading,
  noRecipientsHint,
}: DefectNoticeBasicDetailsSectionProps) => (
  <DefectNoticeFormSection icon={<FileOutlined />} title={copy.basicDetailsTitle}>
    <Row gutter={[32, 8]}>
      <Col xs={24} md={8}>
        <Form.Item name="to" label={copy.to}>
          <RecipientSelect
            prefix={<UserOutlined />}
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={copy.to}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="cc" label={copy.cc}>
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={copy.ccPlaceholder}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="bcc" label={copy.bcc}>
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={copy.bccPlaceholder}
          />
        </Form.Item>
      </Col>
    </Row>
  </DefectNoticeFormSection>
);

export default DefectNoticeBasicDetailsSection;
