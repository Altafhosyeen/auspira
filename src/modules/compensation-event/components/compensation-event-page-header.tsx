import { Card, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { ClauseChip } from '../utils/compensation-event-clause.utils';
import CompensationEventClauseChip from './compensation-event-clause-chip';
import CompensationEventPageHeaderIcon from './compensation-event-page-header-icon';

interface CompensationEventPageHeaderProps {
  title: string;
  // The clause the record on screen cites, resolved by `resolveClauseChip`.
  clause?: ClauseChip;
  icon?: ReactNode;
  /** Trailing action pinned to the right of the bar — PM Assessment puts Export there. */
  extra?: ReactNode;
}

// Shared title bar for the CE workflow screens — title, optional glyph and the clause chip.
const CompensationEventPageHeader = ({
  title,
  clause,
  icon,
  extra,
}: CompensationEventPageHeaderProps) => (
  <Card
    styles={{
      body: { padding: `16px ${QUOTATION_SIZES.railPaddingInline + 2}px` },
    }}
  >
    <Flex align="center" justify="space-between" gap={12} wrap>
      <Flex align="center" gap={12} wrap>
        {icon && <CompensationEventPageHeaderIcon icon={icon} />}
        <Typography.Title level={4} style={{ margin: 0, color: QUOTATION_COLORS.main }}>
          {title}
        </Typography.Title>

        <CompensationEventClauseChip chip={clause} />
      </Flex>

      {/* {extra} */}
    </Flex>
  </Card>
);

export default CompensationEventPageHeader;
