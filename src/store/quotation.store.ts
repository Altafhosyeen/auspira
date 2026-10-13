import { create } from 'zustand';

interface QuotationLinkBridgeState {
  // Ephemeral, non-persisted — the compensation event a quotation was linked to, handed
  // to the assessment screen as a prop instead of on the URL (router.push carries no
  // props), so the reference is not exposed in the address bar.
  linkedCompensationEventReference: string | null;
  setLinkedCompensationEventReference: (reference: string | null) => void;
  // The register's own id for the confirmed quotation — lets the assessment screen fetch
  // the quotation from the API instead of falling back to the extractor's read of the alert.
  linkedQuotationId: string | null;
  setLinkedQuotationId: (quotationId: string | null) => void;
  // The signal the quotation arrived on, when proceeding from the alert-driven quotation
  // screen — the assessment screen reads its card off this alert instead of the register's
  // persisted quotation, same as that screen does.
  linkedProjectAlertId: string | null;
  setLinkedProjectAlertId: (projectAlertId: string | null) => void;
}

export const useQuotationLinkBridgeStore = create<QuotationLinkBridgeState>((set) => ({
  linkedCompensationEventReference: null,
  setLinkedCompensationEventReference: (reference) =>
    set({ linkedCompensationEventReference: reference }),
  linkedQuotationId: null,
  setLinkedQuotationId: (quotationId) => set({ linkedQuotationId: quotationId }),
  linkedProjectAlertId: null,
  setLinkedProjectAlertId: (projectAlertId) => set({ linkedProjectAlertId: projectAlertId }),
}));
