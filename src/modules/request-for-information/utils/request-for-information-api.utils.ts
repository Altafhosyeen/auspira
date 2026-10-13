import type {
  RequestForInformation,
  RequestForInformationListResponse,
  RequestForInformationStatus,
} from '../types/request-for-information.types';
import type {
  ApiNumber,
  RequestForInformationPageResultDto,
  RequestForInformationResponseDto,
} from '../types/request-for-information-api.types';

const toNumber = (value: ApiNumber | null | undefined): number =>
  typeof value === 'string' ? Number(value) : (value ?? 0);

// The backend's numeric/string status folds onto the two-state register vocabulary —
// anything not explicitly closed reads as open, since new status codes should fail open
// rather than silently vanish from the register.
const toStatus = (status: ApiNumber, statusName: string | null): RequestForInformationStatus => {
  const normalized = (statusName ?? String(status)).toLowerCase();
  return normalized.includes('close') || normalized.includes('resolv') ? 'CLOSED' : 'OPEN';
};

export const toRequestForInformation = (
  dto: RequestForInformationResponseDto
): RequestForInformation => ({
  id: dto.id,
  projectId: dto.projectId,
  projectName: dto.projectName ?? undefined,
  reference: dto.reference,
  title: dto.title,
  description: dto.description ?? undefined,
  status: toStatus(dto.status, dto.statusName),
  raisedByName: dto.raisedByName,
  raisedByRole: dto.raisedByRole ?? undefined,
  raisedToName: dto.raisedToName ?? undefined,
  dueDate: dto.dueDate,
  dateIssued: dto.dateIssued,
  createdAt: dto.createdOn,
  updatedAt: dto.updatedOn ?? dto.createdOn,
  pmiId: dto.pmiId ?? undefined,
});

export const toRequestForInformationListResponse = (
  dto: RequestForInformationPageResultDto
): RequestForInformationListResponse => ({
  count: toNumber(dto.meta?.totalCount),
  next: null,
  previous: null,
  items: (dto.items ?? []).map(toRequestForInformation),
});
