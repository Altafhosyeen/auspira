'use client';
import { Button, type ButtonProps } from 'antd';
import type { ReactNode } from 'react';
import DisabledTooltip from '../shared/DisabledTooltip';

interface ButtonXProps extends ButtonProps {
  // Shown on hover when disabled is true; reuses the app-wide disabled-tooltip pattern.
  disabledReason?: ReactNode;
}

function ButtonX({ disabledReason, ...props }: ButtonXProps) {
  return (
    <DisabledTooltip disabled={props.disabled} reason={disabledReason}>
      <Button {...props} />
    </DisabledTooltip>
  );
}

export default ButtonX;
