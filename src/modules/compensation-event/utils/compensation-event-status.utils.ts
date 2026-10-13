import {
  COMPENSATION_EVENT_LEGACY_STATE_MAP,
  COMPENSATION_EVENT_REGISTER_STATES,
  COMPENSATION_EVENT_STATUS_CODE_LABELS,
  COMPENSATION_EVENT_STATUS_CODE_TO_STATE,
} from '../constants/compensation-event.constants';
import type { CompensationEventStatus } from '../types/compensation-event.types';
import type { ApiNumber } from '../types/compensation-event-api.types';
import { toNumber } from './compensation-event-api.utils';

// The backend names its states freely ("Notified", "Quote Submitted", …); fold
// whatever arrives onto the register vocabulary the UI is built around.
export const resolveApiStatus = (statusName?: string | null): CompensationEventStatus => {
  const normalised = (statusName ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (COMPENSATION_EVENT_REGISTER_STATES.includes(normalised as never)) {
    return normalised as CompensationEventStatus;
  }

  if (normalised in COMPENSATION_EVENT_LEGACY_STATE_MAP) {
    return normalised as CompensationEventStatus;
  }

  // "Discard" / "Discarded" — the event was withdrawn. Matched before the rest so it is
  // never mistaken for a live record and folded onto the DRAFT catch-all below.
  if (normalised.startsWith('DISCARD')) return 'DISCARDED';

  if (normalised.startsWith('REVIS')) return 'REVISED_QUOTATION_TO_BE_SUBMITTED';
  if (normalised.startsWith('QUOT')) return 'QUOTATION_SUBMITTED';
  if (normalised.startsWith('IMPLEMENT') || normalised.startsWith('CLOS')) return 'IMPLEMENTED';
  if (normalised.startsWith('EXTENSION') || normalised.startsWith('EOT')) {
    return 'EXTENSION_OF_TIME_REQUESTED';
  }
  if (normalised.startsWith('ASSESS')) return 'PROJECT_MANAGER_ASSESSMENT';
  if (normalised.startsWith('AWAIT') || normalised.startsWith('NOTIF')) {
    return 'QUOTATION_TO_BE_SUBMITTED';
  }

  return 'DRAFT';
};

// The numeric `status` code is authoritative when the backend sends one — `resolveApiStatus`'s
// text-matching is only a fallback for the rows a code doesn't cover.
export const resolveCompensationEventRegisterState = (
  status?: ApiNumber | null,
  statusName?: string | null
): CompensationEventStatus => {
  const code = toNumber(status);
  if (code !== null && code in COMPENSATION_EVENT_STATUS_CODE_TO_STATE) {
    return COMPENSATION_EVENT_STATUS_CODE_TO_STATE[
      code as keyof typeof COMPENSATION_EVENT_STATUS_CODE_TO_STATE
    ];
  }

  return resolveApiStatus(statusName);
};

// The label shown on the register: the proper name for the numeric code (e.g. 5 ->
// "Quotation Requested") when the backend sends one, otherwise the raw `statusName` text.
export const resolveCompensationEventStatusLabel = (
  status?: ApiNumber | null,
  statusName?: string | null
): string | undefined => {
  const code = toNumber(status);
  if (code !== null && code in COMPENSATION_EVENT_STATUS_CODE_LABELS) {
    return COMPENSATION_EVENT_STATUS_CODE_LABELS[
      code as keyof typeof COMPENSATION_EVENT_STATUS_CODE_LABELS
    ];
  }

  return statusName?.trim() || undefined;
};
