import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from 'nextjs-toploader/app';
import {
  MAIN_STAGES,
  PAGE_HEADINGS,
  PAGE_HEADING_STEPS,
  STEP_ONE_VIEWS,
} from './workflow.constants';

export interface WorkflowNavigation {
  mainStep: number;
  stepOneView: number;
  progressPercent: number;
  pageHeading: string;
  pageHeadingSteps: string[];
  stepOneDescription: string;
  totalStages: number;
  setMainStep: (step: number) => void;
  goToNextStepOneView: () => void;
  goBackFromStepOneView: () => void;
  goBackFromStepTwo: () => void;
  goBackFromStepThree: () => void;
  restartWorkflow: () => void;
}

export function useWorkflowNavigation(): WorkflowNavigation {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialMainStep = Number(searchParams.get('mainStep') ?? '0') || 0;
  const initialStepOneView = Number(searchParams.get('stepOneView') ?? '0') || 0;

  const [mainStep, setMainStep] = useState(initialMainStep);
  const [stepOneView, setStepOneView] = useState(initialStepOneView);

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // `router` (from nextjs-toploader/app) and `pathname` are read through refs so they don't sit in
  // the effect's dependency array. The toploader `useRouter()` returns a NEW object every render;
  // if it were a dependency, the effect would fire on every render, call `router.replace()`, trigger
  // an RSC navigation, re-render with a fresh router reference, and loop forever.
  const routerRef = useRef(router);
  routerRef.current = router;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Keep the URL in sync so back/forward navigation restores the correct step. Runs only when the
  // step state actually changes, and no-ops when the URL already matches — so it never re-navigates
  // to the URL it's already on.
  useEffect(() => {
    const current = searchParamsRef.current;
    if (
      current.get('mainStep') === String(mainStep) &&
      current.get('stepOneView') === String(stepOneView)
    ) {
      return;
    }
    const params = new URLSearchParams(current.toString());
    params.set('mainStep', String(mainStep));
    params.set('stepOneView', String(stepOneView));
    routerRef.current.replace(`${pathnameRef.current}?${params.toString()}`, { scroll: false });
  }, [mainStep, stepOneView]);

  const progressPercent = useMemo(() => {
    if (mainStep === 0) return Math.round(((stepOneView + 0) / 4) * 25);
    if (mainStep === 1) return 50;
    if (mainStep === 2) return 75;
    return 100;
  }, [mainStep, stepOneView]);

  const pageHeading = useMemo(() => {
    const entry = PAGE_HEADINGS[mainStep];
    return typeof entry === 'function' ? entry(stepOneView) : (entry ?? '');
  }, [mainStep, stepOneView]);

  const pageHeadingSteps = useMemo(() => {
    const entry = PAGE_HEADING_STEPS[mainStep];
    return typeof entry === 'function' ? entry(stepOneView) : (entry ?? []);
  }, [mainStep, stepOneView]);

  const stepOneDescription = STEP_ONE_VIEWS[stepOneView]?.description ?? '';

  const goToNextStepOneView = () => {
    setStepOneView((current) => {
      if (current < STEP_ONE_VIEWS.length - 1) return current + 1;
      setMainStep(1);
      return current;
    });
  };

  const goBackFromStepOneView = () => setStepOneView((current) => Math.max(0, current - 1));
  const goBackFromStepTwo = () => setMainStep(0);
  const goBackFromStepThree = () => setMainStep(1);
  const restartWorkflow = () => {
    setMainStep(0);
    setStepOneView(0);
  };

  return {
    mainStep,
    stepOneView,
    progressPercent,
    pageHeading,
    pageHeadingSteps,
    stepOneDescription,
    totalStages: MAIN_STAGES.length,
    setMainStep,
    goToNextStepOneView,
    goBackFromStepOneView,
    goBackFromStepTwo,
    goBackFromStepThree,
    restartWorkflow,
  };
}
