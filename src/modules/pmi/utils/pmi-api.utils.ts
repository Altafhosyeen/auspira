import { PMI_STATUS_LABELS, PMI_TYPE_LABELS } from '../constants/pmi.constants';
import type {
  PmiListParams,
  PmiPageResultDto,
  PmiStatusValue,
  PmiTypeValue,
  ProjectManagerInstruction,
  ProjectManagerInstructionResponseDto,
} from '../types/pmi.types';

export const toPmiStatusValue = (status?: number | null): PmiStatusValue => Number(status ?? 0);

export const toPmiStatusLabel = (status?: number | null): string =>
  PMI_STATUS_LABELS[Number(status ?? 0)] ?? String(status ?? 0);

export const toPmiTypeValue = (type?: number | null): PmiTypeValue => Number(type ?? 0);

export const toPmiTypeLabel = (type?: number | null): string =>
  PMI_TYPE_LABELS[Number(type ?? 0)] ?? 'Other';

export const formatPmiDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toReferenceClause = (dto: ProjectManagerInstructionResponseDto): string =>
  dto.clauseNumber || dto.otherClauseReference || '—';

/** DTO → register row. Pure — the table and export both read this. */
export const toProjectManagerInstruction = (
  dto: ProjectManagerInstructionResponseDto
): ProjectManagerInstruction => ({
  id: dto.id,
  reference: dto.reference,
  title: dto.title,
  details: dto.details ?? '',
  dateIssued: formatPmiDate(dto.dateIssued),
  responseRequiredBy: dto.responseRequiredBy ?? null,
  clauseNumber: dto.clauseNumber ?? '',
  referenceClause: toReferenceClause(dto),
  status: toPmiStatusValue(dto.status),
  statusLabel: toPmiStatusLabel(dto.status),
  type: toPmiTypeValue(dto.type),
  typeLabel: toPmiTypeLabel(dto.type),
  createdBy: dto.createdByName ?? undefined,
  createdOn: dto.createdOn ?? null,
  updatedOn: dto.updatedOn ?? null,
  quotationId: dto.quotationId ?? null,
  compensationEventId: dto.compensationEventId ?? null,
  compensationEventReference: dto.compensationEventReference ?? null,
  compensationEventStatus: dto.compensationEventStatus ?? null,
  projectCrossReferenceId: dto.projectCrossReferenceId ?? null,
});

export const toPmiListResponse = (
  dto: PmiPageResultDto
): {
  count: number;
  items: ProjectManagerInstruction[];
} => ({
  count: Number(dto.meta.totalCount ?? 0),
  items: (dto.items ?? []).map(toProjectManagerInstruction),
});

export const toPmiListParams = (
  params?: PmiListParams
): Record<string, string | number | boolean | undefined | null> => ({
  skip: params?.skip,
  top: params?.top,
  term: params?.term?.trim(),
  includeAll: params?.includeAll,
  status: params?.status,
});
