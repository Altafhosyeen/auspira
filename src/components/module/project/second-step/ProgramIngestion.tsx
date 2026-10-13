import { CheckCircleFilled, ThunderboltOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { StepFooterNav } from '@/components/shared/StepFooterNav';
import {
  useAiExtractPrimavera,
  useDownloadDocument,
  useGetPrimaveraComparison,
} from '@/hooks/modules/project';
import { useDocumentActions } from '@/hooks/modules/useDocumentActions';
import { useProjectDocuments } from '@/hooks/modules/useProjectDocuments';
import { ContractDocumentType } from '@/lib/utils/document.type.code';
import { mapProgrammeJson } from './programme-ingestion/mapProgrammeJson';
import { ProgrammeDropZone } from './programme-ingestion/ProgrammeDropZone';
import { ProgrammePostUploadPanels } from './programme-ingestion/ProgrammePostUploadPanels';
import type { ApiPrimaveraComparison, ProgrammeData } from './programme-ingestion/types';

interface ProgrammeIngestionProps {
  onComplete?: () => void;
  onBack?: () => void;
  /** True only while this stage is the active view — gates the primavera-comparison fetch/poll so
   *  it fires when the user reaches this stage, not while it is mounted-but-hidden. */
  isActive?: boolean;
}

const PROGRAMME_DOC_TYPE = ContractDocumentType.Primavera;

export default function ProgrammeIngestion({
  onComplete,
  onBack,
  isActive = true,
}: ProgrammeIngestionProps) {
  const params = useParams();
  const rawId = typeof params?.id === 'string' ? params.id : undefined;
  // While creating, the route id is the literal 'new' — there is no project to query yet, so
  // treat it as "no project" to avoid firing `/api/projects/new/...` calls.
  const projectId = rawId && rawId !== 'new' ? rawId : undefined;

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { refetch, rawDocsMap } = useProjectDocuments({ projectId });
  const { uploadingMap, progressMap, deletingMap, handleUpload, handleDelete } = useDocumentActions(
    {
      projectId,
      onAfterUpload: refetch,
      onAfterDelete: refetch,
    }
  );
  const docKey = String(PROGRAMME_DOC_TYPE);
  const existingDoc = rawDocsMap.get(docKey);
  // The uploaded Primavera doc (documentType 10) carries whether AI extraction has already run —
  // once triggered, the Extract button is disabled to prevent re-triggering.
  const isExtractionTriggered = !!existingDoc?.isAIExtractionTriggered;

  const { data: primaveraComparison } = useGetPrimaveraComparison<ApiPrimaveraComparison>(
    {
      projectId: projectId ?? '',
      // Only fetch once the user reaches this stage (it stays mounted-but-hidden otherwise).
      enabled: !!projectId && isActive,
    },
    {
      // Once extraction has been triggered, poll every 15s until the parsed programme content
      // arrives; stop as soon as the comparison payload carries extracted data.
      refetchInterval: (query) => {
        if (!projectId || !isExtractionTriggered) return false;
        const accepted = query.state.data?.acceptedProgramme;
        const mapped = accepted ? mapProgrammeJson(accepted.jsonData) : null;
        const hasData =
          !!mapped &&
          (mapped.stats.length > 0 ||
            mapped.keyDates.length > 0 ||
            mapped.criticalPath.length > 0 ||
            mapped.progress.length > 0 ||
            mapped.healthAlerts.length > 0 ||
            mapped.extractedValues.length > 0);
        return hasData ? false : 2_000;
      },
    }
  );

  const { mutateAsync: extractPrimavera, isPending: isExtracting } = useAiExtractPrimavera();
  const { mutateAsync: downloadDoc, isPending: isDownloading } = useDownloadDocument();
  const isUploading = !!uploadingMap[docKey];
  const isDeleting = !!deletingMap[docKey];
  const uploadProgress = progressMap[docKey] ?? 0;

  // The parsed programme JSON comes from the primavera-comparison endpoint (accepted programme).
  // Map the raw backend `jsonData` into the panel shape; fall back to the upload's file name for
  // the display label.
  const acceptedProgramme = primaveraComparison?.acceptedProgramme ?? null;
  const displayData: ProgrammeData | null = acceptedProgramme
    ? {
        name: acceptedProgramme.fileName || existingDoc?.fileName || 'Programme',
        ...mapProgrammeJson(acceptedProgramme.jsonData),
      }
    : null;

  // Show the dropzone "uploaded" state from the persisted doc / optimistic upload; the parsed
  // panels render only once the comparison endpoint has actually returned programme content.
  const showData = !!existingDoc || !!uploadedFile;
  const hasJsonData = !!acceptedProgramme?.jsonData;
  const hasExtractedData =
    !!displayData &&
    (displayData.stats.length > 0 ||
      displayData.keyDates.length > 0 ||
      displayData.criticalPath.length > 0 ||
      displayData.progress.length > 0 ||
      displayData.healthAlerts.length > 0 ||
      displayData.extractedValues.length > 0);

  // Extraction is actively in progress while the primavera-comparison endpoint is being polled:
  // either the trigger request is in flight, or extraction was triggered but the parsed
  // programme data has not yet come back.
  const isExtractionProcessing = isExtracting || (isExtractionTriggered && !hasExtractedData);

  const handleFile = async (file: RcFile) => {
    setUploadedFile(file);
    await handleUpload(PROGRAMME_DOC_TYPE, file);
    // The refetch triggered by onAfterUpload lands asynchronously — drop the local file
    // once it does so the row reflects the persisted doc (and View/Delete use its real id).
    setUploadedFile(null);
  };

  const handleRemove = async () => {
    const docId = existingDoc?.id;
    setUploadedFile(null);
    if (docId) await handleDelete(docId, docKey);
  };

  const handleDownload = async () => {
    if (!existingDoc?.id) return;
    try {
      await downloadDoc({ documentId: existingDoc.id, fileName: existingDoc.fileName });
    } catch (error) {
      notification.error({
        message: 'Download failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleExtract = async () => {
    if (!projectId || isExtractionTriggered) return;
    try {
      // Extraction populates the primavera-comparison payload; the hook invalidates that query
      // on success so the parsed panels render automatically.
      await extractPrimavera({ projectId });
      // Refetch the documents list so `isAIExtractionTriggered` updates and the button disables.
      await refetch();
      notification.success({
        message: 'Extraction triggered',
      });
    } catch (error) {
      notification.error({
        message: 'Extraction failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <div className="font-sans">
      <div className="space-y-4">
        {/* Header */}
        {/* <div>
          <h2 className="my-0 text-xl font-bold tracking-tight text-slate-900">
            B · Programme Ingestion
          </h2>
          <p className="mt-0.5 mb-0 text-sm text-slate-500">
            Upload your project programme file. We support Primavera (XER), XML, PDF, and Excel.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Required contract documents
            </span>
            <span
              className={`text-xs font-bold tracking-widest uppercase ${showData ? 'text-green-600' : 'text-slate-700'}`}
            >
              {showData ? '1 / 1 UPLOADED' : '0 / 1 UPLOADED'}
            </span>
          </div>
        </div> */}

        {/* Required contract documents — mirrors the Stage A upload header */}

        <ProgrammeDropZone
          uploadedFile={uploadedFile}
          showData={showData}
          dataName={existingDoc?.fileName || uploadedFile?.name || displayData?.name || ''}
          disabled={isUploading}
          deleting={isDeleting}
          onFile={handleFile}
          onDownload={existingDoc ? handleDownload : undefined}
          downloading={isDownloading}
          onDelete={handleRemove}
        />

        {isUploading && (
          <p className="ds-caption! font-medium! text-slate-500">Uploading… {uploadProgress}%</p>
        )}

        {showData && hasExtractedData && displayData && (
          <ProgrammePostUploadPanels data={displayData} />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <StepFooterNav
        onBack={onBack}
        onNext={() => hasJsonData && onComplete?.()}
        canProceed={showData && hasJsonData}
        nextLabel="Next"
        extraActions={
          showData && (
            <div className="flex items-center gap-2">
              {!isExtractionProcessing && isExtractionTriggered && (
                <span className="ds-body! inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-medium! text-green-600">
                  <CheckCircleFilled />
                  Extraction complete
                </span>
              )}
              <DisabledTooltip
                disabled={isExtractionTriggered}
                reason="Extraction has already been triggered for this programme file."
              >
                <Button
                  size="large"
                  icon={<ThunderboltOutlined />}
                  loading={isExtracting}
                  disabled={isExtractionTriggered}
                  onClick={handleExtract}
                >
                  Extract
                </Button>
              </DisabledTooltip>
            </div>
          )
        }
      />
    </div>
  );
}
