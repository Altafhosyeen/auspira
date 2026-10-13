'use client';

import { CheckCircleFilled, ThunderboltOutlined } from '@ant-design/icons';
import { Button, notification, Spin, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { FileText, Info } from 'lucide-react';
import { useParams } from 'next/navigation';

import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useMemo, useState } from 'react';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { SectionCard } from '@/components/shared/SectionCard';
import { StepFooterNav } from '@/components/shared/StepFooterNav';
import { OPTION_SPECIFIC_DOCS, OPTIONAL_DOCS, REQUIRED_DOCS } from '@/constants/project.constants';
import { useAiExtract, useGetProjectById } from '@/hooks/modules/project';
import { useDocumentActions } from '@/hooks/modules/useDocumentActions';
import { ALL_DOCS, useProjectDocuments } from '@/hooks/modules/useProjectDocuments';
import { slideUpFadeVariants } from '@/lib/config/motion.config';
import type { MainOption } from '@/types/project/create.types';
import { DocumentGrid } from './DocumentGrid';
import MainOptionComponent from './MainOptionComponent';
import { SupportingDocumentsDrawer } from './SupportingDocumentsDrawer';

interface ReviewUploadedDocumentsProps {
  onComplete?: () => void;
  onBack?: () => void;
  isActive?: boolean;
}

