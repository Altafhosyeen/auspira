'use client';

import { Card, Divider, Flex, Tag, Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import { PROGRAMME_STATUS_COLORS } from '../constants/programme.constants';
import type { ProgrammeStatusTone } from '../types/programme.types';

// The card/table furniture shared by every table-driven Program Health tab (PM View,
// Client Obligations). Each tab owns its own columns and rows; these only cover the
// shell, the header band and the status pill so the three tabs stay pixel-identical.

/** White card with a bordered icon chip and a title, ruled off above its body. */
export const ProgrammeSectionCard = ({
  icon,
  title,
  tag,
  children,
}: {
  icon: ReactNode;
  title: string;
  /** Optional chip beside the title — a count the card's own data produced. */
  tag?: ReactNode;
  children: ReactNode;
}) => (
  <Card styles={{ body: { padding: 0 } }}>
    <Flex align="center" gap={12} wrap style={{ padding: '14px 22px' }}>
      <IconChip icon={icon} bordered size={32} />
      <Typography.Text strong style={{ fontSize: 15 }}>
        {title}
      </Typography.Text>
      {tag}
    </Flex>

    <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />

    {children}
  </Card>
);

/** Coloured status pill — "On Track", "Task Open", "Not Started", "+7 days". */
export const ProgrammeStatusPill = ({
  label,
  tone,
}: {
  label: string;
  tone: ProgrammeStatusTone;
}) => {
  const colors = PROGRAMME_STATUS_COLORS[tone];
  return (
    <Tag
      bordered={false}
      style={{ background: colors.background, color: colors.text, borderRadius: 4, margin: 0 }}
    >
      {label}
    </Tag>
  );
};

// A column is either a fixed pixel width or a flex ratio. Tables with a few wide columns
// size them in pixels; ones with enough columns to overrun the card (the Programme
// Register's seven plus an action) share the row out by ratio instead.
export type ProgrammeColumnUnit = 'px' | 'flex';

/** The style one column takes in the header band and in every row, so the two always agree. */
const programmeColumnStyle = (
  size: number | undefined,
  unit: ProgrammeColumnUnit = 'px'
): CSSProperties => {
  if (size === undefined) return { flex: 1, minWidth: 0 };
  return unit === 'flex'
    ? { flex: size, minWidth: 0 }
    : { width: size, flexShrink: 0, minWidth: 0 };
};

// Soft-blue header band above a table's rows. A label with no matching width fills the
// remaining space, and an `undefined` entry does the same mid-row — which is how a wide text
// column is grown without moving the ones after it. The last label is right-aligned unless the
// design ends the row with a left-aligned column (Client Obligations' Due), hence `alignLastEnd`.
export const ProgrammeTableHeader = ({
  labels,
  widths,
  alignLastEnd = true,
  unit = 'px',
  trailingGutter,
}: {
  labels: string[];
  widths: readonly (number | undefined)[];
  alignLastEnd?: boolean;
  unit?: ProgrammeColumnUnit;
  /** Width of a trailing action column in the rows, so the last label still lines up. */
  trailingGutter?: number;
}) => (
  <Flex gap={16} style={{ padding: '10px 32px', background: APP_COLORS.mainSoft, borderRadius: 6 }}>
    {labels.map((label, index) => (
      <Typography.Text
        key={label}
        strong
        style={{
          color: APP_COLORS.main,
          ...programmeColumnStyle(widths[index], unit),
          ...(index === labels.length - 1 && alignLastEnd ? { textAlign: 'right' } : {}),
        }}
      >
        {label}
      </Typography.Text>
    ))}
    {trailingGutter !== undefined && <span style={{ width: trailingGutter, flexShrink: 0 }} />}
  </Flex>
);
