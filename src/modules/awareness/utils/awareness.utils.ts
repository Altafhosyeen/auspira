import dayjs from 'dayjs';
import { ProjectAlertSource, ProjectAlertStatus, ProjectAlertType } from '@/constants';
import { getPrimaryAlertEmail, type ProjectAlert } from '@/hooks/modules/project-alerts';
import { toLocalDayjs } from '@/lib/utils';
import type { ContactPerson } from '@/types/project/selection.types';
import { AWARENESS_CE_ALLOWED_UPLOAD_EXTENSIONS } from '../constants/awareness.constants';
import type {
  BadgeTone,
  RouteMeta,
  Signal,
  SignalSource,
  SourceType,
  StatusType,
} from '../types/awareness.types';

/** Where the signal came from — keyed on `ProjectAlertSource` (see old awareness helpers). */
export const getAlertSource = (alert: ProjectAlert): SignalSource => {
  if (alert.alertType === ProjectAlertType.Meeting) {
    return { type: 'document', name: 'Meeting Minutes', sub: 'Note' };
  }
  switch (alert.source) {
    case ProjectAlertSource.DailySiteReport:
      return { type: 'document', name: 'Side Diary', sub: 'Note' };
    case ProjectAlertSource.Email: {
      if (alert.conversationId) return { type: 'email', name: 'Outlook', sub: 'Email' };
      const primaryEmail = getPrimaryAlertEmail(alert);
      return {
        type: 'email',
        name: primaryEmail?.emailSender || primaryEmail?.emailSubject || 'Email',
        sub: 'Email',
      };
    }
    case ProjectAlertSource.Weather:
      return { type: 'weather', name: 'Weather', sub: 'System' };
    case ProjectAlertSource.PMI:
      return { type: 'document', name: 'PMI', sub: 'Note' };
    default:
      return { type: 'system', name: alert.clauseDescription || 'System', sub: 'System' };
  }
};

export const ROUTE_META: Record<number, RouteMeta> = {
  [ProjectAlertType.Unknown]: { type: 'watchtower', label: 'Watchtower', tone: 'sky' },
  [ProjectAlertType.EarlyWarning]: {
    type: 'early-warning',
    label: 'Early Warning',
    tone: 'success',
  },
  [ProjectAlertType.PMI]: { type: 'pmi', label: 'PMI', tone: 'info' },
  [ProjectAlertType.CompensationEvent]: {
    type: 'compensation',
    label: 'Compensation Event',
    tone: 'warning',
  },
  [ProjectAlertType.Meeting]: { type: 'meeting', label: 'Meeting', tone: 'neutral' },
  [ProjectAlertType.Quotation]: { type: 'quotation', label: 'Quotation', tone: 'info' },
  [ProjectAlertType.DefectNotice]: {
    type: 'defect-notice',
    label: 'Defect Notice',
    tone: 'error',
  },
  // Named, or a Daily Site Report signal falls back to the default meta and reads as a plain
  // "Signal" / "Awareness" — the same gap Defect Notice had before this entry was added.
  [ProjectAlertType.DailySiteReport]: {
    type: 'daily-site-report',
    label: 'Daily Site Report',
    tone: 'info',
  },
  [ProjectAlertType.Programee]: { type: 'programme', label: 'Programme', tone: 'neutral' },
};

export const DEFAULT_ROUTE_META: RouteMeta = {
  type: 'meeting',
  label: 'Awareness',
  tone: 'neutral',
};

export const STATUS_MAP: Record<number, StatusType> = {
  [ProjectAlertStatus.UnReviewed]: 'new',
  [ProjectAlertStatus.Reviewed]: 'linked',
  [ProjectAlertStatus.Registered]: 'linked',
  [ProjectAlertStatus.InProgress]: 'linked',
  [ProjectAlertStatus.Closed]: 'closed',
  [ProjectAlertStatus.Dismissed]: 'closed',
  [ProjectAlertStatus.Overdue]: 'closed',
  [ProjectAlertStatus.Excepted]: 'closed',
};

export const getAlertRefNumber = (alert: ProjectAlert): string => {
  if (alert.alertType === ProjectAlertType.Meeting) {
    return alert.earlyWarningReference ? alert.earlyWarningReference.split('(')[0].trim() : '—';
  }
  if (alert.alertType === ProjectAlertType.Quotation) {
    const ref = alert.compensationEventReference || alert.earlyWarningReference;
    return ref ? ref.split('(')[0].trim() : '—';
  }
  if (alert.alertType === ProjectAlertType.DefectNotice) {
    const ref = alert.earlyWarningReference;
    return ref ? ref.split('(')[0].trim() : '—';
  }
  return '—';
};

export const mapAlertToSignal = (alert: ProjectAlert): Signal => {
  const created = toLocalDayjs(alert.createdOn);
  const routeMeta = ROUTE_META[alert.alertType] ?? DEFAULT_ROUTE_META;
  const rawDue =
    alert.overdueDateTime ??
    alert.compensationDueDate ??
    alert.compensationOverDueAt ??
    alert.overdueAt ??
    null;
  const due = rawDue ? toLocalDayjs(rawDue) : null;
  const dueDate = due?.isValid()
    ? {
        day: due.isSame(dayjs(), 'day') ? 'Today' : due.format('DD MMM YYYY'),
        time: due.format('h:mm A'),
      }
    : null;

  return {
    id: alert.id,
    alertType: alert.alertType,
    source: getAlertSource(alert),
    signal: alert.title,
    refNumber: getAlertRefNumber(alert),
    route:
      routeMeta.type === 'early-warning' && alert.alertStatus === ProjectAlertStatus.Overdue
        ? { ...routeMeta, tone: 'urgent' as BadgeTone }
        : routeMeta,
    status: STATUS_MAP[alert.alertStatus] ?? 'new',
    dueDate,
    createdOn: alert.createdOn,
    received: {
      day: created.isSame(dayjs(), 'day') ? 'Today' : created.format('DD MMM YYYY'),
      time: created.format('h:mm A'),
    },
  };
};

