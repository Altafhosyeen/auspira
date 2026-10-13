'use client';

/**
 * WatchtowerGroupedCard
 * One Early Warning's NEC4 Cl. 15 lifecycle, from GET .../action-queue-grouped.
 *
 * Unlike WatchtowerGroupCard, every stage arrives in the same response — there's no per-card
 * children fetch, so expanding is just a local toggle over already-loaded data.
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ContractEntityType, EwLifecycleStage } from '@/constants';
import type {
  ActionQueueGroup,
  ActionQueueGroupedTask,
  ProjectTask,
} from '@/hooks/modules/project-tasks';
import { mapProjectTaskToWatchtowerRow } from '@/lib/utils/org-dashboard.utils';
import type { WatchtowerRow } from '@/types/dashboard/org-dashboard.types';
import WatchtowerEventRow from './WatchtowerEventRow';
import {
  CARD_SHADOW,
  DUE_URGENCY_CLASS,
  FOCUS_RING,
  getDueUrgencyTone,
  mapGroupedTaskToProjectTask,
  mapGroupTaskToEventCard,
  mapGroupToEventCard,
  normalizeTypeCode,
} from './watchtower-queue.config';

/** Canonical code for an Early Warning lifecycle group — the only group whose `groupId` doubles
 *  as its entity id (a CE group's is a human code like "CE-A11", not a GUID). Compared against
 *  `normalizeTypeCode(group.groupType)`, since the backend sends the kind as a short code ("EW"),
 *  the full entity name ("EarlyWarning"), or `ContractEntityType`'s own numeric value. */
const EW_GROUP_TYPE = 'EW';

/** The entity a group's rows belong to, per normalised group code — what the grouped endpoint
 *  never sends on a task (`entityType`) and what every open rule downstream keys off: CE rows
 *  open the send-email modal, EW rows route to the EW detail screen. A group code that isn't in
 *  here leaves the row's own entity type untouched. */
const GROUP_ENTITY_TYPE: Record<string, ContractEntityType> = {
  EW: ContractEntityType.EarlyWarning,
  CE: ContractEntityType.CompensationEvent,
  PMI: ContractEntityType.PMI,
};

interface WatchtowerGroupedCardProps {
  group: ActionQueueGroup;
  projectId: string;
  /** Real task records, keyed by id, from the plain project-tasks list — the grouped endpoint's
   *  `taskId`s are the same backend ids, so a hit here gives the row its real entityType/entityId
   *  (letting it open the same EW-detail route / CE send-email modal a real task row would) instead
   *  of the synthetic fallback `mapGroupedTaskToProjectTask` builds when there's no match. */
  taskById: Map<string, ProjectTask>;
  /** Fired for sub-event rows only — the governing row toggles its timeline instead of opening
   *  anything, since it's a summary of the stages below it rather than an actionable row itself. */
  onSelectRow: (row: WatchtowerRow) => void;
  /** Id of the row currently armed for a second confirming click — see `onSelectRow`'s caller. */
  selectedRowId?: string | null;
  /** Overrides the mount state of this card's timeline, which is open by default so the full
   *  lifecycle is visible the moment the page lands. Read only as the initial state: this card
   *  mounts on the same render the parent already knows which group to expand, so there's no
   *  later prop change to react to. */
  forceExpanded?: boolean;
}

