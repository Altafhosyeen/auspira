'use client';

import { CalendarOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Typography } from 'antd';
import { Fragment } from 'react';
import { type DetailSummaryRow, DetailSummaryRows } from '@/components/shared/detail-summary-rows';
import { EmptyState } from '@/components/shared/EmptyState';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import {
  PROGRAMME_STATUS_COLORS,
  PROGRAMME_TAB_EMPTY_COPY,
  VARIANCE_BANNER_COLORS,
} from '../constants/programme.constants';
import type { VarianceTabProps } from '../types/programme.types';

// "Variance" — the fourth tab of the Program Health detail screen (Figma node 9785:46837).
// Everything on it comes off the submitted programme: the dates strip and the explanation rows
// from its baseline comparison, the terminal-float banner from its critical path. `direction`
// is a read-only flag off that comparison — ahead or behind is a fact about the revision, not a
// view the user picks — and it tints the variance figure and the banner. It is absent when the
// programme carries no baseline, which greys the banner rather than claiming the Contractor is
// ahead.
const ProgrammeVarianceTab = ({
  direction,
  dates,
  terminalFloatTitle,
  terminalFloatNote,
  notes,
}: VarianceTabProps) => {
  const banner = direction ? VARIANCE_BANNER_COLORS[direction] : PROGRAMME_STATUS_COLORS.neutral;

  // Bold value over a muted explanation — the same row shape as the Programme Received tab.
  const noteRows: DetailSummaryRow[] = notes.map((note) => ({
    label: note.label,
    value: (
      <Flex vertical style={{ flex: 1, minWidth: 0 }}>
        <Typography.Text strong>{note.value}</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {note.caption}
        </Typography.Text>
      </Flex>
    ),
  }));

  return (
    <Flex vertical gap={16}>
      <Card styles={{ body: { padding: '18px 22px' } }}>
        <Flex align="center" wrap>
          {dates.map((cell, index) => (
            <Fragment key={cell.label}>
              {index > 0 && (
                <Divider
                  type="vertical"
                  style={{ height: 46, margin: '0 24px', borderColor: APP_COLORS.rowDivider }}
                />
              )}
              <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                <IconChip icon={<CalendarOutlined />} bordered size={36} />
                <Flex vertical>
                  <Typography.Text style={{ fontSize: 13 }}>{cell.label}</Typography.Text>
                  <Typography.Title
                    level={3}
                    style={{
                      margin: 0,
                      fontSize: 20,
                      color: cell.tone ? PROGRAMME_STATUS_COLORS[cell.tone].text : undefined,
                    }}
                  >
                    {cell.value}
                  </Typography.Title>
                </Flex>
              </Flex>
            </Fragment>
          ))}
        </Flex>
      </Card>

      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{ background: banner.background, borderRadius: 6, padding: '16px 22px' }}
      >
        <Flex align="center" gap={12}>
          <IconChip icon={<CalendarOutlined />} size={36} />
          <Typography.Title level={3} style={{ margin: 0, fontSize: 18, color: banner.text }}>
            {terminalFloatTitle}
          </Typography.Title>
        </Flex>
        <Typography.Text
          type="secondary"
          style={{ fontSize: 13, textAlign: 'right', whiteSpace: 'pre-line' }}
        >
          {terminalFloatNote}
        </Typography.Text>
      </Flex>

      <Card styles={{ body: { padding: '4px 22px 8px' } }}>
        {notes.length === 0 ? (
          <EmptyState {...PROGRAMME_TAB_EMPTY_COPY.varianceNotes} />
        ) : (
          <DetailSummaryRows
            rows={noteRows}
            mutedColor="#6F6B7D"
            dividerColor={APP_COLORS.cardBorder}
            fontSize={14}
            labelWidth={158}
          />
        )}
      </Card>
    </Flex>
  );
};

export default ProgrammeVarianceTab;
