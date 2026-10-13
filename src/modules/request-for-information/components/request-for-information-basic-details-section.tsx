import { AutoComplete, Col, DatePicker, Form, Input, Row } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { RecipientSelect } from '@/components/shared/RecipientSelect';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';
import RequestForInformationFormSection from './request-for-information-form-section';

const copy = REQUEST_FOR_INFORMATION_FORM_COPY;

// Matches on the address alone: the contact option label is a rich two-line node, so the
// default label-based filter has nothing to search.
const filterByAddress = (input: string, option?: DefaultOptionType) =>
  String(option?.value ?? '')
    .toLowerCase()
    .includes(input.toLowerCase());

interface RequestForInformationBasicDetailsSectionProps {
  // The project's contact persons — suggestions for every recipient field, same source
  // (`useRecipientOptions`) the Compensation Event notice form uses. The fields stay
  // free-text, so a one-off address that is not a project contact still goes through.
  recipientOptions?: DefaultOptionType[];
  recipientsLoading?: boolean;
  noRecipientsHint?: string;
}

// Presentational — the "Basic Details" card: To / From / BCC / CC / Role / Date Issued.
const RequestForInformationBasicDetailsSection = ({
  recipientOptions,
  recipientsLoading,
  noRecipientsHint,
}: RequestForInformationBasicDetailsSectionProps) => (
  <RequestForInformationFormSection title={copy.basicDetailsTitle}>
    <Row gutter={[24, 4]}>
      <Col xs={24} md={12}>
        <Form.Item name="to" label={copy.to}>
          <RecipientSelect
            options={recipientOptions}
            loading={recipientsLoading}
            notFoundContent={noRecipientsHint}
            filterOption={filterByAddress}
            placeholder={copy.to}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="from" label={copy.from}>
          {/* One sender, so this stays a single value — AutoComplete offers the same contact
              list while still accepting an address that is not on it. */}
          <AutoComplete options={recipientOptions} filterOption={filterByAddress}>
            <Input placeholder={copy.from} />
          </AutoComplete>
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
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
      <Col xs={24} md={12}>
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
      <Col xs={24} md={12}>
        <Form.Item name="basicRole" label={copy.role}>
          <Input placeholder={copy.role} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="dateIssued" label={copy.dateIssued}>
          <DatePicker className="w-full" format="DD-MMM-YYYY" />
        </Form.Item>
      </Col>
    </Row>
  </RequestForInformationFormSection>
);

export default RequestForInformationBasicDetailsSection;
