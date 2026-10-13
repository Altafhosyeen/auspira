'use client';

import { Button, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { ChevronRight, FileTextIcon, Info, TriangleAlert, Users } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import type React from 'react';
import { ROW_OPEN_BUTTON, ROW_OPEN_ICON } from '@/constants/list-page.constants';
import {
  PANEL_ROW_SUBTEXT_CLASS,
  PANEL_SUBTITLE_CLASS,
  PANEL_TAG_COL,
  PANEL_TITLE_CLASS,
} from '@/constants/org-dashboard.constants';
import { getEntityTypeLabel } from '@/lib/utils/org-dashboard.utils';
import type { WatchtowerRow } from '@/types/dashboard/org-dashboard.types';

export interface WatchtowerPanelProps {
  activeMattersCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  rows: WatchtowerRow[];
  extraMattersCount: number;
  isLoading?: boolean;
}

export const WatchtowerPanel: React.FC<WatchtowerPanelProps> = ({
  activeMattersCount,
  dueTodayCount,
  dueThisWeekCount,
  rows,
  extraMattersCount,
  isLoading,
}) => {
  const router = useRouter();
  const goToQueue = () => router.push('/projects/watchtower-queue');
  /** A dashboard row never acts by itself — it hands off to the full queue page, which finds
   *  the same matter, arms it (highlighted) and waits for the confirming second click there. */
  const goToRowInQueue = (row: WatchtowerRow) =>
    router.push(`/projects/watchtower-queue?rowId=${row.id}`);

  return (
    <motion.div
      className="flex min-h-[378px] flex-col overflow-hidden rounded-[12px] border border-slate-200/90 bg-white shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.38 }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <TriangleAlert className="h-4.5 w-4.5 text-red-500" />
          </span>
          <div>
            <p className={PANEL_TITLE_CLASS}>Watchtower & Action Queue</p>
            <p className={PANEL_SUBTITLE_CLASS}>
              Users can quickly identify items needing attention or action.
            </p>
          </div>
        </div>
        <Button
          type="default"
          size="small"
          onClick={goToQueue}
          className="!h-7 !rounded-lg !border-slate-200 !bg-white !px-3 !text-xs !font-medium !text-slate-500 !shadow-none hover:!border-slate-300 hover:!bg-slate-50"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </div>

      <div className="border-b border-[#E5E7EB] px-5 py-5">
        <div className="grid grid-cols-3">
          {/* Active Matters */}
          <div className="flex flex-col items-center">
            <span className="text-[20px] leading-none font-bold text-[#FF2D20]">
              {activeMattersCount}
            </span>
            <span className="mt-1 text-xs leading-4 font-medium text-[#6B7280]">
              Active matters
            </span>
          </div>

          {/* Due Today */}
          <div className="flex flex-col items-center">
            <span className="text-[20px] leading-none font-bold text-[#F97316]">
              {dueTodayCount}
            </span>
            <span className="mt-1 text-xs leading-4 font-medium text-[#6B7280]">Due Today</span>
          </div>

          {/* Due This Week */}
          <div className="flex flex-col items-center">
            <span className="text-[20px] leading-none font-bold text-[#10B981]">
              {dueThisWeekCount}
            </span>
            <span className="mt-1 text-xs leading-4 font-medium text-[#6B7280]">Due this week</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-10 text-xs text-slate-500">
            Loading matters…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10 text-xs text-slate-500">
            No active matters yet.
          </div>
        ) : (
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              aria-label={`Open ${row.title} in the watchtower queue`}
              onClick={() => goToRowInQueue(row)}
              className="group flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 px-5 py-3 text-left transition-colors select-none hover:bg-blue-50/60"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${row.dot}`} />

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tracking-wide ${row.badgeClass}`}
              >
                {row.badge}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-text !my-0 truncate text-sm font-semibold">{row.title}</p>
                  {/* The title says what to do, not which register it belongs to — the
                      entity type sits behind an info icon so the row stays uncluttered. */}
                  {row.task && (
                    <Tooltip title={getEntityTypeLabel(row.task.entityType)}>
                      <span className="flex shrink-0 items-center text-slate-400 transition-colors hover:text-slate-600">
                        <Info className="h-3.5 w-3.5" aria-label="Matter type" />
                      </span>
                    </Tooltip>
                  )}
                </div>
                <p className={PANEL_ROW_SUBTEXT_CLASS}>{row.sub}</p>
              </div>

              {/* Right-aligned in a fixed column so the tag edge nearest the chevron stays
                  straight, however long the due label is. */}
              <div className={`flex ${PANEL_TAG_COL} shrink-0 flex-col items-end gap-0.5`}>
                <span
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${row.tagClass}`}
                >
                  {row.tag}
                </span>
                {/* "Overdue" alone does not say how late — a relative day-count sits under the
                    pill, tinted to match it so the dot/badge/tag/subtext all read as one signal. */}
                {row.overdueSince && (
                  <span className="text-[10px] leading-3 font-semibold whitespace-nowrap text-rose-500">
                    {row.overdueSince}
                  </span>
                )}
                {/* The relative phrase alone doesn't say *which* date/time — the exact due
                    timestamp sits under it so both are visible at once. */}
                {row.dueDateTimeLabel && (
                  <span className="text-[10px] leading-3 font-medium whitespace-nowrap text-slate-400">
                    {row.dueDateTimeLabel}
                  </span>
                )}
              </div>

              <span className={ROW_OPEN_BUTTON} aria-hidden>
                <FileTextIcon className={ROW_OPEN_ICON} />
              </span>
            </button>
          ))
        )}
      </div>

      {extraMattersCount > 0 && (
        <div className="border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={goToQueue}
            className="inline-flex items-center gap-1.5 !text-xs font-medium !text-slate-500 transition-colors hover:!text-slate-700"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />+{extraMattersCount} more matters
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

WatchtowerPanel.displayName = 'WatchtowerPanel';
