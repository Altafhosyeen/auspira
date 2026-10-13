'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useIsMutating } from '@tanstack/react-query';
import { CheckCircleFilled } from '@ant-design/icons';
import { useProjectDocuments } from '@/hooks/modules/useProjectDocuments';
import {
  useGetPrimaveraComparison,
  AI_EXTRACT_MUTATION_KEY,
  AI_EXTRACT_PRIMAVERA_MUTATION_KEY,
} from '@/hooks/modules/project';
import { REQUIRED_DOCS } from '@/constants/project.constants';
import { ContractDocumentType } from '@/lib/utils/document.type.code';
import PageX from '@/components/shared/PageX';
import CreateProject from '@/components/module/project/first-step/CreateProject';
import ReviewUploadedDocuments from '@/components/module/project/first-step/UploadedDocumentPreview';
import ExecuteStagContract from '@/components/module/project/first-step/ExecuteStagContract';
import ProgrammeIngestion from '@/components/module/project/second-step/ProgramIngestion';
import { mapProgrammeJson } from '@/components/module/project/second-step/programme-ingestion/mapProgrammeJson';
import type { ApiPrimaveraComparison } from '@/components/module/project/second-step/programme-ingestion/types';
import CrossReference from '@/components/module/project/third-step/CrossReference';
import CompletionPage from '@/components/module/project/thire-step/CompletionPage';
import WorkflowProgressBar from './workflow/WorkflowProgressBar';
import { useWorkflowNavigation } from './workflow/useWorkflowNavigation';
import { useWorkflowProgress } from './workflow/useWorkflowProgress';

// Teal 12-spoke spinner (the classic fading-spoke loader) used in the extraction badge.
function ExtractingSpinner() {
  return (
    <span className="inline-flex h-3.5 w-3.5 animate-spin" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-full w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={`spoke-${i * 30}`}
            x="11"
            y="1.5"
            width="2"
            height="6"
            rx="1"
            fill="currentColor"
            opacity={(i + 1) / 12}
            transform={`rotate(${i * 30} 12 12)`}
          />
        ))}
      </svg>
    </span>
  );
}

// Heading pill showing extraction progress: an "info" spinner + "x/N extracted · y left" while any
// document is still being extracted, then a "success" N/N extracted" once complete.
function ExtractionBadge({ done, total }: { done: number; total: number }) {
  if (done < total) {
    return (
      <span className="badge-info border-badge-info/20 ds-caption! inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold!">
        <ExtractingSpinner />
        {done}/{total} extracted · {total - done} left
      </span>
    );
  }
  return (
    <span className="badge-success border-badge-success/20 ds-caption! inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold!">
      <CheckCircleFilled className="ds-caption!" />
      {total}/{total} extracted
    </span>
  );
}

