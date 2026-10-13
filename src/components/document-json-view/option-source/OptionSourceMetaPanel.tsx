'use client';

import React from 'react';

// ==========================================
// SOURCE OVERVIEW — METADATA PANEL
// Left-hand panel of SourceOverviewDialog. Purely presentational: the dialog
// (opened from the Options / Z-clauses / Time-bar eye actions) passes the
// item's content, page and document details as props and this renders them.
// The right pane (PdfViewer) handles the jump + highlight; `onJump` re-triggers
// it from the "view in document" link here.
// ==========================================

export interface OptionSourceMetaPanelProps {
  /** Short code shown in the square badge (option code, Z-number, clause). */
  code?: string;
  /** Item heading. */
  title?: string;
  /** "Document overview" body — what the source clause says. */
  overview?: string;
  /** "What it means" body — the analysis / impact of the clause. */
  meaning?: string;
  /** Optional tag rendered next to the title (e.g. HIGH-IMPACT, MODIFIED). */
  badge?: string;
  /** Page the source appears on, shown in details and used by `onJump`. */
  page?: number;
  /** Human label for the source document family. */
  sourceLabel?: string;
  /** Secondary line under the title (e.g. edition / section). */
  section?: string;
  /** Resolved display file name. */
  fileName?: string;
  /** Formatted "last reviewed" date. */
  reviewedDate?: string;
  /** Jump the PDF viewer to this item's page + re-highlight its text. */
  onJump?: () => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="ds-micro! font-bold! tracking-wider text-slate-700 uppercase">{children}</p>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
    <span className="ds-caption! shrink-0 text-slate-700">{label}</span>
    <span className="ds-caption! text-right font-semibold! text-slate-700">{value}</span>
  </div>
);

export default function OptionSourceMetaPanel({
  code,
  title,
  overview,
  meaning,
  badge,
  page,
  sourceLabel,
  section,
  fileName,
  onJump,
}: OptionSourceMetaPanelProps) {
  const pageLabel = page ? `P. ${page}` : '—';

  return (
    <div className="flex min-h-0 flex-col gap-8 p-6 sm:p-8">
      {/* Title block */}
      <div className="flex items-start gap-3">
        {code && (
          <span className="bg-main-p flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm px-1.5 text-sm font-bold! text-white">
            {code}
          </span>
        )}
        <div className="min-w-0">
          {title && <h1 className="ds-heading-3! text-text font-bold!">{title}</h1>}
          {badge && (
            <span className="ds-micro! mt-1 inline-block rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-bold! tracking-wide text-emerald-600 uppercase">
              {badge}
            </span>
          )}
          {section && <p className="ds-caption! mt-2 font-medium! text-slate-700">{section}</p>}
        </div>
      </div>

      {/* What it means */}
      {meaning?.trim() && (
        <section>
          <Label>What it means</Label>
          <p className="ds-body! mt-3 leading-relaxed text-slate-700">{meaning.trim()}</p>
        </section>
      )}

      {/* Document overview */}
      {overview?.trim() ? (
        <section>
          <Label>Document overview</Label>
          <p className="ds-body! mt-3 leading-relaxed text-slate-700">{overview.trim()}</p>
        </section>
      ) : (
        <div>
          <Label>Document overview</Label>
          Not Available
        </div>
      )}

      {/* Document details */}
      <section>
        <Label>Document details</Label>
        <div className="mt-2">
          <DetailRow label="File" value={fileName || sourceLabel} />
          <DetailRow label="Source" value={sourceLabel} />
          <DetailRow
            label="Page"
            value={
              page && onJump ? (
                <button
                  type="button"
                  onClick={onJump}
                  className="cursor-pointer font-semibold! text-blue-500 hover:text-blue-600 hover:underline"
                >
                  {pageLabel} · view in document
                </button>
              ) : (
                pageLabel
              )
            }
          />
        </div>
      </section>
    </div>
  );
}
