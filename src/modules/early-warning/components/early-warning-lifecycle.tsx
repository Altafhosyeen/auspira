'use client';

import { DetailLifecycleRail } from '@/components/shared/detail-lifecycle-rail';
import { EARLY_WARNING_DETAIL_COPY } from '../constants/early-warning.constants';
import { EW_COLORS } from '../constants/early-warning-register.theme';
import type { LifecycleStep } from '../utils/early-warning-detail.utils';

// Right-rail "Lifecycle" timeline — one node per `EwLifecycleStage`. Completed stages
// show when they happened, the stage in progress renders as an orange ring with its due
// warning, the rest stay grey. Renders through the shared `DetailLifecycleRail`, the same
// shell the PMI and Compensation Event detail rails use.
const EarlyWarningLifecycle = ({ steps }: { steps: LifecycleStep[] }) => (
  <DetailLifecycleRail
    title={EARLY_WARNING_DETAIL_COPY.lifecycle}
    steps={steps.map((step) => ({
      key: step.title,
      label: step.title,
      date: step.subtext,
      complete: step.status === 'completed',
      current: step.status === 'active',
    }))}
    tone={{
      navy: EW_COLORS.main,
      muted: EW_COLORS.textMuted,
      value: EW_COLORS.text,
      complete: EW_COLORS.main,
      pending: '#D9D9D9',
      current: '#FA541C',
    }}
  />
);

export default EarlyWarningLifecycle;
