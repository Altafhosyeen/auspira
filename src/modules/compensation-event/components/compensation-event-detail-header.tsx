'use client';

import { CopyOutlined } from '@ant-design/icons';
import { DetailHeader } from '@/components/shared/detail-header';
import { COMPENSATION_EVENT_DETAIL_COPY } from '../constants/compensation-event-detail.constants';
import { DETAIL_COLORS } from '../constants/compensation-event-detail.theme';
import { REGISTER_SIZES } from '../constants/compensation-event-register.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import { resolveClauseChip } from '../utils/compensation-event-clause.utils';
import CompensationEventClauseChip from './compensation-event-clause-chip';

const { title } = COMPENSATION_EVENT_DETAIL_COPY;

interface CompensationEventDetailHeaderProps {
  event: CompensationEvent;
}

// Presentational — the title bar: icon, "Compensation Event Details" and the clause
// chip read off the event's own record. Renders through the shared `DetailHeader`, the
// same title bar the Request For Information detail screen uses.
const CompensationEventDetailHeader = ({ event }: CompensationEventDetailHeaderProps) => (
  <DetailHeader
    icon={<CopyOutlined />}
    title={title}
    color={DETAIL_COLORS.main}
    iconFontSize={REGISTER_SIZES.headerIconSize}
    titleFontSize={REGISTER_SIZES.titleFontSize}
    extra={<CompensationEventClauseChip chip={resolveClauseChip(event)} />}
  />
);

export default CompensationEventDetailHeader;
