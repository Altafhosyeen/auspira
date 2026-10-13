import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GanttChart,
  Megaphone,
  Receipt,
  Scale,
  TriangleAlert,
  Users,
  Wrench,
} from 'lucide-react';
import { ProjectAlertType } from '@/constants';
import type { ActivityItem, BadgeTone, StatCardData } from '@/types/dashboard/org-dashboard.types';

/** Solid triangle-warning glyph — no library match was close enough, so this is hand-drawn. */
const WarningTriangleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2.001-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.499-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
    />
  </svg>
);

/** Solid document glyph — no library match was close enough, so this is hand-drawn. */
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
    />
    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
  </svg>
);

export const STAT_CARDS: StatCardData[] = [
  {
    label: 'Urgent',
    value: '23',
    delta: '20%',
    deltaLabel: 'than last month',
    deltaTone: 'positive',
    icon: <WarningTriangleIcon className="h-5 w-5 text-red-500" />,
    iconBg: 'bg-red-50',
  },
  {
    label: 'Critical',
    value: '03',
    delta: '11%',
    deltaLabel: 'than last month',
    deltaTone: 'negative',
    icon: <WarningTriangleIcon className="h-5 w-5 text-amber-500" />,
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Open CEs',
    value: '14',
    delta: '10%',
    deltaLabel: 'than last month',
    deltaTone: 'positive',
    icon: <Megaphone className="h-5 w-5 text-emerald-500" fill="currentColor" strokeWidth={1.5} />,
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Programs',
    value: '4',
    delta: '10%',
    deltaLabel: 'than last month',
    deltaTone: 'positive',
    icon: <DocumentIcon className="h-5 w-5 text-blue-500" />,
    iconBg: 'bg-blue-50',
  },
];

/** Suggested-route badge per alert type — same visual language as SignalsInbox's route badges.
 * `label` is the short code shown in the Awareness row badge (matches Watchtower's `EW`/`TK`
 * badges); `fullLabel` is the spelled-out name used for the badge tooltip. */
export const ALERT_TYPE_META: Record<
  number,
  { label: string; fullLabel: string; tone: BadgeTone; Icon: typeof TriangleAlert }
> = {
  [ProjectAlertType.EarlyWarning]: {
    label: 'EW',
    fullLabel: 'Early Warning',
    tone: 'success',
    Icon: TriangleAlert,
  },
  [ProjectAlertType.PMI]: { label: 'PMI', fullLabel: 'PMI', tone: 'info', Icon: FileText },
  [ProjectAlertType.CompensationEvent]: {
    label: 'CE',
    fullLabel: 'Compensation Event',
    tone: 'warning',
    Icon: Scale,
  },
  [ProjectAlertType.Meeting]: {
    label: 'MTG',
    fullLabel: 'Meeting',
    tone: 'neutral',
    Icon: Users,
  },
  [ProjectAlertType.Quotation]: {
    label: 'QTN',
    fullLabel: 'Quotation',
    tone: 'info',
    Icon: Receipt,
  },
  [ProjectAlertType.DefectNotice]: {
    label: 'DN',
    fullLabel: 'Defect Notice',
    tone: 'error',
    Icon: Wrench,
  },
  [ProjectAlertType.DailySiteReport]: {
    label: 'DSR',
    fullLabel: 'Daily Site Report',
    tone: 'info',
    Icon: CalendarDays,
  },
  [ProjectAlertType.Programee]: {
    label: 'PRG',
    fullLabel: 'Programme',
    tone: 'neutral',
    Icon: GanttChart,
  },
};

export const DEFAULT_TYPE_META = {
  label: 'Signal',
  fullLabel: 'Signal',
  tone: 'neutral' as BadgeTone,
  Icon: TriangleAlert,
};

/**
 * Header type for the dashboard's side-by-side panels (Awareness, Watchtower & Action Queue).
 * Shared rather than repeated per panel so the two titles keep the same size, weight, colour and
 * baseline — they sit next to each other, so any drift between them is immediately visible.
 * `!my-0` is required: antd's reset puts a margin on bare `<p>` that Tailwind loses to on specificity.
 */
/**
 * Secondary text sits at slate-500, not slate-400. On white, slate-400 (#94a3b8) lands around
 * 2.8:1 contrast — under the 4.5:1 WCAG AA floor for text this size, which is why the panel
 * descriptions and row source lines read as washed out. slate-500 (#64748b) clears it at ~4.8:1
 * while staying clearly subordinate to the title.
 */
export const PANEL_TITLE_CLASS = '!my-0 text-base font-bold text-slate-900';
export const PANEL_SUBTITLE_CLASS = '!my-0 text-xs text-slate-500';
/** The provenance line under each row title — "Meeting Minutes", "Outlook", "EWN-024 · Kamran". */
export const PANEL_ROW_SUBTEXT_CLASS = '!my-0 !mt-0.5 text-xs text-slate-500';

/**
 * Fixed column widths for the panel rows. Badge labels ("EW", "MTG") and tags ("Overdue",
 * "19 Aug 2026") differ in length, so without a set width each row's pill lands at a different x
 * and the column edge zig-zags down the list. Sized for the longest realistic content.
 */
export const PANEL_BADGE_COL = 'w-[72px]';
export const PANEL_DATE_COL = 'w-[76px]';
export const PANEL_TAG_COL = 'w-[132px]';

export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  success: 'badge-success border border-badge-success/20',
  info: 'badge-info border border-badge-info/20',
  warning: 'badge-warning border border-badge-warning/20',
  error: 'badge-error border border-badge-error/20',
  neutral: 'badge-neutral border border-badge-neutral/20',
};

export const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: '1',
    icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    title: 'PMI communication reviewed',
    meta: 'J. Okafor · 10:42 AM',
  },
  {
    id: '2',
    icon: <TriangleAlert className="h-4.5 w-4.5 text-orange-500" />,
    iconBg: 'bg-orange-50',
    title: 'CE quotation submitted',
    meta: 'A. Menash · 09:15 AM',
  },
  {
    id: '3',
    icon: <Clock className="h-4.5 w-4.5 text-blue-500" />,
    iconBg: 'bg-blue-50',
    title: 'Early warning triggered',
    meta: 'System · 08:47 AM',
  },
  {
    id: '4',
    icon: <Users className="h-4.5 w-4.5 text-violet-600" />,
    iconBg: 'bg-violet-50',
    title: 'Early Warning Meeting updated',
    meta: 'D. Hartley · Yesterday',
  },
];
