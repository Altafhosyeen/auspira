import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface DetailLabelValueRowProps {
  label: string;
  value: ReactNode;
  mutedColor: string;
  fontSize?: number;
  // Fixes the label column so every value in a card starts on one left edge instead of
  // each one floating out to the right edge at its own ragged position. Left unset, the
  // row keeps the original label-left / value-right split.
  labelWidth?: number;
}

// Presentational — one muted-label / value line of a detail screen's record-identity
// panel. Shared by Compensation Event's Overview and Request For Information's Overview.
export const DetailLabelValueRow = ({
  label,
  value,
  mutedColor,
  fontSize = 13,
  labelWidth,
}: DetailLabelValueRowProps) => {
  const isColumnar = labelWidth !== undefined;

  return (
    <Flex align="center" justify={isColumnar ? 'flex-start' : 'space-between'} gap={16}>
      <Typography.Text style={{ color: mutedColor, fontSize, flex: 'none', width: labelWidth }}>
        {label}
      </Typography.Text>
      {typeof value === 'string' ? (
        <Typography.Text
          style={{
            fontSize,
            fontWeight: 500,
            ...(isColumnar ? { flex: 1, minWidth: 0, textAlign: 'left' } : { textAlign: 'right' }),
          }}
        >
          {value}
        </Typography.Text>
      ) : (
        value
      )}
    </Flex>
  );
};
