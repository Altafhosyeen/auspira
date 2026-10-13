'use client';

import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip } from 'antd';
import { useParams } from 'next/navigation';
import { useGetEarlyWarningAuditTrail } from '@/hooks/modules/early-warning';
import { parseBackendDate } from '@/lib/utils';
import EarlyWarningAfterMeetingCard from './EarlyWarningAfterMeetingCard';
import { AUDIT_TRAIL_TITLE } from './early-warning-detail.data';

/** "2026-07-30T20:33:38.808Z" -> { date: "30 Jul 2026", time: "20:33" }. Empty strings for bad input. */
const splitDateTime = (value: string): { date: string; time: string } => {
  const parsed = parseBackendDate(value);
  if (!parsed) return { date: '', time: '' };
  return {
    date: parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: parsed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
};

// `actionType`/`stage` come back as enum names (e.g. "Created", "EarlyWarningMeeting") — mirrors
// `EarlyWarningAuditActionType` / `EwLifecycleStage` in constants/enum.constant.ts. Casing isn't
// guaranteed, so labels are looked up lowercased and fall back to the raw value.

export default function EarlyWarningAuditTrailTab({ closed }: { closed?: boolean }) {
  const params = useParams();
  const earlyWarningId = String(params?.id ?? '');

  const { data: auditTrail = [], isLoading } = useGetEarlyWarningAuditTrail({
    id: earlyWarningId,
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm">
          <h3 className="heading-card border-b border-slate-100 p-5">{AUDIT_TRAIL_TITLE}</h3>

          {isLoading ? (
            <div className="p-5">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : auditTrail.length === 0 ? (
            <p className="px-5 py-6 text-[13px] text-slate-400">No audit trail entries yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditTrail.map((entry) => {
                const { date, time } = splitDateTime(entry.createdOn);
                const actor = entry.performedByUserFullName;
                return (
                  <div key={entry.id} className="flex items-start gap-4 px-5 py-4">
                    <div className="flex w-36 shrink-0 items-baseline gap-2 text-[11px] font-medium text-slate-400">
                      <span>{date}</span>
                      <span className="text-slate-300">·</span>
                      <span>{time}</span>
                    </div>
                    <Tooltip title={entry.sender ? `From email — ${entry.sender}` : 'Auspira user'}>
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        {entry.sender ? (
                          <MailOutlined className="text-[10px]" />
                        ) : (
                          <UserOutlined className="text-[10px]" />
                        )}
                      </span>
                    </Tooltip>
                    <div className="text-[13px] leading-relaxed">
                      <span className="font-bold text-slate-800">{actor}</span>
                      {entry.details ? (
                        <span className="text-slate-500"> — {entry.details}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4! lg:col-span-1">
        <EarlyWarningAfterMeetingCard earlyWarningId={earlyWarningId} closed={closed} />
      </div>
    </div>
  );
}
