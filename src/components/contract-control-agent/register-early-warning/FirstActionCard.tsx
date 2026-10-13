import { Form, Select } from 'antd';
import { InfoCard } from '../EarlyWarningFormControls';
import { EW_FORM_COPY, FIRST_ACTION_SELECT_OPTIONS } from '../early-warning-form.data';

const { labels } = EW_FORM_COPY;

export const FirstActionCard = () => (
  <InfoCard title={labels.firstAction}>
    <Form.Item name="firstAction" noStyle>
      <Select options={FIRST_ACTION_SELECT_OPTIONS} className="w-full" />
    </Form.Item>
  </InfoCard>
);
