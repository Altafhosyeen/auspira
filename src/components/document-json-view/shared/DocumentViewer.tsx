'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import type { DashboardState, DocumentMeta } from './types';
import { DocumentCoverPage } from './DocumentCoverPage';
import { DocumentInfoSheetPage } from './DocumentInfoSheetPage';
import { DocumentFallbackPage } from './DocumentFallbackPage';

// react-pdf (pdf.js) touches browser-only APIs — load it client-side only.
const PdfViewer = dynamic(() => import('@/components/pdf-highlight').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-slate-100">
      <Spin size="large" />
    </div>
  ),
});

interface DocumentViewerProps extends Pick<DashboardState, 'activePage' | 'setActivePage'> {
  meta: DocumentMeta;
  /** Text to highlight in the PDF after jumping to a page. */
  searchText?: string;
  /** Page number on which to draw the highlight. */
  searchPage?: number | null;
  /** Bumped on every chip click so the viewer re-navigates/re-centres even for a repeat of the same reference. */
  highlightNonce?: number;
  /** Called when the user manually navigates so highlight state can be cleared. */
  onClearHighlight?: () => void;
  /** Sibling values from the same record, used to disambiguate a repeated `searchText`. */
  contextHints?: string[];
}

/** True when the meta points at a real uploaded file (e.g. Azure blob SAS URL) rather than a mock page set. */
export const isRemoteFileUrl = (url: string) => /^https?:\/\//i.test(url);

const OFFICE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];

/** File extension from the file name, falling back to the URL path (ignoring the SAS query string). */
const getFileExtension = (fileName: string, fileUrl: string): string => {
  const source = fileName.includes('.') ? fileName : (fileUrl.split('?')[0] ?? '');
  const ext = source.includes('.') ? (source.split('.').pop() ?? '') : '';
  return ext.toLowerCase();
};

/** Full-page Office Online viewer URL — used for "open in new tab" so the file renders instead of downloading. */
const officeViewUrl = (fileUrl: string) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;

/** Embedded Office Online viewer URL — used for the inline iframe. */
const officeEmbedUrl = (fileUrl: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

// ==========================================
// SUB-COMPONENT: DOCUMENT VIEWER
// ==========================================
export function DocumentViewer({
  activePage,
  meta,
  searchText,
  searchPage,
  highlightNonce,
  onClearHighlight,
  contextHints,
}: DocumentViewerProps) {
  const isRemoteFile = isRemoteFileUrl(meta.fileUrl);
  const ext = getFileExtension(meta.documentTitle, meta.fileUrl);
  const isOfficeFile = OFFICE_EXTENSIONS.includes(ext);

  // Office files open through the Office Online viewer so the browser shows
  // the document instead of downloading it; PDFs/images render natively.
  const openInNewTab = () => {
    const url = !isRemoteFile
      ? window.location.href
      : isOfficeFile
        ? officeViewUrl(meta.fileUrl)
        : meta.fileUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // PDFs render through react-pdf with a light, UI-matching toolbar
  // (replaces the browser's native black PDF chrome). Self-contained, so it
  // skips the generic toolbar below.
  if (
    isRemoteFile &&
    !isOfficeFile &&
    !IMAGE_EXTENSIONS.includes(ext) &&
    (ext === 'pdf' || ext === '')
  ) {
    return (
      <PdfViewer
        fileUrl={meta.fileUrl}
        activePage={activePage}
        title={meta.documentTitle}
        onOpenInNewTab={openInNewTab}
        searchText={searchText}
        searchPage={searchPage}
        highlightNonce={highlightNonce}
        onClearHighlight={onClearHighlight}
        contextHints={contextHints}
      />
    );
  }

  return (
    <>
      {/* Top Document Scale & Option Toolbar */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-1.5 shadow-sm">
        <div className="flex min-w-0 flex-1 items-center space-x-3 text-xs text-slate-600">
          {isRemoteFile ? (
            <span className="truncate font-semibold! text-slate-700" title={meta.documentTitle}>
              {meta.documentTitle}
            </span>
          ) : (
            <>
              <span className="font-semibold! text-slate-700">
                Page {activePage} / {meta.totalPages}
              </span>
              <span className="text-slate-700">|</span>
              <div className="flex items-center rounded border border-slate-200 bg-white shadow-2xs">
                <button
                  type="button"
                  className="px-2 py-0.5 font-bold! transition-colors hover:bg-slate-100"
                >
                  -
                </button>
                <span className="ds-caption! border-x border-slate-100 bg-slate-50 px-3 py-0.5 font-mono">
                  108%
                </span>
                <button
                  type="button"
                  className="px-2 py-0.5 font-bold! transition-colors hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center space-x-2 pl-3">
          <button
            type="button"
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200"
            title="Rotate"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={openInNewTab}
            className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold! whitespace-nowrap text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            OPEN IN NEW TAB
          </button>
        </div>
      </div>

      {/* Real uploaded file — rendered inline per file type */}
      {isRemoteFile &&
        (() => {
          // Word / Excel / PowerPoint — Microsoft Office Online embed viewer
          if (isOfficeFile) {
            return (
              <iframe
                src={officeEmbedUrl(meta.fileUrl)}
                title={meta.documentTitle}
                className="h-full min-h-0 w-full flex-1 border-0 bg-white"
              />
            );
          }

          // Images — render directly
          if (IMAGE_EXTENSIONS.includes(ext)) {
            return (
              <div className="flex flex-1 items-start justify-center overflow-auto p-4 sm:p-8">
                <img
                  src={meta.fileUrl}
                  alt={meta.documentTitle}
                  className="max-w-full bg-white shadow-md"
                />
              </div>
            );
          }

          // PDFs are handled by the early PdfViewer return above.

          // Anything else (zip, dwg, …) — no inline preview, offer download
          return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              <p className="text-sm font-semibold! text-slate-700">{meta.documentTitle}</p>
              <p className="text-xs text-slate-500">Preview is not available for .{ext} files.</p>
              <a
                href={meta.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold! text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
              >
                Download file
              </a>
            </div>
          );
        })()}

      {/* Document Scaled Content Container (Responsive aspect layout) */}
      {!isRemoteFile && (
        <div className="flex flex-1 flex-col items-center justify-start overflow-auto p-4 sm:p-8">
          <div className="w-full max-w-[595px] shrink-0">
            {/* PAGE 1: COVER PAGE */}
            {activePage === 1 && (
              <DocumentCoverPage
                documentType={meta.documentType}
                coverHeading={meta.coverHeading}
                documentSubtitle={meta.documentSubtitle}
                client={meta.client}
                reference={meta.reference}
                status={meta.status}
                date={meta.date}
              />
            )}

            {/* PAGE 2: INFO SHEET PAGE */}
            {activePage === 2 && (
              <DocumentInfoSheetPage
                documentTitle={meta.documentTitle}
                documentSubtitle={meta.documentSubtitle}
                reference={meta.reference}
                projectNumber={meta.projectNumber}
                totalPages={meta.totalPages}
              />
            )}

            {/* PAGE > 2: FALLBACK WORKPAGE */}
            {activePage > 2 && (
              <DocumentFallbackPage activePage={activePage} totalPages={meta.totalPages} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
