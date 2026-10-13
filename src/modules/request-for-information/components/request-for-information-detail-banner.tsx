import { DetailBanner } from '@/components/shared/detail-banner';
import { REQUEST_FOR_INFORMATION_DETAIL_COPY } from '../constants/request-for-information.constants';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';

interface RequestForInformationDetailBannerProps {
  // The RFI's own description, when the record carries one; the standing explainer
  // covers a record raised with none.
  description?: string;
}

// Presentational — the soft-blue "Description" card under the detail tabs. Renders
// through the shared `DetailBanner`, the same strip the Compensation Event detail
// screen uses.
const RequestForInformationDetailBanner = ({
  description,
}: RequestForInformationDetailBannerProps) => (
  <DetailBanner
    text={description}
    fallback={REQUEST_FOR_INFORMATION_DETAIL_COPY.overviewBanner}
    color={REGISTER_COLORS.main}
    background={REGISTER_COLORS.mainSoft}
    borderColor={REGISTER_COLORS.tagBorder}
    padding="18px 24px"
  />
);

export default RequestForInformationDetailBanner;
