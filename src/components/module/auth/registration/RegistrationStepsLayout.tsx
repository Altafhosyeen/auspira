'use client';
import React, { ReactNode } from 'react';
import Image from 'next/image';
import StepsLayout, { RegistrationStep } from '@/components/shared/steps/StepsLayout';

export type { RegistrationStep };

interface RegistrationStepsLayoutProps {
  title: string;
  subtitle?: string;
  steps: RegistrationStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  children: ReactNode;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextLoading?: boolean;
  previousLoading?: boolean;
  info?: string;
  description?: string;
}

const RegistrationStepsLayout: React.FC<RegistrationStepsLayoutProps> = ({
  title,
  subtitle,
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
}) => {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* ---------------------------------- logo ---------------------------------- */}
      <Image
        src="/assets/images/logo-nobg.png"
        alt="Auspira Logo"
        width={200}
        height={200}
        className="mx-auto block"
      />
      {/* Header */}
      <div className="mt-4 text-center">
        <h1 className="heading-page my-0">{title}</h1>
        <p className="mt-2 text-gray-600">{subtitle}</p>
      </div>

      {/* Card Container */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <StepsLayout
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
          onPrevious={onPrevious}
          onNext={onNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          nextLoading={nextLoading}
          previousLoading={previousLoading}
          info={'Create Your Organisation  Account'}
          // description={'Set up your organisation account to get started with Auspira'}
        >
          {children}
        </StepsLayout>
      </div>
    </div>
  );
};

export default RegistrationStepsLayout;
