'use client';

/**
 * Awareness table — the presentational primitives its rows are built from.
 * Split out of AwarenessPage.tsx so the page file holds only the screen itself.
 */

import { Checkbox } from 'antd';
import { FileTextIcon } from 'lucide-react';
import React from 'react';
import {
  FOCUS_RING,
  PILL_ACTIVE,
  PILL_BASE,
  PILL_IDLE,
  ROW_OPEN_BUTTON,
  ROW_OPEN_ICON,
} from '@/constants/list-page.constants';
import {
  BADGE_CLASS,
  COL,
  getSourceVisual,
  ROUTE_ICON,
  ROW_PAD,
  type RouteMeta,
  type Signal,
  STATUS_CONFIG,
} from './awareness-page.helpers';

export const RouteBadge = React.memo(function RouteBadge({ route }: { route: RouteMeta }) {
  const Icon = ROUTE_ICON[route.type];
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-[3px] text-[11px] leading-4 font-semibold ${BADGE_CLASS[route.tone]}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="truncate">{route.label}</span>
    </span>
  );
});

export const FilterPill = ({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`${PILL_BASE} ${FOCUS_RING} ${isActive ? PILL_ACTIVE : PILL_IDLE}`}
    >
      {label}
      {count > 0 && (
        <span
          className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md px-1 text-[11px] leading-none font-bold ${
            isActive ? 'bg-main-p text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export interface SignalRowProps {
  signal: Signal;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onOpen: (signal: Signal) => void;
}

export const SignalRow = React.memo(function SignalRow({
  signal,
  isSelected,
  onToggle,
  onOpen,
}: SignalRowProps) {
  const { tile, glyph, Icon } = getSourceVisual(signal.source);
  const status = STATUS_CONFIG[signal.status];

  const open = () => onOpen(signal);

  return (
    // The row's accessible affordance is the trailing chevron <button> below, which carries its
    // own aria-label and keyboard handling — this click is a redundant mouse convenience over the
    // same action. Giving the div a button role would nest that button (and the checkbox) inside
    // an interactive role and put every row in the tab order twice.
    // biome-ignore lint/a11y/noStaticElementInteractions: see above
    // biome-ignore lint/a11y/useKeyWithClickEvents: see above
    <div
      onClick={open}
      className={`group grid ${COL} ${ROW_PAD} relative mb-2 min-h-[60px] cursor-pointer items-center overflow-hidden rounded-lg border py-3 transition-all duration-200 ease-in-out last:mb-0 ${
        isSelected
          ? 'border-blue-200 bg-blue-50/60 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-blue-500'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-blue-50/60'
      }`}
    >
      {/* Handlers sit on the Checkbox itself so the cell stays a plain container — the
          stopPropagation keeps the row from navigating when the checkbox is clicked. */}
      <div className="flex items-center">
        <Checkbox
          checked={isSelected}
          aria-label={`Select awareness: ${signal.signal}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(signal.id);
          }}
        />
      </div>

      <div className="flex min-w-0 items-center gap-3 pr-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${tile}`}
        >
          <Icon className={`h-3.75 w-3.75 ${glyph}`} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="ds-caption! my-0! truncate font-semibold! text-slate-800">
            {signal.source.name}
          </p>
          {signal.source.sub && (
            <p className="my-0! mt-0.5! truncate text-[11px] leading-4 font-medium text-slate-400">
              {signal.source.sub}
            </p>
          )}
        </div>
      </div>

      <p className="ds-caption! my-0! line-clamp-2 pr-4 leading-[18px]! font-medium! text-slate-700">
        {signal.signal}
      </p>

      <p
        className={`ds-micro! my-0! truncate pr-3 font-medium! ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}
      >
        {signal.refNumber}
      </p>

      <div className="min-w-0 pr-3">
        <RouteBadge route={signal.route} />
      </div>

      <div className={`ds-micro! flex items-center gap-1.5 font-semibold! ${status.textClass}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
      </div>

      <div>
        <p className="ds-micro! my-0! font-semibold! text-slate-700">{signal.received.day}</p>
        <p className="my-0! mt-0.5! text-[11px] leading-4 text-slate-400">{signal.received.time}</p>
      </div>

      {/* Real button so the row is reachable by keyboard and announced by screen readers. */}
      <div className="flex justify-end">
        <button
          type="button"
          aria-label={`Open awareness: ${signal.signal}`}
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className={`${ROW_OPEN_BUTTON} ${FOCUS_RING}`}
        >
          <FileTextIcon className={ROW_OPEN_ICON} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
