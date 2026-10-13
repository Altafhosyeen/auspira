import {
  DEFECT_NOTICE_STATUS_LABELS,
  DEFECT_NOTICE_STATUS_TONES,
} from '../constants/defect-notice.constants';
import type {
  DefectNotice,
  DefectNoticeListParams,
  DefectNoticePageResultDto,
  DefectNoticeResponseDto,
  DefectNoticeStatusValue,
  DefectNoticeTone,
} from '../types/defect-notice.types';

export const toDefectNoticeStatusValue = (status?: number | null): DefectNoticeStatusValue =>
  Number(status ?? 0);

export const toDefectNoticeStatusLabel = (status?: number | null): string =>
  DEFECT_NOTICE_STATUS_LABELS[toDefectNoticeStatusValue(status)] ?? String(status ?? 0);

export const toDefectNoticeStatusTone = (status?: number | null): DefectNoticeTone =>
  DEFECT_NOTICE_STATUS_TONES[toDefectNoticeStatusValue(status)] ?? 'neutral';

export const formatDefectNoticeDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** DTO → register row. Pure — the table and export both read this. */
export const toDefectNotice = (
  dto: DefectNoticeResponseDto,
  projectName?: string
): DefectNotice => ({
  id: dto.id,
  projectId: dto.projectId,
  projectName,
  reference: dto.reference,
  title: dto.title,
  raisedByName: dto.raisedBy ?? '',
  // The list DTO carries no role — the register row keeps the field but shows the
  // raised-by name alone until the detail endpoint supplies one.
  raisedByRole: '',
  dateIssued: formatDefectNoticeDate(dto.dateRaised),
  dueDate: formatDefectNoticeDate(dto.overdueDateTime),
  status: toDefectNoticeStatusValue(dto.status),
  statusLabel: toDefectNoticeStatusLabel(dto.status),
  to: dto.raisedBy ?? undefined,
  referenceClause: dto.clauseNumber
    ? dto.clauseTitle
      ? `Clause ${dto.clauseNumber} - ${dto.clauseTitle}`
      : `Clause ${dto.clauseNumber}`
    : undefined,
  description: dto.description ?? undefined,
  summary: dto.summary ?? undefined,
  projectEmailId: dto.projectEmailId ?? null,
  overdueDateTime: dto.overdueDateTime ?? null,
});

export const toDefectNoticeListResponse = (
  dto: DefectNoticePageResultDto,
  projectName?: string
): {
  count: number;
  items: DefectNotice[];
} => ({
  count: Number(dto.meta.totalCount ?? 0),
  items: (dto.items ?? []).map((item) => toDefectNotice(item, projectName)),
});

export const toDefectNoticeListParams = (
  params?: DefectNoticeListParams
): Record<string, string | number | boolean | undefined | null> => ({
  Skip: params?.skip,
  Top: params?.top,
  Term: params?.term?.trim(),
  IncludeAll: params?.includeAll,
});
