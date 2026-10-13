/**
 * Document Grid
 * Grid layout for displaying multiple document upload items with framer motion animations
 */

import { motion } from 'framer-motion';
import type React from 'react';
import { useMemo } from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { SUPPORTING_DOCS_ALLOWED_TYPES } from '@/constants/project.constants';
import { uploadSectionConfig } from '@/lib/config/motion.config';
import type { DocumentGridProps } from '@/types/project/create.types';
import { DocumentUploadItem } from './DocumentUploadItem';

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  uploadedMap,
  loadingMap = {},
  deletingMap = {},
  progressMap = {},
  disabled = false,
  onUpload,
  uploadedDocuments = [],
  onView,
  onReplace,
  onRemove,
  supportingDocsCountMap = {},
  onOpenSupportingDocs,
  columns = 2,
  requiresJsonData = true,
}) => {
  // Create map of uploaded documents by documentType for quick lookup
  // Key by documentType since documents array uses id (1, 2, 3...) which matches documentType
  const uploadedDocMap = useMemo(
    () => new Map(uploadedDocuments.map((doc) => [String(doc.documentType || doc.id), doc])),
    [uploadedDocuments]
  );

  return (
    <DisabledTooltip disabled={disabled} reason="Create the project before uploading documents.">
      <div
        className={`mt-2 grid grid-cols-1 gap-2 transition-all duration-200 ${columns === 1 ? '' : 'md:grid-cols-2'} ${
          disabled ? 'pointer-events-none opacity-50 grayscale' : 'opacity-100'
        }`}
      >
        {documents.map((doc) => {
          // Look up by documentType which matches doc.id in documents array
          const uploadedDoc = uploadedDocMap.get(String(doc.id));
          // AI extraction was triggered but the parsed jsonData hasn't come back yet — replacing
          // or removing the file mid-extraction would race with the backend parsing the old one.
          const extractionInProgress =
            requiresJsonData && !!uploadedDoc?.isAIExtractionTriggered && !uploadedDoc?.jsonData;
          return (
            <motion.div key={doc.id} variants={uploadSectionConfig.item}>
              <DocumentUploadItem
                id={String(uploadedDoc?.id ?? doc.id)}
                label={doc.label}
                info={doc.info}
                required={doc.required}
                matchKeywords={doc.matchKeywords}
                uploaded={!!uploadedMap[String(doc.id)]}
                loading={loadingMap[String(doc.id)]}
                removing={deletingMap[String(doc.id)]}
                progress={progressMap[String(doc.id)] || 0}
                disabled={disabled}
                filename={uploadedDoc?.filename}
                onChange={(file) => onUpload(String(doc.id), file)}
                onView={onView && uploadedDoc ? () => onView(String(doc.id)) : undefined}
                awaitingExtraction={requiresJsonData && !!uploadedDoc && !uploadedDoc.jsonData}
                extracted={requiresJsonData ? !!uploadedDoc?.jsonData : !!uploadedDoc}
                onReplace={onReplace ? () => onReplace(String(doc.id)) : undefined}
                extractionInProgress={extractionInProgress}
                onRemove={onRemove}
                supportingDocsCount={supportingDocsCountMap[String(doc.id)] ?? 0}
                onOpenSupportingDocs={
                  onOpenSupportingDocs && SUPPORTING_DOCS_ALLOWED_TYPES.has(doc.id as number)
                    ? () => onOpenSupportingDocs(String(doc.id))
                    : undefined
                }
              />
            </motion.div>
          );
        })}
      </div>
    </DisabledTooltip>
  );
};

DocumentGrid.displayName = 'DocumentGrid';
