'use client';

import { DetailBanner } from '@/components/shared/detail-banner';
import { COMPENSATION_EVENT_DETAIL_COPY } from '../constants/compensation-event-detail.constants';
import { DETAIL_COLORS } from '../constants/compensation-event-detail.theme';

interface CompensationEventDetailBannerProps {
  // The event's own description, when the API sent one; the standing explainer covers
  // an event raised with none.
  text?: string;
}

// Presentational — the soft-blue explainer strip under the detail-page title. Renders
// through the shared `DetailBanner`, the same strip the Request For Information detail
// screen uses.
const CompensationEventDetailBanner = ({ text }: CompensationEventDetailBannerProps) => (
  <DetailBanner
    text={text}
    fallback={COMPENSATION_EVENT_DETAIL_COPY.overviewBanner}
    color={DETAIL_COLORS.main}
    background={DETAIL_COLORS.mainSoft}
    borderColor={DETAIL_COLORS.mainBorder}
  />
);

export default CompensationEventDetailBanner;
