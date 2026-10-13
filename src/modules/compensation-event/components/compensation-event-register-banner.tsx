import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { COMPENSATION_EVENT_REGISTER_COPY } from '../constants/compensation-event.constants';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/compensation-event-register.theme';

// Presentational — the soft-blue strip explaining what the register shows.
const CompensationEventRegisterBanner = () => (
  <Alert
    type="info"
    showIcon
    icon={<InfoCircleOutlined style={{ color: REGISTER_COLORS.main }} />}
    message={COMPENSATION_EVENT_REGISTER_COPY.description}
    style={{
      background: REGISTER_COLORS.mainSoft,
      borderColor: REGISTER_COLORS.tagBorder,
      borderRadius: REGISTER_SIZES.controlRadius,
    }}
  />
);

export default CompensationEventRegisterBanner;
