'use client';

import { Typography } from 'antd';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import RegisterSearchFilterToolbar from '@/components/shared/register-search-filter-toolbar';
import type { CompensationEventStatus as CompensationEventStatusCode } from '@/constants/enum.constant';
import {
  COMPENSATION_EVENT_REGISTER_COPY,
  COMPENSATION_EVENT_STATUS_CODE_LABELS,
  COMPENSATION_EVENT_STATUS_FILTER_CODES,
} from '../constants/compensation-event.constants';
import { REGISTER_SIZES } from '../constants/compensation-event-register.theme';

const { searchPlaceholder, filtersLabel, clearAllLabel, clearAllDisabledReason } =
  COMPENSATION_EVENT_REGISTER_COPY;

const STATUS_FILTER_OPTIONS = COMPENSATION_EVENT_STATUS_FILTER_CODES.map((code) => ({
  value: code,
  label: COMPENSATION_EVENT_STATUS_CODE_LABELS[code],
}));

interface CompensationEventRegisterToolbarProps {
  search: string;
  // Every status the register is currently narrowed to, as the backend's own
  // CompensationEventStatus codes — empty means no status filter.
  states: CompensationEventStatusCode[];
  onSearchChange: (value: string) => void;
  onStatesChange: (states: CompensationEventStatusCode[]) => void;
  onClear: () => void;
}

// Thin wrapper over the shared register toolbar — supplies this register's copy and
// its own status codes, so the search and filter controls stay identical to the
// Early Warning and PMI registers.
const CompensationEventRegisterToolbar = ({
  search,
  states,
  onSearchChange,
  onStatesChange,
  onClear,
}: CompensationEventRegisterToolbarProps) => {
  const hasActiveFilters = search.trim() !== '' || states.length > 0;

  return (
    <RegisterSearchFilterToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      selectedStatuses={states}
      onStatusesChange={(values) => onStatesChange(values as CompensationEventStatusCode[])}
      statusOptions={STATUS_FILTER_OPTIONS}
      filterLabel={filtersLabel}
      searchWidth={REGISTER_SIZES.toolbarSearchWidth}
      extraActions={
        // Disabled until something is actually filtered, so the link reads as the state
        // of the register rather than an action that is always on offer.
        <DisabledTooltip disabled={!hasActiveFilters} reason={clearAllDisabledReason}>
          <Typography.Link
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="font-medium shrink-0"
          >
            {clearAllLabel}
          </Typography.Link>
        </DisabledTooltip>
      }
    />
  );
};

export default CompensationEventRegisterToolbar;
