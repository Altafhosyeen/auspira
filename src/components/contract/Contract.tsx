import {
  DownOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
  PaperClipOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'nextjs-toploader/app';
import type React from 'react';
import { useMemo, useState } from 'react';
import { OPTION_SPECIFIC_DOC_DISPLAY_NAMES } from '@/constants/project.constants';
import { useGetAllDocuments } from '@/hooks/modules/contract-registery';
import { displayFileName, parseBackendDate } from '@/lib/utils';
import {
  ContractDocumentType,
  getDocumentLabel,
  getDocumentTypeDisplayName,
} from '@/lib/utils/document.type.code';
import { useProjectStore } from '@/store/project.store';

/**
 * Heading for a document group. The option-specific pricing documents carry bare
 * enum identifiers (A1, B1, C1...) that mean nothing on screen, so prefer their
 * real name from `OPTION_SPECIFIC_DOC_DISPLAY_NAMES`.
 */
const documentTypeHeading = (documentType: number): string =>
  OPTION_SPECIFIC_DOC_DISPLAY_NAMES[documentType] ?? getDocumentTypeDisplayName(documentType);

// Document types with a dedicated review page, keyed by route segment.
// Anything not listed here falls back to the generic /projects/document/[id] viewer.
const DOCUMENT_TYPE_ROUTES: Partial<Record<ContractDocumentType, string>> = {
  [ContractDocumentType.FormOfAgreement]: 'form-of-agreement',
  [ContractDocumentType.ContractDataPart1]: 'contract-data-part-1',
  [ContractDocumentType.ContractDataPart2]: 'contract-data-part-2',
  [ContractDocumentType.Conditions]: 'conditions-of-contract',
  [ContractDocumentType.ZClauses]: 'z-clauses',
  [ContractDocumentType.SiteInfo]: 'site-information',
  [ContractDocumentType.Hsqe]: 'hsqe-requirements',
};

const buildDocumentViewUrl = (documentId: string, documentType: number, projectId: string) => {
  const routeSegment = DOCUMENT_TYPE_ROUTES[documentType as ContractDocumentType];
  if (routeSegment) {
    return `/projects/${routeSegment}/${documentId}?projectId=${projectId}`;
  }
  return `/projects/document/${documentId}?type=${documentType}&projectId=${projectId}`;
};

// Shape returned by GET /projects/{id}/documents/all-versions
export interface ApiDocumentVersion {
  id: string;
  projectId: string;
  parentId: string | null;
  documentType: number;
  fileName: string | null;
  fileExtension: string | null;
  filePath: string | null;
  uploadedAt: string | null;
  jsonData: string | null;
  version: number | null;
  comments: string | null;
  status: number | null;
  createdOn: string | null;
  children?: ApiDocumentVersion[] | null;
}

export interface ApiDocumentTypeGroup {
  documentType: number;
  documents: ApiDocumentVersion[] | null;
}

export type AllDocumentsResponse = ApiDocumentTypeGroup[];

interface DocumentRow {
  id: string;
  title: string;
  documentType: number;
  date: string;
  isMuted: boolean;
  hasDocument: boolean;
  fileExtension?: string;
  hasJsonData: boolean;
  /** True only for document types that have a dedicated review page and therefore require AI extraction to view. */
  requiresJsonData: boolean;
  /** Supporting/attachment documents uploaded alongside this version, if any. */
  children: DocumentRow[];
  /**
   * True for a supporting/attachment row (a `children` entry). These open the raw
   * PDF directly — they were never run through AI extraction and have no review page.
   */
  isSupporting: boolean;
  /** SAS URL of the raw file — only needed for supporting rows, opened directly. */
  filePath?: string;
}

interface DocumentSection {
  documentType: number;
  title: string;
  description: string;
  rows: DocumentRow[];
}

const formatDate = (iso?: string | null) =>
  parseBackendDate(iso)?.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) ?? '—';

