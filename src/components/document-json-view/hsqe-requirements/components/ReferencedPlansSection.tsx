import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { CollapsibleDocumentList } from '../../shared/CollapsibleDocumentList';
import { FileText } from 'lucide-react';
import { useHsqeData } from '../HsqeContext';

// Section header — local to this document.

// --- SECTION 06: REFERENCED PLANS & PROCEDURES --- maps to JSON `referenced_plans_and_procedures[]`
export const ReferencedPlansSection: React.FC = () => {
  const { data } = useHsqeData();

  const plans = (data?.referenced_plans_and_procedures ?? [])
    .filter((plan) => !!plan.plan_name)
    .map((plan) => ({
      title: plan.plan_name,
      subtitle: plan.description ?? '',
      status: plan.status ?? 'Awaiting upload',
    }));

  if (plans.length === 0) return null;

  return (
    <section className="space-y-3">
      <DocumentSectionHeader number="06" title="Referenced Plans & Procedures" />

      <CollapsibleDocumentList
        items={plans}
        renderItem={(plan) => {
          const isInPack = plan.status.toLowerCase() === 'in pack';
          return (
            <div
              key={plan.title}
              className="flex items-start justify-between gap-4 p-4 transition duration-150 hover:bg-slate-50/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 shadow-sm">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <h4 className="ds-caption! font-bold! text-slate-900">{plan.title}</h4>
                  <span className="ds-micro! mt-0.5 block font-medium! text-slate-500">
                    {plan.subtitle}
                  </span>
                </div>
              </div>
              <div className="shrink-0 self-center">
                <span
                  className={`ds-micro! inline-flex items-center rounded border px-2.5 py-0.5 font-bold! tracking-wide uppercase ${
                    isInPack
                      ? 'border-badge-success-soft bg-badge-success-soft text-badge-success'
                      : 'border-badge-warning-soft bg-badge-warning-soft text-badge-warning'
                  }`}
                >
                  {plan.status}
                </span>
              </div>
            </div>
          );
        }}
      />
    </section>
  );
};
