'use client';

/**
 * WatchtowerEventRow
 * One matter line in the Watchtower table — Event · Assigned · Due Date · Required action.
 *
 * Governing matters and their nested sub-events are the same layout at two scales, so both
 * render through this component and pick their sizes out of `ROW_METRICS[variant]`.
 */

import { Tooltip } from 'antd';
import { ArrowRight, Calendar, ChevronRight, Flag, Info } from 'lucide-react';
import React from 'react';
import { toLocalDayjs } from '@/lib/utils';
import WatchtowerAssigneePicker from './WatchtowerAssigneePicker';
import {
  CLOCK_BADGE_CLASS,
  DUE_URGENCY_CLASS,
  type EventCard,
  FOCUS_RING,
  getDueUrgencyTone,
  getTypeVisual,
  PRIORITY_DOT_CLASS,
  ROW_METRICS,
  ROW_OPEN_BUTTON,
  ROW_OPEN_ICON,
  ROW_PAD_X,
  type RowVariant,
  WATCHTOWER_ROW_GRID,
} from './watchtower-queue.config';

interface WatchtowerEventRowProps {
  card: EventCard;
  variant: RowVariant;
  /** Receives the card id so the callback stays referentially stable and `React.memo` holds. */
  onOpen: (cardId: string) => void;
  /** Project the row's task belongs to — required to look up assignable members and to scope the
   *  assign mutation's cache invalidation. Omitted on rows the Assigned picker doesn't apply to
   *  (the governing row never renders it). */
  projectId?: string;
  /** Set by rows whose click toggles a sub-event timeline instead of opening the matter (the
   *  grouped governing row) — the trailing chevron then reads as an expander: aria-expanded,
   *  a show/hide label and a 90° rotation while open. Leave unset for rows that truly open. */
  expanded?: boolean;
  /** First click on an actionable row arms it instead of opening it straight away — this marks
   *  that armed row so a second click on the same row is what actually opens it (see `onOpen`'s
   *  caller). Never set on rows whose click toggles a timeline instead of opening. */
  selected?: boolean;
  /** Extra content under the code line — the governing row's show/hide sub-events toggle. */
  footer?: React.ReactNode;
  className?: string;
}

