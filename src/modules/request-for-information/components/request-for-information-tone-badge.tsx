import { Flex } from 'antd';
import type { ReactNode } from 'react';
import {
  REGISTER_SIZES,
  REGISTER_TONE_STYLES,
} from '../constants/request-for-information-register.theme';
import type { RequestForInformationTone } from '../types/request-for-information.types';

interface RequestForInformationToneBadgeProps {
  tone: RequestForInformationTone;
  icon?: ReactNode;
  pill?: boolean;
  children: ReactNode;
}

// Presentational — the tinted pill the register table's Status column uses.
const RequestForInformationToneBadge = ({
  tone,
  icon,
  pill,
  children,
}: RequestForInformationToneBadgeProps) => {
  const { background, border, color } = REGISTER_TONE_STYLES[tone];

  return (
    <Flex
      align="center"
      justify="center"
      gap={5}
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: pill ? REGISTER_SIZES.pillRadius : REGISTER_SIZES.badgeRadius,
        color,
        fontSize: REGISTER_SIZES.badgeFontSize,
        fontWeight: 500,
        lineHeight: 1.2,
        padding: '4px 10px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {children}
    </Flex>
  );
};

export default RequestForInformationToneBadge;
