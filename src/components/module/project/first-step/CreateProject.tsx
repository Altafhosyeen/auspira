'use client';

import { CheckCircleFilled, ThunderboltOutlined } from '@ant-design/icons';
import { Button, notification, Skeleton, Tag } from 'antd';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useMemo, useState } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { StepFooterNav } from '@/components/shared/StepFooterNav';
import { MENU_PATH } from '@/constants';
import { REQUIRED_DOCS } from '@/constants/project.constants';
import {
  useAiExtract,
  useCreateProjectWithNameAndRef,
  useGetDocumentsByProjectId,
  useGetProjectById,
  useUpdateProjectBasic,
} from '@/hooks/modules/project';
import type { ProjectData, UploadedDocument } from '@/types/project/create.types';
import { CreateProjectForm } from './CreateProjectForm';
import { UploadDocumentsSection } from './UploadDocumentsSection';

interface CreateProjectProps {
  onComplete?: () => void;
  onBack?: () => void;
}

/** Row-shaped placeholder matching a single required-document tile (the `h-13` bordered row
 *  rendered by `DocumentUploadItem`). */
const DocRowSkeleton: React.FC = () => (
  <div className="flex h-13 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3">
    <Skeleton.Avatar active size={28} shape="square" className="rounded-md!" />
    <Skeleton.Input active size="small" className="h-3! w-32!" />
  </div>
);

/**
 * Mirrors the real page layout (ProjectFormCard's field row + UploadDocumentsSection's document
 * grid) so the initial project load reads as the same UI taking shape, rather than a generic
 * block of gray bars unrelated to what's about to render.
 */
const CreateProjectSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Project details card */}
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton.Avatar active size={20} shape="square" />
        <Skeleton.Input active size="small" className="h-4! w-40!" />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        {['w-24', 'w-32', 'w-28'].map((labelW) => (
          <div key={labelW} className="min-w-0 flex-1">
            <Skeleton.Input active size="small" className={`mb-1.5! h-3! ${labelW}!`} />
            <Skeleton.Input active block className="h-9! rounded-xl!" />
          </div>
        ))}
        <div className="mt-6 flex h-fit shrink-0 items-end gap-3">
          <Skeleton.Button active className="h-9! w-20! rounded-xl!" />
          <Skeleton.Button active className="h-9! w-20! rounded-xl!" />
        </div>
      </div>
    </div>

    {/* Documents card */}
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton.Avatar active size={20} shape="square" />
        <Skeleton.Input active size="small" className="h-4! w-44!" />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {REQUIRED_DOCS.map((doc) => (
          <DocRowSkeleton key={doc.id} />
        ))}
      </div>
    </div>
  </div>
);

