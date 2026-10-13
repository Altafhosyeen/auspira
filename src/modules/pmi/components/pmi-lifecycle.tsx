'use client';

import { DetailLifecycleRail } from '@/components/shared/detail-lifecycle-rail';
import { PMI_DETAIL_COPY } from '../constants/pmi.constants';
import { PMI_DETAIL_COLORS } from '../constants/pmi-detail.theme';
import type { PmiLifecycleStep } from '../utils/pmi-detail.utils';

interface PmiLifecycleProps {
  steps: PmiLifecycleStep[];
}

// Right-rail "Lifecycle" timeline — one node per `PmiLifecycleStage`. Completed stages
// show their date, the stage in progress renders as an orange ring, the rest stay grey.
// Renders through the shared `DetailLifecycleRail`, the same shell the Early Warning and
// Compensation Event detail rails use.
const PmiLifecycle = ({ steps }: PmiLifecycleProps) => (
  <DetailLifecycleRail
    title={PMI_DETAIL_COPY.lifecycleTitle}
    steps={steps}
    tone={{
      navy: PMI_DETAIL_COLORS.main,
      muted: PMI_DETAIL_COLORS.textMuted,
      value: PMI_DETAIL_COLORS.text,
      complete: PMI_DETAIL_COLORS.main,
      pending: '#D9D9D9',
      current: '#F9480F',
    }}
    divider
  />
);

export default PmiLifecycle;
