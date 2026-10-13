import type { ReactNode } from 'react';
import { DetailMetricTile } from '@/components/shared/detail-metric-tile';
import {
  type CompensationEventOverviewTone,
  OVERVIEW_COLORS,
  OVERVIEW_SIZES,
  OVERVIEW_TILE_TONES,
} from '../constants/compensation-event-overview.theme';

interface CompensationEventOverviewMetricTileProps {
  tone: CompensationEventOverviewTone;
  icon: ReactNode;
  label: string;
  value: string;
  /** Set when the record has no figure yet, so the placeholder reads as muted. */
  muted?: boolean;
  /** Vertical rule between tiles — omitted on the last one in the strip. */
  divided?: boolean;
}

// Presentational — one Key Summary figure: the muted caption above, the value on the
// left and its tinted icon chip pinned to the right, separated by a hairline rule.
// Renders through the shared `DetailMetricTile`, the same tile the Request For
// Information detail's Key Summary strip uses.
const CompensationEventOverviewMetricTile = ({
  tone,
  icon,
  label,
  value,
  muted,
  divided,
}: CompensationEventOverviewMetricTileProps) => {
  const palette = OVERVIEW_TILE_TONES[tone];

  return (
    <DetailMetricTile
      tone={{ chipBg: palette.chip, chipIcon: palette.icon }}
      colors={{
        label: OVERVIEW_COLORS.label,
        value: OVERVIEW_COLORS.value,
        muted: OVERVIEW_COLORS.muted,
        divider: OVERVIEW_COLORS.divider,
      }}
      icon={icon}
      label={label}
      value={value}
      muted={muted}
      divided={divided}
      gutter={OVERVIEW_SIZES.gutter}
    />
  );
};

export default CompensationEventOverviewMetricTile;
