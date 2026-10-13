'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Tag, Typography } from 'antd';
import { Fragment } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import {
  EXTRACTED_FIELD_STATUS_COLORS,
  EXTRACTED_FIELD_STATUS_LABELS,
  PROGRAMME_EXTRACT_COPY,
  PROGRAMME_TAB_EMPTY_COPY,
} from '../constants/programme.constants';
import type { ExtractAndCheckTabProps } from '../types/programme.types';

// Shared between the header band and every data row so the three columns line up exactly.
const TITLE_COLUMN_WIDTH = 397;
const VALUE_COLUMN_WIDTH = 324;

// "Extraction and health check" — the second tab of the Program Health detail screen. The
// extract table sits on top and the AI health check card closes the tab, both fed from the
// programee alert the container resolved.
const ProgrammeExtractAndCheckTab = ({
  revisionLabel,
  fields,
  healthCheck,
}: ExtractAndCheckTabProps) => (
  <Flex vertical gap={16}>
    <Card styles={{ body: { padding: 0 } }}>
      <Flex align="center" gap={12} style={{ padding: '14px 22px' }}>
        <IconChip icon={<FileTextOutlined />} bordered size={32} />
        <Typography.Text strong style={{ fontSize: 15 }}>
          {revisionLabel}
        </Typography.Text>
      </Flex>

      <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />

      <div style={{ padding: '12px 22px' }}>
        <Flex
          gap={16}
          style={{
            padding: '10px 32px',
            background: APP_COLORS.mainSoft,
            borderRadius: 6,
          }}
        >
          <Typography.Text strong style={{ color: APP_COLORS.main, width: TITLE_COLUMN_WIDTH }}>
            {PROGRAMME_EXTRACT_COPY.extractedTableColumns.title}
          </Typography.Text>
          <Typography.Text strong style={{ color: APP_COLORS.main, width: VALUE_COLUMN_WIDTH }}>
            {PROGRAMME_EXTRACT_COPY.extractedTableColumns.valueFound}
          </Typography.Text>
          <Typography.Text strong className="flex-1 text-right" style={{ color: APP_COLORS.main }}>
            {PROGRAMME_EXTRACT_COPY.extractedTableColumns.status}
          </Typography.Text>
        </Flex>

        {/* The column band stays put and the placeholder sits under it, exactly as an antd
            Table renders its `emptyText`. */}
        {fields.length === 0 ? (
          <EmptyState {...PROGRAMME_TAB_EMPTY_COPY.extractedFields} />
        ) : (
          <Flex vertical>
            {fields.map((field, index) => {
              const tone = EXTRACTED_FIELD_STATUS_COLORS[field.status];
              return (
                <Fragment key={field.title}>
                  <Flex align="center" gap={16} style={{ padding: '10px 32px' }}>
                    <Typography.Text style={{ width: TITLE_COLUMN_WIDTH }}>
                      {field.title}
                    </Typography.Text>
                    <Typography.Text style={{ width: VALUE_COLUMN_WIDTH }}>
                      {field.valueFound}
                    </Typography.Text>
                    <Flex className="flex-1" justify="flex-end">
                      <Tag
                        bordered={false}
                        style={{
                          background: tone.background,
                          color: tone.text,
                          borderRadius: 4,
                          margin: 0,
                        }}
                      >
                        {EXTRACTED_FIELD_STATUS_LABELS[field.status]}
                      </Tag>
                    </Flex>
                  </Flex>
                  {index < fields.length - 1 && (
                    <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />
                  )}
                </Fragment>
              );
            })}
          </Flex>
        )}
      </div>
    </Card>

    <Card styles={{ body: { padding: 0 } }}>
      <Flex align="center" gap={12} wrap style={{ padding: '14px 22px' }}>
        <IconChip icon={<FileTextOutlined />} bordered size={32} />
        <Typography.Text strong style={{ fontSize: 15 }}>
          {healthCheck.title}
        </Typography.Text>
        {healthCheck.flagCount > 0 && (
          <Tag
            bordered={false}
            style={{
              background: EXTRACTED_FIELD_STATUS_COLORS.missing.background,
              color: EXTRACTED_FIELD_STATUS_COLORS.missing.text,
              borderRadius: 4,
              marginInlineStart: 4,
            }}
          >
            {PROGRAMME_EXTRACT_COPY.flagsCount(healthCheck.flagCount)}
          </Tag>
        )}
      </Flex>

      <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />

      {healthCheck.flags.length === 0 ? (
        <EmptyState tone="success" {...PROGRAMME_TAB_EMPTY_COPY.healthCheck} />
      ) : (
        <Flex vertical style={{ padding: '8px 22px 16px' }}>
          {healthCheck.flags.map((flag, index) => (
            // Keyed on the finding as well as the category, because the category is the flag's
            // severity — and several warnings at once is the normal case. Keying on severity
            // alone gave React duplicate keys, which makes it drop siblings.
            <Fragment key={`${flag.category}-${flag.finding}`}>
              <Flex gap={35} style={{ padding: '12px 0' }}>
                <Typography.Text type="secondary" style={{ width: 158, flexShrink: 0 }}>
                  {flag.category}
                </Typography.Text>
                <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                  <Typography.Text strong>{flag.finding}</Typography.Text>
                  {flag.note && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {flag.note}
                    </Typography.Text>
                  )}
                </Flex>
              </Flex>
              {index < healthCheck.flags.length - 1 && (
                <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />
              )}
            </Fragment>
          ))}
        </Flex>
      )}
    </Card>
  </Flex>
);

export default ProgrammeExtractAndCheckTab;
