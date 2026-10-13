import {
  DownOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  ToolOutlined,
  UpOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Flex, Tooltip, Typography } from 'antd';
import type { ReactNode } from 'react';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type {
  QuotationLineCategory,
  QuotationTableRow,
} from '../types/compensation-event-quotation.types';
import { getPersonInitials } from '../utils/compensation-event.utils';
import { getMemberTint } from '../utils/compensation-event-quotation.utils';

const CATEGORY_ICONS: Record<QuotationLineCategory, ReactNode> = {
  people: <UserOutlined />,
  equipment: <ToolOutlined />,
  fee: <PercentageOutlined />,
  other: <FileTextOutlined />,
};

interface CompensationEventQuotationItemCellProps {
  row: QuotationTableRow;
  expanded: boolean;
  onToggle: (key: string) => void;
  // Set by the read-only table, which drops the DESCRIPTION column entirely and hands the
  // row's description to an info icon beside the name instead. The assessment screen keeps
  // its own editable description cell, so it leaves this off.
  showDescriptionHint?: boolean;
}

// The ITEM cell for both row kinds — the chevron sits after the group name rather than
// in antd's own expand column, which is why the table hides that column. Hiding it also
// drops antd's indent span, so member rows carry their own left step.
const CompensationEventQuotationItemCell = ({
  row,
  expanded,
  onToggle,
  showDescriptionHint,
}: CompensationEventQuotationItemCellProps) => {
  // A row the quotation left undescribed gets no icon rather than an empty tooltip.
  const hint =
    showDescriptionHint && row.description?.trim() ? (
      <Tooltip title={row.description}>
        <InfoCircleOutlined
          style={{
            color: QUOTATION_COLORS.textMuted,
            flex: 'none',
            fontSize: QUOTATION_SIZES.hintFontSize,
          }}
        />
      </Tooltip>
    ) : null;

  if (!row.isGroup) {
    const tint = getMemberTint(row.item);

    return (
      <Flex align="center" gap={8} style={{ paddingLeft: QUOTATION_SIZES.memberIndent }}>
        <Avatar
          size={QUOTATION_SIZES.memberAvatar}
          style={{
            backgroundColor: tint.background,
            color: tint.color,
            flex: 'none',
            fontSize: 9,
            fontWeight: 600,
          }}
        >
          {getPersonInitials(row.item)}
        </Avatar>
        <Typography.Text
          style={{ color: QUOTATION_COLORS.memberName, fontSize: QUOTATION_SIZES.memberFontSize }}
        >
          {row.item}
        </Typography.Text>
        {hint}
      </Flex>
    );
  }

  return (
    <Flex align="center" gap={8}>
      <Avatar
        shape="square"
        size={QUOTATION_SIZES.categoryAvatar}
        icon={row.category ? CATEGORY_ICONS[row.category] : undefined}
        style={{
          backgroundColor: QUOTATION_COLORS.mainSoft,
          borderRadius: QUOTATION_SIZES.categoryChipRadius,
          color: QUOTATION_COLORS.main,
          flex: 'none',
          fontSize: 11,
        }}
      />
      <Typography.Text
        strong
        style={{ color: QUOTATION_COLORS.amount, fontSize: QUOTATION_SIZES.cellFontSize }}
      >
        {row.item}
      </Typography.Text>
      {hint}
      {/* A category the contractor priced in one line has no members to reveal, so it is
          left without a chevron rather than given one that toggles nothing. */}
      {!!row.children?.length && (
        <Typography.Link
          onClick={() => onToggle(row.key)}
          aria-expanded={expanded}
          aria-label={row.item}
          style={{ color: QUOTATION_COLORS.textMuted, flex: 'none', lineHeight: 1 }}
        >
          {expanded ? (
            <UpOutlined style={{ fontSize: QUOTATION_SIZES.chevronFontSize }} />
          ) : (
            <DownOutlined style={{ fontSize: QUOTATION_SIZES.chevronFontSize }} />
          )}
        </Typography.Link>
      )}
    </Flex>
  );
};

export default CompensationEventQuotationItemCell;
