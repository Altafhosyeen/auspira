'use client';

import { Col, Flex, Row } from 'antd';
import { useMemo } from 'react';
import { OVERVIEW_SIZES } from '../constants/compensation-event-overview.theme';
import { useGetQuotationsByCompensationEvent } from '../hooks/use-quotations';
import type { CompensationEvent } from '../types/compensation-event.types';
import { withQuotationDetails } from '../utils/compensation-event-overview.utils';
import CompensationEventOverviewLifecycle from './compensation-event-overview-lifecycle';
import CompensationEventOverviewSummary from './compensation-event-overview-summary';

// Container — the Overview tab: the Key Summary figures across the top, then the record's
// identity beside the lifecycle rail.
//
// The CE detail response carries no contractor name and no quote-received date, so the
// tab pulls the event's quotations and fills those in from the submitted revision
// rather than rendering a dash for fields the record can actually answer.
const CompensationEventOverviewTab = ({ event }: { event: CompensationEvent }) => {
  const { data: quotations } = useGetQuotationsByCompensationEvent({
    compensationEventId: event.id,
  });

  const resolved = useMemo(() => withQuotationDetails(event, quotations), [event, quotations]);

  return (
    <Flex vertical gap={OVERVIEW_SIZES.gutter}>
      {/* <CompensationEventOverviewMetrics event={resolved} /> */}

      <Row gutter={[OVERVIEW_SIZES.gutter, OVERVIEW_SIZES.gutter]}>
        <Col xs={24} lg={16}>
          <CompensationEventOverviewSummary event={resolved} />
        </Col>
        <Col xs={24} lg={8}>
          <CompensationEventOverviewLifecycle event={resolved} />
        </Col>
      </Row>
    </Flex>
  );
};

export default CompensationEventOverviewTab;
