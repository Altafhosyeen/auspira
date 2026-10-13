import React from 'react';
import { DocumentGrid } from './DocumentGrid';
import { OPTION_SPECIFIC_DOCS } from '@/constants/project.constants';
import { MainOption, UploadedDocument } from '@/types/project/create.types';
import { RcFile } from 'antd/es/upload';

interface OptionSpecificDocumentsProps {
  selectedOption: MainOption | null;
  uploadedMap: Record<string, boolean>;
  loadingMap?: Record<string, boolean>;
  deletingMap?: Record<string, boolean>;
  progressMap?: Record<string, number>;
  onUpload: (id: string, file: RcFile) => Promise<void>;
  disabled?: boolean;
  onView?: (id: string | number) => void;
  onReplace?: (id: string | number) => void;
  onRemove?: (id: string | number) => void;
  uploadedDocuments?: UploadedDocument[];
  supportingDocsCountMap?: Record<string, number>;
  onOpenSupportingDocs?: (docTypeId: string) => void;
  columns?: 1 | 2;
  requiresJsonData?: boolean;
}

export const OptionSpecificDocuments: React.FC<OptionSpecificDocumentsProps> = ({
  selectedOption,
  uploadedMap,
  loadingMap = {},
  deletingMap = {},
  progressMap = {},
  onUpload,
  disabled = false,
  uploadedDocuments = [],
  onView,
  onReplace,
  onRemove,
  supportingDocsCountMap = {},
  onOpenSupportingDocs,
  columns = 2,
  requiresJsonData = false,
}) => {
  const optionDocs = selectedOption ? OPTION_SPECIFIC_DOCS[selectedOption] : [];
  // const optionUploadedCount = optionDocs.filter((d) => !!uploadedMap[String(d.id)]).length;

  if (!selectedOption || optionDocs.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg">
      <DocumentGrid
        documents={optionDocs}
        uploadedMap={uploadedMap}
        loadingMap={loadingMap}
        deletingMap={deletingMap}
        progressMap={progressMap}
        disabled={disabled}
        onUpload={onUpload}
        onView={onView}
        onReplace={onReplace}
        onRemove={onRemove}
        uploadedDocuments={uploadedDocuments}
        supportingDocsCountMap={supportingDocsCountMap}
        onOpenSupportingDocs={onOpenSupportingDocs}
        columns={columns}
        requiresJsonData={requiresJsonData}
      />
    </div>
  );
};

OptionSpecificDocuments.displayName = 'OptionSpecificDocuments';