export default function ProjectWorkflow() {
  const {
    mainStep,
    stepOneView,
    pageHeading,
    pageHeadingSteps,
    stepOneDescription,
    setMainStep,
    goToNextStepOneView,
    goBackFromStepOneView,
    goBackFromStepTwo,
    goBackFromStepThree,
  } = useWorkflowNavigation();

  const progressPercent = useWorkflowProgress(mainStep);

  const params = useParams();
  const projectId = typeof params?.id === 'string' ? params.id : undefined;
  // ProjectWorkflow is the single always-mounted owner of the documents poll — every step
  // component reads the same shared query cache, so only this one drives the refetch interval.
  const { uploadedDocuments, rawDocsMap } = useProjectDocuments({ projectId, poll: true });

  // True the instant the Extract button is clicked (mutation in flight) — before the backend's
  // `isAIExtractionTriggered` flag comes back — so the heading loader activates immediately.
  const isExtractingContracts = useIsMutating({ mutationKey: AI_EXTRACT_MUTATION_KEY }) > 0;
  const isExtractingProgramme =
    useIsMutating({ mutationKey: AI_EXTRACT_PRIMAVERA_MUTATION_KEY }) > 0;

  // --- Stage A (contracts): count the 8 required documents ---
  // Each is uploaded first, then — once the user triggers extraction — has its JSON extracted
  // asynchronously. Show how many of the 8 still have their JSON "coming". `triggered` tells us
  // extraction has actually started.
  const { total, extracted, triggered } = useMemo(() => {
    const matchRequired = (rd: (typeof REQUIRED_DOCS)[number]) =>
      uploadedDocuments.find((d) => String(d.documentType ?? d.id) === String(rd.id));
    const total = REQUIRED_DOCS.length;
    const extracted = REQUIRED_DOCS.filter((rd) => !!matchRequired(rd)?.jsonData).length;
    const triggered = REQUIRED_DOCS.some((rd) => !!matchRequired(rd)?.isAIExtractionTriggered);
    return { total, extracted, triggered };
  }, [uploadedDocuments]);

  // --- Stage B (programme ingestion): a single Primavera programme document ---
  // ProgrammeIngestion (always mounted) drives the primavera-comparison polling; we read the same
  // deduped query here purely to reflect its extraction status in the heading.
  const programmeDoc = rawDocsMap.get(String(ContractDocumentType.Primavera));
  const programmeTriggered = !!programmeDoc?.isAIExtractionTriggered;
  const { data: primaveraComparison } = useGetPrimaveraComparison<ApiPrimaveraComparison>({
    projectId: projectId ?? '',
    // Badge is only shown on Stage B — only fetch there so the API isn't hit on earlier stages.
    enabled: !!projectId && projectId !== 'new' && mainStep === 1,
  });
  const programmeExtracted = useMemo(() => {
    const accepted = primaveraComparison?.acceptedProgramme;
    const mapped = accepted ? mapProgrammeJson(accepted.jsonData) : null;
    return (
      !!mapped &&
      (mapped.stats.length > 0 ||
        mapped.keyDates.length > 0 ||
        mapped.criticalPath.length > 0 ||
        mapped.progress.length > 0 ||
        mapped.healthAlerts.length > 0 ||
        mapped.extractedValues.length > 0)
    );
  }, [primaveraComparison]);

  // Heading badge for the current stage — shown once extraction is triggered (or the moment the
  // Extract button is clicked, while the mutation is in flight, so the loader is instant).
  // Stage A: first two sub-steps (1. Create Project, 2. Review Documents). Stage B: programme.
  const headingBadge =
    mainStep === 0 && stepOneView <= 1 && (triggered || isExtractingContracts) ? (
      <ExtractionBadge done={extracted} total={total} />
    ) : mainStep === 1 && (programmeTriggered || isExtractingProgramme) ? (
      <ExtractionBadge done={programmeExtracted ? 1 : 0} total={1} />
    ) : undefined;

  const headingInfo =
    pageHeadingSteps.length > 0 ? (
      <div className="max-w-xs py-1">
        <p className="ds-caption! mb-1.5 font-semibold! tracking-wide text-white/70 uppercase">
          What to do here
        </p>
        <ol className="my-0 flex list-none flex-col gap-1.5 pl-0">
          {pageHeadingSteps.map((step, index) => (
            <li key={index} className="ds-body! flex gap-2">
              <span className="ds-micro! mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 font-bold!">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    ) : undefined;

  return (
    <PageX
      heading={pageHeading}
      headingInfo={headingInfo}
      headingExtra={headingBadge}
      // className="gap-4"
      subheading={stepOneDescription}
      scrollClassName="h-full"
      stickyHeader
      stickyContent={<WorkflowProgressBar mainStep={mainStep} progressPercent={progressPercent} />}
      scrollResetKey={`${mainStep}-${stepOneView}`}
    >
      {/* Stage A: Project Basic & Contracts — kept mounted to preserve form state */}
      <div className={mainStep === 0 ? 'block' : 'hidden'}>
        <div className={stepOneView === 0 ? 'block' : 'hidden'}>
          <CreateProject onComplete={goToNextStepOneView} onBack={undefined} />
        </div>
        <div className={stepOneView === 1 ? 'block' : 'hidden'}>
          <ReviewUploadedDocuments
            onBack={goBackFromStepOneView}
            onComplete={goToNextStepOneView}
            isActive={mainStep === 0 && stepOneView === 1}
          />
        </div>
        <div className={stepOneView === 2 ? 'block' : 'hidden'}>
          <ExecuteStagContract
            onBack={goBackFromStepOneView}
            onComplete={goToNextStepOneView}
            isActive={mainStep === 0 && stepOneView === 2}
          />
        </div>
      </div>

      {/* Stage B: Programme Ingestion */}
      <div className={mainStep === 1 ? 'block' : 'hidden'}>
        <ProgrammeIngestion
          onBack={goBackFromStepTwo}
          onComplete={() => setMainStep(2)}
          isActive={mainStep === 1}
        />
      </div>

      {/* Stage C: Cross Reference */}
      <div className={mainStep === 2 ? 'block' : 'hidden'}>
        <CrossReference
          onBack={goBackFromStepThree}
          onComplete={() => setMainStep(3)}
          isActive={mainStep === 2}
        />
      </div>

      {/* Stage D: Completion */}
      <div className={mainStep === 3 ? 'block' : 'hidden'}>
        <CompletionPage isActive={mainStep === 3} />
      </div>
    </PageX>
  );
}
