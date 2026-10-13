'use client';

import { Modal, Spin } from 'antd';
import { AlertTriangle, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { ApiDocumentRecord } from '@/components/document-json-view/shared/ApiDocumentReview';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';

// react-pdf (pdf.js) touches browser-only APIs — load it client-side only.
const PdfViewer = dynamic(() => import('@/components/pdf-highlight').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-slate-800">
      <Spin size="large" />
    </div>
  ),
});

/**
 * A single cross-reference source to inspect in the viewer. The value box's eye
 * action maps its `projectCrossReferenceKeyValues` entry (+ parent finding info)
 * onto this shape.
 */
export interface CrossReferenceSourceData {
  /** SAS URL of the source document (`projectDocumentUrl`). Used if the id can't resolve one. */
  documentUrl?: string;
  /** Document id (`projectDocumentId`) — resolves the signed file URL from the documents endpoint. */
  projectDocumentId?: string;
  /** 1-based page the value was extracted from. */
  page: number;
  /** The extracted value to highlight (`value`). */
  extractedValue: string;
  /** Source document file name (`reference`). */
  documentName: string;
  /** Human-readable document family (e.g. "Conditions"), shown as "Source". */
  documentTypeLabel?: string;
  /** Cross-reference key label (parent `label`). */
  label: string;
  /** Parent `errorMessage`, if any. */
  errorMessage?: string;
  /** Parent `description`. */
  description?: string;
  /**
   * Sibling values from the same finding (its label, this row's own clause
   * reference) — passed straight to `PdfViewer` so it can pick the occurrence
   * of `extractedValue` that sits next to them, rather than the first one on
   * the page, when the value repeats (e.g. the same figure in several rows
   * of a table).
   */
  contextHints?: string[];
}

interface CrossReferenceSourceDialogProps {
  open: boolean;
  onClose: () => void;
  source: CrossReferenceSourceData | null;
}

/** Find a document (top-level or child) by id in the project documents tree. */
const findDocument = (docs: ApiDocumentRecord[] | undefined, id: string) => {
  if (!Array.isArray(docs) || !id) return undefined;
  for (const doc of docs) {
    if (String(doc.id) === id) return doc;
    const child = doc.children?.find((c) => String(c.id) === id);
    if (child) return child;
  }
  return undefined;
};

const MetaBlock: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="min-w-0">
    <p className="ds-micro! mb-0.5 font-bold! tracking-wider text-slate-500 uppercase">{label}</p>
    <div className="ds-caption! font-semibold! wrap-break-word text-slate-800">{children}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
    <span className="ds-caption! shrink-0 text-slate-700">{label}</span>
    <span className="ds-caption! text-right font-semibold! text-slate-700">{value}</span>
  </div>
);

