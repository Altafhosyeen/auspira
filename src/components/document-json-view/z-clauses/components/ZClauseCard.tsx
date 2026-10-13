import React from 'react';
import { ExpandableText } from '../../shared/ExpandableText';
import { PageChip } from '../../shared/PageChip';
import { StatusTypeLabel } from './Tags';

/** A short "AMENDS Z12" fits the narrow right-column badge; a `reference` (a
 * full legal citation, e.g. "Contracts (Rights of Third Parties) Act 1999")
 * is too long for that column and gets its own pill in the main content area. */
export interface ZClauseTypeLabel {
  text: string;
  kind: 'amendment' | 'reference';
}

export interface ZClauseCardProps {
  number: string;
  title: string;
  description: string;
  /** Undefined when the clause has neither `amendsClause` nor `reference` — no badge to show. */
  typeLabel?: ZClauseTypeLabel;
  page?: number | string | null;
  /** e.g. "LOW - defines treatment of early works payments". */
  impact?: string | null;
}

const IMPACT_STYLE: Record<string, string> = {
  low: 'badge-warning',
  medium: 'badge-accent',
  high: 'badge-error',
};

/** Splits "LOW - defines treatment of early works payments" into its severity
 * word (badged) and the explanatory note (plain text) shown beside it. */
function parseImpact(impact?: string | null): { level: string; note: string } | null {
  if (!impact) return null;
  const [levelPart, ...rest] = impact.split(' - ');
  const level = levelPart?.trim();
  if (!level) return null;
  return { level: level.toUpperCase(), note: rest.join(' - ').trim() };
}

export const ZClauseCard: React.FC<ZClauseCardProps> = ({
  number,
  title,
  description,
  typeLabel,
  page,
  impact,
}) => {
  const parsedImpact = parseImpact(impact);
  const referenceLabel = typeLabel?.kind === 'reference' ? typeLabel.text : undefined;
  const amendmentLabel = typeLabel?.kind === 'amendment' ? typeLabel.text : undefined;

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2.5px_rgba(0,0,0,0.015)] transition duration-150 hover:border-slate-300 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start gap-3">
          <span className="bg-main-p ds-caption! inline-flex h-6 min-w-11 shrink-0 items-center justify-center rounded px-1.5 font-bold! tracking-wide whitespace-nowrap text-white">
            {number}
          </span>
          <h4 className="min-w-0 text-[15px] leading-6 font-bold! text-slate-900">{title}</h4>
        </div>
        <ExpandableText lines={3} className="min-w-0 text-sm leading-relaxed! text-slate-600">
          {description}
        </ExpandableText>

        {/* Long legal-reference labels get their own single-line pill here — the
            narrow right column can't hold one without wrapping into 3 cramped lines. */}
        {referenceLabel && (
          <span className="ds-micro! bg-badge-neutral-soft inline-block rounded border border-slate-200/60 px-2 py-1 font-semibold! text-slate-600">
            {referenceLabel}
          </span>
        )}

        {parsedImpact && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`ds-micro! inline-flex items-center rounded px-1.5 py-0.5 font-bold! tracking-wide uppercase ${
                IMPACT_STYLE[parsedImpact.level.toLowerCase()] ?? 'badge-neutral'
              }`}
            >
              {parsedImpact.level}
            </span>
            {parsedImpact.note && (
              <span className="ds-micro! text-slate-500">{parsedImpact.note}</span>
            )}
          </div>
        )}
      </div>

      {/* Right column — short "AMENDS X" badge with page chip on same line */}
      <div className="shrink-0 self-start sm:w-[168px] sm:self-center">
        <div className="flex w-full items-center justify-end gap-2">
          {amendmentLabel && <StatusTypeLabel text={amendmentLabel} />}
          <PageChip page={page} searchText={description || title} contextHints={[number, title]} />
        </div>
      </div>
    </div>
  );
};

export function deriveTypeLabel(clause: {
  category: string;
  amendsClause?: string | null;
  reference?: string | null;
}): ZClauseTypeLabel | undefined {
  // `amendsClause` is the actual per-clause signal for "this amends an existing
  // NEC clause" — the API's `category` free-text field (e.g. "Environmental
  // liability", "Tax compliance") never literally reads "amendment", so gating
  // on that string match left every real clause falling through to "NEW".
  if (clause.amendsClause) {
    return { text: `AMENDS ${clause.amendsClause}`, kind: 'amendment' };
  }
  if (clause.reference) return { text: clause.reference, kind: 'reference' };
  // Neither field is populated — nothing real to show, so no badge at all
  // (previously defaulted to a static "NEW" regardless of the actual data).
  return undefined;
}
