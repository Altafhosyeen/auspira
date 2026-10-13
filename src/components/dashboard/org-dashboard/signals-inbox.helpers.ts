'use client';

/**
 * SignalsInbox — types, design tokens and the `ProjectAlert` → `Signal` mapping.
 * Split out of SignalsInbox.tsx so the component file holds only the screen itself,
 * mirroring awareness-page.helpers.ts next door.
 */

import dayjs from 'dayjs';
import {
  CalendarDays,
  CloudRain,
  Eye,
  FileSpreadsheet,
  FileText,
  GanttChart,
  Mail,
  NotebookPen,
  Receipt,
  Scale,
  TriangleAlert,
  Users,
  Wrench,
} from 'lucide-react';
import { ProjectAlertSource, ProjectAlertStatus, ProjectAlertType } from '@/constants';
import { getPrimaryAlertEmail, type ProjectAlert } from '@/hooks/modules/project-alerts';
import { toLocalDayjs } from '@/lib/utils';

export type SourceType = 'outlook' | 'email' | 'excel' | 'diary' | 'document' | 'weather';
export type RouteType =
  | 'early-warning'
  | 'pmi'
  | 'compensation'
  | 'quotation'
  | 'meeting'
  | 'defect-notice'
  | 'daily-site-report'
  | 'programme'
  | 'watchtower';
export type BadgeTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type StatusType = 'new' | 'linked' | 'closed';
export type FilterTab = 'all' | 'early-warning' | 'pmi' | 'compensation';

export interface Signal {
  id: string;
  /** Raw `ProjectAlertType` — drives which detail screen the row opens, via `getAlertDetailHref`. */
  alertType: number;
  source: { type: SourceType; name: string; sub: string };
  signal: string;
  route: { type: RouteType; label: string; tone: BadgeTone };
  status: StatusType;
  received: { day: string; time: string };
}

export const SOURCE_ICON: Record<SourceType, { bg: string; iconClass: string; Icon: typeof Mail }> =
  {
    outlook: { bg: 'bg-blue-50', iconClass: 'text-[#0078D4]', Icon: Mail },
    email: { bg: 'bg-blue-50', iconClass: 'text-blue-500', Icon: Mail },
    excel: { bg: 'bg-emerald-50', iconClass: 'text-emerald-600', Icon: FileSpreadsheet },
    diary: { bg: 'bg-violet-50', iconClass: 'text-violet-600', Icon: NotebookPen },
    document: { bg: 'bg-violet-50', iconClass: 'text-violet-600', Icon: FileText },
    weather: { bg: 'bg-sky-50', iconClass: 'text-sky-600', Icon: CloudRain },
  };

export const ROUTE_ICON: Record<RouteType, typeof TriangleAlert> = {
  'early-warning': TriangleAlert,
  pmi: FileText,
  compensation: Scale,
  quotation: Receipt,
  meeting: Users,
  'defect-notice': Wrench,
  'daily-site-report': CalendarDays,
  programme: GanttChart,
  watchtower: Eye,
};

export const BADGE_CLASS: Record<BadgeTone, string> = {
  success: 'badge-success border border-badge-success/20',
  info: 'badge-info border border-badge-info/20',
  warning: 'badge-warning border border-badge-warning/20',
  error: 'badge-error border border-badge-error/20',
  neutral: 'badge-neutral border border-badge-neutral/20',
};

export const STATUS_CONFIG: Record<StatusType, { dot: string; textClass: string; label: string }> =
  {
    new: { dot: 'bg-blue-500', textClass: 'text-blue-600', label: 'New' },
    linked: { dot: 'bg-violet-500', textClass: 'text-violet-600', label: 'Linked' },
    closed: { dot: 'bg-slate-400', textClass: 'text-slate-500', label: 'Closed' },
  };

/** Mirrors the awareness module's `getAlertSource` — keyed off the backend's
 * `ProjectAlertSource`, shaped for this page's `Signal['source']`. */
const getAlertSource = (alert: ProjectAlert): Signal['source'] => {
  if (alert.alertType === ProjectAlertType.Meeting) {
    return { type: 'document', name: 'Meeting Minutes', sub: 'Note' };
  }
  switch (alert.source) {
    case ProjectAlertSource.DailySiteReport:
      return { type: 'document', name: 'Side Diary', sub: 'Note' };
    case ProjectAlertSource.Email: {
      if (alert.conversationId) {
        return { type: 'outlook', name: 'Outlook', sub: 'Email' };
      }
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
      return { type: 'document', name: alert.clauseDescription || 'System', sub: 'System' };
  }
};

const ALERT_ROUTE_META: Record<number, { type: RouteType; label: string; tone: BadgeTone }> = {
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
  [ProjectAlertType.Quotation]: {
    type: 'quotation',
    label: 'Quotation',
    tone: 'info',
  },
  [ProjectAlertType.DefectNotice]: {
    type: 'defect-notice',
    label: 'Defect Notice',
    tone: 'error',
  },
  [ProjectAlertType.DailySiteReport]: {
    type: 'daily-site-report',
    label: 'Daily Site Report',
    tone: 'info',
  },
  [ProjectAlertType.Programee]: {
    type: 'programme',
    label: 'Programme',
    tone: 'neutral',
  },
};

const DEFAULT_ROUTE_META: { type: RouteType; label: string; tone: BadgeTone } = {
  type: 'watchtower',
  label: 'Watchtower',
  tone: 'info',
};

const ALERT_STATUS_MAP: Record<number, StatusType> = {
  [ProjectAlertStatus.UnReviewed]: 'new',
  [ProjectAlertStatus.Reviewed]: 'linked',
  [ProjectAlertStatus.Registered]: 'linked',
  [ProjectAlertStatus.InProgress]: 'linked',
  [ProjectAlertStatus.Closed]: 'closed',
  [ProjectAlertStatus.Dismissed]: 'closed',
  [ProjectAlertStatus.Overdue]: 'closed',
  [ProjectAlertStatus.Excepted]: 'closed',
};

export const mapAlertToSignal = (alert: ProjectAlert): Signal => {
  const created = toLocalDayjs(alert.createdOn);
  const routeMeta = ALERT_ROUTE_META[alert.alertType] ?? DEFAULT_ROUTE_META;
  return {
    id: alert.id,
    alertType: alert.alertType,
    source: getAlertSource(alert),
    signal: alert.title,
    route:
      alert.alertStatus === ProjectAlertStatus.Overdue
        ? { ...routeMeta, tone: 'error' }
        : routeMeta,
    status: ALERT_STATUS_MAP[alert.alertStatus] ?? 'new',
    received: {
      day: created.isSame(dayjs(), 'day') ? 'Today' : created.format('DD MMM YYYY'),
      time: created.format('h:mm A'),
    },
  };
};
