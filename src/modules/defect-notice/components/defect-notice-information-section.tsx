import { FileOutlined } from '@ant-design/icons';
import { Form, Input, Select } from 'antd';
import {
  DEFECT_NOTICE_CLAUSE_OPTIONS,
  DEFECT_NOTICE_FORM_COPY,
} from '../constants/defect-notice.constants';
import DefectNoticeFormSection from './defect-notice-form-section';

const copy = DEFECT_NOTICE_FORM_COPY;

// The description rides into the notice's email as the body of the notification, so it is
// held to a paragraph rather than left unbounded. The PMI create form's Instruction Details
// carries the same ceiling.
const DESCRIPTION_MAX_LENGTH = 500;

// Presentational — the "Information" card: defect title, description and clause reference.
const DefectNoticeInformationSection = () => (
  <DefectNoticeFormSection icon={<FileOutlined />} title={copy.informationTitle}>
    <Form.Item name="defectTitle" label={copy.defectTitle}>
      <Input placeholder={copy.defectTitlePlaceholder} />
    </Form.Item>

    <Form.Item
      name="defectDescription"
      label={copy.defectDescription}
      // `maxLength` stops the typing at the ceiling; the rule is what catches a value that
      // arrives around it (a paste into the field, or a restored draft).
      rules={[
        { max: DESCRIPTION_MAX_LENGTH, message: 'Description must be 500 characters or fewer' },
      ]}
    >
      <Input.TextArea
        maxLength={DESCRIPTION_MAX_LENGTH}
        showCount
        placeholder={copy.defectDescriptionPlaceholder}
        autoSize={{ minRows: 3 }}
      />
    </Form.Item>

    <Form.Item name="clauseReference" label={copy.clauseReference}>
      <Select options={DEFECT_NOTICE_CLAUSE_OPTIONS} placeholder={copy.clauseReference} />
    </Form.Item>
  </DefectNoticeFormSection>
);

export default DefectNoticeInformationSection;
