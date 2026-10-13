import React from 'react';
import { useFoaData, getCategory, getDetail, detailRefTag } from '../FormOfAgreementContext';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import { PageChip } from '../../shared/PageChip';
import { ExpandableText } from '../../shared/ExpandableText';

const BlueRef: React.FC<{ text: string }> = ({ text }) => (
  <span className="badge-info! ds-micro! inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 font-semibold! tracking-wide whitespace-nowrap">
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
    {text}
  </span>
);

const Field: React.FC<{ label: string; value?: string; placeholder: string }> = ({
  label,
  value,
  placeholder,
}) => (
  <div>
    <span className="ds-micro! block font-bold! tracking-wide text-slate-500 uppercase">
      {label}
    </span>
    {value ? (
      <p className="ds-caption! text-text">{value}</p>
    ) : (
      // Muted, but still readable — slate-400 on white fails contrast at this size.
      <p className="ds-caption! text-slate-500">{placeholder}</p>
    )}
  </div>
);

export const PartiesSection: React.FC = () => {
  const { data } = useFoaData();
  const cat = getCategory(data, 'parties');

  if (!cat) return null;

  const clientDetail = getDetail(cat, 'Client');
  const contractorDetail = getDetail(cat, 'Contractor');
  const contractorBlank = contractorDetail?.status === 'blank';
  const contractorName =
    typeof contractorDetail?.value === 'string' ? contractorDetail.value : undefined;

  const clientRef = clientDetail?.reference?.trim() || null;
  const clientPage = detailRefTag(clientDetail, '').page;
  const contractorRef = contractorDetail?.reference?.trim() || null;
  const contractorPage = detailRefTag(contractorDetail, '').page;

  return (
    <section className="space-y-3">
      {cat.title?.trim() && <DocumentSectionHeader number="01" title={cat.title} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Client Card */}
        {clientDetail && typeof clientDetail.value === 'string' && clientDetail.value && (
          <div className="border-l-main-p relative flex flex-col justify-between rounded-lg border border-l-[3.5px] border-slate-200 bg-white p-5 shadow-sm">
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              {clientRef && <BlueRef text={clientRef} />}
              <PageChip
                page={clientPage}
                searchText={
                  typeof clientDetail?.value === 'string' ? clientDetail.value : undefined
                }
              />
            </div>
            <div>
              <span className="ds-micro! font-bold! tracking-wide text-slate-500 uppercase">
                Client
              </span>
              <h3 className="ds-body-strong! text-text mt-1">
                {typeof clientDetail.value === 'string' ? clientDetail.value : ''}
              </h3>
              {clientDetail.status && (
                <span className="badge-neutral! ds-micro! mt-1.5 inline-block rounded px-1.5 py-0.5 font-bold! tracking-wider uppercase">
                  {clientDetail.status}
                </span>
              )}
              {clientDetail.description && (
                <ExpandableText lines={3} className="ds-caption! mt-1 text-slate-600">
                  {clientDetail.description}
                </ExpandableText>
              )}
            </div>
            <div className="mt-6 space-y-3 border-t border-dotted border-slate-200 pt-4">
              <Field
                label="Contract Notice Address"
                placeholder="Address for formal notices (NEC4 cl.13) — to be populated"
              />
              <Field
                label="Notices Email"
                placeholder="Email for cl.13 communications — to be populated"
              />
            </div>
          </div>
        )}

        {/* Contractor Card */}
        {contractorDetail && (
          <div className="border-l-badge-warning relative flex flex-col justify-between rounded-lg border border-l-[3.5px] border-slate-200 bg-white p-5 shadow-sm">
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              {contractorRef && <BlueRef text={contractorRef} />}
              <PageChip page={contractorPage} searchText={contractorName} />
            </div>
            <div>
              <span className="ds-micro! font-bold! tracking-wide text-slate-500 uppercase">
                Contractor
              </span>
              {contractorBlank ? (
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="ds-body-strong! text-slate-500">Not provided</h3>
                </div>
              ) : (
                <h3 className="ds-body-strong! text-text mt-1">{contractorName}</h3>
              )}
              {contractorDetail.status && !contractorBlank && (
                <span className="badge-neutral! ds-micro! mt-1.5 inline-block rounded px-1.5 py-0.5 font-bold! tracking-wider uppercase">
                  {contractorDetail.status}
                </span>
              )}
              {contractorDetail.description && (
                <ExpandableText lines={3} className="ds-caption! mt-1 text-slate-600">
                  {contractorDetail.description}
                </ExpandableText>
              )}
            </div>
            <div className="mt-6 space-y-3 border-t border-dotted border-slate-200 pt-4">
              <Field
                label="Contract Notice Address"
                placeholder="Address for formal notices (NEC4 cl.13) — to be populated"
              />
              <Field
                label="Notices Email"
                placeholder="Email for cl.13 communications — to be populated"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
