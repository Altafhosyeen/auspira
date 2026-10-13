import { Alert } from 'antd';
import { DEFECT_NOTICE_FORM_COPY } from '../constants/defect-notice.constants';
import { FORM_COLORS, FORM_SIZES } from '../constants/defect-notice-form.theme';

// Presentational — the soft-blue explainer strip at the top of the Create Defect Notice form.
const DefectNoticeFormBanner = () => (
  <Alert
    type="info"
    message={DEFECT_NOTICE_FORM_COPY.banner}
    style={{
      background: FORM_COLORS.mainSoft,
      borderColor: FORM_COLORS.border,
      borderRadius: FORM_SIZES.controlRadius,
    }}
  />
);

export default DefectNoticeFormBanner;
