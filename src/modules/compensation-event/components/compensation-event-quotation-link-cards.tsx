import type { QuotationLinkKind } from '../hooks/use-quotation-link-options';
import type { CompensationEventLookupOption } from '../types/compensation-event-api.types';
import CompensationEventQuotationLinkCard from './compensation-event-quotation-link-card';

interface CompensationEventQuotationLinkCardsProps {
  /** Which record type the signal named — `both` when it named neither, or named each. */
  linkKind: QuotationLinkKind;
  /** The reference the extractor read off the mail — a claim, not a link. */
  reference: string;
  ceOptions: CompensationEventLookupOption[];
  pmiOptions: CompensationEventLookupOption[];
  optionsLoading?: boolean;
  selectedReferenceId?: string;
  confirmedReferenceId?: string;
  onReferenceChange: (kind: Exclude<QuotationLinkKind, 'both'>) => (id?: string) => void;
  onConfirmReference: () => void;
  confirmingCe?: boolean;
  confirmingPmi?: boolean;
}

// The quotation arrived naming a reference in free text, so the PM reconciles it against a
// real record here. Which picker is offered follows the kind the signal settled: one card
// when it named a compensation event or an instruction, and both when it named neither (or
// both) and the choice is the PM's to make.
const CompensationEventQuotationLinkCards = ({
  linkKind,
  reference,
  ceOptions,
  pmiOptions,
  optionsLoading,
  selectedReferenceId,
  confirmedReferenceId,
  onReferenceChange,
  onConfirmReference,
  confirmingCe = false,
  confirmingPmi = false,
}: CompensationEventQuotationLinkCardsProps) => {
  // A link only counts as settled while the picked record is the one actually confirmed.
  const confirmed = !!selectedReferenceId && confirmedReferenceId === selectedReferenceId;

  return (
    <>
      {/* The signal named a compensation event — offer that card alone. */}
      {linkKind !== 'pmi' && (
        <CompensationEventQuotationLinkCard
          reference={reference}
          options={ceOptions}
          optionsLoading={optionsLoading}
          selectedReferenceId={linkKind === 'ce' ? selectedReferenceId : undefined}
          onReferenceChange={onReferenceChange('ce')}
          onConfirmReference={onConfirmReference}
          confirming={confirmingCe}
          confirmed={confirmed}
        />
      )}

      {/* The signal named a PMI — offer that card alone (or alongside the CE card when
          both/neither were named and the PM settles which one). */}
      {linkKind !== 'ce' && (
        <CompensationEventQuotationLinkCard
          reference={reference}
          title="Linked Project Manager's Instruction"
          placeholder="Select project manager instruction"
          options={pmiOptions}
          optionsLoading={optionsLoading}
          selectedReferenceId={linkKind === 'pmi' ? selectedReferenceId : undefined}
          onReferenceChange={onReferenceChange('pmi')}
          onConfirmReference={onConfirmReference}
          confirming={confirmingPmi}
          confirmed={confirmed}
        />
      )}
    </>
  );
};

export default CompensationEventQuotationLinkCards;
