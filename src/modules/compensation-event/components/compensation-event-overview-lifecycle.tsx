'use client';

import { DetailLifecycleRail } from '@/components/shared/detail-lifecycle-rail';
import { COMPENSATION_EVENT_OVERVIEW_COPY } from '../constants/compensation-event-overview.constants';
import {
  OVERVIEW_COLORS,
  OVERVIEW_STEPPER_COLORS,
} from '../constants/compensation-event-overview.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import { resolveRegisterState } from '../utils/compensation-event.utils';
import {
  buildLifecycleSteps,
  toCeLifecycleSteps,
} from '../utils/compensation-event-overview.utils';

// Presentational — the vertical Lifecycle rail beside the Event Summary. Prefers the
// record's own `lifecycle[]` entries through the shared stage mapper (the same five
// stages the PMI and Early Warning rails render), falling back to the record's dates
// for responses that predate the lifecycle payload. Renders through the shared
// `DetailLifecycleRail`, so every detail screen's rail reads identically.
const CompensationEventOverviewLifecycle = ({ event }: { event: CompensationEvent }) => {
  const discarded = resolveRegisterState(event.status) === 'DISCARDED';
  const steps = event.lifecycle?.length
    ? toCeLifecycleSteps(event.lifecycle)
    : buildLifecycleSteps(event);

  return (
    <DetailLifecycleRail
      title={COMPENSATION_EVENT_OVERVIEW_COPY.lifecycleTitle}
      steps={steps}
      note={discarded ? COMPENSATION_EVENT_OVERVIEW_COPY.lifecycleDiscarded : undefined}
      tone={{
        navy: OVERVIEW_COLORS.navy,
        muted: OVERVIEW_COLORS.muted,
        value: OVERVIEW_COLORS.value,
        complete: OVERVIEW_STEPPER_COLORS.complete,
        pending: OVERVIEW_STEPPER_COLORS.pending,
        current: OVERVIEW_STEPPER_COLORS.current,
      }}
    />
  );
};

export default CompensationEventOverviewLifecycle;
