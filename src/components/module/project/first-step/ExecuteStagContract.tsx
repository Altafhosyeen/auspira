'use client';

import { Button, Divider, Form, notification, Tag, Typography } from 'antd';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiZClause } from '@/components/contract/Z-clauses';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { OPTION_SPECIFIC_DOCS, REQUIRED_DOCS } from '@/constants/project.constants';
import { useGetZClauses } from '@/hooks/modules/contract-registery';
import { useGetProjectById, useUpdateProject } from '@/hooks/modules/project';
import { useDocumentActions } from '@/hooks/modules/useDocumentActions';
import { ALL_DOCS, useProjectDocuments } from '@/hooks/modules/useProjectDocuments';
import type { IMetaPaginatedResponse } from '@/types';
import type { MainOption } from '@/types/project/create.types';
import { DEFAULT_SELECTED_OPTION, SECONDARY_OPTIONS } from './execute-stag-contract/constants';
import { ExecuteStagContractAiResults } from './execute-stag-contract/ExecuteStagContractAiResults';
import { ExecuteStagContractDetailsForm } from './execute-stag-contract/ExecuteStagContractDetailsForm';
import { ExecuteStagContractSecondaryOptions } from './execute-stag-contract/ExecuteStagContractSecondaryOptions';
import MainOptionComponent from './MainOptionComponent';
import { SupportingDocumentsDrawer } from './SupportingDocumentsDrawer';

const OPTIONS_ORDER: MainOption[] = ['A', 'B', 'C', 'D', 'E', 'F'];

interface ExecuteStagContractProps {
  onComplete?: () => void;
  onBack?: () => void;
  /** True only while this step is the active view — gates the Z-clauses fetch/poll so it fires
   *  when the user actually reaches this step, not while the step is mounted-but-hidden. */
  isActive?: boolean;
}