export default function WatchtowerGroupedCard({
  group,
  projectId,
  taskById,
  onSelectRow,
  selectedRowId,
  forceExpanded,
}: WatchtowerGroupedCardProps) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded ?? true);

  // The governing row's identity (title/reference/context) comes off the group; everything else
  // (assignee, priority, due date, next action) comes off `current` — the group's own first task,
  // taken as given rather than re-sorted. EVERY task — the current stage included, not just the
  // ones after it — renders below as a sub-event row, so the expanded timeline shows the full
  // lifecycle rather than starting at stage two.
  const current = group.tasks[0] ?? null;
  const subEvents = group.tasks;
  const hasSubEvents = subEvents.length > 0;

  // Each stage's Clock subtext names the stage that follows it in `group.tasks` (the array's
  // own order), not each task's own backend-sent `nextTask` field — see the note on
  // `mapGroupToEventCard`/`mapGroupTaskToEventCard`. `current`'s own reference (off the plain
  // project-tasks list) wins over the group's shared one — see the note on `mapGroupToEventCard`.
  const card = useMemo(
    () =>
      mapGroupToEventCard(
        group,
        current,
        subEvents[1] ?? null,
        current ? taskById.get(current.taskId)?.reference : null
      ),
    [group, current, subEvents, taskById]
  );
  // Prefer the real task record (real entityType/entityId → real EW-detail route / CE send-email
  // modal); only fall back to the synthetic one — which drives the Risk Reduction invite via
  // `stage` and carries the group's id as `entityId` — when this task isn't in the plain list.
  const resolveTask = useCallback(
    (task: ActionQueueGroupedTask): ProjectTask => {
      const real = taskById.get(task.taskId);
      if (!real) return mapGroupedTaskToProjectTask(task, group, projectId);
      // The grouped endpoint's own `subEntityId` (a quotation's real id for "Review Quotation",
      // say) points at a more specific record than whatever the real task's own `entityId` names
      // — the real record's `entityId` is the governing matter (the CE), not this stage's own
      // target, so `subEntityId` wins whenever the backend sent one. Otherwise backfill the
      // group's id so the Risk Reduction invite always has an early-warning id to post against.
      return {
        ...real,
        entityId: task.subEntityId ?? real.entityId ?? group.groupId,
        queueStage: task.stage ?? real.stage ?? undefined,
      };
    },
    [taskById, group, projectId]
  );

  // A group can hold several distinct matters of the same kind (e.g. more than one Compensation
  // Event queued under one Early Warning) — `group.reference` is one value shared by the whole
  // group, so each sub-event row needs its own matching real task's reference instead, read off
  // the plain project-tasks list via `taskById`.
  const subEventCards = useMemo(
    () =>
      subEvents.map((task, index) =>
        mapGroupTaskToEventCard(
          task,
          group,
          subEvents[index + 1] ?? null,
          taskById.get(task.taskId)?.reference
        )
      ),
    [subEvents, group, taskById]
  );

  // Built off `mapProjectTaskToWatchtowerRow` — the same conversion `WatchtowerPanel`/
  // `WatchtowerGroupCard` use for a real top-level task — so a sub-event row from this grouped
  // endpoint opens the exact same modal/route a real task row would for the same stage/entity
  // data. Sub-events only: the governing row is a summary of these stages, not a task of its
  // own, so clicking it toggles the timeline instead of opening anything.
  const rowsById = useMemo(() => {
    const resolvedSubEvents = subEvents.map((task) => resolveTask(task));

    // Every stage rendered by this card belongs to the same governing Early Warning, so they
    // all share one entityId — read it off whichever stage's real record actually resolved. A
    // closed/historical stage (e.g. "Close") is often missing from the plain
    // active-tasks list `taskById` is built from, so the clicked stage itself isn't guaranteed
    // to be the hit; a sibling stage usually is. When NO stage resolves — a group whose
    // tasks are all absent from that list — fall back to the group's own id, which for an
    // EW group IS the early-warning id (the same one `mapGroupedTaskToProjectTask` hands the
    // Risk Reduction invite). Without that fallback those rows had no id to route with and
    // clicked dead, so the same stage navigated in one group and did nothing in another.
    const sharedEwEntityId =
      resolvedSubEvents.find(
        (task) => task?.entityType === ContractEntityType.EarlyWarning && task.entityId
      )?.entityId ??
      (normalizeTypeCode(group.groupType) === EW_GROUP_TYPE ? group.groupId : undefined);

    // Every EW-lifecycle stage except Early Warning Meeting (which opens its own invite modal
    // off `stage` alone, unaffected by this) should route to the EW detail page — it's a stage
    // of the shared EW, not a distinct entity, so it must route there even when its own record
    // didn't resolve via `taskById`. Link to CE routes there too, same as any other EW stage.
    const withEwRoute = (task: ProjectTask): ProjectTask =>
      task.stage != null && task.stage !== EwLifecycleStage.EarlyWarningMeeting && sharedEwEntityId
        ? { ...task, entityType: ContractEntityType.EarlyWarning, entityId: sharedEwEntityId }
        : task;

    // `stage` numbering IS the EW Cl. 15 lifecycle's own — every other matter kind numbers its
    // stages differently, so carrying it on a CE/PMI row lets the EW stage rules
    // (`isMeetingInviteRow`, `getWatchtowerRowHref`) fire on a number that means something else
    // there. Non-EW rows drop it and take their group's entity type instead — including when the
    // backend sent `Unknown` (0) — so a CE stage the plain task list has no record of still opens
    // the CE send-email modal; before this those rows resolved to no entity at all and clicked dead.
    // `queueStage` survives the clear: it is the same number, but read only by routing (which
    // needs the backend's stage key) and never by the EW stage rules.
    const withGroupEntity = (task: ProjectTask): ProjectTask => ({
      ...task,
      stage: undefined,
      queueStage: task.queueStage ?? task.stage,
      entityType: task.entityType || GROUP_ENTITY_TYPE[normalizeTypeCode(group.groupType)],
    });

    const isEwGroup = normalizeTypeCode(group.groupType) === EW_GROUP_TYPE;

    const map = new Map<string, WatchtowerRow>();
    subEventCards.forEach((subEventCard, index) => {
      const task = resolvedSubEvents[index];
      map.set(
        subEventCard.id,
        mapProjectTaskToWatchtowerRow(isEwGroup ? withEwRoute(task) : withGroupEntity(task))
      );
    });
    return map;
  }, [subEventCards, subEvents, resolveTask, group]);

  const handleOpen = useCallback(
    (cardId: string) => {
      const row = rowsById.get(cardId);
      if (row) onSelectRow(row);
    },
    [rowsById, onSelectRow]
  );

  // The governing row is a summary of the stages below it, not an actionable task of its own —
  // clicking it (row or chevron) just shows/hides the sub-event timeline, never opens a
  // modal/route. Matches `stageToggle`, which stops propagation so the two don't double-toggle.
  const toggleExpanded = useCallback(() => setIsExpanded((open) => !open), []);

  const showTimeline = isExpanded && hasSubEvents;

  const stageToggle = hasSubEvents ? (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={(event) => {
        event.stopPropagation();
        setIsExpanded((open) => !open);
      }}
      onKeyDown={(event) => event.stopPropagation()}
      className={`hover:text-main-p mt-2.5 inline-flex w-fit cursor-pointer items-center gap-1 rounded text-[11px] leading-4 font-semibold text-slate-500 transition-colors duration-200 ease-in-out ${FOCUS_RING}`}
    >
      {isExpanded ? (
        <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {isExpanded ? 'sub-events' : `Show sub-events (${subEvents.length})`}
    </button>
  ) : null;

  return (
    <article
      className={`relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white ${CARD_SHADOW} transition-colors duration-200 ease-in-out last:mb-0 hover:border-slate-300`}
    >
      <WatchtowerEventRow
        card={card}
        variant="governing"
        onOpen={toggleExpanded}
        expanded={hasSubEvents ? isExpanded : undefined}
        footer={stageToggle}
        className="hover:bg-slate-50/60"
      />

      {/* Sub-events render flush on the shared `ROW_PAD_X` track rather than inside an indented
          card, so their four columns land under the same headers the governing row does. The
          timeline dot sits in the row's own left padding — between the group rail and the icon
          tile — which reads as nesting without taking the row off the column track. A connecting
          line runs behind the dots, from the first stage's dot to the last, matching the
          reference design's timeline rail. */}
      {showTimeline && (
        <div className="relative border-t border-slate-100 bg-slate-50/40">
          {subEventCards.length > 1 && (
            <span
              className="absolute top-6 bottom-6 left-9 w-px -translate-x-1/2 bg-slate-200"
              aria-hidden="true"
            />
          )}
          {subEventCards.map((subEventCard) => (
            <div
              key={subEventCard.id}
              className="relative border-b border-slate-100 last:border-b-0"
            >
              <span
                className={`absolute top-1/2 left-9 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-slate-50/40 ${DUE_URGENCY_CLASS[getDueUrgencyTone(subEventCard.clock.dueDateTime)]}`}
                aria-hidden="true"
              />
              <WatchtowerEventRow
                card={subEventCard}
                variant="sub"
                onOpen={handleOpen}
                projectId={projectId}
                selected={subEventCard.id === selectedRowId}
                className="hover:bg-slate-100/60"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
