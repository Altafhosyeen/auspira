import type {
  DailySiteReportPageResultDto,
  DailySiteReportResponseDto,
  ProjectDailyReport,
  ProjectDailyReportListParams,
} from '../types/project-daily-report.types';

const DISPLAY_DATE = { day: '2-digit', month: 'short', year: 'numeric' } as const;

/** ISO timestamp → the register's own display date ("20 Aug 2026"). */
export const formatProjectDailyReportDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', DISPLAY_DATE);
};

// The DTO serves progress as a nullable double that a backend may hand back as a string, so
// anything unreadable lands as 0 rather than as a NaN the percentage cell would print.
const toProgress = (value?: number | string | null): number => {
  const progress = Number(value ?? 0);
  return Number.isFinite(progress) ? progress : 0;
};

// Held raw, and left undefined when the API omits it — a row with no status shows a dash
// rather than a code nothing has assigned a meaning to.
const toStatusCode = (value?: number | string | null): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const code = Number(value);
  return Number.isFinite(code) ? code : undefined;
};

/** DTO → register row. Pure — the table and the export both read this. */
export const toProjectDailyReport = (dto: DailySiteReportResponseDto): ProjectDailyReport => ({
  id: dto.id,
  projectId: dto.projectId,
  reference: dto.reference,
  title: dto.title,
  // The DTO carries no role for the submitter — the register prints the name alone.
  submittedByName: dto.raisedBy ?? '',
  raisedAt: formatProjectDailyReportDate(dto.dateRaised),
  progress: toProgress(dto.progressPercentage),
  statusCode: toStatusCode(dto.status),
  description: dto.description ?? undefined,
});

export const toProjectDailyReportListResponse = (
  dto: DailySiteReportPageResultDto
): { count: number; items: ProjectDailyReport[] } => ({
  count: Number(dto.meta?.totalCount ?? 0),
  items: (dto.items ?? []).map(toProjectDailyReport),
});

/** The accept endpoint's multipart body — alert id plus optional evidence files. */
export const toAcceptDailySiteReportFormData = (input: {
  projectAlertId: string;
  attachments?: File[];
}): FormData => {
  const formData = new FormData();
  formData.append('ProjectAlertId', input.projectAlertId);
  input.attachments?.forEach((file) => {
    formData.append('Attachments', file);
  });
  return formData;
};

export const toProjectDailyReportListParams = (
  params?: ProjectDailyReportListParams
): Record<string, string | number | boolean | undefined> => {
  // A blank term is dropped rather than sent: `buildUrl` only strips undefined and null, so
  // a whitespace-only search would reach the backend as an empty `Term=`.
  const term = params?.term?.trim();

  return {
    Skip: params?.skip,
    Top: params?.top,
    Term: term || undefined,
    IncludeAll: params?.includeAll,
  };
};
