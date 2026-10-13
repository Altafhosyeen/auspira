import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { useCd2Category } from '../ContractDataPart2Context';
import { ExpandableText } from '../../shared/ExpandableText';

// --- SECTION 06: CROSS-DOCUMENT DISAGREEMENT DEMO --- maps to JSON category `documentDisagreementDemo` (JSON-only, illustrative section)
export const DisagreementDemoSection: React.FC = () => {
  const category = useCd2Category('documentDisagreementDemo');
  const disagreement = category?.disagreementDetails;

  if (!category) return null;

  return (
    <section>
      <DocumentSectionHeader number="06" title={category.title} />
      <div className="mt-3 space-y-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {category.subtitle && (
          <span className="ds-micro! font-bold! tracking-wider text-slate-900 uppercase">
            {category.subtitle}
          </span>
        )}
        {category.description && (
          <ExpandableText lines={3} className="ds-caption! leading-relaxed! text-slate-600">
            {category.description}
          </ExpandableText>
        )}

        {disagreement && (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <h4 className="ds-caption! font-bold! text-amber-800">{disagreement.field}</h4>
                <span className="ds-micro! block font-bold! tracking-wide text-amber-700 uppercase">
                  {disagreement.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {disagreement.conflictingValues
                .filter((cv) => !!cv.value)
                .map((cv) => (
                  <div
                    key={cv.source}
                    className="rounded border border-amber-200 bg-white px-3 py-2"
                  >
                    <span className="ds-caption! block font-bold! text-slate-900">{cv.value}</span>
                    {cv.source && (
                      <span className="ds-micro! mt-0.5 block font-bold! tracking-wide text-slate-500 uppercase">
                        {cv.source}
                      </span>
                    )}
                  </div>
                ))}
            </div>

            {disagreement.note && (
              <ExpandableText
                lines={3}
                className="ds-micro! leading-relaxed! font-medium! text-amber-800"
              >
                {disagreement.note}
              </ExpandableText>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