const OPTIONS_ORDER: MainOption[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ReviewUploadedDocuments({
  onComplete,
  onBack,
  isActive = true,
}: ReviewUploadedDocumentsProps) {
  const params = useParams();
  const projectId = params?.id as string | undefined;
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<MainOption>('A');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDocTypeId, setDrawerDocTypeId] = useState<string>('');
  const [drawerDocLabel, setDrawerDocLabel] = useState<string>('');

  // Auto-close drawer when step is hidden
  useEffect(() => {
    if (!isActive) setDrawerOpen(false);
  }, [isActive]);

  const {
    isLoading,
    refetch,
    uploadedMap,
    uploadedDocuments,
    rawDocsMap,
    supportingDocsMap,
    supportingDocsCountMap,
    allDocLabels,
  } = useProjectDocuments({ projectId });

  const { uploadingMap, deletingMap, progressMap, handleUpload, handleDelete } = useDocumentActions(
    { projectId, onAfterUpload: refetch, onAfterDelete: refetch }
  );

  const {
    data: projectDetails,
    refetch: refetchProject,
    isLoading: isProjectLoading,
  } = useGetProjectById({
    id: projectId ?? '',
    enabled: !!projectId && projectId !== 'new',
  });

  // Once onboarding is completed the documents are locked — hide all delete actions.
  const isOnboardingCompleted = !!(projectDetails as any)?.isOnboardingCompleted;
  const isBusy = isLoading || isProjectLoading;

  const { mutateAsync: triggerExtract, isPending: isExtracting } = useAiExtract();

  // Auto-detect option from uploaded docs
  useEffect(() => {
    const detected = OPTIONS_ORDER.find((opt) => {
      const docs = OPTION_SPECIFIC_DOCS[opt] ?? [];
      return docs.length > 0 && docs.some((d) => !!uploadedMap[String(d.id)]);
    });
    Promise.resolve().then(() => setSelectedOption(detected ?? 'A'));
  }, [uploadedMap]);

  // Per-required-document upload + extraction state — mirrors the first step (CreateProject) so the
  // Extract button and "Extraction complete" badge behave identically on both steps. Keyed off the
  // required contract documents only, so option-specific / optional docs never affect it.
  const documentStates = useMemo(
    () =>
      REQUIRED_DOCS.map((rd) => {
        const uploadedDoc = uploadedDocuments.find(
          (doc) => String(rd.id) === String(doc.documentType ?? doc.id)
        );
        return {
          isUploaded: !!uploadedDoc,
          isExtractionTriggered: !!uploadedDoc?.isAIExtractionTriggered,
        };
      }),
    [uploadedDocuments]
  );

  const allRequiredUploaded = useMemo(
    () => documentStates.every((d) => d.isUploaded),
    [documentStates]
  );

  const allUploadedRequiredExtracted = useMemo(
    () => documentStates.filter((d) => d.isUploaded).every((d) => d.isExtractionTriggered),
    [documentStates]
  );

  // Every Required contract document is uploaded AND carries its extracted jsonData. This flips to
  // true as the background document polling (from the still-mounted upload section) fills in the
  // data — and it's what enables the Next button on this Review step.
  const allRequiredHaveJsonData = useMemo(() => {
    if (!allRequiredUploaded) return false;
    const requiredUploaded = uploadedDocuments.filter((doc) =>
      REQUIRED_DOCS.some((rd) => String(rd.id) === String(doc.documentType ?? doc.id))
    );
    return requiredUploaded.length > 0 && requiredUploaded.every((doc) => !!doc.jsonData);
  }, [allRequiredUploaded, uploadedDocuments]);

  const isProjectSaved = !!projectId && projectId !== 'new';

  // Extract is enabled once every required contract document is uploaded and extraction has not
  // already been triggered — independent of the option-specific / optional documents.
  const canExtract = isProjectSaved && allRequiredUploaded && !allUploadedRequiredExtracted;

  const isExtractionTriggered = allUploadedRequiredExtracted && allRequiredUploaded;
  // Actively extracting: the trigger request is in flight, or extraction was triggered but the
  // parsed jsonData has not yet come back from polling.
  const isExtractionProcessing =
    isExtracting || (isExtractionTriggered && !allRequiredHaveJsonData);
  // "Extraction complete" only once the parsed data has actually arrived.
  const isAllUploadedExtracted = isExtractionTriggered && allRequiredHaveJsonData;

  const isExtractDisabled = !canExtract || isExtractionProcessing;
  // Mirrors the precedence of `canExtract` / `isExtractionProcessing` above so the tooltip always
  // names the actual blocker.
  const extractDisabledReason = !isProjectSaved
    ? 'Save the project before extracting documents.'
    : !allRequiredUploaded
      ? 'Upload all required documents before extracting.'
      : isExtractionProcessing
        ? 'Extraction is already in progress.'
        : allUploadedRequiredExtracted
          ? 'These documents have already been extracted.'
          : undefined;

  // Next requires at least one document for the selected main option (unlike Extract, which does
  // not depend on option docs). Options always define at least one doc, but guard for safety.
  const hasOptionSpecificDoc = useMemo(() => {
    const optionDocs = OPTION_SPECIFIC_DOCS[selectedOption] ?? [];
    return optionDocs.length === 0 || optionDocs.some((d) => !!uploadedMap[String(d.id)]);
  }, [selectedOption, uploadedMap]);

  const handleView = (docTypeId: string | number) => {
    const doc = rawDocsMap.get(String(docTypeId));
    if (!doc?.id) return;

    // No extracted data yet — there's nothing for the in-app JSON viewer to show, so just open
    // the raw file (PDF or otherwise) directly in a new tab instead of navigating to an empty
    // "original mode" page within the app.
    if (!doc.jsonData) {
      if (doc.filePath) window.open(doc.filePath, '_blank', 'noopener,noreferrer');
      return;
    }

    const def = ALL_DOCS.find((d) => String(d.id) === String(docTypeId));
    if (def?.url) {
      const base = def.url.replace(':id', String(doc.id));
      const url = `${base}${base.includes('?') ? '&' : '?'}projectId=${projectId}`;
      router.push(url);
    }
  };

  const handleRemove = async (id: string | number) => {
    const docId = String(id);
    const uploaded = uploadedDocuments.find((doc) => String(doc.id) === docId);
    const typeKey = String(uploaded?.documentType ?? uploaded?.id ?? docId);
    await handleDelete(docId, typeKey);
  };

  const handleExtract = async () => {
    if (!projectId) return;
    try {
      await triggerExtract({ projectId });
      notification.success({ message: 'Extraction started successfully' });
      await refetchProject();
    } catch {
      notification.error({ message: 'Failed to start extraction' });
    }
  };

  const handleOpenSupportingDocs = (docTypeId: string) => {
    setDrawerDocTypeId(docTypeId);
    setDrawerDocLabel(allDocLabels[docTypeId] ?? 'Document');
    setDrawerOpen(true);
  };

  const gridProps = {
    uploadedMap,
    loadingMap: uploadingMap,
    deletingMap,
    progressMap,
    uploadedDocuments,
    onUpload: handleUpload,
    onView: handleView,
    // Once onboarding is locked, Remove disappears — Replace is the only way left to fix a
    // wrong or outdated document, so it only appears once the project reaches that state.
    onReplace: isOnboardingCompleted ? () => undefined : undefined,
    onRemove: isOnboardingCompleted ? undefined : handleRemove,
    supportingDocsCountMap,
    onOpenSupportingDocs: handleOpenSupportingDocs,
  };

  return (
    <motion.div variants={slideUpFadeVariants} initial="hidden" animate="visible">
      <SectionCard>
        <h2 className="heading-section my-0 flex items-center gap-2">
          <FileText className="text-theme-primary h-5 w-5 shrink-0" />
          Contract Documents
          <Tooltip
            title="Upload the signed contract PDF. Auspira reads the Main Option and Secondary Options straight from the document and flags any that don't match what you entered in Stage A."
            placement="right"
          >
            <Info className="h-4 w-4 shrink-0 cursor-help text-slate-700 transition-colors hover:text-slate-600" />
          </Tooltip>
        </h2>
        {/* <p className="mt-0.5 mb-0 text-sm text-gray-500">
          Upload the signed contract PDF. We'll extract the Main Option and Secondary Options and
          flag any mismatches with what you entered in Stage A.
        </p> */}

        {isBusy ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* <RequiredDocumentsHeader uploadedCount={requiredUploadedCount} /> */}
            <DocumentGrid documents={REQUIRED_DOCS} {...gridProps} columns={1} />

            <MainOptionComponent
              mode="collapsible"
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              uploadedMap={uploadedMap}
              loadingMap={uploadingMap}
              deletingMap={deletingMap}
              progressMap={progressMap}
              onUpload={handleUpload}
              onView={handleView}
              onReplace={isOnboardingCompleted ? () => undefined : undefined}
              onRemove={isOnboardingCompleted ? undefined : handleRemove}
              uploadedDocuments={uploadedDocuments}
              supportingDocsCountMap={supportingDocsCountMap}
              onOpenSupportingDocs={handleOpenSupportingDocs}
              columns={1}
            />

            <div className="mt-3">
              <CollapsibleSection title="Recommended (optional) — Priced contract with Activity Schedule">
                <DocumentGrid
                  documents={OPTIONAL_DOCS}
                  {...gridProps}
                  onView={handleView}
                  requiresJsonData={false}
                  columns={1}
                />
              </CollapsibleSection>
            </div>

            <StepFooterNav
              onBack={() => {
                setDrawerOpen(false);
                onBack?.();
              }}
              onNext={() => {
                setDrawerOpen(false);
                onComplete?.();
              }}
              canProceed={allRequiredHaveJsonData && hasOptionSpecificDoc}
              nextLabel="Next"
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
          </>
        )}
      </SectionCard>

      {projectId && (
        <SupportingDocumentsDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          documentLabel={drawerDocLabel}
          ParentId={rawDocsMap.get(drawerDocTypeId)?.id ?? null}
          documentType={drawerDocTypeId || null}
          projectId={projectId}
          supportingDocs={supportingDocsMap[drawerDocTypeId] ?? []}
          onAfterChange={refetch}
        />
      )}
    </motion.div>
  );
}
