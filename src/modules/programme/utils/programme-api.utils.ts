import dayjs from 'dayjs';
import { toLocalDayjs } from '@/lib/utils';
import {
  isProgrammeAccepted,
  PROGRAMME_DETAIL_COPY,
  programmeAlertStatusLabel,
  programmeAlertStatusTone,
  programmeStatusLabel,
} from '../constants/programme.constants';
import type {
  ProgrammeAlertDetail,
  ProgrammeHealthResponseDto,
  ProgrammeHealthSummaryDto,
  ProgrammeListParams,
  ProgrammeReceivedRow,
  ProgrammeReceivedView,
  ProgrammeRegisterRow,
  ProgrammeSummaryPageResultDto,
} from '../types/programme.types';

// Formatted with dayjs rather than `toLocaleDateString`: the export parses these display
// strings back with dayjs under a strict `DD MMM YYYY`, and the two only agree when one
// library writes the string the other reads (en-GB via Intl renders September as "Sept",
// which the strict parse rejects).
const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';

const text = (value?: string | null): string => (value ?? '').trim();

// Register dates arrive either as ISO date-times (`raisedAt`) or as plain strings
// (`completionDate`, whose format the backend does not pin down), so anything the parser
// cannot read is shown exactly as it came rather than blanked — a date the user can read is
// better than an empty cell.
export const formatProgrammeRegisterDate = (value?: string | null): string => {
  if (!value) return '';

  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;

  return parsed.format(DISPLAY_DATE_FORMAT);
};

// Held raw, and left undefined when the API omits it — a row with no code shows a dash rather
// than a number nothing has assigned a meaning to. The DTO may hand an int back as a string.
const toCode = (value?: number | string | null): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const code = Number(value);
  return Number.isFinite(code) ? code : undefined;
};

/** DTO → register row. Pure — the table and the export both read this. */
export const toProgrammeRegisterRow = (dto: ProgrammeHealthSummaryDto): ProgrammeRegisterRow => ({
  id: dto.id,
  reference: dto.reference,
  completionDate: formatProgrammeRegisterDate(dto.completionDate),
  variance: dto.variance ?? '',
  healthCode: toCode(dto.health),
  raisedBy: dto.raisedBy ?? '',
  raisedAt: formatProgrammeRegisterDate(dto.raisedAt),
  statusCode: toCode(dto.status),
  fileUrl: dto.fileUrl ?? undefined,
});

export const toProgrammeRegisterListResponse = (
  dto: ProgrammeSummaryPageResultDto
): { count: number; items: ProgrammeRegisterRow[] } => ({
  count: Number(dto.meta?.totalCount ?? 0),
  items: (dto.items ?? []).map(toProgrammeRegisterRow),
});

// A stored programme record and the alert it was accepted from share no key but the source
// conversation/project-email id, so the join runs in either direction off these two fields —
// whichever way round the route id arrived.
export interface ProgrammeSourceLinked {
  conversationId?: string | null;
  projectEmailId?: string | null;
}

const sourceIdsOf = ({ conversationId, projectEmailId }: ProgrammeSourceLinked): string[] =>
  [conversationId, projectEmailId].filter((id): id is string => !!id);

/** The candidate sharing a source id with `source`; undefined when neither side has one. */
export const matchBySourceIds = <T extends ProgrammeSourceLinked>(
  candidates: T[] | null | undefined,
  source: ProgrammeSourceLinked
): T | undefined => {
  const sourceIds = sourceIdsOf(source);
  if (sourceIds.length === 0) return undefined;

  return candidates?.find((candidate) =>
    sourceIdsOf(candidate).some((id) => sourceIds.includes(id))
  );
};

// The register status for a stored record — GET /api/programme/{id} carries no status field, so
// the decision on a programme is only readable off its own summary row.
const findProgrammeStatus = (
  items: ProgrammeRegisterRow[] | null | undefined,
  recordId?: string
): number | undefined =>
  recordId ? items?.find((item) => item.id === recordId)?.statusCode : undefined;

