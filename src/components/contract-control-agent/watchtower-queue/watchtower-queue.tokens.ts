/**
 * Watchtower & Action Queue — design tokens.
 *
 * Presentation layer only: every value below is read off the reference design so the
 * row/badge/pill markup stays declarative. Split out of `watchtower-queue.config.ts`, which
 * re-exports it — import from there rather than reaching in here.
 */

import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Eye,
  FileText,
  Users,
} from 'lucide-react';
import type { ClockTone, EventCard, RowVariant, TypeVisual } from './watchtower-queue.types';

/* ─── Layout tokens ─────────────────────────────────────────────────────── */

/**
 * Shared column track — the header band, the governing rows and the sub-event rows all use
 * this exact grid so the columns line up down the whole table.
 *
 * The trailing fixed track carries the row's open-chevron. It used to live inside the Clock
 * column, which meant the CLOCK header label spanned the clock data *plus* the button and a gap:
 * the label sat over a track a third wider than the content it names. Giving the chevron its own
 * gutter makes each labelled column contain exactly what its label says — the same shape the
 * Awareness table uses for its own trailing chevron. Clock keeps its previous content width
 * (1.95fr minus the button and gap ≈ 1.7fr of the remaining space).
 *
 * Deliberately unconditional: the table always holds its designed shape and the narrow-viewport
 * story is horizontal scroll (see `WATCHTOWER_MIN_WIDTH`), never a stacked fallback — a
 * breakpoint here collapses the layout on any laptop running display scaling.
 */
/**
 * Column order matches the reference design: Event → Assigned → Due Date → Required Action.
 *
 *   Event    2.1  — the widest content (tile + category + title + code + toggle).
 *   Assigned 1.1  — the "Add Assignee" pill / assignee chip (~215px).
 *   Due Date 1.15 — the due-date badge + priority dot (~185px).
 *   Required 1.55 — action label + progress bar + trailing overflow menu.
 */
export const WATCHTOWER_COLS =
  'grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_minmax(0,1.15fr)_minmax(0,1.55fr)_36px]';

/**
 * `items-start`, not `items-center`: the four cells hold different amounts of content (Assigned is
 * one avatar, Clock stacks a badge, a bar and two lines), so centring each one independently left
 * every column's first line at a different height — the Clock badge floated a full 26px above the
 * Event title on the same row. Topping them out is what makes a row read straight across.
 */
export const WATCHTOWER_ROW_GRID = `grid items-start ${WATCHTOWER_COLS}`;

/**
 * Horizontal padding shared by the column-header band, the governing rows and the sub-event rows.
 *
 * All three must sit on this one track or the four columns stop lining up down the table. The
 * sub-events previously carried a nested indent (`pl-6.5` + `pl-12` on their container, plus their
 * own `p-3.5`) which pushed their grid origin 66px right of the header's *and* narrowed the track,
 * so every fractional column landed somewhere different from the header it belonged under.
 * Hierarchy is carried by the left rail, the timeline dot and `ROW_METRICS.sub`'s smaller type —
 * never by moving a row off the column track.
 */
export const ROW_PAD_X = 'pl-6 pr-5';

/** Narrowest width the four columns stay legible at; the table scrolls horizontally below it. */
export const WATCHTOWER_MIN_WIDTH = 'min-w-[900px]';

/**
 * Surface tokens are shared with the other list pages (see constants/list-page.constants.ts)
 * and re-exported here so this module stays the single import for everything the queue renders.
 */
export {
  CARD_SHADOW,
  FOCUS_RING,
  ROW_OPEN_BUTTON,
  ROW_OPEN_ICON,
  TABLE_CARD,
  TABLE_HEADER_LABEL,
} from '@/constants/list-page.constants';

/** Reference design's column-header band is a light blue tint, not the grey every other list
 *  page's `TABLE_HEADER_BG` uses — kept local to Watchtower rather than changed globally. */
export const WATCHTOWER_TABLE_HEADER_BG = 'bg-sky-50';

export const CLOCK_BADGE_CLASS: Record<ClockTone, string> = {
  critical: 'border-rose-100 bg-rose-50 text-rose-600',
  warning: 'border-amber-100 bg-amber-50 text-amber-600',
  normal: 'border-slate-200 bg-slate-100 text-slate-600',
};

/** Text colour of the day-count line under the clock bar ("Due today" / "Due in 28 days") —
 *  tinted to the same urgency as the badge and bar above it so the countdown reads as one unit,
 *  and kept bold so it stands out from the muted "Next: …" line beneath. */
export const CLOCK_DUE_TEXT_CLASS: Record<ClockTone, string> = {
  critical: 'text-rose-600',
  warning: 'text-amber-600',
  normal: 'text-slate-600',
};

/**
 * Fill of the required-action bar and the sub-event timeline dot — both keyed off the row's own
 * due date via `getDueUrgencyTone`, so a matter due imminently reads red wherever it appears on
 * the row, not just in the Clock column. Red under 3 days left (including overdue), orange
 * between 3 and 5 days, green beyond that.
 */
export const DUE_URGENCY_CLASS: Record<ClockTone, string> = {
  critical: 'bg-rose-500',
  warning: 'bg-orange-500',
  normal: 'bg-emerald-500',
};

export const PRIORITY_DOT_CLASS: Record<EventCard['clock']['priority'], string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-400',
  Low: 'bg-emerald-500',
};

/** Friendly category names for a task's reference-prefix code, used by the category filter. */
export const CATEGORY_LABELS: Record<string, string> = {
  EW: 'Early Warning',
  CE: 'Compensation Event',
  RRM: 'Early Warning Meeting',
  PMI: 'PMI',
  CLS: 'Close',
  TK: 'Task',
};

