import { Col, Row } from 'antd';
import type { ReactNode } from 'react';
import {
  DetailMetricTile,
  type DetailMetricTileColors,
  type DetailMetricTileTone,
} from './detail-metric-tile';
import { DetailSectionCard, type DetailSectionCardTone } from './detail-section-card';

export interface DetailMetricConfig {
  key: string;
  tone: DetailMetricTileTone;
  icon: ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}

interface DetailMetricsRowProps {
  title: string;
  headerIcon: ReactNode;
  tiles: DetailMetricConfig[];
  sectionTone: DetailSectionCardTone;
  tileColors: DetailMetricTileColors;
  gutter?: number;
}

// Presentational — the Key Summary strip: a row of rule-separated figures inside the
// section-card shell. Shared by every detail screen's Key Summary (Compensation Event,
// Request For Information) so they render identically.
export const DetailMetricsRow = ({
  title,
  headerIcon,
  tiles,
  sectionTone,
  tileColors,
  gutter = 20,
}: DetailMetricsRowProps) => (
  <DetailSectionCard icon={headerIcon} title={title} tone={sectionTone} gap={18}>
    <Row gutter={[gutter, gutter]}>
      {tiles.map((tile, index) => (
        <Col key={tile.key} xs={24} sm={8}>
          <DetailMetricTile
            tone={tile.tone}
            colors={tileColors}
            icon={tile.icon}
            label={tile.label}
            value={tile.value}
            muted={tile.muted}
            divided={index < tiles.length - 1}
            gutter={gutter}
          />
        </Col>
      ))}
    </Row>
  </DetailSectionCard>
);
