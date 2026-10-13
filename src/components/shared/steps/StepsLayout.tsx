'use client';

import { Button } from 'antd';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import React, { type ReactNode } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';

export interface RegistrationStep {
  title: string;
  description?: string;
}

interface StepsLayoutProps {
  title?: string;
  subtitle?: string;
  steps?: RegistrationStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  children?: ReactNode;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextLoading?: boolean;
  previousLoading?: boolean;
  info?: string;
  description?: string;
}

const StepsLayout: React.FC<StepsLayoutProps> = ({
  steps,
  currentStep,
  onStepChange,
  onPrevious,
  onNext,
  children,
  isFirstStep = false,
  isLastStep = false,
  nextLoading = false,
  previousLoading = false,
  description,
  info,
}) => {
  const handlePreviousClick = () => {
    if (onPrevious) {
      onPrevious();
      return;
    }

    if (typeof currentStep === 'number' && onStepChange) {
      onStepChange(Math.max(0, currentStep - 1));
    }
  };

  const handleNextClick = () => {
    if (onNext) {
      onNext();
      return;
    }

    if (typeof currentStep === 'number' && onStepChange) {
      const lastStepIndex = Math.max(0, (steps?.length ?? 1) - 1);
      onStepChange(Math.min(lastStepIndex, currentStep + 1));
    }
  };

  return (
    <>
      {/* Card Container */}
      {/* Steps Navigation */}
      <div className="px-6 pt-4 pb-3">
        <p className="text-center">
          {info && (
            <span className="text-center! text-xl! font-semibold! text-[#1e3a5f]">{info}</span>
          )}
          <br />
          {description && <span className="text-sm text-gray-600">{description}</span>}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          {steps?.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = typeof currentStep === 'number' && index < currentStep;
            return (
              <React.Fragment key={step.title}>
                <div
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${
                    isActive ? 'bg-[#E5EEFF]' : ''
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                      isActive || isDone ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : index + 1}
                  </span>
                  <span
                    className={`text-sm transition-colors ${
                      isActive
                        ? 'font-semibold text-[#1e3a5f]'
                        : isDone
                          ? 'font-medium text-[#1e3a5f]'
                          : 'font-medium text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < (steps?.length ?? 1) - 1 && (
                  <ChevronRight size={18} className={isDone ? 'text-[#1e3a5f]' : 'text-gray-300'} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content Area */}

      <div className="px-6 pt-2 pb-4">{children}</div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <DisabledTooltip
          disabled={isFirstStep}
          reason="This is the first step — there's nothing before it."
        >
          <Button onClick={handlePreviousClick} disabled={isFirstStep} loading={previousLoading}>
            Previous
          </Button>
        </DisabledTooltip>

        <Button
          type="primary"
          onClick={handleNextClick}
          loading={nextLoading}
          icon={<ArrowRight size={16} />}
          iconPosition="end"
        >
          {isLastStep ? 'Create' : 'Next'}
        </Button>
      </div>
    </>
  );
};

export default StepsLayout;
