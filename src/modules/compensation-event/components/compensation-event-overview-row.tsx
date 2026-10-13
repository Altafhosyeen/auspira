import type { ReactNode } from 'react';
import { DetailLabelValueRow } from '@/components/shared/detail-label-value-row';
import { OVERVIEW_COLORS, OVERVIEW_SIZES } from '../constants/compensation-event-overview.theme';

interface CompensationEventOverviewRowProps {
  label: string;
  value: ReactNode;
}

// Presentational — one muted-label / value line of the Overview's record panels. Renders
// through the shared `DetailLabelValueRow`, the same row the Request For Information
// detail's Overview panels use.
const CompensationEventOverviewRow = ({ label, value }: CompensationEventOverviewRowProps) => (
  <DetailLabelValueRow
    label={label}
    value={value}
    mutedColor={OVERVIEW_COLORS.muted}
    fontSize={OVERVIEW_SIZES.rowFontSize}
    labelWidth={OVERVIEW_SIZES.summaryLabelWidth}
  />
);

export default CompensationEventOverviewRow;
