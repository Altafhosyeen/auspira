'use client';

import { CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip } from 'antd';
import React from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useGetRiskReductionMeetingsByEarlyWarningId } from '@/hooks/modules/risk-reduction-meeting';
import RiskReductionMeetingDetailModal from './RiskReductionMeetingDetailModal';
import { RRM_COPY } from './risk-reduction-meeting.data';
import { toRrmRows } from './risk-reduction-meeting.map';

const EM_DASH = '—';

/**
 * Meetings recorded against one early warning.
 *
 * Owns its own query rather than taking rows as a prop — React Query dedupes it against any other
 * caller using the same key, so mounting this alongside the rest of the RRM screen costs no extra
 * request. Pagination is off: an EW carries a handful of meetings at most.
 */
const RiskReductionMeetingTable = ({ earlyWarningId }: { earlyWarningId: string }) => {
  const [selectedMeetingId, setSelectedMeetingId] = React.useState<string | null>(null);

  // The hook skips the request while the id is empty, so the URL is never built with an
  // undefined segment.
  const { data, isLoading } = useGetRiskReductionMeetingsByEarlyWarningId({
    earlyWarningId,
  });

  const rows = React.useMemo(() => toRrmRows(data), [data]);

  return (
    <div className="mb-2">
      {isLoading ? (
        <div className="space-y-2!">
          {['a', 'b'].map((skeletonKey) => (
            <div
              key={`rrm-skeleton-${skeletonKey}`}
              className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 shadow-[0_1.6px_3.6px_rgba(0,0,0,0.11),0_0.3px_0.9px_rgba(0,0,0,0.07)]"
            >
              <Skeleton avatar active paragraph={{ rows: 2 }} title />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarOutlined className="text-lg text-slate-700" />}
          title="No meetings yet"
          description={RRM_COPY.meetingsTableEmpty}
        />
      ) : (
        <div className="space-y-3!">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedMeetingId(row.id)}
              className="w-full overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.11),0_0.3px_0.9px_rgba(0,0,0,0.07)] transition-colors hover:bg-[#f9f9f9]"
            >
              <div className="flex items-start gap-3 px-4 py-3 text-left">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F2E4C] text-[15px] text-white">
                  <CalendarOutlined />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 truncate text-[14px] font-semibold text-[#242424]">
                    <span>{row.date}</span>
                    {row.clauseNumber && (
                      <span className="badge-success border-badge-success-soft ds-micro flex items-center gap-1 rounded border px-2 py-0.5 font-mono font-bold tracking-wider">
                        Cl. {row.clauseNumber}
                        {row.clauseDescription !== EM_DASH && (
                          <Tooltip title={row.clauseDescription}>
                            <InfoCircleOutlined className="cursor-help opacity-70" />
                          </Tooltip>
                        )}
                      </span>
                    )}
                  </p>
                  <p className="line-clamp-2 text-[12px] leading-snug text-[#616161]">
                    {row.summary}
                  </p>
                </div>

                {/* <div className="flex shrink-0 flex-col items-end gap-1.5 pl-2">
                  <span className="text-[12px] whitespace-nowrap text-[#616161]">
                    {row.actionsTotal === 0
                      ? 'No actions'
                      : `${row.actionsCompleted}/${row.actionsTotal} actions`}
                  </span>
                </div> */}
              </div>
            </button>
          ))}
        </div>
      )}

      <RiskReductionMeetingDetailModal
        riskReductionMeetingId={selectedMeetingId}
        earlyWarningId={earlyWarningId}
        onClose={() => setSelectedMeetingId(null)}
      />
    </div>
  );
};

export default RiskReductionMeetingTable;
