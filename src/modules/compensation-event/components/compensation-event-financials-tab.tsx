'use client';

import { Empty, Flex, Skeleton } from 'antd';
import { COMPENSATION_EVENT_FINANCIALS_COPY } from '../constants/compensation-event-financials.constants';
import { FINANCIALS_SIZES } from '../constants/compensation-event-financials.theme';
import { useGetCompensationEventFinancialSummary } from '../hooks/use-compensation-events';
import type { CompensationEvent } from '../types/compensation-event.types';
import {
  buildCompensationEventFinancials,
  hasCompensationEventFinancialData,
} from '../utils/compensation-event.utils';
import CompensationEventFinancialMetrics from './compensation-event-financial-metrics';

// Container + presentational — the Financials tab: KPI strip and quotation row.
// Prefers the dedicated financial-summary endpoint (the final quotation's real
// figures) and falls back to the CE record's own fields while that query has no
// data — e.g. a real CE with no quotation yet.
const CompensationEventFinancialsTab = ({ event }: { event: CompensationEvent }) => {
  const { data: financialSummary, isLoading } = useGetCompensationEventFinancialSummary({
    id: event.id,
  });
  const financials = financialSummary ?? buildCompensationEventFinancials(event);

  return (
    <Flex vertical gap={FINANCIALS_SIZES.sectionGap}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : hasCompensationEventFinancialData(financials) ? (
        <CompensationEventFinancialMetrics event={event} financials={financials} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={COMPENSATION_EVENT_FINANCIALS_COPY.noData}
        />
      )}
    </Flex>
  );
};

export default CompensationEventFinancialsTab;
