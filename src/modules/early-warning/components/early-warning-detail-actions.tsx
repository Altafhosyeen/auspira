'use client';

import { Button, Flex } from 'antd';
import { EARLY_WARNING_DETAIL_COPY } from '../constants/early-warning.constants';

interface EarlyWarningDetailActionsProps {
  onClose: () => void;
  onUpdate: () => void;
  onCreateCe: () => void;
  loadingClose?: boolean;
  loadingUpdate?: boolean;
  /** The EW is closed out — its decision buttons are moot. */
  disabled?: boolean;
}

// Persistent decision rail — "Risk resolved → close", "Mitigation agreed → update", and the
// CE trigger link. The amber one mirrors the design's CE-gate affordance.
const EarlyWarningDetailActions = ({
  onClose,
  onUpdate,
  onCreateCe,
  loadingClose,
  loadingUpdate,
  disabled,
}: EarlyWarningDetailActionsProps) => (
  <Flex vertical gap={12}>
    <Button block loading={loadingClose} disabled={disabled} onClick={onClose}>
      {EARLY_WARNING_DETAIL_COPY.actions.close}
    </Button>
    <Button block type="primary" loading={loadingUpdate} disabled={disabled} onClick={onUpdate}>
      {EARLY_WARNING_DETAIL_COPY.actions.update}
    </Button>
    <Button
      block
      disabled={disabled}
      style={{ backgroundColor: '#B45309', borderColor: '#B45309', color: '#fff' }}
      onClick={onCreateCe}
    >
      {EARLY_WARNING_DETAIL_COPY.actions.createCe}
    </Button>
  </Flex>
);

export default EarlyWarningDetailActions;