export default function CreateProject({ onComplete, onBack }: CreateProjectProps) {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string | undefined;
  const isCreateNew = projectId === 'new';
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isEditing, setIsEditing] = useState(isCreateNew);
  const [isDocumentsValid, setIsDocumentsValid] = useState(false);
  const { mutateAsync: createProject, isPending: isCreatePending } =
    useCreateProjectWithNameAndRef();
  const {
    data: projectDetails,
    isSuccess,
    isLoading: isLoadingProject,
    refetch: refetchProject,
  } = useGetProjectById({
    id: !isCreateNew && projectId ? projectId : '',
    enabled: !isCreateNew && !!projectId,
  });

  const { mutateAsync: updateProject, isPending: isUpdatePending } = useUpdateProjectBasic();
  const isSaving = isCreatePending || isUpdatePending;

  // AI extraction trigger — moved here from the removed "Review Documents" step.
  // Now supports per-document extraction state tracking.
  const { mutateAsync: triggerExtract, isPending: isExtracting } = useAiExtract();

  const handleExtract = async () => {
    if (!projectId || projectId === 'new') return;
    try {
      await triggerExtract({ projectId });
      notification.success({ message: 'Extraction started successfully' });
      await refetchProject();
      // Move to the next step as soon as extraction has been kicked off.
      onComplete?.();
    } catch {
      notification.error({ message: 'Failed to start extraction' });
    }
  };

  // Shares the same React Query cache as UploadDocumentsSection (same query key), so this reads
  // the polled documents without firing an extra request.
  const { data: documentsProject, isLoading: isLoadingDocuments } = useGetDocumentsByProjectId<
    any[]
  >({
    id: !isCreateNew && projectId ? projectId : '',
    enabled: !isCreateNew && !!projectId,
    skipLoader: true,
  });

  // Track per-document upload and extraction state
  const documentStates = useMemo(() => {
    const mainDocs = Array.isArray(documentsProject)
      ? documentsProject.filter((doc: any) => !doc?.parentId)
      : [];

    const states = REQUIRED_DOCS.map((requiredDoc) => {
      const uploadedDoc = mainDocs.find(
        (doc: any) => requiredDoc.id === doc?.documentType || requiredDoc.id === doc?.id
      );
      return {
        id: requiredDoc.id,
        isUploaded: !!uploadedDoc,
        isExtractionTriggered: uploadedDoc?.isAIExtractionTriggered || false,
      };
    });

    return states;
  }, [documentsProject]);

  // Check if all required documents are uploaded
  const allRequiredUploaded = useMemo(
    () => documentStates.every((d) => d.isUploaded),
    [documentStates]
  );

  // Check if all uploaded required documents have extraction triggered
  const allUploadedRequiredExtracted = useMemo(
    () => documentStates.filter((d) => d.isUploaded).every((d) => d.isExtractionTriggered),
    [documentStates]
  );

  // Whether every uploaded Required document already carries its parsed `jsonData`.
  // Extraction is only truly *finished* once this is true — until then the documents API
  // is still being polled (5s interval in UploadDocumentsSection) for the result.
  const allRequiredHaveJsonData = useMemo(() => {
    const mainDocs = Array.isArray(documentsProject)
      ? documentsProject.filter((doc: any) => !doc?.parentId)
      : [];
    const requiredUploaded = mainDocs.filter((doc: any) =>
      REQUIRED_DOCS.some((rd) => rd.id === doc?.documentType || rd.id === doc?.id)
    );
    if (requiredUploaded.length === 0) return false;
    return requiredUploaded.every((doc: any) => !!doc?.jsonData);
  }, [documentsProject]);
  const currentProjectData = useMemo(
    () => projectData ?? (isSuccess ? (projectDetails as ProjectData | null) : null),
    [projectData, isSuccess, projectDetails]
  );

  const handleSaveProject = async (data: ProjectData) => {
    if (currentProjectData?.id) {
      try {
        const updatedProject = await updateProject({
          id: currentProjectData.id,
          data: {
            id: currentProjectData.id,
            name: data.name,
            referenceId: data.referenceId,
            necForm: data.necForm,
          },
        });
        setProjectData(updatedProject as any);
        setIsEditing(false);
        notification.success({ message: 'Project updated successfully' });
      } catch (error) {
        console.error('Project update error:', error);
      }
    } else {
      try {
        const createdProject = await createProject({
          data: { name: data.name, referenceId: data.referenceId, necForm: data.necForm },
        });
        setProjectData(createdProject);
        setIsEditing(false);
        console.log(createdProject);
        router.push(MENU_PATH.PROJECTS.pathname + '/' + createdProject.projectId);

        notification.success({ message: 'Project created successfully' });
      } catch (error) {
        console.error('Project creation error:', error);
      }
    }
  };
  const handleEditProject = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  /**
   * Handle documents validation from UploadDocumentsSection
   * Tracks if required + option-specific documents are valid
   */
  const handleDocumentsValidation = useCallback(
    (_documents: UploadedDocument[], isValid: boolean) => {
      setIsDocumentsValid(isValid);
    },
    []
  );

  // ─── Computed Validation States ──────────────────────────────────────────

  /**
   * Project is considered saved when it has an ID
   */
  const isProjectSaved = currentProjectData && currentProjectData.id;

  /**
   * Extract button is enabled if:
   * - Project is saved
   * - Documents are valid (required + option-specific if option selected)
   * - Documents haven't already been extracted (no extraction triggered OR have new uploads)
   */
  const canExtract = !!isProjectSaved && isDocumentsValid && !allUploadedRequiredExtracted;

  /**
   * Can proceed to Next when:
   * - Project is saved
   * - Documents are valid (required docs + option-specific docs uploaded if option selected)
   * - All uploaded required documents have extraction triggered
   */
  const canProceedToNext = !!isProjectSaved && isDocumentsValid && allUploadedRequiredExtracted;

  /**
   * Extraction has been triggered for every uploaded Required document.
   */
  const isExtractionTriggered = allUploadedRequiredExtracted && allRequiredUploaded;

  /**
   * Extraction is actively in progress while the documents API is being polled:
   * either the trigger request is in flight, or extraction has been triggered but the
   * parsed `jsonData` has not yet come back.
   */
  const isExtractionProcessing =
    isExtracting || (isExtractionTriggered && !allRequiredHaveJsonData);

  /**
   * Show the "Extraction complete" badge only once the parsed data has actually arrived.
   */
  const isAllUploadedExtracted = isExtractionTriggered && allRequiredHaveJsonData;

  const isExtractDisabled = !canExtract || isExtractionProcessing;
  // Mirrors the precedence of `canExtract` / `isExtractionProcessing` above so the tooltip always
  // names the actual blocker.
  const extractDisabledReason = !isProjectSaved
    ? 'Save the project before extracting documents.'
    : !isDocumentsValid
      ? 'Upload all required documents before extracting.'
      : isExtractionProcessing
        ? 'Extraction is already in progress.'
        : allUploadedRequiredExtracted
          ? 'These documents have already been extracted.'
          : undefined;

  // Wait for BOTH the project details AND the documents list before dropping the skeleton — the
  // project query alone finishing first previously let UploadDocumentsSection mount and render its
  // empty "not uploaded" state for a beat before the documents query caught up and synced in the
  // real uploaded/extracted state.
  if (isLoadingProject || isLoadingDocuments) {
    return <CreateProjectSkeleton />;
  }
  return (
    <div className="space-y-4">
      <CreateProjectForm
        onBack={onBack}
        onSave={handleSaveProject}
        initialData={currentProjectData || undefined}
        isEditMode={isEditing}
        onEdit={handleEditProject}
        onCancel={handleCancelEdit}
        onComplete={onComplete}
        isLoading={isSaving}
      />

      <UploadDocumentsSection
        projectID={currentProjectData?.id}
        disabled={isCreateNew}
        onDocumentsValidation={handleDocumentsValidation}
      />

      <StepFooterNav
        onBack={onBack}
        hideBack={!onBack}
        backDisabled
        onNext={onComplete}
        canProceed={!!canProceedToNext}
        extraActions={
          <>
            {!isExtractionProcessing && isAllUploadedExtracted && (
              <Tag
                icon={<CheckCircleFilled />}
                color="success"
                className="ds-caption! flex items-center gap-1 px-3 py-1 font-semibold!"
              >
                Extraction complete
              </Tag>
            )}
            <DisabledTooltip disabled={isExtractDisabled} reason={extractDisabledReason}>
              <Button
                icon={<ThunderboltOutlined />}
                loading={isExtracting}
                disabled={isExtractDisabled}
                onClick={handleExtract}
                size="large"
                type={isAllUploadedExtracted ? 'default' : 'primary'}
              >
                Extract
              </Button>
            </DisabledTooltip>
          </>
        }
      />
    </div>
  );
}
