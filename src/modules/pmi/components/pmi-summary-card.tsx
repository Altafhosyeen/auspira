'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import IconChip from '@/components/shared/icon-chip';
import { PMI_DETAIL_COPY } from '../constants/pmi.constants';
import { PMI_DETAIL_COLORS } from '../constants/pmi-detail.theme';
import type { PmiSummaryRow } from '../utils/pmi-detail.utils';

interface PmiSummaryCardProps {
  rows: PmiSummaryRow[];
}

// "PMI Summary" card — antd Card's native head draws the full-width rule under the
// title, then one muted-label / value line per field with a hairline between rows
// (the same structure as the Early Warning detail's summary card).
const PmiSummaryCard = ({ rows }: PmiSummaryCardProps) => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <IconChip icon={<FileTextOutlined />} />
        <Typography.Text strong style={{ color: PMI_DETAIL_COLORS.main }}>
          {PMI_DETAIL_COPY.summaryTitle}
        </Typography.Text>
      </Flex>
    }
  >
    <Flex vertical>
      {rows.map((row, index) => (
        <Flex
          key={row.label}
          align="flex-start"
          gap={24}
          style={{
            padding: '16px 0',
            borderTop: index === 0 ? 'none' : `1px solid ${PMI_DETAIL_COLORS.rowDivider}`,
          }}
        >
          <Typography.Text type="secondary" style={{ width: 180, flexShrink: 0 }}>
            {row.label}
          </Typography.Text>
          <Typography.Text style={row.variant === 'details' ? { lineHeight: 1.6 } : undefined}>
            {row.value ?? '—'}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  </Card>
);

export default PmiSummaryCard;
