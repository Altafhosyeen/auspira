import React from 'react';
import {
  useFoaData,
  getCategory,
  getDetail,
  detailArray,
  detailRefTag,
} from '../FormOfAgreementContext';
import type { FoaComponentDocument } from '../FormOfAgreementContext';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';
import { toSearchText } from '../../shared/toSearchText';

/** Blue ref tag — inlined to avoid linter stripping unused imports. */
const BlueRef: React.FC<{ text: string }> = ({ text }) => (
  <span className="border-badge-info-soft bg-badge-info-soft ds-micro! text-badge-info inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-semibold! tracking-wide whitespace-nowrap">
    <span className="bg-badge-info inline-block h-1.5 w-1.5 rounded-full" />
    {text}
  </span>
);

const componentDocumentRank = (title: string) => {
  const normalizedTitle = title.trim().toLowerCase();

  if (normalizedTitle.includes('conditions of contract')) return 0;
  if (normalizedTitle.includes('additional conditions') || normalizedTitle.includes('option z')) {
    return 1;
  }
  if (normalizedTitle.includes('contract data part 1')) return 2;
  if (normalizedTitle.includes('contract data part 2')) return 3;
  if (normalizedTitle.includes('documents identified')) return 4;

  return Number.MAX_SAFE_INTEGER;
};

/** Right-aligned chip container: ref tag + page chip. */
const RefChips: React.FC<{
  detail: { reference?: string; page?: number | string | null; value?: unknown } | undefined;
  /** Explicit search text override for rows whose detail has no `value` (e.g. component documents use `title`). */
  searchText?: unknown;
}> = ({ detail, searchText: searchTextOverride }) => {
  const { page } = detailRefTag(detail, '');
  const ref = detail?.reference?.trim() || null;
  // `value` may be a string OR a list (e.g. Secondary Options ["X2", "X5", …]).
  // Normalise so list-valued rows still produce a matchable PDF search query.
  // Fall back to an explicit override when the detail carries no `value`.
  const searchText = toSearchText(searchTextOverride ?? detail?.value);
  if (!ref && page == null) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {ref && <BlueRef text={ref} />}
      <PageChip page={page} searchText={searchText} />
    </div>
  );
};

const ComponentDocumentRow: React.FC<{
  doc: FoaComponentDocument;
  index: number;
  isLast: boolean;
}> = ({ doc, index, isLast }) => (
  <div
    className={`flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between ${
      isLast ? '' : 'border-b border-slate-100'
    }`}
  >
    <div className="flex min-w-0 items-start gap-3">
      <span className="bg-main-p ds-caption! flex h-6 w-6 shrink-0 items-center justify-center rounded font-bold! text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="ds-caption! font-bold! text-slate-900">{doc.title}</h4>
          {doc.section && (
            <span className="ds-micro! rounded bg-slate-100 px-1.5 py-0.5 font-bold! tracking-wider text-slate-500 uppercase">
              {doc.section}
            </span>
          )}
        </div>
        {doc.description && (
          <ExpandableText lines={3} className="ds-caption! leading-relaxed! text-slate-600">
            {doc.description}
          </ExpandableText>
        )}
      </div>
    </div>
    <RefChips detail={doc} searchText={doc.title} />
  </div>
);

// --- SECTION 02: WHAT FORMS THE AGREEMENT --- maps to JSON category `formsAgreement`
export const OptionsSection: React.FC = () => {
  const { data } = useFoaData();
  const cat = getCategory(data, 'formsAgreement');

  if (!cat) return null;

  const formEdition = getDetail(cat, 'Contract form & edition');
  const mainOptionDetail = getDetail(cat, 'Main Option');
  const disputesDetail = getDetail(cat, 'Disputes');
  const entireAgreementDetail = getDetail(cat, 'Entire Agreement');
  const secondaryOptionsRaw = detailArray(cat, 'Secondary Options');
  const secondaryOptionsDetail = getDetail(cat, 'Secondary Options');
  const componentDocuments = (cat.componentDocuments ?? [])
    .map((doc, originalIndex) => ({ doc, originalIndex }))
    .filter(({ doc }) => !!doc.title)
    .sort((left, right) => {
      const rankDifference =
        componentDocumentRank(left.doc.title) - componentDocumentRank(right.doc.title);
      if (rankDifference !== 0) return rankDifference;
      return left.originalIndex - right.originalIndex;
    })
    .map(({ doc }) => doc);

  const row = (
    label: string,
    content: React.ReactNode,
    detail: Parameters<typeof RefChips>[0]['detail']
  ) => (
    <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
        <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
          {label}
        </span>
        {content}
      </div>
      <RefChips detail={detail} />
    </div>
  );

  return (
    <section className="space-y-3">
      {cat.title?.trim() && <DocumentSectionHeader number="02" title={cat.title} />}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {formEdition &&
          typeof formEdition.value === 'string' &&
          formEdition.value &&
          row(
            'Form & Edition',
            <span className="ds-caption! font-bold! text-slate-900">{formEdition.value}</span>,
            formEdition
          )}

        {mainOptionDetail &&
          typeof mainOptionDetail.value === 'string' &&
          mainOptionDetail.value &&
          row(
            'Main Option',
            <span className="ds-caption! font-bold! text-slate-900">{mainOptionDetail.value}</span>,
            mainOptionDetail
          )}

        {disputesDetail &&
          typeof disputesDetail.value === 'string' &&
          disputesDetail.value &&
          row(
            'Disputes',
            <span className="ds-caption! font-bold! text-slate-900">{disputesDetail.value}</span>,
            disputesDetail
          )}

        {secondaryOptionsRaw.length > 0 &&
          row(
            'Secondary Options',
            <div className="flex flex-wrap gap-1">
              {secondaryOptionsRaw.map((id) => (
                <span
                  key={id}
                  className="ds-micro! rounded border border-slate-200 bg-slate-50 px-2 py-1 font-bold! text-slate-600"
                >
                  {id}
                </span>
              ))}
            </div>,
            secondaryOptionsDetail
          )}

        {componentDocuments.length > 0 && (
          <div className="flex flex-col justify-between gap-2 p-4 transition hover:bg-slate-50/10 sm:flex-row sm:items-start">
            <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-start sm:gap-12">
              <span className="ds-micro! w-40 shrink-0 pt-0.5 font-bold! tracking-wider text-slate-900 uppercase">
                Component Documents
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="ds-caption! leading-relaxed! font-semibold! text-slate-700">
                  In the order clause 3 states them, named here and defined in their own sections.
                </p>
                <div>
                  {componentDocuments.map((doc, index) => (
                    <ComponentDocumentRow
                      key={doc.title}
                      doc={doc}
                      index={index}
                      isLast={index === componentDocuments.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {entireAgreementDetail &&
          typeof entireAgreementDetail.value === 'string' &&
          entireAgreementDetail.value &&
          row(
            'Entire Agreement',
            <div>
              <span className="ds-caption! block font-bold! text-slate-900">
                {entireAgreementDetail.value}
              </span>
              {entireAgreementDetail.description && (
                <ExpandableText
                  lines={3}
                  className="ds-caption! mt-1 block leading-relaxed! text-slate-600"
                >
                  {entireAgreementDetail.description}
                </ExpandableText>
              )}
            </div>,
            entireAgreementDetail
          )}
      </div>
    </section>
  );
};
