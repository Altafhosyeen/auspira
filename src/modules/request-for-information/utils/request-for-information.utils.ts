import dayjs from 'dayjs';
import type { ProjectEmail } from '@/components/contract/cross-reference-contract/EmailThreadModal/types';
import type { EntityConversationDto } from '@/modules/compensation-event';
import {
  REQUEST_FOR_INFORMATION_LIFECYCLE_STEPS,
  REQUEST_FOR_INFORMATION_REGISTER_STATUSES,
} from '../constants/request-for-information.constants';
import type {
  RequestForInformation,
  RequestForInformationListParams,
  RequestForInformationStatus,
  RequestForInformationThreadMessage,
} from '../types/request-for-information.types';

const DASH = '-';

export const formatRegisterDate = (value?: string | null): string =>
  value ? dayjs(value).format('DD MMM YYYY') : DASH;

// Every state the register filter picked, cast back to the plain status list the
// checkbox dropdown works with — kept as its own helper so the filter logic reads the
// same way the Compensation Event register's does, even though today it is an identity map.
export const toSelectedStatuses = (
  states: RequestForInformationStatus[]
): RequestForInformationStatus[] =>
  states.filter((state) => REQUEST_FOR_INFORMATION_REGISTER_STATUSES.includes(state));

export type RequestForInformationLifecycleStepKey =
  (typeof REQUEST_FOR_INFORMATION_LIFECYCLE_STEPS)[number]['key'];

export interface RequestForInformationLifecycleStep {
  key: RequestForInformationLifecycleStepKey;
  label: string;
  date: string;
  complete: boolean;
}

// The register only carries OPEN/CLOSED plus `createdAt`/`dateIssued`, so the Lifecycle
// rail (Initiated / Open / Respond / Close / PMI) reads what it can off those and leaves
// the rest pending: "Initiated" and "Open" are reached once the record has those dates,
// "Close" is reached once the record is closed, and "Respond"/"PMI" stay pending until
// the backend carries a signal for them.
export const buildLifecycleSteps = (
  rfi: RequestForInformation
): RequestForInformationLifecycleStep[] =>
  REQUEST_FOR_INFORMATION_LIFECYCLE_STEPS.map((step) => {
    if (step.key === 'initiated') {
      return { ...step, date: formatRegisterDate(rfi.createdAt), complete: true };
    }
    if (step.key === 'open') {
      return { ...step, date: formatRegisterDate(rfi.dateIssued), complete: true };
    }
    if (step.key === 'close') {
      const complete = rfi.status === 'CLOSED';
      return { ...step, date: complete ? formatRegisterDate(rfi.updatedAt) : DASH, complete };
    }
    return { ...step, date: DASH, complete: false };
  });

// The Email Thread tab's list source — one row per conversation summary, newest first.
// `EntityConversationDto` comes off the same entity-keyed conversations endpoint the
// Compensation Event detail's Email Thread tab reads, so the mapping only needs to shape
// it into the RFI module's own thread-message type.
export const toRequestForInformationThread = (
  conversations: EntityConversationDto[]
): RequestForInformationThreadMessage[] =>
  [...conversations]
    .sort((a, b) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime())
    .map((conversation) => ({
      id: conversation.conversationId,
      authorName: conversation.senderEmail || 'Unknown sender',
      subject: conversation.subject || '(no subject)',
      body: conversation.body ?? '',
      sentAt: conversation.timestampUtc,
    }));

// A mock thread row has no real conversationId to fetch, so `EmailThreadModal` cannot load
// it — shape the row's own already-known content into a single-message `ProjectEmail` and
// hand it in as `fallbackMessages` instead, same approach CE's `toFallbackProjectEmail` takes.
export const toRequestForInformationFallbackEmail = (
  item: RequestForInformationThreadMessage
): ProjectEmail => ({
  id: item.id,
  provider: 0,
  type: 'mail',
  userEmail: item.authorName,
  userId: item.authorName,
  timestampUtc: item.sentAt,
  subject: item.subject,
  body: item.body,
  conversationId: item.id,
  messageId: item.id,
  boxType: 0,
  senderEmail: item.authorName,
  ccEmails: null,
  toEmails: '—',
  source: '',
});

// The register's search box, status filter and pagination are applied on the client while
// `USE_MOCK_REQUEST_FOR_INFORMATION` stands in for the backend — without this the mock
// list comes back whole and the toolbar looks broken. Mirrors what the live endpoint does
// with `Term`, `status`, `Skip`/`Top`, so flipping the flag changes nothing on screen.
type RequestForInformationMockListParams = Omit<RequestForInformationListParams, 'statuses'> & {
  statuses?: readonly string[];
};

export const filterRequestForInformationList = (
  rows: RequestForInformation[],
  params?: RequestForInformationMockListParams
): RequestForInformation[] => {
  const term = params?.term?.trim().toLowerCase();
  // Compared case-insensitively as plain strings: the API params type carries `statuses`
  // as `string[]`, and the backend is not consistent about the casing of enum-like values.
  const statuses = params?.statuses?.map((status) => status.toLowerCase());

  return rows.filter((row) => {
    if (statuses?.length && !statuses.includes(row.status.toLowerCase())) return false;
    if (!term) return true;

    return [
      row.reference,
      row.title,
      row.description,
      row.raisedByName,
      row.raisedByRole,
      row.raisedToName,
    ].some((field) => field?.toLowerCase().includes(term));
  });
};

// `includeAll` is the export path — it wants every matching row, not the current page.
export const paginateRequestForInformationList = (
  rows: RequestForInformation[],
  params?: RequestForInformationMockListParams
): RequestForInformation[] => {
  if (params?.includeAll && !params?.top) return rows;

  const skip = params?.skip ?? 0;
  return params?.top ? rows.slice(skip, skip + params.top) : rows.slice(skip);
};
