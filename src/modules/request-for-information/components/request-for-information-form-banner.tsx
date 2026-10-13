import { Alert } from 'antd';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';
import { FORM_COLORS, FORM_SIZES } from '../constants/request-for-information-form.theme';

// Presentational — the soft-blue explainer strip at the top of the Create RFI form.
const RequestForInformationFormBanner = () => (
  <Alert
    type="info"
    message={REQUEST_FOR_INFORMATION_FORM_COPY.banner}
    style={{
      background: FORM_COLORS.mainSoft,
      borderColor: FORM_COLORS.bannerBorder,
      borderRadius: FORM_SIZES.controlRadius,
    }}
  />
);

export default RequestForInformationFormBanner;
