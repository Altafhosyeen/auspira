'use client';
import { Tooltip } from 'antd';
import type { ReactElement, ReactNode } from 'react';

interface DisabledTooltipProps {
  disabled?: boolean;
  reason?: ReactNode;
  children: ReactElement;
}

// A disabled control swallows its own hover events, so the tooltip attaches to a plain wrapper span instead.
function DisabledTooltip({ disabled, reason, children }: DisabledTooltipProps) {
  if (!disabled || !reason) return children;
  return (
    <Tooltip title={reason}>
      {/* No explicit display: stays inline (ignored for text-align/containing-block, as before) unless a flex parent blockifies it, in which case flex/0% mirrors a flex-1 sibling so space still splits evenly. */}
      <span style={{ flex: '1 1 0%', minWidth: 0, cursor: 'not-allowed' }}>{children}</span>
    </Tooltip>
  );
}

export default DisabledTooltip;
