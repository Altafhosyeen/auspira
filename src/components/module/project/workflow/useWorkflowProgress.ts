'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGetProjectById, useGetDocumentsByProjectId } from '@/hooks/modules/project';

/**
 * Computes a progress percent (0-100) driven by real backend state for Stage A
 * and navigation position for Stages B-D.
 */
export function useWorkflowProgress(mainStep: number): number {
  const params = useParams();
  const projectId = params?.id as string | undefined;
  const isValidId = !!projectId && projectId !== 'new';

  const { data: projectData } = useGetProjectById({ id: projectId ?? '', enabled: isValidId });

  const { data: documentsData } = useGetDocumentsByProjectId({
    id: projectId ?? '',
    enabled: isValidId,
  });

  return useMemo(() => {
    // A completed onboarding is always 100%, regardless of the current step.
    if ((projectData as any)?.isOnboardingCompleted) return 100;

    if (mainStep === 1) return 50;
    if (mainStep === 2) return 75;
    if (mainStep === 3) return 100;

    // Stage A: incremental checkpoints (0 → 25%)
    const project = projectData as any;
    const docs = Array.isArray(documentsData) ? documentsData : [];

    const isExtracted = !!project?.isAIExtractionTriggered;
    const hasDocs = docs.length > 0;

    if (isExtracted) return 25;
    if (hasDocs) return 17;
    if (isValidId) return 8;
    return 0;
  }, [mainStep, projectData, documentsData, isValidId]);
}
