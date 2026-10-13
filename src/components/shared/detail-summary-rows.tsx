import { Divider, Flex } from 'antd';
import { Fragment, type ReactNode } from 'react';
import { DetailLabelValueRow } from './detail-label-value-row';

export interface DetailSummaryRow {
  label: string;
  value: ReactNode;
}

interface DetailSummaryRowsProps {
  rows: DetailSummaryRow[];
  mutedColor: string;
  dividerColor: string;
  fontSize?: number;
  labelWidth?: number;
  /** Applied above and below each row — see the padding note below. */
  rowPaddingBlock?: number;
}

// Presentational — the stacked label/value body of a detail screen's summary card.
// Shared by Compensation Event, Request For Information, Project Daily Report and
// Defect Notice so all four Overview tabs render one identical card body.
//
// A hairline sits under every line but the last, so each label/value pair reads as its
// own record field rather than as one run of text. The rows carry their own symmetric
// padding rather than a flex gap, which would fall on both sides of each rule and leave
// the fields spaced twice as far apart as the rules suggest.
export const DetailSummaryRows = ({
  rows,
  mutedColor,
  dividerColor,
  fontSize = 12,
  labelWidth = 200,
  rowPaddingBlock = 16,
}: DetailSummaryRowsProps) => (
  <Flex vertical>
    {rows.map((row, index) => (
      <Fragment key={row.label}>
        <div style={{ padding: `${rowPaddingBlock}px 0` }}>
          <DetailLabelValueRow
            label={row.label}
            value={row.value}
            mutedColor={mutedColor}
            fontSize={fontSize}
            labelWidth={labelWidth}
          />
        </div>
        {index < rows.length - 1 && <Divider style={{ margin: 0, borderColor: dividerColor }} />}
      </Fragment>
    ))}
  </Flex>
);
