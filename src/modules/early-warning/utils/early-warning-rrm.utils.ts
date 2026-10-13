import { parseBackendDate } from '@/lib/utils';
import type { AgreedActionDto, EarlyWarningMeetingDto } from '../types/early-warning-api.types';

// Shapes returned by GET /api/risk-reduction-meetings/{id}.
export interface RrmAgreedActionDto {
  id: string;
  riskReductionMeetingId: string;
  description: string;
  isCompleted: boolean;
  responsibleParty?: string | null;
  dueDate?: string | null;
}

// meetingDetails (RiskReductionMeetingResponseDto)
export interface RrmMeetingDetailsDto {
  id?: string;
  earlyWarningId?: string;
  earlyWarningReference?: string | null;
  projectAlertId?: string;
  projectEmailId?: string | null;
  meetingDate?: string | null;
  location?: string | null;
  participants?: string | null;
  summary?: string | null;
  clauseDescription?: string | null;
  outcomeSoFar?: string | null;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
}

export interface RrmDetailByIdDto {
  meetingDetails?: RrmMeetingDetailsDto;
  projectEmailInformation?: unknown;
  agreedActions?: RrmAgreedActionDto[];
}

/** Whole days from today until the meeting — for the stat card sub-label. */
const formatDate = (value?: string | null): string => {
  const date = parseBackendDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export interface RrmDetailAction {
  id: string;
  label: string;
  assignee: string;
  dueDate: string;
  rawDueDate?: string | null;
  checked: boolean;
}

export interface RrmDetail {
  meetingDate: string;
  rawMeetingDate?: string | null;
  format: string;
  participantsText: string;
  participantCount: number;
  clauseNumber: string;
  clauseTitle: string;
  clauseDescription: string;
  summary: string;
  outcomeSoFar?: string;
  agreedActions: RrmDetailAction[];
  completedCount: number;
  totalCount: number;
}

export const toRrmDetail = (data?: RrmDetailByIdDto | null): RrmDetail | undefined => {
  const details = data?.meetingDetails ?? {};
  const rawActions = data?.agreedActions ?? [];
  const actions: RrmDetailAction[] = rawActions.map((action, index) => ({
    id: action.id ?? String(index),
    label: action.description ?? '',
    assignee: action.responsibleParty ?? '',
    dueDate: formatDate(action.dueDate),
    rawDueDate: action.dueDate ?? null,
    checked: Boolean(action.isCompleted),
  }));
  const completedCount = actions.filter((action) => action.checked).length;

  return {
    meetingDate: formatDate(details.meetingDate),
    rawMeetingDate: details.meetingDate ?? null,
    format: details.location ?? '—',
    participantsText: details.participants ?? '—',
    participantCount: (details.participants ?? '').split(',').filter((part) => part.trim()).length,
    clauseNumber: details.clauseNumber ?? '15.1',
    clauseTitle: details.clauseTitle ?? 'Risk reduction meeting',
    clauseDescription: details.clauseDescription ?? '',
    summary: details.summary ?? '',
    outcomeSoFar: details.outcomeSoFar ?? undefined,
    agreedActions: actions,
    completedCount,
    totalCount: actions.length,
  };
};

export const toRrmDetailFromAlert = (alert?: any): RrmDetail | undefined => {
  if (!alert) return undefined;
  let parsed: any = {};
  try {
    parsed =
      typeof alert.riskReductionMeeting === 'string'
        ? JSON.parse(alert.riskReductionMeeting)
        : (alert.riskReductionMeeting ?? {});
  } catch {
    parsed = {};
  }
  const details = parsed ?? {};
  const rawActions = details.agreedActions ?? [];
  const actions: RrmDetailAction[] = (Array.isArray(rawActions) ? rawActions : []).map(
    (action: any, index: number) => ({
      id: String(action.id ?? index),
      label: action.action ?? action.description ?? '',
      assignee: action.owner ?? action.responsibleParty ?? '',
      dueDate: formatDate(action.dueDate),
      rawDueDate: action.dueDate ?? null,
      checked: Boolean(action.isCompleted),
    })
  );
  const completedCount = actions.filter((action) => action.checked).length;

  return {
    meetingDate: formatDate(details.meetingDate),
    rawMeetingDate: details.meetingDate ?? null,
    format: details.location ?? details.format ?? '—',
    participantsText: details.participants ?? '—',
    participantCount: (details.participants ?? '').split(',').filter((part: string) => part.trim())
      .length,
    clauseNumber: alert.clauseNumber ?? details.clauseNumber ?? '15.1',
    clauseTitle: alert.clauseTitle ?? details.clauseTitle ?? 'Risk reduction meeting',
    clauseDescription: alert.clauseDescription ?? details.clauseDescription ?? '',
    summary: details.summary ?? '',
    outcomeSoFar: details.outcomeSoFar ?? undefined,
    agreedActions: actions,
    completedCount,
    totalCount: actions.length,
  };
};

export const toRrmDetailFromMeetingDto = (
  meeting?: EarlyWarningMeetingDto | null,
  agreedActions?: AgreedActionDto[] | null
): RrmDetail | undefined => {
  if (!meeting) return undefined;

  const rawActions = agreedActions ?? [];
  const actions: RrmDetailAction[] = rawActions.map((action, index) => ({
    id: action.id ?? String(index),
    label: action.description ?? '',
    assignee: action.responsibleParty ?? action.userFullName ?? '—',
    dueDate: formatDate(action.dueDate),
    rawDueDate: action.dueDate ?? null,
    checked: Boolean(action.isCompleted),
  }));
  const completedCount = actions.filter((action) => action.checked).length;
  const participantsText = meeting.participants || '—';
  const participantCount =
    participantsText !== '—' ? participantsText.split(',').filter((part) => part.trim()).length : 0;

  return {
    meetingDate: formatDate(meeting.meetingDate),
    rawMeetingDate: meeting.meetingDate ?? null,
    format: meeting.location || '—',
    participantsText,
    participantCount,
    clauseNumber: meeting.clauseNumber || '15.1',
    clauseTitle: meeting.clauseTitle || 'Risk reduction meeting',
    clauseDescription: meeting.clauseDescription || '',
    summary: meeting.summary || '',
    outcomeSoFar: meeting.outcomeSoFar || undefined,
    agreedActions: actions,
    completedCount,
    totalCount: actions.length,
  };
};

/** % of action progress, for the "N OF M COMPLETE" bar. */
export const toProgressPercent = (detail: RrmDetail): number =>
  detail.totalCount > 0 ? Math.round((detail.completedCount / detail.totalCount) * 100) : 0;