const WatchtowerEventRow = React.memo(function WatchtowerEventRow({
  card,
  variant,
  onOpen,
  projectId,
  expanded,
  selected,
  footer,
  className = '',
}: WatchtowerEventRowProps) {
  const m = ROW_METRICS[variant];
  const visual = getTypeVisual(card.type);
  const open = () => onOpen(card.id);
  // Reference design gives every row its own short urgency-tinted left bar rather than one
  // continuous spine down the whole card — a governing row (no due date of its own) always reads
  // as its matter type's colour; a sub-event row reads its own due-date urgency, same tone as its
  // progress bar and timeline dot.
  const railClass =
    variant === 'governing'
      ? visual.chip
      : DUE_URGENCY_CLASS[getDueUrgencyTone(card.clock.dueDateTime)];

  return (
    // The row's accessible affordance is the trailing chevron <button> below, which carries its
    // own aria-label and keyboard handling — this click is a redundant mouse convenience over the
    // same action. Giving the div a button role would nest that button (and the info button)
    // inside an interactive role and put every row in the tab order twice.
    // biome-ignore lint/a11y/noStaticElementInteractions: see above
    // biome-ignore lint/a11y/useKeyWithClickEvents: see above
    <div
      id={`watchtower-row-${card.id}`}
      onClick={open}
      className={`group relative ${WATCHTOWER_ROW_GRID} ${ROW_PAD_X} ${m.padding} cursor-pointer transition-colors duration-200 ease-in-out ${selected ? 'bg-main-p/5 ring-1 ring-inset ring-main-p/40' : ''} ${className}`}
    >
      {/* Short urgency-tinted rail, inset from the row's own top/bottom edge so consecutive rows
          read as separate segments rather than one continuous bar down the whole card. Sub-event
          rows sit one step right of the governing row's own rail — nested under it, same as the
          Event column's own `eventIndent` — rather than flush with the card's left edge. */}
      <span
        className={`absolute top-2 bottom-2 w-1 rounded-full ${variant === 'governing' ? 'left-0' : 'left-4'} ${railClass}`}
        aria-hidden="true"
      />
      {/* ─── Event ───────────────────────────────────────────────────────
          Governing rows keep the icon tile + chip (they read as a matter's cover line); sub-event
          rows drop it — the reference design gives them no icon, just the coloured left rail
          (see the timeline dot/spine in `WatchtowerGroupCard`/`WatchtowerGroupedCard`) — and carry
          a description line plus the lifecycle's "Next: …" hint under the title instead. */}
      <div className={`flex min-w-0 ${m.gap} ${m.eventIndent} pr-4`}>
        {variant === 'governing' && (
          <div className="flex shrink-0 flex-col items-center">
            <span className={`flex items-center justify-center border ${m.tile} ${visual.tile}`}>
              <visual.Icon
                className={`${m.glyph} ${visual.glyph}`}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <span
              className={`mt-1 rounded py-px leading-[13px] font-bold tracking-wider text-white uppercase ${m.chip} ${visual.chip}`}
            >
              {card.type}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-col justify-center">
          {/* Governing rows read as a shout ("EARLY WARNING MATTER • GOVERNING") over their own
              bold title below. Sub-event rows have no title of their own worth repeating (their
              `title` IS the stage name `categoryLabel` already carries), so the reference design
              promotes this line to the bold dark heading instead — same role the governing row's
              `<h3>` plays, just carried by a different field. */}
          <span
            title={card.categoryLabel}
            className={
              variant === 'governing'
                ? `whitespace-nowrap uppercase leading-4 font-bold tracking-[0.06em] ${m.category} ${visual.label}`
                : `text-text truncate leading-5 font-bold ${m.title}`
            }
          >
            {card.categoryLabel}
          </span>
          {!card.hideTitle && (
            <h3
              title={card.title}
              className={`text-text my-0 mt-0.5 whitespace-nowrap font-bold ${m.title}`}
            >
              {card.title}
            </h3>
          )}
          {variant === 'governing' && card.code && (
            <span
              title={card.code}
              className={`mt-0.5 truncate leading-4 font-medium text-slate-400 ${m.code}`}
            >
              {card.code}
            </span>
          )}
          {/* Sub-event rows only: the stage's own action read as a short description under the
              title, then the lifecycle's next step (or, on the final stage, a flag reading "Final
              step in this event" instead of an arrow) — matches the reference design's two-line
              body under each task. */}
          {variant === 'sub' && (
            <>
              {card.requiredAction.label && card.requiredAction.label !== card.title && (
                <p
                  title={card.requiredAction.label}
                  className={`my-0 mt-1 line-clamp-2 leading-4 font-normal text-slate-500 ${m.code}`}
                >
                  {card.requiredAction.label}
                </p>
              )}
              {card.clock.subText &&
                (card.clock.subText === 'Final stage' ? (
                  <span
                    className={`mt-1.5 flex min-w-0 items-center gap-1 leading-4 font-medium text-slate-400 italic ${m.clockSub}`}
                  >
                    <Flag className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Final step in this event
                  </span>
                ) : (
                  <span
                    title={card.clock.subText}
                    className={`mt-1.5 flex min-w-0 items-center gap-1 truncate leading-4 font-medium text-slate-500 ${m.clockSub}`}
                  >
                    <ArrowRight className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span className="font-semibold text-emerald-600">Next:</span>
                    {card.clock.subText.replace(/^Next:\s*/, '')}
                  </span>
                ))}
            </>
          )}
          {footer}
        </div>
      </div>

      {/* ─── Assigned ──────────────────────────────────────────────────────
          The governing row already names its owner on the code line in the Event column, so this
          cell only carries the picker for sub-event rows — kept as an empty track (not omitted)
          so the grid's column count still lines up with the header band.

          `self-stretch` + `items-center` overrides the grid's `items-start` for this one cell.
          Every other column stacks three or four lines, so topping them out is what makes a row
          read straight across — but this cell is a single avatar-and-name chip, and topped out it
          hung off the row's ceiling. Stretching the cell to the row's height and centring the chip
          in it puts it back on the row's optical line, and lets the whole cell swallow clicks:
          assigning (including picks from the portalled dropdown, whose React events bubble
          through here) must never fall through to the row's open handler. */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: only stops bubbling to the row */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: only stops bubbling to the row */}
      <div
        onClick={variant !== 'governing' ? (event) => event.stopPropagation() : undefined}
        className={`flex min-w-0 items-center gap-2.5 self-stretch pr-3 ${variant !== 'governing' ? 'cursor-default' : ''}`}
      >
        {variant !== 'governing' && projectId && (
          <WatchtowerAssigneePicker
            taskId={card.id}
            projectId={projectId}
            assigned={card.assigned}
            assignees={card.assignees}
          />
        )}
      </div>

      {/* ─── Due Date ──────────────────────────────────────────────────────
          Plain date-time text — the urgency read (badge + priority) moved to the Required Action
          column below, next to the progress bar it shares an urgency tint with. */}
      <div className="flex min-w-0 items-center self-center pr-3">
        {variant !== 'governing' && (
          <span className={`truncate leading-4 font-medium text-slate-600 ${m.priority}`}>
            {card.clock.dueDateTime
              ? toLocalDayjs(card.clock.dueDateTime).format('DD MMM YYYY, h:mm A')
              : card.clock.badgeText}
          </span>
        )}
      </div>

      {/* ─── Required action ──────────────────────────────────────────────
          Governing rows are a summary of their stages, not a stage of their own, so this cell
          only carries content for sub-event rows — kept as an empty track (not omitted) so the
          grid's column count still lines up with the header band. Urgency badge + priority sit
          above the progress bar, both keyed off the same due-date tone as the bar's own fill. */}
      <div className="flex min-w-0 flex-col justify-center gap-1.5 pr-2">
        {variant !== 'governing' && (
          <>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span
                className={`inline-flex items-center gap-1 rounded-md border leading-4 font-semibold ${m.clockBadge} ${CLOCK_BADGE_CLASS[card.clock.badgeTone]}`}
              >
                <Calendar className={`shrink-0 ${m.clockIcon}`} aria-hidden="true" />
                {card.clock.badgeText}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 leading-4 font-semibold text-slate-500 ${m.priority}`}
              >
                <span
                  className={`shrink-0 rounded-full ${m.priorityDot} ${PRIORITY_DOT_CLASS[card.clock.priority]}`}
                  aria-hidden="true"
                />
                {card.clock.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div
                  className={`w-full overflow-hidden rounded-full bg-slate-100 ${m.bar}`}
                  role="progressbar"
                  aria-label={`Progress: ${card.requiredAction.label}`}
                  aria-valuenow={card.requiredAction.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${DUE_URGENCY_CLASS[getDueUrgencyTone(card.clock.dueDateTime)]}`}
                    style={{ width: `${card.requiredAction.progress}%` }}
                  />
                </div>
              </div>
              {/* The clause this stage is raised under, on hover. Rows the backend maps to no
                  clause drop the button entirely rather than offering an affordance that opens
                  an empty tooltip. Clicking it must not fall through to the row's open handler. */}
              {card.clause && (
                <Tooltip
                  title={
                    <div className="ds-caption! font-medium!">
                      <p className="my-0 font-bold">Clause {card.clause.reference}</p>
                      {card.clause.description && (
                        <p className="my-0 mt-1 whitespace-pre-line">{card.clause.description}</p>
                      )}
                    </div>
                  }
                  trigger={['hover', 'focus']}
                  styles={{ root: { maxWidth: 340 } }}
                >
                  <button
                    type="button"
                    aria-label={`Clause ${card.clause.reference}${card.clause.description ? `: ${card.clause.description}` : ''}`}
                    onClick={(event) => event.stopPropagation()}
                    className={`shrink-0 cursor-help rounded text-slate-300 transition-colors duration-200 ease-in-out hover:text-slate-500 ${FOCUS_RING}`}
                  >
                    <Info className={m.infoIcon} aria-hidden="true" />
                  </button>
                </Tooltip>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Open ──────────────────────────────────────────────────────────
          Its own trailing track. Governing rows keep a real chevron button here — it's an
          expand/collapse toggle, not just a mouse convenience over the row's own click, so it
          stays reachable by keyboard and announced by screen readers. Sub-event rows have no
          matching affordance in the reference design (the row's own `onClick={open}` above is
          the only way to open them), so this track renders empty for them. */}
      <div className="flex justify-end">
        {expanded !== undefined && (
          <button
            type="button"
            aria-label={`${expanded ? 'Hide' : 'Show'} sub-events of ${card.title}`}
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation();
              open();
            }}
            className={`${ROW_OPEN_BUTTON} ${FOCUS_RING}`}
          >
            <ChevronRight
              className={`${ROW_OPEN_ICON} transition-transform duration-200 ease-in-out ${expanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
});

export default WatchtowerEventRow;