// ==========================================
// CROSS REFERENCE SOURCE DIALOG
// Opened from a value box's eye action. Shows the finding metadata above a reused
// PdfViewer that jumps to the extracted value's page and highlights every match.
// Self-contained: it takes the document URL + metadata directly, so it can be
// reused anywhere without a project/document lookup.
// ==========================================
export default function CrossReferenceSourceDialog({
  open,
  onClose,
  source,
}: CrossReferenceSourceDialogProps) {
  const pageNum = source?.page;
  const highlight = source?.extractedValue || '';

  // Resolve a fetchable (signed) file URL from the documents endpoint by id — the
  // same source SourceOverviewDialog uses. The raw `documentUrl` is a fallback for
  // cases where the id can't be resolved.
  const projectId = useProjectStore((state) => state.selectedProjectId) ?? '';
  const documentId = source?.projectDocumentId || '';
  const { data: docs, isLoading } = useGetDocumentsByProjectId<ApiDocumentRecord[]>({
    id: projectId,
    enabled: !!projectId && !!documentId && open,
    skipLoader: true,
  });
  const resolvedDoc = useMemo(() => findDocument(docs, documentId), [docs, documentId]);
  // While a by-id lookup is possible, wait for it to settle before falling back to the
  // raw `documentUrl` — resolving mid-flight (id lookup succeeds after the fallback
  // already mounted the viewer) swapped `fileUrl` under the PdfViewer, forcing it to
  // tear down and reload a second time (visible as a flash / duplicate render, and an
  // occasional failure if the second load hiccuped).
  const resolvedFileUrl = documentId
    ? (resolvedDoc?.filePath ?? (isLoading ? '' : source?.documentUrl || ''))
    : source?.documentUrl || '';

  // The documents list can refetch (cache invalidation elsewhere, a background
  // refetch-on-mount, etc.) while this dialog stays open, and Azure re-signs the
  // blob URL on every fetch — a new signature string on an unrelated refetch was
  // enough to make PdfViewer see a "new" fileUrl and reload the whole document
  // (visible as it re-rendering over and over). Lock the URL in for the lifetime
  // of a single "open" session so only opening a genuinely different source can
  // change what PdfViewer sees.
  const [lockedFileUrl, setLockedFileUrl] = useState('');
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setLockedFileUrl(resolvedFileUrl);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  } else if (open && !lockedFileUrl && resolvedFileUrl) {
    setLockedFileUrl(resolvedFileUrl);
  }
  const fileUrl = lockedFileUrl;

  // PDF jump + highlight state, seeded from the item and re-triggerable.
  const [activePage, setActivePage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchPage, setSearchPage] = useState<number | null>(null);
  const [highlightNonce, setHighlightNonce] = useState(0);
  // null = not searched yet / cleared; true/false = last search outcome.
  const [found, setFound] = useState<boolean | null>(null);

  // Re-seed each time the dialog opens for a new item.
  useEffect(() => {
    if (!open) return;
    setActivePage(pageNum ?? 1);
    setSearchText(highlight);
    setSearchPage(highlight && pageNum ? pageNum : null);
    setHighlightNonce((n) => n + 1);
    setFound(null);
  }, [open, pageNum, highlight]);

  const openInNewTab = () => {
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  // Re-centres the viewer on the source's page + highlight — lets the "view in
  // document" link re-trigger the jump even though it was already seeded on open.
  const jumpToSource = () => {
    if (!pageNum) return;
    setActivePage(pageNum);
    setSearchText(highlight);
    setSearchPage(highlight ? pageNum : null);
    setHighlightNonce((n) => n + 1);
    setFound(null);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 1280 }}
      title={<span className="text-base font-bold! text-slate-900">Source document</span>}
      styles={{
        body: { padding: 0, height: '82vh', display: 'flex', flexDirection: 'column' },
      }}
      destroyOnHidden
    >
      {source && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Left metadata panel */}
          <aside className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto border-b border-slate-200 bg-white px-5 py-5 lg:w-[40%] lg:border-r lg:border-b-0">
            <div>
              <p className="ds-micro! mb-0.5 font-bold! tracking-wider text-slate-500 uppercase">
                Label
              </p>
              <h3 className="ds-heading-3! font-bold! wrap-break-word text-slate-900">
                {source.label || '—'}
              </h3>
            </div>

            {source.errorMessage && (
              <div className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="ds-micro! mb-0.5 font-bold! tracking-wider text-amber-600 uppercase">
                    Error message
                  </p>
                  <p className="ds-caption! font-medium! wrap-break-word text-amber-800">
                    {source.errorMessage}
                  </p>
                </div>
              </div>
            )}

            {source.description && (
              <MetaBlock label="Description">
                <span className="leading-relaxed font-medium! text-slate-600">
                  {source.description}
                </span>
              </MetaBlock>
            )}

            <div>
              <p className="ds-micro! mb-0.5 font-bold! tracking-wider text-slate-500 uppercase">
                Document details
              </p>
              <div className="mt-1">
                <DetailRow
                  label="File"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                      {source.documentName || '—'}
                    </span>
                  }
                />
                <DetailRow
                  label="Source"
                  value={source.documentTypeLabel || source.documentName || '—'}
                />
                <DetailRow
                  label="Page"
                  value={
                    pageNum ? (
                      <DisabledTooltip
                        disabled={!fileUrl}
                        reason="No source document is available to jump to."
                      >
                        <button
                          type="button"
                          onClick={jumpToSource}
                          disabled={!fileUrl}
                          className="cursor-pointer font-semibold! text-blue-500 hover:text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                        >
                          P. {pageNum} · view in document
                        </button>
                      </DisabledTooltip>
                    ) : (
                      '—'
                    )
                  }
                />
              </div>
            </div>
          </aside>

          {/* Right document viewer — jumps to the page and highlights the extracted value */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-800">
            {isLoading && !fileUrl ? (
              <div className="flex flex-1 items-center justify-center">
                <Spin size="large" />
              </div>
            ) : fileUrl ? (
              <>
                {found === false && (
                  <div className="flex shrink-0 items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <p className="ds-caption! font-medium! text-amber-800">
                      Couldn&apos;t find “{highlight}” on page {pageNum}. The page is shown, but the
                      exact text may differ in the document.
                    </p>
                  </div>
                )}
                <PdfViewer
                  fileUrl={fileUrl}
                  activePage={activePage}
                  title={source.documentName || 'document.pdf'}
                  onOpenInNewTab={openInNewTab}
                  searchText={searchText}
                  searchPage={searchPage}
                  highlightNonce={highlightNonce}
                  contextHints={source.contextHints}
                  onHighlightResult={setFound}
                  onClearHighlight={() => {
                    setSearchText('');
                    setSearchPage(null);
                    setFound(null);
                  }}
                  pageAreaClassName="bg-slate-800"
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <p className="ds-body! text-slate-700">
                  No source document is available for this value.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
