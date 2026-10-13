import React from 'react';
import { Scroll } from 'lucide-react';
import { PageChip } from '../../shared/PageChip';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { CollapsibleDocumentList } from '../../shared/CollapsibleDocumentList';
import { useCd2Category } from '../ContractDataPart2Context';

// --- SECTION 04: REFERENCED DOCUMENTS --- maps to JSON category `referencedDocuments`
export const ReferencedDocumentsSection: React.FC = () => {
  const category = useCd2Category('referencedDocuments');

  const documents = (category?.items ?? [])
    .filter((item) => !!item.name)
    .map((item) => {
      const page =
        item.page != null && Number.isFinite(Number(item.page)) ? Number(item.page) : null;
      return {
        title: item.name,
        subtitle: [item.section && `${item.section} —`, item.description].filter(Boolean).join(' '),
        status: item.status ?? 'Awaiting Upload',
        reference: item.reference,
        page,
      };
    });

  if (documents.length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="04" title={category?.title ?? 'Referenced documents'} />
      <div className="mt-3">
        <CollapsibleDocumentList
          items={documents}
          listClassName="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs shadow-sm"
          renderItem={(doc, index) => (
            <div
              key={`${doc.title}-${doc.reference ?? 'no-ref'}-${index}`}
              className="flex flex-col justify-between gap-4 p-4 transition duration-150 hover:bg-slate-50/20 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded bg-slate-100 p-2 text-slate-500">
                  <Scroll className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="ds-caption! text-main-p font-bold!">{doc.title}</h4>
                  <span className="ds-micro! mt-0.5 block font-medium! text-slate-500">
                    {doc.subtitle}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {doc.status && (
                  <span className="ds-micro! rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold! text-amber-700 uppercase">
                    {doc.status}
                  </span>
                )}
                {(doc.reference || doc.page != null) && (
                  <div className="flex items-center gap-1.5">
                    {doc.reference && (
                      <span className="ds-micro! font-semibold! text-slate-500">
                        {doc.reference}
                      </span>
                    )}
                    {doc.page != null && <PageChip page={doc.page} searchText={doc.title} />}
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
};
