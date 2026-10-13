/**
 * Upload Documents Section
 * Document upload workflow orchestrator with required, main option, and optional documents
 * Integrated with Ant Design Form for validation
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Form, notification, Tooltip } from 'antd';
import { Info, FileText } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { DocumentGrid } from './DocumentGrid';
import {
  UploadDocumentsSectionProps,
  UploadedDocument,
  MainOption,
} from '@/types/project/create.types';
import { OPTIONAL_DOCS, REQUIRED_DOCS, OPTION_SPECIFIC_DOCS } from '@/constants/project.constants';
import {
  useDeleteDocument,
  useGetDocumentsByProjectId,
  useGetProjectById,
  useUploadDocument,
} from '@/hooks/modules/project';
import { parseBackendDate } from '@/lib/utils';
import { createDocumentUploadFormData } from '@/lib/utils/document-upload';
import { slideUpFadeVariants } from '@/lib/config/motion.config';
import { RcFile } from 'antd/es/upload';
import MainOptionComponent from './MainOptionComponent';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { SupportingDocumentsDrawer } from './SupportingDocumentsDrawer';
import type { SupportingDoc } from './SupportingDocumentsDrawer';
import { useRouter } from 'nextjs-toploader/app';
/**
 * Maps backend document to UploadedDocument
 * Handles label lookup from document constants
 */
const mapBackendDocToUploadedDoc = (doc: any): UploadedDocument => {
  const requiredDoc = REQUIRED_DOCS.find((d) => d.id === doc.documentType || d.id === doc.id);
  const docLabel = requiredDoc?.label || doc.title || doc.name || '';

  return {
    id: doc.id || doc.documentType,
    documentType: doc.documentType,
    title: docLabel,
    filename: doc.fileName || doc.filename || '',
    uploaded: true,
    jsonData: doc.jsonData,
    isAIExtractionTriggered: doc.isAIExtractionTriggered || false,
  };
};

/**
 * UploadDocumentsSection
 * Manages the complete document upload workflow including:
 * - Required documents (common to all options)
 * - Main option selection (A-F)
 * - Option-specific required documents
 * - Optional/recommended documents
 *
 * Uses Ant Design Form for validation and state management
 */
