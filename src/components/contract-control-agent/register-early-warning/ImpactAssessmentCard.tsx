import { Form, Input } from 'antd';
import { SectionCard } from '../EarlyWarningFormControls';
import { EW_FORM_COPY } from '../early-warning-form.data';

const { labels, sections } = EW_FORM_COPY;

export const ImpactAssessmentCard = () => (
  <SectionCard title={sections.earlyWarningMatter} aside={sections.earlyWarningMatterHint}>
    <Form.Item
      label={labels.riskDescription}
      name="riskDescription"
      rules={[{ required: true, message: 'Description of matter is required' }]}
    >
      <Input.TextArea
        rows={4}
        placeholder="Describe the matter that could affect cost, time, or quality (per Clause 15)..."
      />
    </Form.Item>

    {/* Full-width rows rather than a 2-up grid — as textareas these need the room. */}
    <Form.Item label={labels.potentialImpacts} name="potentialImpacts">
      <Input.TextArea
        rows={4}
        placeholder="Describe potential impacts on cost, programme, or performance..."
      />
    </Form.Item>

    <Form.Item label={labels.proposedActions} name="proposedActions">
      <Input.TextArea
        rows={4}
        placeholder="Describe proposed actions to avoid or reduce the impact..."
      />
    </Form.Item>

    <Form.Item label={labels.keyDatesAffected} name="keyDatesAffected">
      <Input.TextArea
        rows={4}
        placeholder="Describe key dates affected by this matter..."
      />
    </Form.Item>

    {/* <Form.Item label={labels.impactTypes} name="impactTypes">
      <Checkbox.Group options={IMPACT_TYPE_OPTIONS} className={S.checkboxGroup} />
    </Form.Item> */}
  </SectionCard>
);
