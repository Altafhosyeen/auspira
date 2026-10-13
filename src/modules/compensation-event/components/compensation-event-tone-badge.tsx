import { Flex } from 'antd';
import type { ReactNode } from 'react';
import {
  REGISTER_SIZES,
  REGISTER_TONE_STYLES,
} from '../constants/compensation-event-register.theme';
import type { CompensationEventTone } from '../types/compensation-event.types';

interface CompensationEventToneBadgeProps {
  tone: CompensationEventTone;
  icon?: ReactNode;
  // Fully rounded variant used by the detail header; the register table uses the square one.
  pill?: boolean;
  children: ReactNode;
}

// Presentational — the tinted pill shared by the State and Cl.62.3 Reply columns.
const CompensationEventToneBadge = ({
  tone,
  icon,
  pill,
  children,
}: CompensationEventToneBadgeProps) => {
  const { background, border, color } = REGISTER_TONE_STYLES[tone];

  return (
    <Flex
      align="center"
      justify="center"
      gap={5}
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: pill ? 112 : REGISTER_SIZES.badgeRadius,
        color,
        fontSize: REGISTER_SIZES.badgeFontSize,
        fontWeight: 500,
        lineHeight: 1.2,
        maxWidth: '100%',
        // Tight inline padding buys the ~20px the longest status needs to stay on one
        // line inside the State column; the block padding is untouched.
        padding: '4px 6px',
        textAlign: 'center',
        // One line, always: the State column is sized to hold the longest status the
        // backend sends, so the badge never has to wrap or clip to fit it.
        whiteSpace: 'nowrap',
      }}
    >
      {/* Neither part may be shrunk by the flex row — a shrunk child with `nowrap`
          clips its text rather than wrapping it. */}
      {!!icon && <span style={{ display: 'flex', flex: 'none' }}>{icon}</span>}
      <span style={{ flex: 'none' }}>{children}</span>
    </Flex>
  );
};

export default CompensationEventToneBadge;
