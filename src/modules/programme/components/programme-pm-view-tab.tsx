'use client';

import { CalendarOutlined, FileTextOutlined, LineChartOutlined } from '@ant-design/icons';
import { Divider, Flex, Tag, Typography } from 'antd';
import { Fragment } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import {
  PROGRAMME_EXTRACT_COPY,
  PROGRAMME_PM_VIEW_COPY,
  PROGRAMME_TAB_EMPTY_COPY,
} from '../constants/programme.constants';
import type { PmViewTabProps } from '../types/programme.types';
import { countDatedSections } from '../utils/programme-alert.utils';
import {
  ProgrammeSectionCard,
  ProgrammeStatusPill,
  ProgrammeTableHeader,
} from './programme-section-card';

// Column widths shared between the header band and every row so the two line up exactly —
// same approach as the Extract & Check tab. The section name is the only cell that runs long,
// so it takes the slack; the reference, date and status are sized to their content and sit
// together after it. A fixed section column wrapped long names while the card was still holding
// empty space beside them.
const SECTIONAL_COLUMNS = { reference: 140, completionDate: 170, status: 120 } as const;
const SECTIONAL_WIDTHS: readonly (number | undefined)[] = [
  undefined,
  SECTIONAL_COLUMNS.reference,
  SECTIONAL_COLUMNS.completionDate,
  SECTIONAL_COLUMNS.status,
];

// The count tag beside a section card's heading.
const countTag = (label: string) => (
  <Tag
    bordered={false}
    style={{ background: APP_COLORS.mainSoft, color: APP_COLORS.main, borderRadius: 4 }}
  >
    {label}
  </Tag>
);

// "PM View" — the third tab of the Program Health detail screen (Figma node 9785:46543). The
// contract dates and the sectional completions are read off `keyDatesAndMilestones` in the
// submitted programme.
const ProgrammePmViewTab = ({
  revisionLabel,
  contractDates,
  sectionalCompletions,
}: PmViewTabProps) => {
  const datedSections = countDatedSections(sectionalCompletions);

  return (
    <Flex vertical gap={16}>
      <ProgrammeSectionCard icon={<FileTextOutlined />} title={revisionLabel}>
        <Flex vertical gap={12} style={{ padding: '16px 22px 22px' }}>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {PROGRAMME_PM_VIEW_COPY.contractDatesTitle}
          </Typography.Text>

          {/* A tile strip rather than a table, but the same rule applies: an empty one would
              leave the card holding nothing but its own heading. */}
          {contractDates.length === 0 ? (
            <EmptyState {...PROGRAMME_TAB_EMPTY_COPY.contractDates} />
          ) : (
            <Flex gap={20} wrap>
              {contractDates.map((tile) => (
                <Flex
                  key={tile.label}
                  vertical
                  gap={6}
                  style={{
                    flex: '1 1 320px',
                    minWidth: 0,
                    background: APP_COLORS.mainSoft,
                    borderRadius: 6,
                    padding: '16px 18px',
                  }}
                >
                  <Flex align="center" gap={10}>
                    <IconChip icon={<CalendarOutlined />} bordered size={26} />
                    <Typography.Text style={{ fontSize: 13 }}>{tile.label}</Typography.Text>
                  </Flex>
                  <Typography.Title level={3} style={{ margin: 0, fontSize: 20 }}>
                    {tile.date}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {tile.caption}
                  </Typography.Text>
                </Flex>
              ))}
            </Flex>
          )}
        </Flex>
      </ProgrammeSectionCard>

      {/* The sectional table proper: each section against its completion date and the status the
          backend sends for it. The card's own count still reports how many are dated. */}
      <ProgrammeSectionCard
        icon={<LineChartOutlined />}
        title={PROGRAMME_PM_VIEW_COPY.sectionalTitle}
        tag={
          sectionalCompletions.length > 0
            ? countTag(
                PROGRAMME_PM_VIEW_COPY.sectionalCount(datedSections, sectionalCompletions.length)
              )
            : undefined
        }
      >
        <div style={{ padding: '12px 22px' }}>
          <ProgrammeTableHeader
            labels={[
              PROGRAMME_PM_VIEW_COPY.sectionalColumns.section,
              PROGRAMME_PM_VIEW_COPY.sectionalColumns.reference,
              PROGRAMME_PM_VIEW_COPY.sectionalColumns.completionDate,
              PROGRAMME_PM_VIEW_COPY.sectionalColumns.status,
            ]}
            widths={SECTIONAL_WIDTHS}
            alignLastEnd={false}
          />

          {sectionalCompletions.length === 0 ? (
            <EmptyState {...PROGRAMME_TAB_EMPTY_COPY.sectionalCompletions} />
          ) : (
            <Flex vertical>
              {sectionalCompletions.map((row, index) => (
                // Same duplicate-name risk as the key-dates table, so the reference is part of
                // the key here too.
                <Fragment key={`${row.reference}-${row.section}`}>
                  <Flex align="center" gap={16} style={{ padding: '10px 32px' }}>
                    <Typography.Text style={{ flex: 1, minWidth: 0 }}>
                      {row.section}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ width: SECTIONAL_COLUMNS.reference, flexShrink: 0 }}
                    >
                      {row.reference || PROGRAMME_EXTRACT_COPY.emptyValue}
                    </Typography.Text>
                    <Typography.Text
                      style={{ width: SECTIONAL_COLUMNS.completionDate, flexShrink: 0 }}
                    >
                      {row.completionDate || PROGRAMME_EXTRACT_COPY.emptyValue}
                    </Typography.Text>
                    <Flex style={{ width: SECTIONAL_COLUMNS.status, flexShrink: 0 }}>
                      {/* The section's own status off the extract — green when completed, amber
                          while pending. A section the backend sends no status for reads the same
                          as any other empty cell. */}
                      {row.status ? (
                        <ProgrammeStatusPill label={row.status.label} tone={row.status.tone} />
                      ) : (
                        <Typography.Text type="secondary">
                          {PROGRAMME_EXTRACT_COPY.emptyValue}
                        </Typography.Text>
                      )}
                    </Flex>
                  </Flex>
                  {index < sectionalCompletions.length - 1 && (
                    <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />
                  )}
                </Fragment>
              ))}
            </Flex>
          )}
        </div>
      </ProgrammeSectionCard>
    </Flex>
  );
};

export default ProgrammePmViewTab;
