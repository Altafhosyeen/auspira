'use client';

import { DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Flex, Input, Typography } from 'antd';
import { COMPENSATION_EVENT_AUDIT_COPY } from '../constants/compensation-event-audit.constants';
import { AUDIT_SIZES } from '../constants/compensation-event-audit.theme';
import { PANEL_SIZES } from '../constants/compensation-event-detail.theme';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';

const { filtersLabel, noFilterOptions, clearAllLabel } = COMPENSATION_EVENT_AUDIT_COPY;

export interface ToolbarFilterOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface CompensationEventListToolbarProps<TValue extends string> {
  term: string;
  onTermChange: (term: string) => void;
  searchPlaceholder: string;
  /** Omitted where the list has nothing worth filtering on beyond the search. */
  filterOptions?: ToolbarFilterOption<TValue>[];
  selected?: TValue[];
  onSelectedChange?: (selected: TValue[]) => void;
  onClearAll: () => void;
  // Only the Audit Trail card needs a trailing gap — the other panels space their own body.
  marginBottom?: number;
  searchWidth?: number | string;
}

// Presentational — the shared detail-tab toolbar: a search box and a multi-select
// Filters dropdown pushed to the right, with Clear all trailing them. Every CE detail
// tab that lists rows renders this one control set so they read identically.
const CompensationEventListToolbar = <TValue extends string>({
  term,
  onTermChange,
  searchPlaceholder,
  filterOptions,
  selected = [],
  onSelectedChange,
  onClearAll,
  marginBottom = 0,
  searchWidth = AUDIT_SIZES.searchWidth,
}: CompensationEventListToolbarProps<TValue>) => (
  <Flex
    align="center"
    justify="flex-end"
    gap={AUDIT_SIZES.toolbarGap}
    wrap
    style={{ marginBottom }}
  >
    <Input
      allowClear
      prefix={<SearchOutlined style={{ color: REGISTER_COLORS.textMuted }} />}
      placeholder={searchPlaceholder}
      value={term}
      onChange={(changeEvent) => onTermChange(changeEvent.target.value)}
      style={{
        borderRadius: PANEL_SIZES.cardRadius,
        height: AUDIT_SIZES.toolbarHeight,
        maxWidth: '100%',
        width: searchWidth,
      }}
    />

    {filterOptions && (
      <Dropdown
        trigger={['click']}
        menu={{
          selectable: false,
          // Long vocabularies (the audit trail's ~23 actions) would otherwise render as
          // one unbounded column that overflows the viewport.
          style: {
            maxHeight: AUDIT_SIZES.filtersMenuMaxHeight,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          },
          items: filterOptions.length
            ? filterOptions.map((option) => ({
                key: option.value,
                label: (
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onChange={({ target }) =>
                      onSelectedChange?.(
                        target.checked
                          ? [...selected, option.value]
                          : selected.filter((item) => item !== option.value)
                      )
                    }
                  >
                    {option.label}
                  </Checkbox>
                ),
              }))
            : [{ key: 'empty', disabled: true, label: noFilterOptions }],
        }}
      >
        <Button
          icon={<FilterOutlined />}
          style={{
            borderRadius: PANEL_SIZES.cardRadius,
            height: AUDIT_SIZES.toolbarHeight,
            width: AUDIT_SIZES.filtersWidth,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {filtersLabel}
            <DownOutlined style={{ fontSize: 10, color: REGISTER_COLORS.textMuted }} />
          </span>
        </Button>
      </Dropdown>
    )}

    <Typography.Link onClick={onClearAll} style={{ fontSize: AUDIT_SIZES.footerFontSize }}>
      {clearAllLabel}
    </Typography.Link>
  </Flex>
);

export default CompensationEventListToolbar;
