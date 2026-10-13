// ==========================================
// SHARED TYPES & INTERFACES — DOCUMENT REVIEW LAYOUT
// ==========================================

export type ViewMode = 'side-by-side' | 'original';

export interface DashboardState {
  viewMode: ViewMode;
  activePage: number;
  setActivePage: (page: number) => void;
  setViewMode: (mode: ViewMode) => void;
}

export type BadgeType = 'perf' | 'wi' | 'override' | 'status-queued' | 'status-ingested';

export interface BadgeProps {
  type: BadgeType;
  label: string;
  page?: string;
}

// ==========================================
// PAGE NAVIGATION — lets a metadata-panel ref tag jump the document
// viewer to the page it cites. Provided by DocumentReviewLayout.
// ==========================================
export interface DocumentPageContextValue {
  /**
   * Jump the document viewer to this page and optionally highlight matching text
   * in the PDF. `contextHints` are sibling values from the same record (e.g. a
   * row's own label or reference) — when `searchText` repeats on the page, the
   * highlighter ranks the occurrence nearest them above the first one it finds.
   */
  goToPage: (page: number, searchText?: string, contextHints?: string[]) => void;
}

// ==========================================
// DOCUMENT METADATA — drives header, cover & info sheet pages
// ==========================================
export interface DocumentMeta {
  /** Main project / asset title shown in the header and cover page, e.g. "Salt Island Bridge Replacement" */
  title: string;
  /** Header subtitle line, e.g. "SCOPE SUMMARY | SCOPE OF WORKS | PC6884-RHD-XX-XX-SW-C-2002" */
  subtitle: string;
  /** Document reference code, e.g. "PC6884-RHD-XX-XX-SW-C-2002" */
  reference: string;
  /** Project number, e.g. "PC6884" */
  projectNumber: string;
  /** Revision label shown in the header, e.g. "Rev C02" */
  revision: string;
  /** Revision/issue date, e.g. "17 Mar 2025" */
  date: string;
  /** Total page count for the document viewer */
  totalPages: number;
  /** Cover page heading line(s), e.g. ["Holyhead Ferry Terminal", "Salt Island Bridge Replacement"] */
  coverHeading: string[];
  /** Cover page document type label, e.g. "Scope of Work" */
  documentType: string;
  /** Cover page document subtype label, e.g. "Scope of Works" */
  documentSubtitle: string;
  /** Cover page document status, e.g. "A3/C02" */
  status: string;
  /** Client name, e.g. "Stena Line Ports Ltd" */
  client: string;
  /** Document title shown in the info sheet control table */
  documentTitle: string;
  /** File to open when "Open in new tab" is clicked */
  fileUrl: string;
}
