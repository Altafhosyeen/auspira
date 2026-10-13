'use client';

import { DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Flex, Input, Typography } from 'antd';
import { useState } from 'react';

export interface StatusFilterOption {
  value: number;
  label: string;
}

interface RegisterSearchFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  // Status codes the register is currently narrowed to — empty means no filter.
  selectedStatuses: number[];
  onStatusesChange: (values: number[]) => void;
  statusOptions: StatusFilterOption[];
  filterLabel?: string;
  searchWidth?: number;
  // Register-specific controls rendered after the filter (e.g. PMI's Clear button).
  extraActions?: React.ReactNode;
}

// The register toolbar shared by the Early Warning, PMI and Compensation Event
// registers — a search box and a multi-select status filter, right-aligned.
export const RegisterSearchFilterToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search by user, action or details...',
  selectedStatuses,
  onStatusesChange,
  statusOptions,
  filterLabel = 'Filters',
  searchWidth = 280,
  extraActions,
}: RegisterSearchFilterToolbarProps) => {
  const [open, setOpen] = useState(false);

  const toggleStatus = (value: number) => {
    onStatusesChange(
      selectedStatuses.includes(value)
        ? selectedStatuses.filter((code) => code !== value)
        : [...selectedStatuses, value]
    );
  };

  return (
    <Flex align="center" justify="flex-end" gap={12} wrap>
      <Input
        allowClear
        prefix={<SearchOutlined style={{ color: '#98A2B3' }} />}
        placeholder={searchPlaceholder}
        style={{ maxWidth: '100%', width: searchWidth }}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <Dropdown
        trigger={['click']}
        // A checkbox list reads as one you tick several boxes in, but antd closes the
        // menu on every click — so the open state is held here and only the trigger or
        // an outside click shuts it.
        open={open}
        onOpenChange={setOpen}
        menu={{
          items: statusOptions.map(({ value, label }) => ({
            key: String(value),
            // The whole row toggles the checkbox; the checkbox ignores pointer
            // events so the row click never double-fires.
            label: (
              <Flex
                align="center"
                gap={8}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(value);
                }}
              >
                <Checkbox
                  checked={selectedStatuses.includes(value)}
                  className="pointer-events-none"
                />
                <Typography.Text>{label}</Typography.Text>
              </Flex>
            ),
          })),
        }}
        styles={{ root: { width: 230 } }}
      >
        <Button icon={<FilterOutlined />} iconPosition="start">
          <Flex align="center" gap={6}>
            {filterLabel}
            {/* The count stands for the selection once the dropdown closes, since the
                picked statuses are not listed anywhere else on the toolbar. */}
            {selectedStatuses.length > 0 && (
              <Typography.Text type="secondary">{`(${selectedStatuses.length})`}</Typography.Text>
            )}
            <DownOutlined style={{ fontSize: 10 }} />
          </Flex>
        </Button>
      </Dropdown>

      {extraActions}
    </Flex>
  );
};

export default RegisterSearchFilterToolbar;