/** Icon + colour for the file-type badge, derived from the upload's extension, e.g. ".docx" → Word icon. */
const fileTypeIcon = (extension?: string | null) => {
  const ext = (extension ?? '').replace(/^\./, '').toLowerCase();
  if (ext === 'pdf') return { Icon: FilePdfOutlined, className: 'bg-rose-50 text-rose-500' };
  if (ext.startsWith('doc'))
    return { Icon: FileWordOutlined, className: 'bg-blue-50 text-blue-500' };
  if (ext.startsWith('xls'))
    return { Icon: FileExcelOutlined, className: 'bg-emerald-50 text-emerald-500' };
  if (ext.startsWith('ppt'))
    return { Icon: FilePptOutlined, className: 'bg-orange-50 text-orange-500' };
  return { Icon: FileUnknownOutlined, className: 'bg-slate-100 text-slate-700' };
};

/**
 * A document (top-level version or supporting attachment) -> its list row, including its
 * own supporting docs. Only the top-level version routes to a review page — supporting
 * attachments were never AI-extracted, so they always open as a raw PDF.
 */
const toRow = (
  doc: ApiDocumentVersion,
  fallbackTitle: string,
  isSupporting = false
): DocumentRow => ({
  id: doc.id,
  title: displayFileName(doc.fileName) || fallbackTitle,
  documentType: doc.documentType,
  date: formatDate(doc.uploadedAt),
  isMuted: false,
  hasDocument: true,
  fileExtension: doc.fileExtension ?? undefined,
  hasJsonData: !!doc.jsonData,
  requiresJsonData: !isSupporting && doc.documentType in DOCUMENT_TYPE_ROUTES,
  isSupporting,
  filePath: doc.filePath ?? undefined,
  children: (doc.children ?? []).map((child) =>
    toRow(child, documentTypeHeading(child.documentType), true)
  ),
});

function buildSection(group: ApiDocumentTypeGroup): DocumentSection {
  const title = documentTypeHeading(group.documentType);
  const versions = [...(group.documents ?? [])].sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  const requiresJsonData = group.documentType in DOCUMENT_TYPE_ROUTES;

  const rows: DocumentRow[] =
    versions.length > 0
      ? versions.map((doc, index) => ({ ...toRow(doc, title), isMuted: index !== 0 }))
      : [
          {
            id: `empty-${group.documentType}`,
            title,
            documentType: group.documentType,
            date: '—',
            isMuted: true,
            hasDocument: false,
            hasJsonData: false,
            requiresJsonData,
            children: [],
            isSupporting: false,
          },
        ];

  return {
    documentType: group.documentType,
    title,
    description: getDocumentLabel(group.documentType),
    rows,
  };
}

