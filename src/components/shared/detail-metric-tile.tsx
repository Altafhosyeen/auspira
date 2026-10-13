import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

export interface DetailMetricTileTone {
  chipBg: string;
  chipIcon: string;
}

export interface DetailMetricTileColors {
  label: string;
  value: string;
  muted: string;
  divider: string;
}

interface DetailMetricTileProps {
  tone: DetailMetricTileTone;
  colors: DetailMetricTileColors;
  icon: ReactNode;
  label: string;
  value: string;
  /** Set when the record has no figure yet, so the placeholder reads as muted. */
  muted?: boolean;
  /** Vertical rule between tiles — omitted on the last one in the strip. */
  divided?: boolean;
  gutter?: number;
}

// Presentational — one Key Summary figure: the muted caption above, the value on the
// left and its tinted icon chip pinned to the right, separated by a hairline rule.
// Shared by every detail screen's Key Summary strip (Compensation Event, Request For
// Information) so they stay one component instead of per-module copies.
export const DetailMetricTile = ({
  tone,
  colors,
  icon,
  label,
  value,
  muted,
  divided,
  gutter = 20,
}: DetailMetricTileProps) => (
  <Flex
    vertical
    gap={8}
    style={{
      borderRight: divided ? `1px solid ${colors.divider}` : undefined,
      height: '100%',
      paddingRight: divided ? gutter : undefined,
    }}
  >
    <Typography.Text style={{ color: colors.label, fontSize: 12 }}>{label}</Typography.Text>

    <Flex align="center" justify="space-between" gap={12}>
      <Typography.Text
        style={{
          color: muted ? colors.muted : colors.value,
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {value}
      </Typography.Text>

      <Flex
        align="center"
        justify="center"
        style={{
          background: tone.chipBg,
          borderRadius: 8,
          color: tone.chipIcon,
          flex: 'none',
          fontSize: 16,
          height: 34,
          width: 34,
        }}
      >
        {icon}
      </Flex>
    </Flex>
  </Flex>
);
