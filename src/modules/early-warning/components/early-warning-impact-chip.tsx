import { Tag } from 'antd';
import type { EarlyWarningImpact } from '../types/early-warning.types';

// antd preset colors per the register design: red for delay, blue for key date, orange for cost.
const IMPACT_COLORS: Record<EarlyWarningImpact, string> = {
  DELAY: 'red',
  KEY_DATE: 'blue',
  COST: 'orange',
  PERFORMANCE: 'geekblue',
};

const IMPACT_LABELS: Record<EarlyWarningImpact, string> = {
  DELAY: 'DELAY',
  KEY_DATE: 'KEY DATE',
  COST: 'COST',
  PERFORMANCE: 'PERFORMANCE',
};

const EarlyWarningImpactChip = ({ impact }: { impact: EarlyWarningImpact }) => (
  <Tag color={IMPACT_COLORS[impact]}>{IMPACT_LABELS[impact] || impact}</Tag>
);

export default EarlyWarningImpactChip;
