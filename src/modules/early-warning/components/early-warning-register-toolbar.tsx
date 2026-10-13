'use client';

import { FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Select } from 'antd';
import { EARLY_WARNING_REGISTER_COPY } from '../constants/early-warning.constants';
import { EW_SIZES } from '../constants/early-warning-register.theme';
import type { EarlyWarningRegisterStatus } from '../types/early-warning.types';

interface EarlyWarningRegisterToolbarProps {
  search: string;
  status?: EarlyWarningRegisterStatus;
  /** Status options scoped to the active register tab (see early-warning-list-page). */
  statusOptions: { label: string; value: EarlyWarningRegisterStatus }[];
  exporting?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (status?: EarlyWarningRegisterStatus) => void;
  onExport: () => void;
  onRaise: () => void;
}

const EarlyWarningRegisterToolbar = ({
  search,
  status,
  statusOptions,
  exporting,
  onSearchChange,
  onStatusChange,
  onExport,
  onRaise,
}: EarlyWarningRegisterToolbarProps) => (
  <Flex justify="space-between" align="center" gap={EW_SIZES.toolbarGap}>
    <Flex gap={EW_SIZES.toolbarGap}>
      <Input
        allowClear
        placeholder={EARLY_WARNING_REGISTER_COPY.searchPlaceholder}
        style={{ width: EW_SIZES.toolbarSearchWidth }}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Select
        allowClear
        placeholder={EARLY_WARNING_REGISTER_COPY.allStatusLabel}
        style={{ width: EW_SIZES.toolbarStatusWidth }}
        options={statusOptions}
        value={status}
        onChange={(next?: EarlyWarningRegisterStatus) => onStatusChange(next)}
      />
    </Flex>

    <Flex gap={EW_SIZES.toolbarGap}>
      <Button icon={<FileExcelOutlined />} loading={exporting} onClick={onExport}>
        {EARLY_WARNING_REGISTER_COPY.exportLabel}
      </Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={onRaise}>
        {EARLY_WARNING_REGISTER_COPY.raiseLabel}
      </Button>
    </Flex>
  </Flex>
);

export default EarlyWarningRegisterToolbar;
