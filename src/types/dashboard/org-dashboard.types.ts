import type { TriangleAlert } from 'lucide-react';
import type React from 'react';
import type { ProjectTask } from '@/hooks/modules/project-tasks';

export type BadgeTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export interface StatCardData {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  /** Colour of the delta arrow + percentage — green reads as growth, red as a warning. */
  deltaTone: 'positive' | 'negative';
  icon: React.ReactNode;
  iconBg: string;
}

export interface SignalRow {
  id: string;
  /** Fully-resolved icon content — either a bare glyph or a small colour-tile-wrapped glyph. */
  icon: React.ReactNode;
  title: string;
  source: string;
  day: string;
  time: string;
  /** Short badge code, e.g. `EW` / `CE`. */
  typeLabel: string;
  /** Spelled-out alert type — shown on hover since the badge itself is abbreviated. */
  typeFullLabel: string;
  typeTone: BadgeTone;
  TypeIcon: typeof TriangleAlert;
  /** Raw `ProjectAlertType` — drives which detail screen the row opens. */
  alertType: number;
  /** `alertStatus === ProjectAlertStatus.Overdue` — drives the Urgent Signals filter. */
  urgent: boolean;
}

export interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  meta: string;
}

export interface WatchtowerRow {
  id: string;
  dot: string;
  badge: string;
  badgeClass: string;
  title: string;
  sub: string;
  tag: string;
  tagClass: string;
  /** Relative day-count ("3 days ago"), set only on overdue rows. */
  overdueSince?: string;
  /** Exact due timestamp ("08 Aug 2026, 10:09 PM"), set whenever the row has a due date. */
  dueDateTimeLabel?: string;
  /** Present when mapped from a real project task — absent on the static fallback rows. */
  task?: ProjectTask;
}
