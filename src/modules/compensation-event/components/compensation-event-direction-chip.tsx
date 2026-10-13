import { Badge, Flex } from 'antd';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/compensation-event-register.theme';
import type { CompensationEventDirection } from '../types/compensation-event.types';

interface CompensationEventDirectionChipProps {
  direction: CompensationEventDirection;
}

const CompensationEventDirectionChip = ({ direction }: CompensationEventDirectionChipProps) => (
  <Flex
    align="center"
    gap={5}
    style={{
      background: REGISTER_COLORS.directionChipBg,
      borderRadius: REGISTER_SIZES.badgeRadius,
      color: REGISTER_COLORS.main,
      fontSize: REGISTER_SIZES.badgeFontSize,
      fontWeight: 500,
      padding: '3px 8px',
      // The chip is a fixed lozenge: it keeps its width in a tight cell rather than
      // being squeezed until "OUT" wraps under its dot.
      flex: 'none',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}
  >
    <Badge color={REGISTER_COLORS.main} />
    {direction}
  </Flex>
);

export default CompensationEventDirectionChip;
