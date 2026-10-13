'use client';

import { Button } from 'antd';
import type React from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';

interface StepFooterNavProps {
  onBack?: () => void;
  onNext?: () => void;
  canProceed?: boolean;
  backLabel?: string;
  nextLabel?: string;
  nextLoading?: boolean;
  nextIcon?: React.ReactNode;
  hideBack?: boolean;
  hideNext?: boolean;
  backDisabled?: boolean;
  /** Slot for extra actions placed left of the Next button */
  extraActions?: React.ReactNode;
  className?: string;
  /** Shown on hover when backDisabled is true — the caller knows why, this component doesn't. */
  backDisabledReason?: React.ReactNode;
  /** Shown on hover when canProceed is false — the caller knows why, this component doesn't. */
  nextDisabledReason?: React.ReactNode;
}

export const StepFooterNav: React.FC<StepFooterNavProps> = ({
  onBack,
  onNext,
  canProceed = true,
  backLabel = 'Previous',
  nextLabel = 'Next',
  nextLoading = false,
  nextIcon,
  hideBack = false,
  hideNext = false,
  backDisabled = false,
  extraActions,
  className,
  backDisabledReason,
  nextDisabledReason,
}) => (
  <div
    className={`mt-6 flex items-center justify-between border-t border-slate-200 pt-4 ${className ?? ''}`}
  >
    {!hideBack ? (
      <DisabledTooltip disabled={backDisabled} reason={backDisabledReason}>
        <Button
          size="large"
          onClick={onBack}
          disabled={backDisabled}
          className="border-slate-300! text-slate-600!"
        >
          {backLabel}
        </Button>
      </DisabledTooltip>
    ) : (
      <div />
    )}

    <div className="flex items-center gap-3">
      {extraActions}
      {!hideNext && (
        <DisabledTooltip disabled={!canProceed} reason={nextDisabledReason}>
          <Button
            type="primary"
            size="large"
            icon={nextIcon}
            iconPosition="end"
            loading={nextLoading}
            onClick={onNext}
            disabled={!canProceed}
          >
            {nextLabel}
          </Button>
        </DisabledTooltip>
      )}
    </div>
  </div>
);

StepFooterNav.displayName = 'StepFooterNav';