// A register row carries a blob URL but no file name, so the name to save under is read off
// the URL's last segment — query string dropped, since the storage URL is SAS-signed. Falls
// back to the reference when the URL gives nothing usable.
export const programmeFileName = (reference?: string, fileUrl?: string): string => {
  const fallback = `${reference?.trim() || 'programme'}.pdf`;
  const segment = (fileUrl ?? '').split('?')[0].split('/').filter(Boolean).pop();
  if (!segment) return fallback;

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

// Trigger a browser save for a blob — the same helper the PMI, Defect Notice and Daily Site
// Report modules use for their own downloads.
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

/** The decision already recorded for a revision ("Accepted"), or undefined while it is open. */
export const recordedProgrammeDecision = (
  items: ProgrammeRegisterRow[] | null | undefined,
  recordId?: string
): string | undefined => {
  const status = findProgrammeStatus(items, recordId);
  return status === undefined
    ? undefined
    : isProgrammeAccepted(status)
      ? programmeStatusLabel(status)
      : undefined;
};

// "Received 11 Sep 2026, 07:14 AM" — the same day/time split the Awareness review screen shows.
// The value is pushed through `toLocalDayjs` so it reads in the viewer's zone, not UTC.
const formatReceived = (value?: string | null): string => {
  const created = toLocalDayjs(value);
  if (!created.isValid()) return '';
  return `Received ${created.format('DD MMM YYYY')}, ${created.format('hh:mm A')}`;
};

// The Programme Received card, fed by whichever of the two records actually arrived. From
// Awareness the alert carries the title, sender, subject and due date; from the register the
// stored record's own reference, revision and submission date stand in when its signal cannot be
// joined — the response has no title of its own, so without this the tab renders an empty card.
export const toProgrammeReceivedView = ({
  alert,
  email,
  record,
  revisionLabel,
}: {
  alert?: ProgrammeAlertDetail | null;
  email?: { emailSender?: string | null; emailSubject?: string | null } | null;
  record?: ProgrammeHealthResponseDto | null;
  revisionLabel?: string;
}): ProgrammeReceivedView => {
  const rows: ProgrammeReceivedRow[] = [];
  const sender = text(email?.emailSender);
  const subject = text(email?.emailSubject);
  // An alert built straight from the extractor has no email rows, so its own title stands in
  // as the raiser — the same fallback the Early Warning and CE prefill screens use.
  const raisedBy = sender || text(alert?.title);

  if (raisedBy) {
    rows.push({
      label: PROGRAMME_DETAIL_COPY.raisedBy,
      value: raisedBy,
      caption: subject ? `Via email — ${subject}` : undefined,
    });
  }

  // No signal to describe, so the record names itself. Both rows are dropped rather than shown
  // as a dash — the record DTO leaves `version` unset on a revision it has not stored one for.
  if (!alert) {
    const reference = text(record?.reference);
    if (reference) {
      rows.push({ label: PROGRAMME_DETAIL_COPY.programmeReference, value: reference });
    }
    if (record?.version !== null && record?.version !== undefined) {
      rows.push({ label: PROGRAMME_DETAIL_COPY.revision, value: `Rev ${record.version}` });
    }
  }

  if (alert?.overdueDateTime) {
    rows.push({
      label: PROGRAMME_DETAIL_COPY.dueDate,
      value: toLocalDayjs(alert.overdueDateTime).format(DISPLAY_DATE_FORMAT),
      caption: text(alert.description) || undefined,
    });
  }

  // Where the signal stands, off the alert's own status — a stored record has no signal left to
  // report, and an unnamed code gives no tag rather than an "Unknown" one.
  const statusLabel = alert ? programmeAlertStatusLabel(alert.alertStatus) : undefined;

  return {
    heading: text(alert?.title) || text(revisionLabel) || text(record?.reference),
    received: formatReceived(alert?.createdOn ?? record?.createdOn),
    status: statusLabel
      ? { label: statusLabel, tone: programmeAlertStatusTone(alert?.alertStatus) }
      : undefined,
    rows,
  };
};

export const toProgrammeListParams = (
  params?: ProgrammeListParams
): Record<string, string | number | boolean | undefined> => {
  // A blank term is dropped rather than sent: `buildUrl` only strips undefined and null, so a
  // whitespace-only search would reach the backend as an empty `Term=`.
  const term = params?.term?.trim();

  return {
    Skip: params?.skip,
    Top: params?.top,
    Term: term || undefined,
    IncludeAll: params?.includeAll,
  };
};
