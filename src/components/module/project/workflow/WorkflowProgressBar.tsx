'use client';

import { Progress } from 'antd';
import { ACCENT_GRADIENT } from '@/constants/theme.constants';
import { MAIN_STAGES } from './workflow.constants';

interface WorkflowProgressBarProps {
  mainStep: number;
  progressPercent: number;
}

export default function WorkflowProgressBar({
  mainStep,
  progressPercent,
}: WorkflowProgressBarProps) {
  // Color each stage label based on the actual progress percent so the labels
  // stay consistent with the bar (e.g. at 100% all stages are highlighted).
  // Highlight the stage the user is on (mainStep) plus any stage the percent has
  // already fully completed (each stage = an equal slice of 100%).
  const stageCount = MAIN_STAGES.length;
  const sliceSize = 100 / stageCount;
  const completedByPercent = Math.floor(progressPercent / sliceSize) - 1;
  const reachedIndex = Math.min(stageCount - 1, Math.max(mainStep, completedByPercent));

  return (
    <div className="-mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-center">
        {MAIN_STAGES.map((stage, index) => (
          <div key={stage.id} className="flex">
            <span
              className={`ds-caption! font-bold! tracking-wider transition-all duration-200 ${
                index <= reachedIndex
                  ? 'bg-gradient-to-r from-(--ds-accent-gradient-from) to-(--ds-accent-gradient-to) bg-clip-text text-transparent'
                  : 'cursor-not-allowed text-slate-700 select-none'
              }`}
            >
              {stage.id} · {stage.title}
            </span>
          </div>
        ))}
      </div>

      <Progress
        percent={progressPercent}
        showInfo={false}
        size={{ height: 5 }}
        strokeColor={{ '0%': ACCENT_GRADIENT.from, '100%': ACCENT_GRADIENT.to }}
        className="my-0! leading-none!"
      />

      <div className="flex items-center justify-between">
        <span className="ds-caption! font-medium! text-slate-500">
          {reachedIndex + 1} of {MAIN_STAGES.length} stages complete
        </span>
        <span className="ds-body! font-semibold! text-slate-700">{progressPercent}%</span>
      </div>
    </div>
  );
}
