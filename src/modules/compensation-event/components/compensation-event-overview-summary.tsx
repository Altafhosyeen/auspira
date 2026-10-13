'use client';

import { Icon } from '@iconify/react';
import { Divider } from 'antd';
import { DetailSummaryRows } from '@/components/shared/detail-summary-rows';
import {
  COMPENSATION_EVENT_OVERVIEW_COPY,
  COMPENSATION_EVENT_OVERVIEW_SUMMARY_LABELS,
} from '../constants/compensation-event-overview.constants';
import { OVERVIEW_COLORS, OVERVIEW_SIZES } from '../constants/compensation-event-overview.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import { orDash } from '../utils/compensation-event.utils';
import {
  formatEventType,
  formatImplementedQuotation,
} from '../utils/compensation-event-overview.utils';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const labels = COMPENSATION_EVENT_OVERVIEW_SUMMARY_LABELS;

// Presentational — the CE Summary card: the record's identity in the header, then one
// label/value line per field the record carries, under a hairline rule.
const CompensationEventOverviewSummary = ({ event }: { event: CompensationEvent }) => {
  const rows = [
    { label: labels.implementedQuotation, value: formatImplementedQuotation(event) },
    { label: labels.reference, value: orDash(event.reference) },
    { label: labels.type, value: formatEventType(event.typeValue) },
    { label: labels.contractor, value: orDash(event.contractorName) },
    { label: labels.raisedBy, value: orDash(event.raisedByName) },
  ];

  return (
    <CompensationEventNoticeSectionCard
      icon={<Icon icon="fluent:clipboard-task-list-ltr-24-regular" />}
      title={COMPENSATION_EVENT_OVERVIEW_COPY.summaryTitle}
      // The heading carries no reference of its own — the CE Reference row below states
      // it under its own label, and the two together only read as the same value twice.
      gap={0}
    >
      <Divider style={{ margin: '16px 0 0' }} />

      <DetailSummaryRows
        rows={rows}
        mutedColor={OVERVIEW_COLORS.muted}
        dividerColor={OVERVIEW_COLORS.divider}
        fontSize={OVERVIEW_SIZES.rowFontSize}
        labelWidth={OVERVIEW_SIZES.summaryLabelWidth}
        rowPaddingBlock={OVERVIEW_SIZES.summaryRowPaddingBlock}
      />
    </CompensationEventNoticeSectionCard>
  );
};

export default CompensationEventOverviewSummary;
