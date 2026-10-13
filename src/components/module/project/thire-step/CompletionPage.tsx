import { Button } from 'antd';
import { useParams } from 'next/navigation';

import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useRef } from 'react';
import { useCompleteOnboarding } from '@/hooks/modules/project';

// ==========================================
// UTILITY SVG ICONS
// ==========================================
const CheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
const CompletionPage = ({ isActive = true }: { isActive?: boolean }) => {
  const router = useRouter();
  const params = useParams();
  const rawId = typeof params?.id === 'string' ? params.id : undefined;
  // Skip the placeholder route id used while a project is still being created.
  const projectId = rawId && rawId !== 'new' ? rawId : undefined;

  const { mutate: completeOnboarding } = useCompleteOnboarding();

  // Mark the project's onboarding as complete (and activate it) the moment the
  // user lands on Stage D. Guarded so it fires only once per project.
  const completedRef = useRef(false);
  useEffect(() => {
    if (!isActive || !projectId || completedRef.current) return;
    completedRef.current = true;
    completeOnboarding({ projectId });
  }, [isActive, projectId, completeOnboarding]);

  const logItems = [
    {
      title: 'Contract Registry created',
      description: 'Secure vault initialized.',
    },
    {
      title: 'Legal snapshot created',
      description: 'Baseline compliance verified.',
    },
    {
      title: 'CCA/OCA activated',
      description: 'Analysis models deployed.',
    },
  ];

  return (
    <div className="mx-auto w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      {/* C • Completion Section Header */}

      {/* Centered Configuration Setup Card */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:p-6">
          <div className="flex flex-col items-center text-center">
            {/* Top Badge Success Circle */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
              <CheckIcon className="h-5 w-5" />
            </div>

            {/* Title & Subtitle */}
            <h2 className="heading-section mt-4">Setup Complete</h2>
            <p className="ds-caption! mt-2 max-w-xs text-slate-500">
              Your project environment has been successfully configured and is ready for use.
            </p>

            {/* Active Project Pill */}
            <div className="bg-main-p ds-micro! mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold! tracking-wider text-white uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Active Project
            </div>
          </div>

          {/* System Activation Log Panel */}
          <div className="bg-surface-subtle mt-6 rounded-xl border border-blue-100 p-4 text-left">
            <span className="ds-micro! mb-3 block font-bold! tracking-wider text-slate-700 uppercase">
              System Activation Log
            </span>

            <div className="space-y-4">
              {logItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    idx < logItems.length - 1 ? 'border-b border-blue-50/80 pb-3' : ''
                  }`}
                >
                  {/* Milestones Log Check circle */}
                  <div className="text-main-p mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-blue-50">
                    <CheckIcon className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="ds-caption! text-text font-bold!">{item.title}</h4>
                    <p className="ds-micro! font-medium! text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call-to-action Button */}
          <div className="mt-6">
            <Button
              onClick={() => router.push('/')}
              className="bg-main-p! ds-caption! hover:bg-main-p/90! focus:ring-main-p/40 w-full rounded-lg py-2.5 font-bold! tracking-wide text-white! transition focus:ring-2 focus:outline-hidden"
            >
              Go to Dashboard
            </Button>
          </div>

          {/* Optional Back / Start Over link */}
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
