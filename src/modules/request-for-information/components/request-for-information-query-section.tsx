import { DatePicker, Form, Input } from 'antd';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';
import RequestForInformationFormSection from './request-for-information-form-section';

const copy = REQUEST_FOR_INFORMATION_FORM_COPY;

// Presentational — the "RFI Details" card: the query itself, its references, proposed
// solution and the date a response is required by.
const RequestForInformationQuerySection = () => (
  <RequestForInformationFormSection title={copy.rfiDetailsTitle}>
    <Form.Item name="rfiSubject" label={copy.rfiSubject}>
      <Input placeholder={copy.rfiSubjectPlaceholder} />
    </Form.Item>

    <Form.Item name="rfiDetails" label={copy.rfiDetails}>
      <Input.TextArea placeholder={copy.rfiDetailsPlaceholder} autoSize={{ minRows: 3 }} />
    </Form.Item>

    <Form.Item name="drawingReferences" label={copy.drawingReferences}>
      <Input placeholder={copy.referencesPlaceholder} />
    </Form.Item>

    <Form.Item name="specificationReferences" label={copy.specificationReferences}>
      <Input placeholder={copy.referencesPlaceholder} />
    </Form.Item>

    <Form.Item name="otherReferences" label={copy.otherReferences}>
      <Input placeholder={copy.referencesPlaceholder} />
    </Form.Item>

    <Form.Item name="proposedSolution" label={copy.proposedSolution}>
      <Input.TextArea placeholder={copy.proposedSolutionPlaceholder} autoSize={{ minRows: 3 }} />
    </Form.Item>

    <Form.Item name="responseRequiredBy" label={copy.responseRequiredBy}>
      <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
    </Form.Item>
  </RequestForInformationFormSection>
);

export default RequestForInformationQuerySection;
