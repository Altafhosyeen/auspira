'use client';

import { useParams } from 'next/navigation';
import { EarlyWarningStatus } from '@/constants/enum.constant';
import EarlyWarningAfterMeetingCard from './EarlyWarningAfterMeetingCard';
import type { LifecycleStep, SummaryRow } from './early-warning-detail.data';
import { IMPACT_ICON } from './early-warning-detail.styles';

export default function EarlyWarningOverviewTab({
  summaryRows,
  lifecycleSteps,
  status,
}: {
  summaryRows: SummaryRow[];
  lifecycleSteps: LifecycleStep[];
  status?: EarlyWarningStatus;
}) {
  const params = useParams();
  const earlyWarningId = String(params?.id ?? '');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold!">Risk Summary</h3>

          <div className="ds-caption divide-y divide-slate-100 border-t border-slate-100">
            {summaryRows.map((row) => (
              <div key={row.label} className="grid grid-cols-12 items-start gap-4 py-4">
                <span className="col-span-3 font-medium text-slate-600">{row.label}</span>
                <div className="col-span-9">
                  {row.impacts ? (
                    <div className="flex gap-2">
                      {row.impacts.map((impact) => (
                        <span
                          key={impact.label}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${impact.wrapperClass}`}
                        >
                          {IMPACT_ICON[impact.icon]}
                          {impact.label}
                        </span>
                      ))}
                    </div>
                  ) : row.variant === 'description' ? (
                    <span className="block leading-relaxed font-bold wrap-break-word text-slate-800">
                      {row.value}
                    </span>
                  ) : (
                    <span className="font-bold wrap-break-word text-slate-800">{row.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-1">
        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
          <h4 className="heading-card mb-4">Lifecycle</h4>
          <div className="relative space-y-6 pl-6">
            <div className="absolute top-2 bottom-2 left-1.75 w-0.5 bg-slate-100" />

            {lifecycleSteps.map((step) => (
              <div key={step.title} className="relative -ml-6 flex items-start gap-3">
                <span
                  className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                    step.status === 'completed'
                      ? 'bg-success border-white'
                      : step.status === 'active'
                        ? 'bg-warning ring-warning/15 border-white ring-4'
                        : 'border-main-p bg-white'
                  }`}
                />

                <div className="space-y-0.5">
                  <h5
                    className={`text-xs font-bold ${step.status === 'upcoming' ? 'text-main-p' : 'text-slate-800'}`}
                  >
                    {step.title}
                    {/* {step.actor && <span className="text-slate-500"> {step.actor}</span>} */}
                  </h5>
                  <p
                    className={`text-[11px] font-medium ${
                      step.subtextHighlight ? 'text-warning font-bold' : 'text-slate-400'
                    }`}
                  >
                    {step.subtext}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="space-y-3 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800">{CE_GATE_COPY.title}</h4>
          <p className="text-xs leading-relaxed text-slate-400">{CE_GATE_COPY.body}</p>
          <button className="flex w-full items-center justify-center gap-1.5 rounded border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50">
            <span>{CE_GATE_COPY.action}</span>
            <RightOutlined className="text-[10px]" />
          </button>
        </div> */}

        <EarlyWarningAfterMeetingCard
          earlyWarningId={earlyWarningId}
          closed={status === EarlyWarningStatus.Closed}
          linkedToCE={lifecycleSteps.some(
            (step) => step.title === 'Link to CE' && step.status === 'completed'
          )}
        />
      </div>
    </div>
  );
}
