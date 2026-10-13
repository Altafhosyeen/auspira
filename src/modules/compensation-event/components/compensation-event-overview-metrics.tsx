'use client';

import { Icon } from '@iconify/react';
import { DetailMetricsRow } from '@/components/shared/detail-metrics-row';
import { NOTICE_COLORS } from '../constants/compensation-event-notice.theme';
import {
  COMPENSATION_EVENT_OVERVIEW_COPY,
  COMPENSATION_EVENT_OVERVIEW_METRIC_LABELS,
} from '../constants/compensation-event-overview.constants';
import {
  OVERVIEW_COLORS,
  OVERVIEW_SIZES,
  OVERVIEW_TILE_TONES,
} from '../constants/compensation-event-overview.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import { formatOptionalQuoteValue, resolveRegisterState } from '../utils/compensation-event.utils';
import {
  formatDayCount,
  resolveDaysIncreased,
  resolveStatusMetric,
} from '../utils/compensation-event-overview.utils';

// Presentational — the Key Summary strip: the quoted cost, the time impact and where the
// record currently stands, as three rule-separated figures. Renders through the shared
// `DetailMetricsRow`, the same strip the Request For Information detail's Overview uses.
const CompensationEventOverviewMetrics = ({ event }: { event: CompensationEvent }) => {
  const originalQuote = event.originalQuoteAmount ?? event.amount;
  const daysIncreased = resolveDaysIncreased(event);
  const status = resolveStatusMetric(resolveRegisterState(event.status), event.statusName);
  const statusPalette = OVERVIEW_TILE_TONES[status.tone];

  return (
    <DetailMetricsRow
      title={COMPENSATION_EVENT_OVERVIEW_COPY.metricsTitle}
      headerIcon={<Icon icon="fluent:document-bullet-list-24-regular" />}
      gutter={OVERVIEW_SIZES.gutter}
      sectionTone={{
        main: NOTICE_COLORS.main,
        mainSoft: NOTICE_COLORS.mainSoft,
        mainBorder: NOTICE_COLORS.mainBorder,
      }}
      tileColors={{
        label: OVERVIEW_COLORS.label,
        value: OVERVIEW_COLORS.value,
        muted: OVERVIEW_COLORS.muted,
        divider: OVERVIEW_COLORS.divider,
      }}
      tiles={[
        {
          key: 'originalQuote',
          tone: {
            chipBg: OVERVIEW_TILE_TONES.cost.chip,
            chipIcon: OVERVIEW_TILE_TONES.cost.icon,
          },
          icon: <Icon icon="fluent:document-text-24-regular" />,
          label: COMPENSATION_EVENT_OVERVIEW_METRIC_LABELS.originalQuote,
          value: formatOptionalQuoteValue(originalQuote, event.currency),
        },
        {
          key: 'daysIncreased',
          tone: {
            chipBg: OVERVIEW_TILE_TONES.schedule.chip,
            chipIcon: OVERVIEW_TILE_TONES.schedule.icon,
          },
          icon: <Icon icon="fluent:calendar-24-regular" />,
          label: COMPENSATION_EVENT_OVERVIEW_METRIC_LABELS.daysIncreased,
          value: formatDayCount(daysIncreased),
        },
        {
          key: 'status',
          tone: { chipBg: statusPalette.chip, chipIcon: statusPalette.icon },
          icon: <Icon icon={status.icon} />,
          label: COMPENSATION_EVENT_OVERVIEW_METRIC_LABELS.status,
          value: status.label,
        },
      ]}
    />
  );
};

export default CompensationEventOverviewMetrics;
