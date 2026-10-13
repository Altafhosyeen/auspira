'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { ChevronRight, FileTextIcon, Users } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import type React from 'react';
import { ProjectAlertType } from '@/constants/enum.constant';
import { ROW_OPEN_BUTTON, ROW_OPEN_ICON } from '@/constants/list-page.constants';
import {
  BADGE_TONE_CLASS,
  PANEL_BADGE_COL,
  PANEL_DATE_COL,
  PANEL_ROW_SUBTEXT_CLASS,
  PANEL_SUBTITLE_CLASS,
  PANEL_TITLE_CLASS,
} from '@/constants/org-dashboard.constants';
import { AWARENESS_LIST_PATH, getAlertDetailHref } from '@/lib/utils/org-dashboard.utils';
import type { SignalRow } from '@/types/dashboard/org-dashboard.types';

export interface AwarenessPanelProps {
  totalAlertsCount: number;
  isLoading: boolean;
  signals: SignalRow[];
}

const PREVIEW_ROW_LIMIT = 4;

export const AwarenessPanel: React.FC<AwarenessPanelProps> = ({
  totalAlertsCount,
  isLoading,
  signals,
}) => {
  const router = useRouter();

  const previewSignals = signals.slice(0, PREVIEW_ROW_LIMIT);
  const remainingCount = Math.max(totalAlertsCount - previewSignals.length, 0);

  return (
    <motion.div
      className="flex min-h-[378px] flex-col overflow-hidden rounded-[12px] border border-slate-200/90 bg-white shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.38 }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <InfoCircleOutlined className="text-[15px] text-blue-500" />
          </span>
          <div>
            <p className={PANEL_TITLE_CLASS}>Awareness</p>
            <p className={PANEL_SUBTITLE_CLASS}>Latest Awareness and updates across the project.</p>
          </div>
        </div>
        <Button
          type="default"
          size="small"
          onClick={() => router.push(AWARENESS_LIST_PATH)}
          className="!h-7 !rounded-lg !border-slate-200 !bg-white !px-3 !text-xs !font-medium !text-slate-500 !shadow-none hover:!border-slate-300 hover:!bg-slate-50"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </div>

      <div className="border-b border-slate-100" />

      <div className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-10 text-xs text-slate-500">
            Loading awareness…
          </div>
        ) : previewSignals.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10 text-xs text-slate-500">
            No awareness yet.
          </div>
        ) : (
          previewSignals.map((sig) => (
            <button
              key={sig.id}
              type="button"
              onClick={() => router.push(getAlertDetailHref(sig.alertType, sig.id))}
              className="group flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 px-5 py-3 text-left transition-colors hover:bg-blue-50/60"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${sig.urgent ? 'bg-red-500' : 'bg-blue-500'}`}
              />

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
                {sig.icon}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-text !my-0 truncate text-sm font-semibold">{sig.title}</p>
                <p className={PANEL_ROW_SUBTEXT_CLASS}>{sig.source}</p>
              </div>

              {/* Fixed-width columns: badge labels and dates vary in length, so without a set
                  width every row's badge starts at a different x and the list reads as ragged. */}
              <div className={`flex ${PANEL_BADGE_COL} shrink-0 justify-start`}>
                {sig.alertType !== ProjectAlertType.Meeting && (
                  <span
                    title={sig.typeFullLabel}
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${BADGE_TONE_CLASS[sig.typeTone]}`}
                  >
                    <sig.TypeIcon className="h-3 w-3 shrink-0" />
                    {sig.typeLabel}
                  </span>
                )}
              </div>

              <div className={`${PANEL_DATE_COL} shrink-0 text-right`}>
                <p className="text-text !my-0 text-xs font-semibold whitespace-nowrap">{sig.day}</p>
                <p className="!my-0 text-xs whitespace-nowrap text-slate-500">{sig.time}</p>
              </div>

              <span className={ROW_OPEN_BUTTON} aria-hidden>
                <FileTextIcon className={ROW_OPEN_ICON} />
              </span>
            </button>
          ))
        )}
      </div>

      {remainingCount > 0 && (
        <div className="border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={() => router.push(AWARENESS_LIST_PATH)}
            className="inline-flex items-center gap-1.5 !text-xs font-medium !text-slate-500 transition-colors hover:!text-slate-700"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />+{remainingCount} more awareness
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

AwarenessPanel.displayName = 'AwarenessPanel';
