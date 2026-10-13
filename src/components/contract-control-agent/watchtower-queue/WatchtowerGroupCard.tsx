'use client';

/**
 * WatchtowerGroupCard
 * One governing matter — expandable to show its real child tasks as a nested sub-event timeline.
 *
 * Children are fetched per-card via GET /api/project-tasks/{taskId}/children, only once the
 * card is expanded and only when the task actually reports children.
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { type ProjectTask, useGetProjectTaskChildren } from '@/hooks/modules/project-tasks';
import { mapProjectTaskToWatchtowerRow, toDisplayReference } from '@/lib/utils/org-dashboard.utils';
import type { WatchtowerRow } from '@/types/dashboard/org-dashboard.types';
import WatchtowerEventRow from './WatchtowerEventRow';
import {
  CARD_SHADOW,
  CATEGORY_LABELS,
  DUE_URGENCY_CLASS,
  FOCUS_RING,
  getDueUrgencyTone,
  getTaskBadgeType,
  mapTaskToEventCard,
} from './watchtower-queue.config';

interface WatchtowerGroupCardProps {
  task: ProjectTask;
  onSelectRow: (row: WatchtowerRow) => void;
  /** Id of the row currently armed for a second confirming click — see `onSelectRow`'s caller. */
  selectedRowId?: string | null;
}

export default function WatchtowerGroupCard({
  task,
  onSelectRow,
  selectedRowId,
}: WatchtowerGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubEvents = (task.childTaskCount ?? 0) > 0;

  const { data: childTasks, isLoading: isLoadingChildren } = useGetProjectTaskChildren({
    taskId: task.id,
    enabled: isExpanded && hasSubEvents,
  });

  const card = useMemo(() => {
    const typeCode = getTaskBadgeType(task);
    return mapTaskToEventCard(task, `${CATEGORY_LABELS[typeCode] ?? typeCode}`);
  }, [task]);

  const subCards = useMemo(() => {
    // Raw GUID references never render — with no human code the label just drops the "• …" tail.
    const parentRef = toDisplayReference(task.reference) ?? card.code;
    return (childTasks ?? []).map((child) => {
      const typeCode = getTaskBadgeType(child);
      // Full type name (e.g. "Compensation Event") rather than the abbreviation ("CE") — the
      // abbreviation still shows on the icon chip underneath.
      const typeLabel = CATEGORY_LABELS[typeCode] ?? typeCode;
      return mapTaskToEventCard(child, parentRef ? `${typeLabel} • ${parentRef}` : typeLabel);
    });
  }, [childTasks, task.reference, card.code]);

  /** Rows are keyed by task id so the row components can hand back an id and keep `React.memo`. */
  const rowsById = useMemo(() => {
    const map = new Map<string, WatchtowerRow>();
    map.set(task.id, mapProjectTaskToWatchtowerRow(task));
    (childTasks ?? []).forEach((child) => {
      map.set(child.id, mapProjectTaskToWatchtowerRow(child));
    });
    return map;
  }, [task, childTasks]);

  const handleOpen = useCallback(
    (cardId: string) => {
      const row = rowsById.get(cardId);
      if (row) onSelectRow(row);
    },
    [rowsById, onSelectRow]
  );

  const showTimeline = isExpanded && hasSubEvents;

  const subEventToggle = hasSubEvents ? (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={(event) => {
        event.stopPropagation();
        setIsExpanded((open) => !open);
      }}
      // Keeps Enter/Space on the toggle from also firing the row's open handler.
      onKeyDown={(event) => event.stopPropagation()}
      className={`hover:text-main-p mt-2.5 inline-flex w-fit cursor-pointer items-center gap-1 rounded text-[11px] leading-4 font-semibold text-slate-500 transition-colors duration-200 ease-in-out ${FOCUS_RING}`}
    >
      {isExpanded ? (
        <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {isExpanded ? 'sub-events' : `Show sub-events (${task.childTaskCount})`}
    </button>
  ) : null;

  return (
    <article
      className={`relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white ${CARD_SHADOW} transition-colors duration-200 ease-in-out last:mb-0 hover:border-slate-300`}
    >
      <WatchtowerEventRow
        card={card}
        variant="governing"
        onOpen={handleOpen}
        footer={subEventToggle}
        className="hover:bg-slate-50/60"
      />

      {/* Sub-events stay on the shared `ROW_PAD_X` track so their columns line up with the
          header band — the timeline node sits in the row's own left padding, off the spine. */}
      {showTimeline && (
        <div className="relative border-t border-slate-100 bg-slate-50/40">
          {isLoadingChildren ? (
            <p className="my-0 py-3 pl-6 text-[11px] leading-4 font-medium text-slate-400">
              Loading sub-events…
            </p>
          ) : (
            <>
              {subCards.length > 1 && (
                <span
                  className="absolute top-6 bottom-6 left-9 w-px -translate-x-1/2 bg-slate-200"
                  aria-hidden="true"
                />
              )}
              {subCards.map((subCard) => (
                <div
                  key={subCard.id}
                  className="relative border-b border-slate-100 last:border-b-0"
                >
                  <span
                    className={`absolute top-1/2 left-9 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-slate-50/40 ${DUE_URGENCY_CLASS[getDueUrgencyTone(subCard.clock.dueDateTime)]}`}
                    aria-hidden="true"
                  />
                  <WatchtowerEventRow
                    card={subCard}
                    variant="sub"
                    onOpen={handleOpen}
                    projectId={task.projectId}
                    selected={subCard.id === selectedRowId}
                    className="hover:bg-slate-100/60"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </article>
  );
}
