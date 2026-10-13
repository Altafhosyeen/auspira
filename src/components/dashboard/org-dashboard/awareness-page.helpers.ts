/**
 * Awareness table — types, design tokens and the `ProjectAlert` → `Signal` mapping.
 * Split out of AwarenessPage.tsx so the page file holds only the screen itself.
 * Every token below is read off the reference design; keep them here so the
 * row/badge/pill markup stays declarative.
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
  NotebookText,
  Receipt,
  Scale,
  TriangleAlert,
  Users,
  Wrench,
} from 'lucide-react';
import { ProjectAlertSource, ProjectAlertStatus, ProjectAlertType } from '@/constants';
import { getPrimaryAlertEmail, type ProjectAlert } from '@/hooks/modules/project-alerts';
import { toLocalDayjs } from '@/lib/utils';

export type SourceType = 'email' | 'document' | 'weather' | 'system';
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
export type BadgeTone = 'success' | 'info' | 'sky' | 'warning' | 'error' | 'neutral' | 'urgent';
export type StatusType = 'new' | 'linked' | 'closed';
export type FilterTab = 'all' | 'early-warning' | 'pmi' | 'compensation';

export interface RouteMeta {
  type: RouteType;
  label: string;
  tone: BadgeTone;
}

export interface Signal {
  id: string;
  /** Raw `ProjectAlertType` — drives which detail screen the row opens, via `getAlertDetailHref`. */
  alertType: number;
  source: { type: SourceType; name: string; sub: string };
  signal: string;
  refNumber: string;
  route: RouteMeta;
  status: StatusType;
  received: { day: string; time: string };
}

/* ─── Design tokens ─────────────────────────────────────────────────────────
   Every value below is read off the reference design; keep them here so the
   row/badge/pill markup stays declarative. */

/** Shared column track — the header row and every data row use this exact grid. */
export const COL = 'grid-cols-[40px_220px_minmax(140px,1fr)_160px_170px_100px_104px_48px]';

/** Horizontal padding shared by the header row and the row cards, so labels line up with their column. */
export const ROW_PAD = 'px-6';

export type SourceVisual = { tile: string; glyph: string; Icon: typeof Mail };

/** Sources the design gives their own glyph, keyed on the name `getAlertSource` produces. */
export const SOURCE_VISUAL_BY_NAME: Record<string, SourceVisual> = {
  'Side Diary': {
    tile: 'border-violet-100 bg-violet-50',
    glyph: 'text-violet-600',
    Icon: NotebookText,
  },
  'Meeting Minutes': {
    tile: 'border-violet-100 bg-violet-50',
    glyph: 'text-violet-600',
    Icon: FileText,
  },
};

/** Fallback per source kind. A given source always renders the same tile — the glyph identifies
 *  where the signal came from, so it cannot vary between rows of the same kind. */
export const SOURCE_VISUAL_BY_TYPE: Record<SourceType, SourceVisual> = {
  email: { tile: 'border-blue-100 bg-blue-50', glyph: 'text-blue-600', Icon: Mail },
  document: {
    tile: 'border-emerald-100 bg-emerald-50',
    glyph: 'text-emerald-600',
    Icon: FileSpreadsheet,
  },
  weather: { tile: 'border-sky-100 bg-sky-50', glyph: 'text-sky-600', Icon: CloudRain },
  system: { tile: 'border-amber-100 bg-amber-50', glyph: 'text-amber-600', Icon: TriangleAlert },
};

export const getSourceVisual = (source: Signal['source']): SourceVisual =>
  SOURCE_VISUAL_BY_NAME[source.name] ?? SOURCE_VISUAL_BY_TYPE[source.type];

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
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-600',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  urgent: 'border-rose-200 bg-rose-50 text-rose-600',
};

export const STATUS_CONFIG: Record<StatusType, { dot: string; textClass: string; label: string }> =
  {
    new: { dot: 'bg-blue-500', textClass: 'text-blue-600', label: 'New' },
    linked: { dot: 'bg-violet-500', textClass: 'text-violet-600', label: 'Linked' },
    closed: { dot: 'bg-slate-400', textClass: 'text-slate-500', label: 'Closed' },
  };

/* ─── Alert → Signal mapping (unchanged behaviour) ──────────────────────── */

/** Mirrors org-dashboard.utils.tsx's `getAlertSourceMeta` — keyed off the backend's
 * `ProjectAlertSource`, shaped for this page's `Signal['source']` instead of icon/label pairs. */
export const getAlertSource = (alert: ProjectAlert): Signal['source'] => {
  if (alert.alertType === ProjectAlertType.Meeting) {
    return { type: 'document', name: 'Meeting Minutes', sub: 'Note' };
  }
  switch (alert.source) {
    case ProjectAlertSource.DailySiteReport:
      return { type: 'document', name: 'Side Diary', sub: 'Note' };
    case ProjectAlertSource.Email: {
      if (alert.conversationId) {
        return { type: 'email', name: 'Outlook', sub: 'Email' };
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
      return { type: 'system', name: alert.clauseDescription || 'System', sub: 'System' };
  }
};

/** Badge presentation only — where a row navigates is decided by its `alertType`. */
export const ALERT_ROUTE_META: Record<number, RouteMeta> = {
  // Untyped alerts surface as Watchtower per the design.
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
export const DEFAULT_ROUTE_META: RouteMeta = {
  type: 'meeting',
  label: 'Awareness',
  tone: 'neutral',
};

export const ALERT_STATUS_MAP: Record<number, StatusType> = {
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
    refNumber: alert.earlyWarningReference || '—',
    route:
      routeMeta.type === 'early-warning' && alert.alertStatus === ProjectAlertStatus.Overdue
        ? { ...routeMeta, tone: 'urgent' as BadgeTone }
        : routeMeta,
    status: ALERT_STATUS_MAP[alert.alertStatus] ?? 'new',
    received: {
      day: created.isSame(dayjs(), 'day') ? 'Today' : created.format('DD MMM YYYY'),
      time: created.format('h:mm A'),
    },
  };
};
