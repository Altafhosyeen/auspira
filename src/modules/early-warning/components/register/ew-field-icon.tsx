'use client';

import { Avatar } from 'antd';
import type { ReactNode } from 'react';
import { EW_COLORS, EW_SIZES } from '../../constants/early-warning-register.theme';

export interface EwFieldIconProps {
  icon: ReactNode;
}

/** Grey chip (using #949BAA tint) that wraps each field's leading icon inside form inputs. */
export const EwFieldIcon = ({ icon }: EwFieldIconProps) => (
  <Avatar
    shape="square"
    size={EW_SIZES.fieldIconChip}
    icon={icon}
    style={{
      backgroundColor: EW_COLORS.fieldIconBg,
      border: `0.5px solid ${EW_COLORS.fieldIconBorder}`,
      color: EW_COLORS.main,
      fontSize: EW_SIZES.fieldIcon,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
    }}
  />
);

export default EwFieldIcon;
