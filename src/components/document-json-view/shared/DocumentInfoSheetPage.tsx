import React from 'react';
import type { DocumentMeta } from './types';

type DocumentInfoSheetPageProps = Pick<
  DocumentMeta,
  'documentTitle' | 'documentSubtitle' | 'reference' | 'projectNumber' | 'totalPages'
>;

// ==========================================
// SUB-COMPONENT: INFO SHEET PAGE (PAGE 2)
// ==========================================
export function DocumentInfoSheetPage({
  documentTitle,
  documentSubtitle,
  reference,
  projectNumber,
  totalPages,
}: DocumentInfoSheetPageProps) {
  return (
    <div className="flex aspect-[1/1.414] w-full flex-col justify-between overflow-hidden rounded bg-white p-6 shadow-xl sm:p-12">
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header Grid */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
          <div className="text-left">
            <span className="ds-micro! block font-bold! text-sky-950 sm:text-xs!">
              Royal HaskoningDHV
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span className="ds-micro! sm:ds-micro! bg-red-600 px-1.5 py-0.5 font-black! tracking-tighter text-white sm:px-2">
              Stena Line
            </span>
          </div>
        </div>

        {/* Meta Address block */}
        <div className="ds-micro! sm:ds-caption! grid grid-cols-2 gap-4 text-slate-600 sm:gap-8">
          <div className="space-y-1">
            <p className="font-bold! text-slate-900">Project Related</p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="font-bold! text-slate-900">HASKONINGDHV UK LTD.</p>
            <p>Honeycomb, Edmund Street</p>
            <p>Liverpool, L3 9NG</p>
            <p>Water & Maritime</p>
            <p className="mt-1 text-slate-500 sm:mt-2">VAT No: 752428892</p>
            <p>Tel: +44 151 236 2944</p>
          </div>
        </div>

        {/* Document metadata table block */}
        <div className="ds-micro! mt-4 overflow-hidden rounded border border-slate-200 sm:mt-6 sm:text-xs!">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 font-bold! text-slate-700 sm:py-2">
            Document Control Sheet
          </div>
          <div className="space-y-1.5 divide-y divide-slate-100 p-2.5 sm:space-y-2 sm:p-3">
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Document title</span>
              <span className="col-span-2 font-semibold! text-slate-800">{documentTitle}</span>
            </div>
            <div className="grid grid-cols-3 pt-1.5 sm:pt-2">
              <span className="text-slate-500">Subtitle</span>
              <span className="col-span-2 text-slate-700">{documentSubtitle}</span>
            </div>
            <div className="grid grid-cols-3 pt-1.5 sm:pt-2">
              <span className="text-slate-500">Reference</span>
              <span className="col-span-2 font-mono text-slate-700">{reference}</span>
            </div>
            <div className="grid grid-cols-3 pt-1.5 sm:pt-2">
              <span className="text-slate-500">Project number</span>
              <span className="col-span-2 text-slate-700">{projectNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet bottom stamp */}
      <div className="ds-micro! sm:ds-micro! flex items-center justify-between border-t border-slate-100 pt-3 text-slate-500 sm:pt-4">
        <span>Classification: Project Related</span>
        <span>Page 2 of {totalPages}</span>
      </div>
    </div>
  );
}
