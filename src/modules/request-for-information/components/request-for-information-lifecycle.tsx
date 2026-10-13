import { DetailLifecycleRail } from '@/components/shared/detail-lifecycle-rail';
import { REQUEST_FOR_INFORMATION_DETAIL_COPY } from '../constants/request-for-information.constants';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';
import type { RequestForInformation } from '../types/request-for-information.types';
import { buildLifecycleSteps } from '../utils/request-for-information.utils';

interface RequestForInformationLifecycleProps {
  rfi: RequestForInformation;
}

// Presentational — the vertical Lifecycle rail beside the Event Summary. One node per
// stage the record has reached: Initiated, Open, Respond, Close, PMI. Renders through the
// shared `DetailLifecycleRail`, the same shell the Compensation Event detail's Lifecycle
// rail uses, so both detail screens' rails render identically.
const RequestForInformationLifecycle = ({ rfi }: RequestForInformationLifecycleProps) => (
  <DetailLifecycleRail
    title={REQUEST_FOR_INFORMATION_DETAIL_COPY.lifecycleTitle}
    steps={buildLifecycleSteps(rfi)}
    tone={{
      navy: REGISTER_COLORS.main,
      muted: REGISTER_COLORS.textMuted,
      value: REGISTER_COLORS.text,
      complete: REGISTER_COLORS.main,
      pending: '#D9D9D9',
    }}
  />
);

export default RequestForInformationLifecycle;
