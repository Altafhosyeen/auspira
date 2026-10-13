'use client';

import { CalendarOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Dropdown, Flex, Input } from 'antd';
import type { Dayjs } from 'dayjs';
import { AWARENESS_COPY, AWARENESS_FILTER_TABS } from '../constants/awareness.constants';
import type { FilterTab } from '../types/awareness.types';

interface AwarenessToolbarProps {
  activeTab: FilterTab;
  counts: Record<FilterTab, number>;
  search: string;
  date?: Dayjs | null;
  onTabChange: (tab: FilterTab) => void;
  onSearchChange: (term: string) => void;
  onDateChange: (date?: Dayjs | null) => void;
}

// Filter bar — tab pills (with counts), More dropdown (Meeting / Quotation), a working date picker, and search.
const AwarenessToolbar = ({
  activeTab,
  counts,
  search,
  date,
  onTabChange,
  onSearchChange,
  onDateChange,
}: AwarenessToolbarProps) => {
  const isMoreActive = activeTab === 'meeting' || activeTab === 'quotation';
  const moreLabel =
    activeTab === 'meeting'
      ? `Meeting (${counts.meeting ?? 0})`
      : activeTab === 'quotation'
        ? `Quotation (${counts.quotation ?? 0})`
        : 'More';

  return (
    <Flex justify="space-between" align="center" gap={16} wrap>
      <Flex gap={8} align="center" wrap>
        {AWARENESS_FILTER_TABS.map(({ key, label }) => (
          <Button
            key={key}
            type={activeTab === key ? 'primary' : 'default'}
            onClick={() => onTabChange(key)}
          >
            {label} ({counts[key] ?? 0})
          </Button>
        ))}

        <Dropdown
          menu={{
            items: [
              {
                key: 'meeting',
                label: `Meeting (${counts.meeting ?? 0})`,
              },
              {
                key: 'quotation',
                label: `Quotation (${counts.quotation ?? 0})`,
              },
            ],
            selectable: true,
            selectedKeys: isMoreActive ? [activeTab] : [],
            onClick: ({ key }) => onTabChange(key as FilterTab),
          }}
          trigger={['click']}
        >
          <Button
            type={isMoreActive ? 'primary' : 'default'}
            icon={<DownOutlined />}
            iconPosition="end"
          >
            {moreLabel}
          </Button>
        </Dropdown>

        <DatePicker
          placeholder="Select Date"
          allowClear
          suffixIcon={<CalendarOutlined />}
          value={date ?? null}
          onChange={(value) => onDateChange(value)}
        />
      </Flex>

      <Flex gap={8} align="center">
        <Input
          allowClear
          placeholder={AWARENESS_COPY.searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 260 }}
        />
      </Flex>
    </Flex>
  );
};

export default AwarenessToolbar;
