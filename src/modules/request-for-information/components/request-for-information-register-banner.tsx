import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { REQUEST_FOR_INFORMATION_REGISTER_COPY } from '../constants/request-for-information.constants';
import {
  REGISTER_COLORS,
  REGISTER_SIZES,
} from '../constants/request-for-information-register.theme';

// Presentational — the soft-blue strip explaining what the register shows.
const RequestForInformationRegisterBanner = () => (
  <Alert
    type="info"
    showIcon
    icon={<InfoCircleOutlined style={{ color: REGISTER_COLORS.main }} />}
    message={REQUEST_FOR_INFORMATION_REGISTER_COPY.bannerDescription}
    style={{
      background: REGISTER_COLORS.mainSoft,
      borderColor: REGISTER_COLORS.tagBorder,
      borderRadius: REGISTER_SIZES.controlRadius,
    }}
  />
);

export default RequestForInformationRegisterBanner;
