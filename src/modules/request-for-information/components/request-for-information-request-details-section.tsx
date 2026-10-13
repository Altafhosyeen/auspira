import { Col, Form, Input, Row } from 'antd';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';
import RequestForInformationFormSection from './request-for-information-form-section';

const copy = REQUEST_FOR_INFORMATION_FORM_COPY;

// Presentational — the "Request For Information" card: project/reference identity fields.
const RequestForInformationRequestDetailsSection = () => (
  <RequestForInformationFormSection title={copy.requestDetailsTitle}>
    <Row gutter={[24, 4]}>
      <Col xs={24} md={12}>
        <Form.Item name="projectName" label={copy.projectName}>
          <Input placeholder={copy.projectName} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="requestRole" label={copy.role}>
          <Input placeholder={copy.role} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="raisedTo" label={copy.raisedTo}>
          <Input placeholder={copy.raisedTo} />
        </Form.Item>
      </Col>
    </Row>
  </RequestForInformationFormSection>
);

export default RequestForInformationRequestDetailsSection;
