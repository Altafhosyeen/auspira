import {
  REQUEST_FOR_INFORMATION_STATUS_LABELS,
  REQUEST_FOR_INFORMATION_STATUS_TONES,
} from '../constants/request-for-information.constants';
import type { RequestForInformationStatus } from '../types/request-for-information.types';
import RequestForInformationToneBadge from './request-for-information-tone-badge';

interface RequestForInformationStatusBadgeProps {
  status: RequestForInformationStatus;
  // Raw backend statusName — shown verbatim when supplied, instead of the mapped
  // register label, so the badge reflects exactly what the API sent.
  label?: string;
}

// Presentational — the OPEN/CLOSED pill the register table's Status column shows.
const RequestForInformationStatusBadge = ({
  status,
  label,
}: RequestForInformationStatusBadgeProps) => (
  <RequestForInformationToneBadge tone={REQUEST_FOR_INFORMATION_STATUS_TONES[status]} pill>
    {(label ?? REQUEST_FOR_INFORMATION_STATUS_LABELS[status]).toUpperCase()}
  </RequestForInformationToneBadge>
);

export default RequestForInformationStatusBadge;
