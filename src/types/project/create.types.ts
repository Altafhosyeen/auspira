/**
 * Project Creation Form Types
 * Domain-specific types for the project creation workflow
 */

export interface ProjectData {
  id?: string;
  name: string;
  referenceId: string;
  necForm: number | string;
}

export interface Document {
  id: number | string;
  label: string;
  required?: boolean;
  /** URL template for viewing the document, e.g. '/project/view-scope-documents/:id' */
  url?: string;
  /** Short explanation shown in the info-icon tooltip next to the label */
  info?: string;
  /**
   * Lowercase keywords the uploaded file name should contain (any one match passes).
   * Used to warn when a file that doesn't look like this document is uploaded.
   */
  matchKeywords?: string[];
}

export interface UploadedMap {
  [key: string]: boolean;
}

export interface CreateProjectFormProps {
  onBack?: () => void;
  onSave: (data: ProjectData) => void;
  initialData?: ProjectData;
  isEditMode?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface DocumentUploadItemProps {
  label: string;
  required?: boolean;
  uploaded: boolean;
  loading?: boolean;
  progress?: number;
  disabled?: boolean;
  onChange: (file: any) => Promise<void>;
}

export interface DocumentGridProps {
  documents: Document[];
  uploadedMap: Record<string, boolean>;
  loadingMap?: Record<string, boolean>;
  deletingMap?: Record<string, boolean>;
  progressMap?: Record<string, number>;
  disabled?: boolean;
  onUpload: (id: string, file: any) => Promise<void>;
  uploadedDocuments?: UploadedDocument[];
  onView?: (id: string | number) => void;
  onReplace?: (id: string | number) => void;
  onRemove?: (id: string | number) => void;
  isDeleting?: boolean;
  isUploading?: boolean;
  /** Count of supporting documents keyed by document type ID */
  supportingDocsCountMap?: Record<string, number>;
  /** Called when user clicks the supporting-docs button; receives the doc's type ID */
  onOpenSupportingDocs?: (docTypeId: string) => void;
  /** Max columns at md breakpoint — 1 or 2 (default 2) */
  columns?: 1 | 2;
  /** When false, show View button whenever uploaded (no jsonData check). Default true. */
  requiresJsonData?: boolean;
}

export interface UploadedDocument {
  id: string | number;
  documentType?: number | string;
  title: string;
  filename: string;
  uploaded: boolean;
  jsonData?: string | null;
  isAIExtractionTriggered?: boolean;
}

export interface UploadDocumentsSectionProps {
  projectID?: string;
  disabled?: boolean;
  onDocumentsChange?: (documents: UploadedDocument[]) => void;
  onDocumentsValidation?: (documents: UploadedDocument[], isValid: boolean) => void;
}

export type MainOption = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type ProjectTypes = {
  id: string;
  name: string;
  referenceId: string;
  description: string | null;
  necEdition: number;
  necForm: number;
  mainOption: number;
  secondaryOptions: number;
  aiAssistenceMode: number;
  contractValue: number;
  currency: string;
  startDate: Date;
  completionDate: Date;
  defectDate: Date;
  siteAddress: string;
  postcode: string | null;
  employer: string;
  contractor: string;
  projectManager: string;
  supervisor: string;
  isAIExtractionTriggered: boolean;
  status: number;
  createdOn: Date;
};
