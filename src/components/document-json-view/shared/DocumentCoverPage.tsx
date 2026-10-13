import React from 'react';
import type { DocumentMeta } from './types';

type DocumentCoverPageProps = Pick<
  DocumentMeta,
  'documentType' | 'coverHeading' | 'documentSubtitle' | 'client' | 'reference' | 'status' | 'date'
>;

// ==========================================
// SUB-COMPONENT: COVER PAGE (PAGE 1)
// ==========================================
export function DocumentCoverPage({
  documentType,
  coverHeading,
  documentSubtitle,
  client,
  reference,
  status,
  date,
}: DocumentCoverPageProps) {
  return (
    <div className="relative flex aspect-[1/1.414] w-full flex-col justify-between overflow-hidden rounded bg-white shadow-xl">
      {/* Geometric Artwork Header Panel */}
      <div className="relative h-[45%] w-full shrink-0 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L100,0 L100,60 C75,80 40,95 0,100 Z" fill="#007ba1" />
          <path d="M100,20 C75,50 40,75 0,100 L100,100 Z" fill="#8dc63f" />
        </svg>
      </div>

      {/* Cover text details */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-12">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <span className="ds-micro! mb-1 block font-semibold! tracking-wider text-slate-500 uppercase sm:text-xs!">
              {documentType}
            </span>
            <h1 className="text-lg leading-tight! font-bold! text-sky-950 sm:text-2xl!">
              {coverHeading.map((line, idx) => (
                <React.Fragment key={line}>
                  {idx > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </h1>
            <p className="ds-micro! mt-1 font-medium! text-sky-700 sm:text-xs!">
              {documentSubtitle}
            </p>
          </div>

          <div className="ds-micro! space-y-1.5 border-t border-slate-100 pt-4 sm:space-y-2 sm:pt-6 sm:text-xs!">
            <div className="flex">
              <span className="w-20 text-slate-500 sm:w-24">Client:</span>
              <span className="font-semibold! text-slate-800">{client}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-slate-500 sm:w-24">Reference:</span>
              <span className="font-mono text-slate-700">{reference}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-slate-500 sm:w-24">Status:</span>
              <span className="font-medium! text-slate-700">{status}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-slate-500 sm:w-24">Date:</span>
              <span className="font-medium! text-slate-700">{date}</span>
            </div>
          </div>
        </div>

        {/* Footer Brand Logos */}
        <div className="mt-8 flex items-end justify-between border-t border-slate-100 pt-4 sm:mt-12 sm:pt-6">
          <div className="flex shrink-0 flex-col">
            <span className="ds-micro! inline-block rounded bg-red-600 px-2 py-0.5 text-center font-black! tracking-tighter text-white sm:px-2.5 sm:py-1 sm:text-xs!">
              Stena Line
            </span>
          </div>
          <div className="text-right">
            <span className="ds-micro! block font-bold! text-sky-950 sm:text-xs!">
              Royal HaskoningDHV
            </span>
            <span className="ds-micro! sm:ds-micro! block text-slate-500">
              Enhancing Society Together
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