const TYPE_VISUALS: Record<string, TypeVisual> = {
  EW: {
    Icon: AlertTriangle,
    tile: 'border-sky-100 bg-sky-50',
    glyph: 'text-main-p',
    label: 'text-main-p',
    chip: 'bg-main-p',
  },
  CE: {
    Icon: CircleDollarSign,
    tile: 'border-orange-100 bg-orange-50',
    glyph: 'text-orange-600',
    label: 'text-orange-600',
    chip: 'bg-orange-600',
  },
  RRM: {
    Icon: Users,
    tile: 'border-violet-100 bg-violet-50',
    glyph: 'text-violet-600',
    label: 'text-violet-600',
    chip: 'bg-violet-600',
  },
  PMI: {
    Icon: FileText,
    tile: 'border-blue-100 bg-blue-50',
    glyph: 'text-blue-600',
    label: 'text-blue-600',
    chip: 'bg-blue-600',
  },
  // Early Warning lifecycle stages (see `EwLifecycleStage`) — sub-event rows under a governing
  // matter all share that matter's groupType, so they'd otherwise all render identically; keying
  // off the stage instead gives each row in the timeline its own icon/colour.
  DET: {
    Icon: Eye,
    tile: 'border-sky-100 bg-sky-50',
    glyph: 'text-main-p',
    label: 'text-main-p',
    chip: 'bg-main-p',
  },
  REG: {
    Icon: ClipboardList,
    tile: 'border-blue-100 bg-blue-50',
    glyph: 'text-blue-600',
    label: 'text-blue-600',
    chip: 'bg-blue-600',
  },
  CLS: {
    Icon: CheckCircle2,
    tile: 'border-emerald-100 bg-emerald-50',
    glyph: 'text-emerald-600',
    label: 'text-emerald-600',
    chip: 'bg-emerald-600',
  },
};

const DEFAULT_TYPE_VISUAL: TypeVisual = {
  Icon: FileText,
  tile: 'border-slate-200 bg-slate-50',
  glyph: 'text-slate-500',
  label: 'text-slate-500',
  chip: 'bg-slate-500',
};

/**
 * Icon/colour mapper keyed off a matter's short type code ("EW", "CE", "RRM", "PMI", …) — any
 * reference the backend assigns that we don't recognise falls back to a generic slate style.
 */
export const getTypeVisual = (type: string): TypeVisual =>
  TYPE_VISUALS[type] ?? DEFAULT_TYPE_VISUAL;

/* ─── Per-variant metrics ───────────────────────────────────────────────── */

/**
 * The governing row and its sub-event rows are the same layout at two scales. Keeping the
 * two size sets side by side here is what lets `WatchtowerEventRow` render both.
 *
 * `padding` is deliberately vertical-only — the horizontal track is `ROW_PAD_X`, shared by both
 * variants and the header band, so the two scales differ in row height but never in column x.
 */
export const ROW_METRICS: Record<
  RowVariant,
  {
    padding: string;
    /** Left inset of the Event cell's content only — the cell itself stays on the shared grid
     *  track, so the other three columns keep their x; sub rows use it to read as nested. */
    eventIndent: string;
    gap: string;
    tile: string;
    glyph: string;
    chip: string;
    category: string;
    title: string;
    code: string;
    actionLabel: string;
    bar: string;
    infoIcon: string;
    avatar: string;
    assigneeName: string;
    assigneeRole: string;
    clockBadge: string;
    clockIcon: string;
    clockBar: string;
    priority: string;
    priorityDot: string;
    clockSub: string;
  }
> = {
  governing: {
    padding: 'py-5',
    eventIndent: '',
    gap: 'gap-3.5',
    tile: 'h-11 w-11 rounded-xl',
    glyph: 'h-5 w-5',
    chip: 'px-1.5 text-[9px]',
    category: 'text-[10px]',
    title: 'text-[15px] leading-5',
    code: 'text-[11px]',
    actionLabel: 'text-[11px]',
    bar: 'h-1.5 max-w-[150px]',
    infoIcon: 'h-4 w-4',
    avatar: 'h-8 w-8 text-[11px]',
    assigneeName: 'text-[12px]',
    assigneeRole: 'text-[11px]',
    clockBadge: 'px-2 py-[3px] text-[11px]',
    clockIcon: 'h-3 w-3',
    clockBar: 'h-1.5 max-w-[150px]',
    priority: 'text-[11px]',
    priorityDot: 'h-2 w-2',
    clockSub: 'text-[13px]',
  },
  sub: {
    padding: 'py-3.5',
    eventIndent: 'pl-10',
    gap: 'gap-3',
    tile: 'h-9 w-9 rounded-lg',
    glyph: 'h-[18px] w-[18px]',
    chip: 'px-1 text-[8px]',
    category: 'text-[9px]',
    title: 'text-[13px] leading-[18px]',
    code: 'text-[10px]',
    actionLabel: 'text-[10px]',
    bar: 'h-1.5 max-w-[130px]',
    infoIcon: 'h-3.5 w-3.5',
    avatar: 'h-7 w-7 text-[10px]',
    assigneeName: 'text-[11px]',
    assigneeRole: 'text-[10px]',
    clockBadge: 'px-1.5 py-[2px] text-[10px]',
    clockIcon: 'h-2.5 w-2.5',
    clockBar: 'h-1 max-w-[130px]',
    priority: 'text-[10px]',
    priorityDot: 'h-1.5 w-1.5',
    clockSub: 'text-[12px]',
  },
};
