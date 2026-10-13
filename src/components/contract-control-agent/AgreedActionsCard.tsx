'use client';

import { CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import { RRM_CARD as CARD, RRM_COPY } from './risk-reduction-meeting.data';
import type { RrmDetailAction } from './risk-reduction-meeting.map';

const EM_DASH = '—';

/** The agreed-action tracker from the Risk Reduction Meeting screen: a completion bar over one
 * row per action. Read-only — completion is recorded elsewhere. */
export default function AgreedActionsCard({ actions }: { actions: RrmDetailAction[] }) {
  const totalActions = actions.length;
  const completedCount = actions.filter((a) => a.checked).length;
  const progressPct = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
        <h3 className="heading-card">{RRM_COPY.agreedActionsTitle}</h3>
        <span className="ds-micro font-bold tracking-wider text-slate-400 uppercase">
          {completedCount} of {totalActions} {RRM_COPY.agreedActionsProgressSuffix} · {progressPct}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="bg-warning h-full rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="w-full divide-y divide-slate-100">
        {totalActions === 0 ? (
          <p className="py-3.5 text-sm text-slate-400">No agreed actions recorded yet.</p>
        ) : (
          actions.map((act) => {
            /* The mapper folds owner + role into one string — "Usman Tariq (Quantity
               Surveyor)" — so split it back apart to style name and role separately. */
            const assigneeMatch = act.assignee.match(/^(.*?)\s*\((.+)\)$/);
            const assigneeName = assigneeMatch ? assigneeMatch[1] : act.assignee;
            const assigneeRole = assigneeMatch?.[2];
            const hasAssignee = act.assignee !== EM_DASH;
            const hasDueDate = act.dueDate !== EM_DASH;

            return (
              <div
                key={act.id}
                className="flex w-full items-start justify-between gap-4 py-3.5 text-left"
              >
                <span className="flex min-w-0 items-start gap-2.5">
                  {act.checked ? (
                    <CheckCircleFilled className="text-success mt-0.5 text-base" />
                  ) : (
                    <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-200 bg-white" />
                  )}
                  <span
                    className={`text-sm font-medium ${act.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                  >
                    {act.label}
                  </span>
                </span>
                {(hasAssignee || hasDueDate) && (
                  <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                    {hasAssignee && (
                      <>
                        <span className="text-xs font-semibold text-slate-600">{assigneeName}</span>
                        {assigneeRole && (
                          <span className="text-[11px] text-slate-400">{assigneeRole}</span>
                        )}
                      </>
                    )}
                    {hasDueDate && (
                      <span className="ds-micro mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold whitespace-nowrap text-slate-500">
                        <CalendarOutlined className="text-[10px]" />
                        {act.dueDate}
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