export const SOURCE_ICON_BY_TYPE: Record<SourceType, string> = {
  email: 'mail',
  document: 'file',
  weather: 'cloud',
  system: 'alert',
};

export const TONE_HEX: Record<BadgeTone, { color: string; background: string }> = {
  success: { color: '#1E7B34', background: '#E8F6EC' },
  info: { color: '#1D4F91', background: '#E8F0FB' },
  sky: { color: '#0369A1', background: '#E0F2FE' },
  warning: { color: '#B45309', background: '#FFF4E5' },
  error: { color: '#C0392B', background: '#FDECEA' },
  neutral: { color: '#667085', background: '#F1F3F7' },
  urgent: { color: '#BE123C', background: '#FCE8EF' },
};

/** Strip HTML tags / entities → one-line preview (mirrors the thread-list util). */
export const toPlainText = (html?: string | null): string =>
  (html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Readable email body — strips tags but keeps paragraph breaks (no single-line collapse). */
export const toEmailText = (html?: string | null): string =>
  (html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|br|li|h\d)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** "an Early Warning" vs "a Compensation Event" — the tier labels read as prose. */
const article = (subject: string): string => `${/^[aeiou]/i.test(subject) ? 'n' : ''} ${subject}`;

// Confidence band for the score card. `subject` names what was detected — pass the alert
// type's own label so a Compensation Event is never described as an Early Warning.
export const confidenceTier = (
  percent: number,
  subject = 'Early Warning'
): { label: string; color: string } => {
  if (percent >= 80) return { label: `High · very likely a${article(subject)}`, color: '#C0392B' };
  if (percent >= 50) return { label: `Medium · possibly a${article(subject)}`, color: '#B45309' };
  return { label: `Low · unlikely a${article(subject)}`, color: '#667085' };
};

/** Whole days from today until the deadline — null when undated. */
export const daysUntil = (deadline?: string | null): number | null => {
  if (!deadline) return null;
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
};

/** Lowercased extension without the dot, e.g. "report.PDF" → "pdf". */
export const fileExtension = (fileName?: string | null) =>
  (fileName ?? '').split('.').pop()?.toLowerCase() ?? '';

// Whether an upload is one of the three document types the assessment accepts. The file
// picker's `accept` filter is only a hint — drag-and-drop and "All files" bypass it — so
// this is the gate that actually decides.
export const isAllowedUpload = (fileName?: string | null) =>
  (AWARENESS_CE_ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(fileExtension(fileName));

export interface FormattedEmailParty {
  name: string;
  email: string;
  role?: string;
  displayText: string;
}

// Formats a raw email or "Name <email>" string into a structured party with
// display name, email, and optional role badge.
export const formatEmailParty = (
  raw?: string | null,
  contacts?: ContactPerson[],
  defaultRole?: string
): FormattedEmailParty => {
  if (!raw) {
    return { name: '', email: '', displayText: '—' };
  }

  const trimmed = raw.trim();
  const angleMatch = trimmed.match(/^(.*?)\s*<([^>]+)>\s*$/);

  let name = '';
  let email = '';

  if (angleMatch) {
    name = (angleMatch[1] || '').trim().replace(/^["']|["']$/g, '');
    email = (angleMatch[2] || '').trim();
  } else if (trimmed.includes('@')) {
    email = trimmed;
  } else {
    name = trimmed;
  }

  // Look up in contacts
  let role = defaultRole;
  if (email && contacts && contacts.length > 0) {
    const matchedContact = contacts.find(
      (c) => c.email && c.email.toLowerCase() === email.toLowerCase()
    );
    if (matchedContact) {
      if (!name || name.toLowerCase() === email.toLowerCase()) {
        name = matchedContact.name || '';
      }
      if (matchedContact.role) {
        role = matchedContact.role;
      }
    }
  }

  // If still no name, derive a clean name from email prefix
  if (!name && email) {
    const prefix = email.split('@')[0] || '';
    const spaced = prefix.replace(/[._-]+/g, ' ');
    name = spaced.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // If role is PM or Project Manager and not defaultRole, format name with role like Sarah Collins (PM)
  let nameWithRole = name;
  if (role && !defaultRole && name && !name.includes('(')) {
    const shortRole =
      role.toLowerCase().includes('project manager') || role.toLowerCase() === 'pm' ? 'PM' : role;
    nameWithRole = `${name} (${shortRole})`;
  }

  let displayText = '';
  if (nameWithRole && email && nameWithRole.toLowerCase() !== email.toLowerCase()) {
    displayText = `${nameWithRole} <${email}>`;
  } else {
    displayText = email || nameWithRole || trimmed;
  }

  return { name: nameWithRole, email, role, displayText };
};
