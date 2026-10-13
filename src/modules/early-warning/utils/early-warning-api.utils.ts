import { EarlyWarningStatus, EwLifecycleStatus } from '@/constants/enum.constant';
import { parseBackendDate } from '@/lib/utils';
import type {
  EarlyWarning,
  EarlyWarningImpact,
  EarlyWarningListResponse,
  EarlyWarningRegisterStatus,
  RegisterEarlyWarningContext,
  RegisterEarlyWarningFormValues,
} from '../types/early-warning.types';
import type {
  ApiEarlyWarningDetail,
  ApiEarlyWarningLifecycle,
  EarlyWarningPageResultDto,
  RegisterEarlyWarningRequest,
} from '../types/early-warning-api.types';

/** "2026-07-31T00:00:00Z" -> "31 Jul 2026". Returns null for null/unparseable input. */
export const formatEarlyWarningDate = (value?: string | null): string | null => {
  const date = parseBackendDate(value);
  if (!date) return null;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Register status comes straight from the record's top-level status field (0/1/2/3).
export const deriveStatus = (record: ApiEarlyWarningDetail): EarlyWarningRegisterStatus => {
  const statusNum = Number(record.status);
  if (statusNum === EarlyWarningStatus.Closed) return 'CLOSED';
  if (statusNum === EarlyWarningStatus.NotAccepted) return 'NOT_ACCEPTED';
  if (statusNum === EarlyWarningStatus.Discard) return 'DISCARD';
  return 'OPEN';
};

export const deriveDisplayStatus = (record: ApiEarlyWarningDetail): string => {
  const statusNum = Number(record.status);
  if (statusNum === EarlyWarningStatus.Closed) return 'CLOSED';
  if (statusNum === EarlyWarningStatus.NotAccepted) return 'NOT ACCEPTED';
  if (statusNum === EarlyWarningStatus.Discard) return 'DISCARD';
  return 'OPEN';
};

/** Earliest outstanding (non-completed) lifecycle due date on the record. */
export const nextDueLifecycle = (
  record: ApiEarlyWarningDetail
): ApiEarlyWarningLifecycle | undefined =>
  (record.earlyWarningLifecycles ?? [])
    .filter((entry) => entry.status !== EwLifecycleStatus.Completed && entry.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))[0];

export const isDueDateOverdue = (dueDate: string): boolean => {
  const due = parseBackendDate(dueDate);
  if (!due) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return due.getTime() < startOfToday.getTime();
};

const IMPACT_FLAG_KEYS: Record<EarlyWarningImpact, keyof ApiEarlyWarningDetail> = {
  DELAY: 'delayToCompletion',
  KEY_DATE: 'keyDateImpact',
  COST: 'costIncrease',
  PERFORMANCE: 'performanceImpairment',
};

/** DTO → register row. Pure — the table and detail screens both read this. */
export const toEarlyWarning = (dto: ApiEarlyWarningDetail): EarlyWarning => {
  const status = deriveStatus(dto);
  const dueEntry = nextDueLifecycle(dto);

  return {
    id: dto.id,
    reference: dto.reference,
    title: dto.title,
    description: dto.description ?? undefined,
    source: dto.isRaisedManually ? 'Manual raise' : 'From email',
    raisedOn: formatEarlyWarningDate(dto.dateRaised) ?? '',
    raisedBy: dto.raisedBy,
    raisedAt: dto.dateRaised,
    impacts: (Object.keys(IMPACT_FLAG_KEYS) as EarlyWarningImpact[]).filter((impact) =>
      Boolean(dto[IMPACT_FLAG_KEYS[impact]])
    ),
    status,
    statusCode: Number(dto.status),
    displayStatus: deriveDisplayStatus(dto),
    dueDate: dueEntry ? formatEarlyWarningDate(dueEntry.dueDate) : null,
    dueOverdue: dueEntry ? isDueDateOverdue(dueEntry.dueDate!) : false,
    closed: status === 'CLOSED',
    closedAt: dto.closingDate,
    closingReason: dto.closingReason,
    closedBy: dto.closedByName,
    potentialImpacts: dto.potentialImpacts ?? undefined,
  };
};

export const toEarlyWarningListResponse = (
  dto: EarlyWarningPageResultDto
): EarlyWarningListResponse => ({
  count: Number(dto.meta.totalCount ?? 0),
  next: null,
  previous: null,
  items: dto.items.map(toEarlyWarning),
});

const joinRecipients = (value?: string[]) => (Array.isArray(value) ? value.join(', ') : '');

// The register design collects Time Impact and Cost Impact as separate inputs, but the
// backend DTO has no such fields — they fold into PotentialImpacts as labeled lines,
// ahead of any pre-filled impacts text from the originating alert.
const buildPotentialImpacts = (
  values: RegisterEarlyWarningFormValues,
  context: RegisterEarlyWarningContext
) => {
  const lines: string[] = [];
  if (values.timeImpact?.trim()) lines.push(`Time impact: ${values.timeImpact.trim()}`);
  if (values.costImpact?.trim()) lines.push(`Cost impact: ${values.costImpact.trim()}`);
  if (context.prefillImpacts?.trim()) lines.push(context.prefillImpacts.trim());
  return lines.join('\n');
};

/** Form values + submit context → the PascalCase multipart payload the backend binds. */
export const toRegisterEarlyWarningRequest = (
  values: RegisterEarlyWarningFormValues,
  context: RegisterEarlyWarningContext
): RegisterEarlyWarningRequest => ({
  ProjectId: context.projectId,
  ProjectAlertId: context.projectAlertId,
  Reference: values.ewReference,
  RaisedBy: joinRecipients(values.raisedBy),
  Title: values.riskTitle,
  Description: values.riskDescription ?? '',
  DateRaised: values.dateRaised ? values.dateRaised.format('YYYY-MM-DD') : '',
  To: joinRecipients(values.to),
  CC: joinRecipients(values.cc),
  BCC: joinRecipients(values.bcc),
  Subject: values.riskTitle,
  PotentialImpacts: values.potentialImpact || buildPotentialImpacts(values, context),
  ProposedActions: values.proposedActions || context.prefillActions || '',
  KeyDatesAffected: values.keyDatesAffected ?? '',
  DelayToCompletion: values.impactTypes?.includes('delay') ?? false,
  KeyDateImpact: values.impactTypes?.includes('key-date') ?? false,
  CostIncrease: values.impactTypes?.includes('cost') ?? false,
  PerformanceImpairment: values.impactTypes?.includes('performance') ?? false,
  Attachments: context.attachments ?? [],
  ProjectName: values.projectName || context.projectName,
  ProjectReference: values.projectReference || context.projectReference,
  ClauseNumber: context.clauseNumber ?? '15.1',
  ClauseTitle: context.clauseTitle ?? 'Early Warning',
  ClauseDescription: context.clauseDescription ?? '',
});

// Multipart encoding of the register payload. `isMultipart` alone is not enough — the axios
// interceptor picks the content type off `data instanceof FormData`, so the body has to be
// real FormData. Scalars are stringified; files are appended as-is under `Attachments`.
export const toRegisterEarlyWarningFormData = (
  values: RegisterEarlyWarningFormValues,
  context: RegisterEarlyWarningContext
): FormData => {
  const payload = toRegisterEarlyWarningRequest(values, context);
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item instanceof Blob ? item : String(item));
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};
