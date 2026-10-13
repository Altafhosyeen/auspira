/**
 * Watchtower & Action Queue — the card shape every row renders from.
 *
 * Split out of `watchtower-queue.config.ts` so the tokens and the mappers can both name these
 * without importing each other. Import from `./watchtower-queue.config`, which re-exports the
 * whole set as one module.
 */

import type { LucideIcon } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */

/** How urgent a clock reads — drives the badge tint only. */
export type ClockTone = 'critical' | 'warning' | 'normal';

/** Governing matters are the top-level rows; sub-events are their nested children. */
export type RowVariant = 'governing' | 'sub';

export interface EventCardAssignee {
  /** The user's id — what assign/unassign address. Empty when the source row carried none. */
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
}

export interface EventCard {
  id: string;
  type: string;
  categoryLabel: string;
  title: string;
  /** Sub-event rows set this: their `title` IS the stage name, which the Required Action column
   *  already prints, so the Event column skips the visible title line. `title` itself stays
   *  populated — tooltips and aria-labels still read off it. */
  hideTitle?: boolean;
  code: string;
  requiredAction: {
    label: string;
    progress: number; // percentage (0-100)
    /** Full due date-time of the action itself, printed under the label ("Due 07 Aug 2026,
     *  10:09 PM"). Same deadline the Clock badge condenses into a tag ("Due Today") — this is
     *  the precise form of it. Only the grouped-endpoint cards populate this. */
    dueDateTime?: string | null;
  };
  /** `null` when the matter has no assignee — the Assigned column then renders nothing rather
   *  than a placeholder avatar over the word "Unassigned", which read as a real person at a
   *  glance and put a colour on the row that meant nothing. */
  assigned: EventCardAssignee | null;
  /** Every assignee on the task, `assigned` first — the Assigned cell stacks them as avatars
   *  once there's more than one. Empty when unassigned. */
  assignees: EventCardAssignee[];
  clock: {
    badgeText: string;
    badgeTone: ClockTone;
    priority: 'High' | 'Medium' | 'Low';
    /** Deadline printed under the run-down bar as a day count (see `formatDueInDays`) — the
     *  Required Action column already carries the same deadline in full date-time form. */
    dueDateTime?: string | null;
    subText: string;
    /** How much of the response window (raised → due) has run down, 0-100. */
    progress: number;
  };
  /** The NEC4 clause this row is raised under, shown on hover of the Required Action info
   *  button. Only rows the backend maps to a clause carry it — the button hides without it. */
  clause?: {
    /** Bare clause number as sent ("62", "15.2") — the row prints it as "Clause 62". */
    reference: string;
    description: string;
  } | null;
}

/** Per-matter-type colourway: icon tile, glyph, category label and the solid chip under the tile. */
export interface TypeVisual {
  Icon: LucideIcon;
  tile: string;
  glyph: string;
  label: string;
  chip: string;
}
