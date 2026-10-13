'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Card, Flex, Tag, Typography } from 'antd';
import { EARLY_WARNING_DETAIL_COPY } from '../constants/early-warning.constants';
import type { SummaryRow } from '../utils/early-warning-detail.utils';
import EwIconChip from './register/ew-icon-chip';

const IMPACT_COLOR: Record<string, string> = {
  DELAY: 'red',
  KEY_DATE: 'blue',
  COST: 'orange',
  PERFORMANCE: 'geekblue',
};

// "EW Summary" card — a label/value table pulled from the detail record.
const EarlyWarningRiskSummary = ({ rows }: { rows: SummaryRow[] }) => (
  <Card
    title={
      <Flex align="center" gap={8}>
        <EwIconChip icon={<FileTextOutlined />} />
        {EARLY_WARNING_DETAIL_COPY.riskSummary}
      </Flex>
    }
  >
    <Flex vertical style={{ padding: '0 16px' }}>
      {rows.map((row, index) => (
        <Flex
          key={row.label}
          align="flex-start"
          gap={24}
          style={{
            padding: '16px 0',
            borderTop: index === 0 ? 'none' : `1px solid #EAECF0`,
          }}
        >
          <Typography.Text type="secondary" style={{ width: 180, flexShrink: 0 }}>
            {row.label}
          </Typography.Text>
          <Flex vertical gap={8}>
            {row.value && (
              <Typography.Text
                type={row.variant === 'description' ? 'secondary' : undefined}
                style={row.variant === 'description' ? { lineHeight: 1.6 } : undefined}
              >
                {row.value}
              </Typography.Text>
            )}
            {row.impactFlags && (
              <Flex gap={8} wrap>
                {row.impactFlags.map((flag) => (
                  <Tag key={flag} color={IMPACT_COLOR[flag]}>
                    {flag.replace('_', ' ')}
                  </Tag>
                ))}
              </Flex>
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  </Card>
);

export default EarlyWarningRiskSummary;
