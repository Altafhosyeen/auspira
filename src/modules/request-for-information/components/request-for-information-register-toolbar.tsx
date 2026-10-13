'use client';

import { DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Badge, Button, Checkbox, Dropdown, Flex, Input, type MenuProps, Typography } from 'antd';
import { useState } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import {
  REQUEST_FOR_INFORMATION_REGISTER_COPY,
  REQUEST_FOR_INFORMATION_REGISTER_STATUSES,
  REQUEST_FOR_INFORMATION_STATUS_LABELS,
} from '../constants/request-for-information.constants';
import {
  REGISTER_COLORS,
  REGISTER_SIZES,
} from '../constants/request-for-information-register.theme';
import type { RequestForInformationStatus } from '../types/request-for-information.types';
import { toSelectedStatuses } from '../utils/request-for-information.utils';

const { searchPlaceholder, filtersLabel, clearAllLabel, clearAllDisabledReason } =
  REQUEST_FOR_INFORMATION_REGISTER_COPY;

interface RequestForInformationRegisterToolbarProps {
  search: string;
  statuses: RequestForInformationStatus[];
  onSearchChange: (value: string) => void;
  onStatusesChange: (statuses: RequestForInformationStatus[]) => void;
  onClearAll: () => void;
}

// Presentational — the search box, the multi-select status Filters dropdown and Clear all.
const RequestForInformationRegisterToolbar = ({
  search,
  statuses,
  onSearchChange,
  onStatusesChange,
  onClearAll,
}: RequestForInformationRegisterToolbarProps) => {
  const [open, setOpen] = useState(false);

  const items: MenuProps['items'] = REQUEST_FOR_INFORMATION_REGISTER_STATUSES.map((option) => ({
    key: option,
    label: (
      <Flex align="center" gap={8}>
        <Checkbox checked={statuses.includes(option)} className="pointer-events-none" />
        {REQUEST_FOR_INFORMATION_STATUS_LABELS[option]}
      </Flex>
    ),
  }));

  // Fires for both select and deselect — antd hands back the full next selection either
  // way, so the same handler covers ticking and unticking a status.
  const handleSelectionChange: MenuProps['onSelect'] = ({ selectedKeys }) =>
    onStatusesChange(toSelectedStatuses(selectedKeys as RequestForInformationStatus[]));

  const hasFilters = Boolean(search) || statuses.length > 0;

  return (
    <Flex align="center" justify="space-between" gap={REGISTER_SIZES.toolbarGap} wrap>
      <Flex align="center" gap={REGISTER_SIZES.toolbarGap} wrap>
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: REGISTER_COLORS.controlText }} />}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="max-w-full"
          style={{ width: REGISTER_SIZES.toolbarSearchWidth }}
        />

        <Dropdown
          menu={{
            items,
            multiple: true,
            selectable: true,
            selectedKeys: statuses,
            onSelect: handleSelectionChange,
            onDeselect: handleSelectionChange,
            onClick: ({ domEvent }) => domEvent.stopPropagation(),
          }}
          trigger={['click']}
          open={open}
          onOpenChange={setOpen}
          destroyOnHidden
        >
          <Badge
            count={statuses.length}
            showZero={false}
            offset={[-6, 4]}
            color={REGISTER_COLORS.main}
          >
            <Button icon={<FilterOutlined />} style={{ width: REGISTER_SIZES.toolbarFiltersWidth }}>
              <span className="inline-flex items-center gap-1.5">
                {filtersLabel}
                <DownOutlined style={{ fontSize: 10, color: REGISTER_COLORS.controlText }} />
              </span>
            </Button>
          </Badge>
        </Dropdown>
      </Flex>

      <DisabledTooltip disabled={!hasFilters} reason={clearAllDisabledReason}>
        <Typography.Link
          onClick={onClearAll}
          disabled={!hasFilters}
          className="font-medium shrink-0"
        >
          {clearAllLabel}
        </Typography.Link>
      </DisabledTooltip>
    </Flex>
  );
};

export default RequestForInformationRegisterToolbar;