export const UploadDocumentsSection: React.FC<UploadDocumentsSectionProps> = ({
  projectID,
  disabled = false,
  onDocumentsChange,
  onDocumentsValidation,
}) => {
  // ─── Form Instance ──────────────────────────────────────────────────────

  const [form] = Form.useForm();

  // ─── State Management ────────────────────────────────────────────────────
  const [uploadedMap, setUploadedMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [selectedOption, setSelectedOption] = useState<MainOption | null>(null);
  const router = useRouter();

  // ── Supporting docs drawer ────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDocTypeId, setDrawerDocTypeId] = useState<string>('');
  const [drawerDocLabel, setDrawerDocLabel] = useState<string>('');

  // ─── Stable callback refs (avoids adding callbacks to effect deps) ────────
  const onDocumentsValidationRef = useRef(onDocumentsValidation);
  const onDocumentsChangeRef = useRef(onDocumentsChange);
  // Signature of the last synced docs (identity + jsonData presence) so polling re-syncs when
  // jsonData arrives even though the document count stays the same.
  const lastSyncSignatureRef = useRef<string>('');
  // Tracks which document keys have already been announced as extracted, plus whether the
  // "already extracted on load" baseline has been seeded, so we only notify for jsonData that
  // arrives during polling — not for docs that were already extracted when the page opened.
  const notifiedJsonKeysRef = useRef<Set<string>>(new Set());
  const notifyBaselineSeededRef = useRef(false);
  useEffect(() => {
    onDocumentsValidationRef.current = onDocumentsValidation;
    onDocumentsChangeRef.current = onDocumentsChange;
  });

  // ─── Mutations and Queries ──────────────────────────────────────────────
  const { mutateAsync: uploadDocumentMutation } = useUploadDocument();

  // Once onboarding is completed, documents are locked — delete actions are hidden.
  const { data: project } = useGetProjectById<any>({
    id: projectID || '',
    enabled: !!projectID && projectID !== 'new',
  });
  const isOnboardingCompleted = !!project?.isOnboardingCompleted;

  // Reads the shared documents query cache — the extraction poll (refetchInterval) is owned by the
  // always-mounted ProjectWorkflow, so this observer must NOT install its own interval or the
  // endpoint would be polled by several observers on staggered timers.
  const { data: documentsProject, refetch: refetchDocuments } = useGetDocumentsByProjectId({
    id: projectID || '',
    enabled: !!projectID && projectID !== 'new',
    skipLoader: true,
  });
  const { mutateAsync: deleteDocumentAsync } = useDeleteDocument();

  // ─── Validation Logic ───────────────────────────────────────────────────

  /**
   * Check if ALL required documents are uploaded
   */
  const allRequiredDocsUploaded = useMemo(
    () => REQUIRED_DOCS.every((d) => !!uploadedMap[String(d.id)]),
    [uploadedMap]
  );

  /**
   * A main option (A-F) must be selected AND every document specific to that
   * option must be uploaded. This is mandatory before extraction can run.
   */
  const allOptionSpecificDocsUploaded = useMemo(() => {
    if (!selectedOption) return false;
    const optionDocs = OPTION_SPECIFIC_DOCS[selectedOption] ?? [];
    return optionDocs.length > 0 && optionDocs.every((d) => !!uploadedMap[String(d.id)]);
  }, [selectedOption, uploadedMap]);

  /**
   * Documents are considered valid once ALL REQUIRED documents are uploaded,
   * a main option has been selected, and ALL of that option's specific
   * documents are uploaded. The Extract button keys off this, so it stays
   * disabled until the user picks an option and uploads its documents in full.
   * (Recommended optional documents are NOT required — deleting those must not
   * invalidate the step.)
   */
  const isDocumentsValid = allRequiredDocsUploaded && allOptionSpecificDocsUploaded;

  /**
   * Notify parent of validation state changes.
   * Callbacks are accessed via ref so they never appear as reactive deps.
   */
  useEffect(() => {
    onDocumentsValidationRef.current?.(uploadedDocuments, isDocumentsValid);
    if (uploadedDocuments.length > 0) {
      onDocumentsChangeRef.current?.(uploadedDocuments);
    }
  }, [isDocumentsValid, uploadedDocuments]);

  /**
   * Sync uploaded documents from backend query results
   * Updates uploadedMap and uploadedDocuments state
   * Notifies parent component of changes
   */
  useEffect(() => {
    if (!documentsProject || !Array.isArray(documentsProject)) return;

    // Only consider main docs (parentId === null) for the upload map
    const mainDocs = (documentsProject as any[]).filter((doc: any) => !doc.parentId);

    // Skip re-sync only when nothing meaningful changed. The signature tracks each doc's identity,
    // whether its jsonData is present, AND whether AI extraction has been triggered, so a poll that
    // only flips isAIExtractionTriggered (jsonData still pending) still triggers a re-sync —
    // otherwise the View button would never enable, and Replace/Remove would never disable while
    // extraction is actually in flight.
    const signature = mainDocs
      .map(
        (doc: any) =>
          `${doc.documentType ?? doc.id}:${doc.jsonData ? 1 : 0}:${doc.isAIExtractionTriggered ? 1 : 0}`
      )
      .sort()
      .join('|');
    if (isSynced && signature === lastSyncSignatureRef.current) return;
    lastSyncSignatureRef.current = signature;

    const newUploadedMap: Record<string, boolean> = {};
    const uploadedDocs = mainDocs.map((doc: any) => {
      const key = doc.documentType !== undefined ? String(doc.documentType) : String(doc.id);
      newUploadedMap[key] = true;
      return mapBackendDocToUploadedDoc(doc);
    });

    // Auto-detect which option has uploaded docs; fall back to 'A'
    const OPTIONS_ORDER: MainOption[] = ['A', 'B', 'C', 'D', 'E', 'F'];
    const detectedOption =
      OPTIONS_ORDER.find((opt) => {
        const optDocs = OPTION_SPECIFIC_DOCS[opt] ?? [];
        return optDocs.length > 0 && optDocs.some((d) => !!newUploadedMap[String(d.id)]);
      }) ?? 'A';

    setUploadedMap(newUploadedMap);
    setUploadedDocuments(uploadedDocs);
    setSelectedOption(detectedOption);
    setIsSynced(true);
  }, [documentsProject]);

  /**
   * Handle document upload
   * Creates FormData, uploads to backend, shows progress
   */
  const handleUpload = useCallback(
    async (id: string, file: RcFile) => {
      if (disabled || !projectID) {
        notification.warning({ message: 'Please create a project before uploading documents' });
        return;
      }
      try {
        setLoadingMap((prev) => ({ ...prev, [id]: true }));
        setProgressMap((prev) => ({ ...prev, [id]: 0 }));

        const formData = createDocumentUploadFormData(file, id);

        await uploadDocumentMutation({
          data: formData,
          id: projectID,
          onProgress: (progress: number) => {
            setProgressMap((prev) => ({ ...prev, [id]: progress }));
          },
        });

        notification.success({ message: 'Document uploaded successfully' });
        // Optimistically mark as uploaded so validation updates immediately
        setUploadedMap((prev) => ({ ...prev, [id]: true }));
        await refetchDocuments();
      } catch (error) {
        notification.error({ message: 'Failed to upload document' });
        console.error('Document upload error:', error);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [id]: false }));
        setTimeout(() => {
          setProgressMap((prev) => ({ ...prev, [id]: 0 }));
        }, 1500);
      }
    },
    [disabled, projectID, uploadDocumentMutation, refetchDocuments]
  );

  /**
   * Handle view document action
   */
  const handleViewDocument = useCallback(
    (docTypeId: string | number) => {
      const doc = uploadedDocuments.find(
        (d) => String(d.documentType ?? d.id) === String(docTypeId)
      );
      if (!doc) return;

      // No extracted data yet — there's nothing for the in-app JSON viewer to show, so just
      // open the raw file (PDF or otherwise) directly in a new tab instead of navigating to an
      // empty "original mode" page within the app.
      if (!doc.jsonData) {
        const rawDoc = Array.isArray(documentsProject)
          ? (documentsProject as any[]).find(
              (d: any) => String(d.documentType ?? d.id) === String(docTypeId)
            )
          : undefined;
        if (rawDoc?.filePath) window.open(rawDoc.filePath, '_blank', 'noopener,noreferrer');
        return;
      }

      const allDocs = [
        ...REQUIRED_DOCS,
        ...OPTIONAL_DOCS,
        ...Object.values(OPTION_SPECIFIC_DOCS).flat(),
      ];
      const requiredDoc = allDocs.find((d) => String(d.id) === String(docTypeId));
      if (requiredDoc?.url) {
        const base = requiredDoc.url.replace(':id', String(doc.id));
        const url = `${base}${base.includes('?') ? '&' : '?'}projectId=${projectID}`;
        router.push(url);
      }
    },
    [uploadedDocuments, router, projectID, documentsProject]
  );

  /**
   * Handle replace document action
   */

  /**
   * Handle remove document action
   * Calls API to delete document and refetches document list
   */
  const handleRemoveDocument = useCallback(
    async (id: string | number) => {
      const doc = uploadedDocuments.find((d) => d.id === id);
      if (!doc) {
        console.log('Document not found');
        return;
      }

      try {
        const deleteKey = String(doc.documentType ?? doc.id);
        setDeletingMap((prev) => ({ ...prev, [deleteKey]: true }));

        // Call API to delete document
        await deleteDocumentAsync({
          documentId: String(id),
        });

        notification.error({ message: 'Document deleted successfully' });

        // Optimistically remove from map so validation updates immediately
        setUploadedMap((prev) => {
          const updated = { ...prev };
          delete updated[String(doc.documentType)];
          return updated;
        });

        // Refetch documents list to sync with backend
        await refetchDocuments();
      } catch (error) {
        notification.error({ message: 'Failed to remove document' });
        console.error('Document removal error:', error);
      } finally {
        const deleteKey = String(doc.documentType ?? doc.id);
        setDeletingMap((prev) => ({ ...prev, [deleteKey]: false }));
      }
    },
    [uploadedDocuments, deleteDocumentAsync, refetchDocuments]
  );

  /**
   * Calculate uploaded required documents count
   */
  // const uploadedCount = useMemo(
  //   () =>
  //     Object.keys(uploadedMap).filter((id) => REQUIRED_DOCS.some((d) => String(d.id) === id))
  //       .length,
  //   [uploadedMap]
  // );

  // ── Supporting docs derived data ──────────────────────────────────────────
  const rawDocsMap = useMemo(() => {
    if (!Array.isArray(documentsProject)) return new Map<string, any>();
    const map = new Map<string, any>();
    (documentsProject as any[])
      .filter((doc) => !doc.parentId)
      .forEach((doc) => {
        const key = String(doc.documentType ?? doc.id);
        map.set(key, doc);
      });
    return map;
  }, [documentsProject]);

  // Supporting docs from each main doc's children array
  const supportingDocsMap = useMemo((): Record<string, SupportingDoc[]> => {
    if (!Array.isArray(documentsProject)) return {};
    const result: Record<string, SupportingDoc[]> = {};
    (documentsProject as any[])
      .filter((doc) => !doc.parentId && Array.isArray(doc.children) && doc.children.length > 0)
      .forEach((doc) => {
        result[String(doc.documentType)] = doc.children.map((child: any) => ({
          id: child.id,
          filename: child.fileName || child.filename || '',
          title: child.title || child.name || child.fileName || '',
          size: child.fileSize ? `${(child.fileSize / 1024 / 1024).toFixed(1)} MB` : undefined,
          addedOn: parseBackendDate(child.createdOn)?.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        }));
      });
    return result;
  }, [documentsProject]);

  const supportingDocsCountMap = useMemo(
    () => Object.fromEntries(Object.entries(supportingDocsMap).map(([k, v]) => [k, v.length])),
    [supportingDocsMap]
  );

  const allDocLabels = useMemo(() => {
    const map: Record<string, string> = {};
    [...REQUIRED_DOCS, ...OPTIONAL_DOCS, ...Object.values(OPTION_SPECIFIC_DOCS).flat()].forEach(
      (d) => {
        map[String(d.id)] = d.label;
      }
    );
    return map;
  }, []);

  // Announce each document as its jsonData arrives during polling. On first load we seed the
  // baseline (docs already extracted) silently, so notifications only fire for newly-extracted
  // documents while the poll runs.
  useEffect(() => {
    if (!Array.isArray(documentsProject)) return;
    const mainDocsWithJson = (documentsProject as any[]).filter(
      (doc: any) => !doc.parentId && !!doc.jsonData
    );

    if (!notifyBaselineSeededRef.current) {
      mainDocsWithJson.forEach((doc: any) =>
        notifiedJsonKeysRef.current.add(String(doc.documentType ?? doc.id))
      );
      notifyBaselineSeededRef.current = true;
      return;
    }

    mainDocsWithJson.forEach((doc: any) => {
      const key = String(doc.documentType ?? doc.id);
      if (notifiedJsonKeysRef.current.has(key)) return;
      notifiedJsonKeysRef.current.add(key);
      const label = allDocLabels[key] || doc.title || doc.fileName || 'Document';
      notification.success({
        message: label,
        description: `${label} data extracted successfully.`,
      });
    });
  }, [documentsProject, allDocLabels]);

  // Hide every delete action once onboarding is locked by passing `undefined`
  // down to the grids/option component (they only render a delete button when
  // an onRemove handler is provided).
  const removeHandler = isOnboardingCompleted ? undefined : handleRemoveDocument;

  // Once onboarding is locked, Remove disappears — Replace is the only way left to fix a
  // wrong or outdated document, so it only appears once the project reaches that state.
  // The actual upload goes through the existing `onChange`/`handleUpload` path; this hook
  // just needs to be defined for DocumentUploadItem to render the Replace action.
  const replaceHandler = isOnboardingCompleted ? () => undefined : undefined;

  const handleOpenSupportingDocs = useCallback(
    (docTypeId: string) => {
      setDrawerDocTypeId(docTypeId);
      setDrawerDocLabel(allDocLabels[docTypeId] ?? 'Document');
      setDrawerOpen(true);
    },
    [allDocLabels]
  );

  return (
    <motion.div variants={slideUpFadeVariants} initial="hidden" animate="visible">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          requiredDocuments: {},
          documents: {},
        }}
      >
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

          {/* <Divider className="my-3!" /> */}

          {/* REQUIRED DOCUMENTS */}
          {/* <RequiredDocumentsHeader uploadedCount={uploadedCount} /> */}
          <DocumentGrid
            documents={REQUIRED_DOCS}
            uploadedMap={uploadedMap}
            loadingMap={loadingMap}
            deletingMap={deletingMap}
            progressMap={progressMap}
            disabled={disabled}
            onUpload={handleUpload}
            uploadedDocuments={uploadedDocuments}
            onView={handleViewDocument}
            onReplace={replaceHandler}
            onRemove={removeHandler}
            supportingDocsCountMap={supportingDocsCountMap}
            onOpenSupportingDocs={handleOpenSupportingDocs}
          />

          {/* MAIN OPTION SECTION */}
          <MainOptionComponent
            mode="collapsible"
            selectedOption={selectedOption}
            uploadedMap={uploadedMap}
            loadingMap={loadingMap}
            progressMap={progressMap}
            onSelectOption={setSelectedOption}
            onUpload={handleUpload}
            disabled={disabled}
            onView={handleViewDocument}
            onReplace={replaceHandler}
            onRemove={removeHandler}
            uploadedDocuments={uploadedDocuments}
            supportingDocsCountMap={supportingDocsCountMap}
            onOpenSupportingDocs={handleOpenSupportingDocs}
          />

          {/* OPTIONAL DOCUMENTS */}
          <div className="mt-3">
            <CollapsibleSection
              title={
                <div className="text-text! flex items-center gap-2">
                  <span className="text-theme-primary! font-semibold!">Recommended (optional)</span>
                  <span className="ds-body! text-text! font-medium!">
                    — Priced contract with Activity Schedule
                  </span>
                </div>
              }
            >
              <DocumentGrid
                documents={OPTIONAL_DOCS}
                uploadedMap={uploadedMap}
                loadingMap={loadingMap}
                deletingMap={deletingMap}
                progressMap={progressMap}
                disabled={disabled}
                onUpload={handleUpload}
                uploadedDocuments={uploadedDocuments}
                onView={handleViewDocument}
                onReplace={replaceHandler}
                onRemove={removeHandler}
                supportingDocsCountMap={supportingDocsCountMap}
                onOpenSupportingDocs={handleOpenSupportingDocs}
                requiresJsonData={false}
              />
            </CollapsibleSection>
          </div>
        </SectionCard>
      </Form>

      {projectID && (
        <SupportingDocumentsDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          documentLabel={drawerDocLabel}
          ParentId={rawDocsMap.get(drawerDocTypeId)?.id ?? null}
          documentType={drawerDocTypeId || null}
          projectId={projectID}
          supportingDocs={supportingDocsMap[drawerDocTypeId] ?? []}
          onAfterChange={refetchDocuments}
        />
      )}
    </motion.div>
  );
};

UploadDocumentsSection.displayName = 'UploadDocumentsSection';
