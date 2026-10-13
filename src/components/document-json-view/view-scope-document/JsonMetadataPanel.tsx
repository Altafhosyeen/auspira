import React from 'react';
import { DocumentSectionHeader } from '../shared/DocumentSectionHeader';
import { ExpandableText } from '../shared/ExpandableText';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { PageChip } from '../shared/PageChip';
import { RefBadge } from '../shared/RefBadge';
import { CitationBadge } from './CitationBadge';
import type {
  JsonConstraintItem,
  JsonObligationItem,
  JsonScopeDocument,
  JsonScopeSection,
} from './types';
import { useScopeDocumentData } from './ViewScopeDocumentContext';

function ScopePillBadge({ reference }: { reference: string }) {
  return (
    <span className="bg-badge-warning-soft ds-micro! inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold! whitespace-nowrap">
      <span className="text-amber-500">◆</span>
      <span className="text-slate-700">{reference}</span>
    </span>
  );
}

function TopLevelScopeSection({ section }: { section: JsonScopeSection }) {
  const categories = section.categories ?? [];

  return (
    <div>
      <DocumentSectionHeader number={section.number} title={section.title} />

      <div className="mt-3 space-y-4">
        <div className="space-y-2 text-xs leading-relaxed! text-slate-600">
          {section.description && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <ExpandableText lines={2} className="min-w-0 flex-1">
                {section.description}
              </ExpandableText>
              {section.citation && (
                <CitationBadge citation={section.citation} searchText={section.description} />
              )}
            </div>
          )}
          {section.contractDelivery && (
            <p className="font-medium! text-slate-500">
              Contract delivery:{' '}
              <span className="font-bold! text-slate-700">{section.contractDelivery}</span>
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {section.note && (
            <p className="border-b border-slate-100 p-4 text-xs leading-relaxed! text-slate-500">
              {section.note}
            </p>
          )}

          <div className="divide-y divide-slate-100">
            {categories
              .filter((category) => !!category.name)
              .map((category) => (
                <div key={category.name} className="flex items-stretch">
                  <div className="bg-badge-warning-soft flex w-36 shrink-0 items-center px-4 py-4">
                    <span className="ds-micro! text-main-p flex items-start gap-1.5 font-bold! tracking-wide uppercase">
                      <span className="mt-0.75 shrink-0 text-amber-500">◆</span>
                      {category.name}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 divide-y divide-slate-100">
                    {category.items
                      .filter((item) => !!item.text)
                      .map((item) => (
                        <div
                          key={item.citation.reference}
                          className="ds-caption! text-main-p flex items-start justify-between gap-3 px-4 py-4 transition-colors hover:bg-slate-50/55"
                        >
                          <ExpandableText lines={2} className="min-w-0 flex-1">
                            {item.text}
                          </ExpandableText>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <ScopePillBadge reference={item.citation.reference} />
                            <PageChip page={item.citation.page} searchText={item.text} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalReferencesSection({ section }: { section: JsonScopeSection }) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <DocumentSectionHeader number={section.number} title={section.title} />

      <div className="mt-3 space-y-4">
        {section.designStandards && section.designStandards.length > 0 && (
          <div className="space-y-2">
            <DocumentSectionHeader number="1" title="Design Standards & Codes" />
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {section.designStandards
                .filter((std) => !!std.code)
                .map((std, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-slate-50/55"
                  >
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="w-36 min-w-0 shrink-0 font-bold! text-slate-900">
                        {std.code}
                      </span>
                      <ExpandableText
                        lines={2}
                        className="ds-caption! min-w-0 font-medium! text-slate-600"
                      >
                        {std.description}
                      </ExpandableText>
                    </div>
                    <CitationBadge
                      citation={std.citation}
                      searchText={std.description || std.code}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {section.performanceParameters && section.performanceParameters.length > 0 && (
          <div className="space-y-2">
            <DocumentSectionHeader number="2" title="Key Performance Parameters" />
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {section.performanceParameters
                .filter((param) => !!param.name && !!param.value)
                .map((param, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-slate-50/55"
                  >
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="w-32 min-w-0 shrink-0 font-bold! text-slate-900 capitalize">
                        {param.name}
                      </span>
                      <ExpandableText
                        lines={2}
                        className="ds-caption! min-w-0 font-medium! text-slate-600"
                      >
                        {param.value}
                      </ExpandableText>
                    </div>
                    <CitationBadge citation={param.citation} searchText={param.value} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ObligationsSection({ section }: { section: JsonScopeSection }) {
  const items = ((section.items ?? []) as JsonObligationItem[]).filter((ob) => !!ob.title);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <DocumentSectionHeader number={section.number} title={section.title} />

      <div className="mt-3 space-y-2.5">
        {items.map((ob, index) => (
          <div
            key={index}
            className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs font-bold! text-slate-900">{ob.title}</h4>
                {ob.override && (
                  <span className="ds-micro! rounded bg-amber-500 px-1.5 py-0.5 font-bold! tracking-wide text-white">
                    {ob.override.toUpperCase()}
                  </span>
                )}
              </div>
              <ExpandableText lines={2} className="ds-caption! font-medium! text-slate-500">
                {ob.description}
              </ExpandableText>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-50 pt-2 sm:border-t-0 sm:pt-0">
              <span className="text-xs font-bold! tracking-wide text-amber-600">{ob.period}</span>
              <CitationBadge citation={ob.citation} searchText={ob.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstraintsJsonSection({ section }: { section: JsonScopeSection }) {
  const items = ((section.items ?? []) as JsonConstraintItem[]).filter((item) => !!item.text);

  if (items.length === 0) return null;

  return (
    <div className="border-t border-slate-100 pt-4">
      <DocumentSectionHeader number={section.number} title={section.title} />

      <div className="mt-3 space-y-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-xs"
            >
              <div className="mb-2.5 flex items-start gap-2">
                <span className="ds-micro! mt-0.5 shrink-0 font-bold! text-amber-500">◆</span>
                <ExpandableText
                  lines={2}
                  className="ds-caption! min-w-0 flex-1 leading-relaxed! font-medium! text-slate-700"
                >
                  {item.text}
                </ExpandableText>
              </div>
              <div className="self-end">
                <CitationBadge citation={item.citation} searchText={item.text} />
              </div>
            </div>
          ))}
        </div>

        {section.note && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
            <ExpandableText
              lines={3}
              className="ds-caption! leading-relaxed! font-medium! text-amber-800"
            >
              {section.note}
            </ExpandableText>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferencedDocumentsList({ documents }: { documents: JsonScopeDocument['documents'] }) {
  const visibleDocs = (documents ?? []).filter((doc) => !!doc.name);

  if (visibleDocs.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-slate-100 pt-4">
      <DocumentSectionHeader number="3" title="Referenced Project Documents" />
      <div className="flex flex-wrap gap-2.5">
        {visibleDocs.map((doc, index) => (
          <div
            key={`${doc.id}-${index}`}
            className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs"
          >
            <span className="ds-caption! font-bold! text-slate-700">{doc.name}</span>
            <span className="ds-micro! font-mono font-bold! text-slate-500">{doc.reference}</span>
            {doc.status && (
              <RefBadge
                type={doc.status === 'ingested' ? 'status-ingested' : 'status-queued'}
                label={doc.status.toUpperCase()}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function JsonMetadataPanel() {
  const { data } = useScopeDocumentData();

  if (!data) return <NoExtractedDataPanel label="Scope of Works" />;

  const summaryCards = data.summaryCards ?? [];
  const sections = data.sections ?? [];
  const documents = data.documents ?? [];

  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {summaryCards.filter((card) => !!card.label && !!card.value).length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summaryCards
              .filter((card) => !!card.label && !!card.value)
              .map((card) => (
                <div
                  key={card.label}
                  className="rounded border border-slate-200 bg-white p-3 shadow-xs"
                >
                  <span className="ds-micro! mb-1 block font-bold! tracking-wider text-slate-500 uppercase">
                    {card.label}
                  </span>
                  <span className="text-xs font-bold! text-slate-900">{card.value}</span>
                </div>
              ))}
          </div>
        )}

        {sections.map((section) => {
          switch (section.id) {
            case 'topLevelScope':
              return <TopLevelScopeSection key={section.id} section={section} />;
            case 'technicalReferences':
              return <TechnicalReferencesSection key={section.id} section={section} />;
            case 'obligations':
              return (
                <React.Fragment key={section.id}>
                  <ReferencedDocumentsList documents={documents} />
                  <ObligationsSection section={section} />
                </React.Fragment>
              );
            case 'constraints':
              return <ConstraintsJsonSection key={section.id} section={section} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
