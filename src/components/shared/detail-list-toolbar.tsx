'use client';

import { DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Flex, Input, Typography } from 'antd';
import { APP_COLORS } from '@/constants/app.theme';

// Roughly eight rows — enough that the list reads as scrollable without the menu
// running off the bottom of the screen.
const FILTERS_MENU_MAX_HEIGHT = 320;

export interface DetailToolbarFilterOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface DetailListToolbarProps<TValue extends string> {
  term: string;
  onTermChange: (term: string) => void;
  searchPlaceholder?: string;
  /** Omitted where the list has nothing worth filtering on beyond the search. */
  filterOptions?: DetailToolbarFilterOption<TValue>[];
  selected?: TValue[];
  onSelectedChange?: (selected: TValue[]) => void;
  onClearAll: () => void;
  // Only cards that do not space their own body need a trailing gap.
  marginBottom?: number;
  searchWidth?: number | string;
}

// Presentational — the detail-tab toolbar: a search box and a multi-select Filters
// dropdown pushed to the right, with Clear all trailing them. Shared so every detail
// tab that lists rows (CE, PMI) renders one control set instead of per-module copies.
export const DetailListToolbar = <TValue extends string>({
  term,
  onTermChange,
  searchPlaceholder = 'Search by user, action or details...',
  filterOptions,
  selected = [],
  onSelectedChange,
  onClearAll,
  marginBottom = 0,
  searchWidth = 320,
}: DetailListToolbarProps<TValue>) => (
  <Flex align="center" justify="flex-end" gap={8} wrap style={{ marginBottom }}>
    <Input
      allowClear
      prefix={<SearchOutlined style={{ color: APP_COLORS.textMuted }} />}
      placeholder={searchPlaceholder}
      value={term}
      onChange={(changeEvent) => onTermChange(changeEvent.target.value)}
      style={{ height: 44, maxWidth: '100%', width: searchWidth }}
    />

    {filterOptions && (
      <Dropdown
        trigger={['click']}
        menu={{
          selectable: false,
          // Long vocabularies (the audit trail's ~23 actions) would otherwise render as
          // one unbounded column that overflows the viewport.
          style: {
            maxHeight: FILTERS_MENU_MAX_HEIGHT,
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
            : [{ key: 'empty', disabled: true, label: 'No activity to filter' }],
        }}
      >
        <Button icon={<FilterOutlined />} style={{ height: 44, width: 143 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Filters
            <DownOutlined style={{ fontSize: 10, color: APP_COLORS.textMuted }} />
          </span>
        </Button>
      </Dropdown>
    )}

    <Typography.Link onClick={onClearAll} style={{ fontSize: 13 }}>
      Clear all
    </Typography.Link>
  </Flex>
);

export default DetailListToolbar;
