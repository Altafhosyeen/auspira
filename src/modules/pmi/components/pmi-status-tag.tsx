import { Tag } from 'antd';
import { PMI_STATUS_COLORS, PMI_STATUS_LABELS } from '../constants/pmi.constants';

interface PmiStatusTagProps {
  status?: number | null;
  /** Overrides the label — used for statuses outside the known map. */
  label?: string;
  /** Overrides the preset color. */
  color?: string;
}

/** Outlined status pill per the register design — antd preset colors, no custom CSS. */
const PmiStatusTag = ({ status, label, color }: PmiStatusTagProps) => {
  const code = Number(status ?? 0);
  const resolvedLabel = label ?? PMI_STATUS_LABELS[code] ?? String(code);
  const resolvedColor = color ?? PMI_STATUS_COLORS[code] ?? 'default';

  return (
    <Tag color={resolvedColor} style={{ fontWeight: 500 }}>
      {resolvedLabel}
    </Tag>
  );
};

export default PmiStatusTag;