/** One document row — reused for both a version and its nested supporting documents. */
const DocumentRowItem: React.FC<{
  item: DocumentRow;
  description: string;
  compact?: boolean;
  activeTooltip: string | null;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  onView: (item: DocumentRow) => void;
}> = ({ item, description, compact = false, activeTooltip, onHoverStart, onHoverEnd, onView }) => {
  const { Icon, className } = fileTypeIcon(item.fileExtension);
  const isAwaitingExtraction = !item.isSupporting && item.requiresJsonData && !item.hasJsonData;
  const canView = item.isSupporting ? !!item.filePath : !item.requiresJsonData || item.hasJsonData;

  return (
    <div
      className={`group flex items-center justify-between py-1 transition-colors ${
        item.isMuted ? 'opacity-50' : ''
      }`}
    >
      {/* Left side: Icon + Text information */}
      <div className="flex items-center gap-4">
        <div
          className={`ds-body-large! flex shrink-0 items-center justify-center rounded ${className} ${
            compact ? 'h-6 w-6 text-sm' : 'h-8 w-8'
          }`}
        >
          <Icon />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className={`font-semibold! text-slate-500 ${compact ? 'ds-caption!' : 'ds-body!'}`}>
            {item.title}
          </span>
        </div>
      </div>

      {/* Right side: Date + Badge + View Action */}
      <div className="flex items-center gap-6 md:gap-12">
        <span className="ds-caption! w-24 text-right font-medium! text-slate-700">{item.date}</span>

        {/* Interactive Tooltip Container */}
        <div className="relative flex h-4 w-4 items-center justify-center">
          {item.hasDocument && (
            <>
              <button
                type="button"
                onClick={() => canView && onView(item)}
                onMouseEnter={() => onHoverStart(item.id)}
                onMouseLeave={onHoverEnd}
                className={`focus:outline-none ${
                  canView
                    ? 'cursor-pointer text-slate-700 hover:text-slate-600'
                    : 'cursor-not-allowed text-slate-700'
                }`}
              >
                <EyeOutlined />
              </button>

              {activeTooltip === item.id && (
                <div className="absolute top-1/2 right-full z-50 mr-3 w-87.5 -translate-y-1/2 rounded-xl border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                  <h4 className="ds-body-large! text-main-p font-bold!">{item.title}</h4>
                  {isAwaitingExtraction ? (
                    <p className="ds-body! text-warning mt-2 font-normal!">
                      Awaiting AI extraction for this document
                    </p>
                  ) : (
                    <p className="ds-body! text-main-p mt-2 font-normal!">
                      {description} — uploaded {item.date}.
                    </p>
                  )}

                  <div className="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-t border-r border-slate-100 bg-white"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ContractDocuments: React.FC = () => {
  const router = useRouter();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  // Which parent rows have their "Supporting documents" list expanded — collapsed by default.
  const [expandedSupporting, setExpandedSupporting] = useState<Set<string>>(() => new Set());

  const { data: documents } = useGetAllDocuments<AllDocumentsResponse>({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  const sections = useMemo<DocumentSection[]>(
    () => (documents ?? []).map(buildSection),
    [documents]
  );

  const toggleSupporting = (id: string) =>
    setExpandedSupporting((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Supporting attachments were never AI-extracted and have no review page — open the raw
  // PDF directly. Only the top-level version routes into the JSON-driven review page.
  const handleView = (item: DocumentRow) => {
    if (item.isSupporting) {
      if (item.filePath) window.open(item.filePath, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!selectedProjectId) return;
    router.push(buildDocumentViewUrl(item.id, item.documentType, selectedProjectId));
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
      {/* Main Header */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="ds-caption! font-bold! tracking-wider text-slate-700 uppercase">
          Documents
        </h2>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.documentType} className="space-y-3">
            <h3 className="ds-caption! font-bold! tracking-wider text-slate-600 uppercase">
              {section.title}
            </h3>

            <div className="space-y-2">
              {section.rows.map((item) => (
                <div key={item.id}>
                  <DocumentRowItem
                    item={item}
                    description={section.description}
                    activeTooltip={activeTooltip}
                    onHoverStart={setActiveTooltip}
                    onHoverEnd={() => setActiveTooltip(null)}
                    onView={handleView}
                  />

                  {/* Supporting documents — only shown when the version actually has any; collapsed by default. */}
                  {item.children.length > 0 && (
                    <div className="mt-1 mb-2 ml-12">
                      <button
                        type="button"
                        onClick={() => toggleSupporting(item.id)}
                        aria-expanded={expandedSupporting.has(item.id)}
                        className="ds-micro! flex items-center gap-1.5 font-semibold! tracking-wider text-slate-400 uppercase transition-colors hover:text-slate-600"
                      >
                        {expandedSupporting.has(item.id) ? (
                          <DownOutlined className="text-[10px]" />
                        ) : (
                          <RightOutlined className="text-[10px]" />
                        )}
                        <PaperClipOutlined />
                        Supporting documents ({item.children.length})
                      </button>

                      {expandedSupporting.has(item.id) && (
                        <div className="mt-1.5 space-y-1.5 border-l-2 border-slate-200 py-1 pl-4">
                          {item.children.map((child) => (
                            <div key={child.id} className="rounded-lg bg-slate-50 px-4 py-1">
                              <DocumentRowItem
                                item={child}
                                description={getDocumentLabel(child.documentType)}
                                activeTooltip={activeTooltip}
                                onHoverStart={setActiveTooltip}
                                onHoverEnd={() => setActiveTooltip(null)}
                                onView={handleView}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractDocuments;
