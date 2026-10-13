'use client';

import { DetailBanner } from '@/components/shared/detail-banner';
import { PMI_DETAIL_COPY } from '../constants/pmi.constants';
import { PMI_DETAIL_COLORS } from '../constants/pmi-detail.theme';

interface PmiDetailBannerProps {
  // The instruction's own details, when the record carries them; the standing
  // explainer covers an instruction raised with none.
  text?: string;
}

// Presentational — the soft-blue explainer strip under the detail-page title. Renders
// through the shared `DetailBanner`, the same strip the Compensation Event, Request For
// Information and Daily Report detail screens use.
const PmiDetailBanner = ({ text }: PmiDetailBannerProps) => (
  <DetailBanner
    text={text}
    fallback={PMI_DETAIL_COPY.overviewBanner}
    color={PMI_DETAIL_COLORS.main}
    background={PMI_DETAIL_COLORS.mainSoft}
    borderColor={PMI_DETAIL_COLORS.mainBorder}
  />
);

export default PmiDetailBanner;
