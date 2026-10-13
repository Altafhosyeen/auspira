'use client';

import { Modal, Spin } from 'antd';
import dynamic from 'next/dynamic';
import React, { useMemo, useState } from 'react';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import { displayFileName, parseBackendDate } from '@/lib/utils';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import OptionSourceMetaPanel from './OptionSourceMetaPanel';

// react-pdf (pdf.js) touches browser-only APIs — load it client-side only.
const PdfViewer = dynamic(() => import('@/components/pdf-highlight').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-slate-800">
      <Spin size="large" />
    </div>
  ),
});

export type SourceKind = 'option' | 'zclause' | 'timebar';

/** Modal heading per source type (top title the user requested). */
const KIND_TITLE: Record<SourceKind, string> = {
  option: 'Option information',
  zclause: 'Z-Clause information',
  timebar: 'Time bar information',
};

export interface SourceOverviewData {
  code?: string;
  title?: string;
  overview?: string;
  meaning?: string;
  badge?: string;
  section?: string;
  documentId?: string;
  page?: number;
  searchText?: string;
  sourceLabel?: string;
  /**
   * Sibling values from the same record (e.g. the option code, clause number) —
   * passed straight through to `PdfViewer`. When `searchText` appears more than
   * once on the page, these are what let the engine pick the occurrence next to
   * this record's own reference rather than the first one on the page.
   */
  contextHints?: string[];
}

interface SourceOverviewDialogProps {
  open: boolean;
  onClose: () => void;
  kind: SourceKind;
  projectId: string;
  data: SourceOverviewData | null;
}

const formatDate = (iso?: string | null) =>
  parseBackendDate(iso)?.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) ?? '';

const findDocument = (docs: ApiDocumentRecord[] | undefined, id: string) => {
  if (!Array.isArray(docs) || !id) return undefined;
  for (const doc of docs) {
    if (String(doc.id) === id) return doc;
    const child = doc.children?.find((c) => String(c.id) === id);
    if (child) return child;
  }
  return undefined;
};

// ==========================================
// SOURCE OVERVIEW DIALOG
// Shared modal opened from the Options / Z-clauses / Time-bar eye actions.
// Left: the overview panel; right: the reused PdfViewer jumping to the item's
// page and highlighting its text. Data is passed directly (no URL / no route),
// so there is no header-size limit and nothing to deep-link.
// ==========================================
export default function SourceOverviewDialog({
  open,
  onClose,
  kind,
  projectId,
  data,
}: SourceOverviewDialogProps) {
  const documentId = data?.documentId || '';
  const pageNum = data?.page;
  const highlight = data?.searchText || '';
  const sourceLabel = data?.sourceLabel || '';

  const { data: docs, isLoading } = useGetDocumentsByProjectId<ApiDocumentRecord[]>({
    id: projectId,
    enabled: !!projectId && open,
    skipLoader: true,
  });
  const doc = useMemo(() => findDocument(docs, documentId), [docs, documentId]);

  const fileName = displayFileName(doc?.fileName) || sourceLabel;
  const reviewedDate = formatDate(doc?.uploadedAt);
  const fileUrl = doc?.filePath || '';

  // PDF jump + highlight state, seeded from the item and re-triggerable.
  const [activePage, setActivePage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchPage, setSearchPage] = useState<number | null>(null);
  const [highlightNonce, setHighlightNonce] = useState(0);
  const contextHints = data?.contextHints;

  // Re-seed each time the dialog opens for a new item. Adjusting state directly during
  // render (guarded by the signature check) instead of in a useEffect avoids the extra
  // render pass an effect-based sync would cost — same pattern used in DataPointDrawer.
  const [seededSignature, setSeededSignature] = useState<string | null>(null);
  const signature = open ? `${pageNum ?? ''}|${highlight}` : null;
  if (open && signature !== seededSignature) {
    setSeededSignature(signature);
    setActivePage(pageNum ?? 1);
    setSearchText(highlight);
    setSearchPage(highlight && pageNum ? pageNum : null);
    setHighlightNonce((n) => n + 1);
  } else if (!open && seededSignature !== null) {
    setSeededSignature(null);
  }

  const jumpToSource = () => {
    if (!pageNum) return;
    setActivePage(pageNum);
    setSearchText(highlight);
    setSearchPage(highlight ? pageNum : null);
    setHighlightNonce((n) => n + 1);
  };

  const openInNewTab = () => {
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="92%"
      style={{ maxWidth: 1280 }}
      title={<span className="text-base font-bold! text-slate-900">{KIND_TITLE[kind]}</span>}
      styles={{
        body: { padding: 0, height: '80vh', display: 'flex', flexDirection: 'column' },
      }}
      destroyOnHidden
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left overview panel */}
        <aside className="flex min-h-0 w-full flex-col overflow-y-auto border-b border-slate-200 bg-white lg:w-[44%] lg:border-r lg:border-b-0">
          <OptionSourceMetaPanel
            code={data?.code}
            title={data?.title}
            overview={data?.overview}
            meaning={data?.meaning}
            badge={data?.badge}
            page={pageNum}
            sourceLabel={sourceLabel}
            section={data?.section}
            fileName={fileName}
            reviewedDate={reviewedDate}
            onJump={fileUrl ? jumpToSource : undefined}
          />
        </aside>

        {/* Right document viewer */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-800">
          {isLoading && !doc ? (
            <div className="flex flex-1 items-center justify-center">
              <Spin size="large" />
            </div>
          ) : fileUrl ? (
            <>
              <PdfViewer
                fileUrl={fileUrl}
                activePage={activePage}
                title={fileName}
                onOpenInNewTab={openInNewTab}
                searchText={searchText}
                searchPage={searchPage}
                highlightNonce={highlightNonce}
                contextHints={contextHints}
                onClearHighlight={() => {
                  setSearchText('');
                  setSearchPage(null);
                }}
                pageAreaClassName="bg-slate-800"
              />
              {/* <div className="flex shrink-0 items-center justify-center gap-3 border-t border-slate-700 bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={download}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold! text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={openInNewTab}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold! text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </button>
              </div> */}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <p className="ds-body! text-slate-700">
                No source document is available for this item.
              </p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