export default function ExecuteStagContract({
  onComplete,
  onBack,
  isActive = true,
}: ExecuteStagContractProps) {
  const params = useParams();
  const projectId = typeof params?.id === 'string' ? params.id : undefined;
  const router = useRouter();

  // The contract-details form instance is owned here so the step footer (rendered at the very
  // bottom) can validate/submit it, even though the form fields live inside the details card.
  const [detailsForm] = Form.useForm();

  const [selectedOption, setSelectedOption] = useState<MainOption>(DEFAULT_SELECTED_OPTION);
  const hasManualOptionSelectionRef = useRef(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDocTypeId, setDrawerDocTypeId] = useState<string>('');
  const [drawerDocLabel, setDrawerDocLabel] = useState<string>('');

  const {
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

  // Every Required contract document must be uploaded and carry its extracted jsonData before we
  // begin polling the project for the processed secondary options.
  const allRequiredHaveJsonData = useMemo(() => {
    const allUploaded = REQUIRED_DOCS.every((rd) => !!uploadedMap[String(rd.id)]);
    if (!allUploaded) return false;
    const requiredUploaded = uploadedDocuments.filter((d) =>
      REQUIRED_DOCS.some((rd) => String(rd.id) === String(d.documentType ?? d.id))
    );
    return requiredUploaded.length > 0 && requiredUploaded.every((d) => !!d.jsonData);
  }, [uploadedMap, uploadedDocuments]);

  // The contract-details fields are AI-extracted from the required documents. While any required
  // doc's extraction is triggered but its jsonData hasn't landed, those fields are still on their
  // way — the details form shows a skeleton until then.
  const isExtractingDetails = useMemo(
    () =>
      REQUIRED_DOCS.some((rd) => {
        const doc = uploadedDocuments.find((d) => String(d.documentType ?? d.id) === String(rd.id));
        return !!doc?.isAIExtractionTriggered && !doc?.jsonData;
      }),
    [uploadedDocuments]
  );

  // Wall-clock timestamp of when project polling started (first tick where every required doc has
  // its jsonData). Reset to null whenever polling isn't warranted, so a later re-entry into the
  // "waiting on secondary options" state gets its own fresh fast-poll window.
  const pollStartedAtRef = useRef<number | null>(null);
  const PROJECT_POLL_TIMEOUT_MS = 30000;
  const PROJECT_BACKGROUND_POLL_MS = 40000;

  const { data: project } = useGetProjectById<any>(
    {
      id: projectId ?? '',
      enabled: !!projectId && projectId !== 'new',
    },
    {
      // Poll every 3s — but only while this sub-step is active AND every Required document has its
      // jsonData — until the contract's secondary options AND every AI-extracted party/value field
      // (employer, contractor, project manager, supervisor, contract value) have come back from
      // processing. Checking the party fields too (not just secondary options) keeps this polling
      // for as long as the details form's own per-field skeletons are still waiting on data — the
      // two must stay in sync, or polling could stop while a field is still showing its skeleton.
      // After the fast window, DON'T stop outright: this app disables refetchOnWindowFocus globally,
      // so a hard stop would mean data that finishes processing after the window never reaches the
      // form. Instead fall back to a slow background poll (40s) so late-arriving data still lands
      // eventually, without hammering the API. Gating on `isActive` stops this shared /projects/{id}
      // query from polling in the background while the step is mounted-but-hidden (e.g. the user is
      // still on Create Project / Review Documents).
      refetchInterval: (query) => {
        if (!isActive || !projectId || projectId === 'new' || !allRequiredHaveJsonData) {
          pollStartedAtRef.current = null;
          return false;
        }
        const data = query.state.data;
        const values = data?.secondaryOptionValues;
        const hasSecondaryOptions = Array.isArray(values) && values.length > 0;
        const hasAllPartyFields = !!(
          data?.employer &&
          data?.contractor &&
          data?.projectManager &&
          data?.supervisor &&
          data?.contractValue
        );
        if (hasSecondaryOptions && hasAllPartyFields) {
          pollStartedAtRef.current = null;
          return false;
        }
        if (pollStartedAtRef.current == null) pollStartedAtRef.current = Date.now();
        const elapsed = Date.now() - pollStartedAtRef.current;
        return elapsed >= PROJECT_POLL_TIMEOUT_MS ? PROJECT_BACKGROUND_POLL_MS : 3000;
      },
    }
  );
  const { data: zClauses } = useGetZClauses<IMetaPaginatedResponse<ApiZClause>>(
    {
      id: projectId ?? '',
      // Only fetch once the user reaches this step (the step stays mounted-but-hidden otherwise).
      enabled: !!projectId && projectId !== 'new' && isActive,
    },
    {
      // Z-clauses are extracted asynchronously — poll every 5s until they arrive, then stop.
      // Polling is inert while the query is disabled (step not yet active).
      refetchInterval: (query) => {
        const items = query.state.data?.items;
        return Array.isArray(items) && items.length > 0 ? false : 5000;
      },
    }
  );
  const zClausesData: ApiZClause[] = zClauses?.items ?? [];
  const isOnboardingCompleted = !!project?.isOnboardingCompleted;

  // Secondary options detected on the contract (from the project response) — seed the local
  // selection when they arrive, then let the user add/remove freely.
  const detectedSecondary: string[] = useMemo(
    () => (Array.isArray(project?.secondaryOptionValues) ? project.secondaryOptionValues : []),
    [project]
  );

  // True while any of the AI-extracted party/value fields hasn't landed yet — kept separate from
  // `detectedSecondary` since the two can arrive independently (e.g. secondary options land before
  // the contract value does), and the details form's per-field skeletons need to know about this
  // one specifically.
  const hasAllPartyFields = !!(
    project?.employer &&
    project?.contractor &&
    project?.projectManager &&
    project?.supervisor &&
    project?.contractValue
  );

  // True while the contract is still being processed on the backend — either the required docs are
  // still extracting, OR their jsonData has landed but the project's processed data (party fields,
  // secondary options) hasn't come back from polling yet. Broader than `isExtractingDetails` alone:
  // document-level extraction can finish while the project-level fields are still on their way, and
  // the details form must keep its skeleton for that whole window, not just the document part of it.
  const isContractProcessing = useMemo(() => {
    if (!isActive || !projectId || projectId === 'new') return false;
    if (isExtractingDetails) return true;
    return allRequiredHaveJsonData && (detectedSecondary.length === 0 || !hasAllPartyFields);
  }, [
    isActive,
    projectId,
    isExtractingDetails,
    allRequiredHaveJsonData,
    detectedSecondary,
    hasAllPartyFields,
  ]);

  const [selectedSecondary, setSelectedSecondary] = useState<string[]>(detectedSecondary);

  // Seed local selection the first time detected options arrive from the API.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!seededRef.current && detectedSecondary.length > 0) {
      seededRef.current = true;
      setSelectedSecondary(detectedSecondary);
    }
  }, [detectedSecondary]);

  const secondaryOptions = useMemo(
    () => [
      ...SECONDARY_OPTIONS,
      ...detectedSecondary.filter((v) => !SECONDARY_OPTIONS.includes(v)),
    ],
    [detectedSecondary]
  );

  const handleToggleSecondary = (option: string) => {
    setSelectedSecondary((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const requiredDocuments = useMemo(
    () => OPTION_SPECIFIC_DOCS[selectedOption] ?? [],
    [selectedOption]
  );

  const uploadCount = useMemo(
    () => requiredDocuments.filter((doc) => !!uploadedMap[String(doc.id)]).length,
    [requiredDocuments, uploadedMap]
  );

  // Auto-detect option from uploaded docs (skipped after manual selection)
  useEffect(() => {
    if (hasManualOptionSelectionRef.current) return;
    const detected = OPTIONS_ORDER.find((option) => {
      const optionDocs = OPTION_SPECIFIC_DOCS[option] ?? [];
      return optionDocs.some((doc) => !!uploadedMap[String(doc.id)]);
    });
    if (detected && detected !== selectedOption) {
      startTransition(() => setSelectedOption(detected));
    }
  }, [selectedOption, uploadedMap]);

  const handleSelectOption = (option: MainOption) => {
    hasManualOptionSelectionRef.current = true;
    setSelectedOption(option);
  };

  const handleView = (docTypeId: string | number) => {
    const def = ALL_DOCS.find((d) => String(d.id) === String(docTypeId));
    const doc = rawDocsMap.get(String(docTypeId));
    if (def?.url && doc?.id) {
      const base = def.url.replace(':id', String(doc.id));
      let url = `${base}${base.includes('?') ? '&' : '?'}projectId=${projectId}`;
      // No extracted data yet → open the raw document (original mode) instead of the empty
      // JSON metadata panel; once extraction lands, View opens the parsed side-by-side view.
      if (!doc.jsonData) url += '&view=original';
      router.push(url);
    }
  };

  const handleRemove = async (id: string | number) => {
    const doc = uploadedDocuments.find((item) => String(item.id) === String(id));
    const typeKey = doc ? String(doc.documentType ?? doc.id) : undefined;
    await handleDelete(id, typeKey);
  };

  const handleOpenSupportingDocs = (docTypeId: string) => {
    setDrawerDocTypeId(docTypeId);
    setDrawerDocLabel(allDocLabels[docTypeId] ?? 'Document');
    setDrawerOpen(true);
  };

  const { mutateAsync: updateProject } = useUpdateProject();

  // Persist the contract-details form to the project. Returns whether the save succeeded so
  // callers (Save / Next) can decide whether to advance.
  const saveDraft = async (values: any): Promise<boolean> => {
    try {
      await updateProject({
        id: projectId || '',
        data: {
          ...values,
          name: project?.name,
          secondaryOptions: selectedSecondary,
          contractValue: values.contractValue ? String(values.contractValue).replace(/,/g, '') : '',
          startDate: values.startDate ? values.startDate.toISOString() : null,
          completionDate: values.completionDate ? values.completionDate.toISOString() : null,
          defectDate: values.defectDate ? values.defectDate.toISOString() : null,
        },
      });
      notification.success({ message: 'Updated successfully' });
      return true;
    } catch (error: any) {
      console.error('Save draft error:', error);
      notification.error({
        message: 'Failed to save draft',
        description: error?.response?.data?.message || error?.message || 'Something went wrong',
      });
      return false;
    }
  };

  // Validate the form and return its values, or `null` when validation fails (errors shown inline).
  // On failure, scroll the first invalid field back into view so the user sees what to fix instead
  // of the error staying off-screen above the footer's Next button.
  const validateDetails = async (): Promise<any | null> => {
    try {
      return await detailsForm.validateFields();
    } catch (error: any) {
      if (error?.errorFields) {
        const firstErrorName = error.errorFields?.[0]?.name;
        if (firstErrorName) {
          detailsForm.scrollToField(firstErrorName, { behavior: 'smooth', block: 'center' });
        }
        return null;
      }
      throw error;
    }
  };

  // Save button — validate then persist, without leaving the step.
  // const handleSave = async () => {
  //   const values = await validateDetails();
  //   if (values) await saveDraft(values);
  // };

  // Next button — validate, save, then advance only once the save succeeded and every required
  // Option-specific document has been uploaded.
  const handleNext = async () => {
    const values = await validateDetails();
    if (!values) return;
    const saved = await saveDraft(values);
    if (saved && uploadCount >= requiredDocuments.length) onComplete?.();
  };

  const isNextDisabled = projectId === 'new';

  return (
    <div>
      <div className="border-theme-border rounded-2xl border bg-white p-2 shadow-sm">
        {/* <ExecuteStagContractHeader onBack={onBack} /> */}
        <MainOptionComponent
          mode="collapsible"
          collapsibleDefaultOpen
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          uploadedMap={uploadedMap}
          loadingMap={uploadingMap}
          deletingMap={deletingMap}
          progressMap={progressMap}
          onUpload={handleUpload}
          onView={handleView}
          onRemove={isOnboardingCompleted ? undefined : handleRemove}
          uploadedDocuments={uploadedDocuments}
          supportingDocsCountMap={supportingDocsCountMap}
          onOpenSupportingDocs={handleOpenSupportingDocs}
        />

        <ExecuteStagContractSecondaryOptions
          options={secondaryOptions}
          selectedOptions={selectedSecondary}
          onToggle={handleToggleSecondary}
        />

        {/* AI-detected secondary options — read-only reflection of what the toggle buttons
            above currently have selected, sourced straight from the contract extraction. */}
        {selectedSecondary.length > 0 && (
          <div className="mt-3">
            <Divider className="my-1!" />
            <Typography.Text className="ds-caption! mb-2 block font-bold! tracking-wide text-slate-500 uppercase">
              Secondary Options (AI)
            </Typography.Text>
            <div className="flex flex-wrap gap-2">
              {selectedSecondary.map((item) => (
                <Tag key={item} className="badge-info! border-badge-info/20! rounded-md px-3 py-1">
                  {item}
                </Tag>
              ))}
            </div>
            <Divider className="my-3!" />
          </div>
        )}

        <ExecuteStagContractDetailsForm
          form={detailsForm}
          extracting={isContractProcessing}
          skeletonTimeoutMs={PROJECT_POLL_TIMEOUT_MS}
        />

        <ExecuteStagContractAiResults clauses={zClausesData} />

        {/* Step footer — pinned at the bottom of the step, below all sections. */}
        <div className="mt-4 flex justify-between">
          <Button size="large" onClick={onBack} className="border-slate-300! text-slate-600!">
            Previous
          </Button>

          <div className="flex gap-2">
            {/* <Button size="large" onClick={handleSave} className="mr-3">
              Save
            </Button> */}

            <DisabledTooltip
              disabled={isNextDisabled}
              reason="Save the project before continuing to the next step."
            >
              <Button type="primary" size="large" onClick={handleNext} disabled={isNextDisabled}>
                Next
              </Button>
            </DisabledTooltip>
          </div>
        </div>
      </div>

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
    </div>
  );
}
