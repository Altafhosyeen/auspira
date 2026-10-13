import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Tag, Tooltip } from 'antd';
import type { ReactNode } from 'react';

// The one clause pill every detail and register header wears. Colours are pinned here
// rather than taken from `Tag.defaultBg`, because each module wraps its screens in its own
// ConfigProvider and those themes override that token without restating it — which is what
// let this pill render soft blue on some screens and antd's default grey on others.
export const CLAUSE_CHIP_COLORS = {
  background: '#E6F4FF',
  border: 'rgba(15, 76, 129, 0.23)',
  text: '#1B3A5F',
} as const;

export const CLAUSE_CHIP_ARIA_LABEL = 'Contract clauses';

export interface ClauseChipValue {
  /** Absent when the record names no clause number — the chip then shows the icon alone. */
  label?: string;
  /** One row per clause, e.g. "CE-004 – Cost, time and programme impact". */
  lines: string[];
}

interface ClauseChipProps {
  /** Undefined drops the chip entirely rather than printing an empty pill. */
  chip?: ClauseChipValue;
  /** Trailing slot for a header that hangs something off the chip. */
  suffix?: ReactNode;
}

// Presentational — the clause pill. The clause itself runs to a full sentence, so only the
// number is printed and the wording lives in the tooltip.
export const ClauseChip = ({ chip, suffix }: ClauseChipProps) => {
  if (!chip || (!chip.label && !chip.lines.length)) return null;

  const tag = (
    <Tag
      bordered
      aria-label={[CLAUSE_CHIP_ARIA_LABEL, ...chip.lines].join(': ')}
      style={{
        backgroundColor: CLAUSE_CHIP_COLORS.background,
        borderColor: CLAUSE_CHIP_COLORS.border,
        borderRadius: 20,
        color: CLAUSE_CHIP_COLORS.text,
        cursor: chip.lines.length ? 'help' : 'default',
        flexShrink: 0,
        lineHeight: 1,
        margin: 0,
        marginInlineEnd: 0,
        padding: '4px 10px',
      }}
    >
      <Flex align="center" gap={6}>
        <InfoCircleOutlined />
        {!!chip.label && <span style={{ fontSize: 12, fontWeight: 600 }}>{chip.label}</span>}
        {suffix}
      </Flex>
    </Tag>
  );

  if (!chip.lines.length) return tag;

  return (
    <Tooltip
      title={
        <Flex vertical gap={2}>
          {chip.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </Flex>
      }
    >
      {tag}
    </Tooltip>
  );
};

export default ClauseChip;
