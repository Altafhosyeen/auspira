import { Tag } from 'antd';
import type { EarlyWarningRegisterStatus } from '../types/early-warning.types';

interface EarlyWarningStatusTagProps {
  status: EarlyWarningRegisterStatus | string;
  /** Overrides the label — used by the Archived/Discarded tabs, e.g. "Archived". */
  label?: string;
  /** Overrides the preset color — grey for Archived, red for Discarded. */
  color?: string;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  OPEN: 'warning',
  CLOSED: 'success',
  NOT_ACCEPTED: 'error',
  'NOT ACCEPTED': 'error',
  DISCARD: 'default',
  DISCARDED: 'default',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  NOT_ACCEPTED: 'NOT ACCEPTED',
  'NOT ACCEPTED': 'NOT ACCEPTED',
  DISCARD: 'DISCARD',
  DISCARDED: 'DISCARD',
};

/** Outlined status pill per the register design — antd preset colors, no custom CSS. */
const EarlyWarningStatusTag = ({ status, label, color }: EarlyWarningStatusTagProps) => {
  const resolvedColor =
    color ?? STATUS_COLOR_MAP[status] ?? (status.startsWith('CE') ? 'purple' : 'default');
  const resolvedLabel = label ?? STATUS_LABEL_MAP[status] ?? status;

  return (
    <Tag color={resolvedColor} style={{ fontWeight: 500 }}>
      {resolvedLabel}
    </Tag>
  );
};

export default EarlyWarningStatusTag;
