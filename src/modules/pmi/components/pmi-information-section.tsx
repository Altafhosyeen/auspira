import { CalendarOutlined, FileOutlined, NumberOutlined, TagOutlined } from '@ant-design/icons';
import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { EwFieldIcon } from '@/modules/early-warning';
import {
  CLAUSE_REFERENCE_PREFIX,
  PMI_DATE_FORMAT,
  PMI_FORM_COPY,
  PMI_TYPE_OPTIONS,
} from '../constants/pmi-form.constants';
import { PmiType } from '../types/pmi.types';
import PmiFormSectionCard from './pmi-form-section-card';

const copy = PMI_FORM_COPY;

// The instruction details ride into the notice's email, so they are held to the same
// ceiling the Defect Notice form puts on its description.
const INSTRUCTION_DETAILS_MAX_LENGTH = 500;

// Presentational — the "Information" card: PMI Selection (type + embedded clause), Clause
// Reference (auto-filled for presets, free-text entry for "Other"), Instruction Details
// and the contractor's response deadline.
const PmiInformationSection = () => {
  // Watched so the Clause Reference field can flip between the preset's embedded clause and
  // free-text entry the moment "Other" is picked.
  const pmiType = Form.useWatch('pmiType');
  const form = Form.useFormInstance();

  const isOther = Number(pmiType) === PmiType.Other;

  return (
    <PmiFormSectionCard icon={<FileOutlined />} title={copy.informationTitle}>
      <Row gutter={[32, 8]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={copy.pmiSelection}
            name="pmiType"
            rules={[{ required: true, message: 'PMI selection is required' }]}
          >
            <Select
              placeholder={copy.pmiSelectionPlaceholder}
              showSearch={{ optionFilterProp: 'label' }}
              prefix={<EwFieldIcon icon={<NumberOutlined />} />}
              options={PMI_TYPE_OPTIONS}
              // A preset carries its clause — write it into the Clause Reference field so the
              // PM sees exactly which clause the selection is issued under.
              onChange={(value) => {
                const option = PMI_TYPE_OPTIONS.find((candidate) => candidate.value === value);
                if (option?.clauseNumber) {
                  form.setFieldValue(
                    'clauseReference',
                    `${CLAUSE_REFERENCE_PREFIX}${option.clauseNumber}`
                  );
                } else {
                  form.setFieldValue('clauseReference', undefined);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={copy.clauseReference}
            name="clauseReference"
            rules={[{ required: true, message: 'Clause reference is required' }]}
          >
            {isOther ? (
              <Input placeholder={copy.clauseReferenceFreeTextPlaceholder} />
            ) : (
              <Input readOnly placeholder={copy.clauseReferencePlaceholder} />
            )}
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={copy.titleLabel}
            name="title"
            rules={[{ required: true, message: 'A title is required' }]}
          >
            <Input
              maxLength={120}
              showCount
              prefix={<EwFieldIcon icon={<TagOutlined />} />}
              placeholder={copy.titlePlaceholder}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={copy.responseRequiredBy}
            name="responseRequiredBy"
            rules={[{ required: true, message: 'A response date is required' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format={PMI_DATE_FORMAT}
              prefix={<EwFieldIcon icon={<CalendarOutlined />} />}
              suffixIcon={null}
              // The response window starts today — past dates are not selectable.
              disabledDate={(current) => current.isBefore(dayjs().startOf('day'), 'day')}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label={copy.instructionDetails}
            name="instructionDetails"
            // `maxLength` stops the typing at the ceiling; the rule catches a value that
            // arrives around it (a paste, or a restored draft).
            rules={[
              { required: true, message: 'Instruction details are required' },
              {
                max: INSTRUCTION_DETAILS_MAX_LENGTH,
                message: 'Instruction details must be 500 characters or fewer',
              },
            ]}
          >
            <Input.TextArea
              rows={10}
              showCount
              maxLength={INSTRUCTION_DETAILS_MAX_LENGTH}
              placeholder={copy.instructionDetailsPlaceholder}
            />
          </Form.Item>
        </Col>
      </Row>
    </PmiFormSectionCard>
  );
};

export default PmiInformationSection;
