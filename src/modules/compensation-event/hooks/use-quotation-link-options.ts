'use client';

import { useMemo } from 'react';
import { useGetPmisLookup } from '@/modules/pmi';
import { useProjectStore } from '@/store/project.store';
import {
  matchCompensationEventReference,
  toCompensationEventLookupOptions,
} from '../utils/compensation-event-api.utils';
import { useGetCompensationEventsLookup } from './use-compensation-events';

export interface QuotationLinkOption {
  label: string;
  value: string;
  reference: string;
}

/** Which record type the quotation link card offers — one kind, or both for the PM to settle. */
export type QuotationLinkKind = 'ce' | 'pmi' | 'both';

interface UseQuotationLinkOptionsArgs {
  kind: QuotationLinkKind;
  // The mail's reference, until a confirmed link supersedes it.
  quotationReference?: string;
  // The record currently picked in the dropdown, whose reference the actions are sent.
  linkedEventId?: string;
}

// The picker's options and the extractor's best-guess match, shared by the quotation
// screen. A PMI quotation lists the project's instructions, a CE quotation its events —
// and when the signal names neither (or names both), the screen offers both lookups and
// the PM settles which one the quotation belongs to. Returns the matched record id too,
// so the caller can seed the picker with the reference the mail named — the PM still
// confirms the link before it counts.
export const useQuotationLinkOptions = ({
  kind,
  quotationReference,
  linkedEventId,
}: UseQuotationLinkOptionsArgs) => {
  const selectedProjectId = useProjectStore((store) => store.selectedProjectId);
  const loadCe = kind !== 'pmi';
  const loadPmi = kind !== 'ce';

  const { data: eventLookup, isLoading: eventLookupLoading } = useGetCompensationEventsLookup({
    projectId: selectedProjectId ?? undefined,
    enabled: loadCe && !!selectedProjectId,
  });

  const { data: pmiLookup, isLoading: pmiLookupLoading } = useGetPmisLookup({
    projectId: selectedProjectId ?? undefined,
    enabled: loadPmi && !!selectedProjectId,
  });

  const ceOptions = useMemo<QuotationLinkOption[]>(
    () => toCompensationEventLookupOptions(eventLookup),
    [eventLookup]
  );

  const pmiOptions = useMemo<QuotationLinkOption[]>(
    () =>
      (pmiLookup ?? []).map((p) => ({
        label: p.title ? `${p.referenceNumber} - ${p.title}` : p.referenceNumber,
        value: p.pmiId,
        reference: p.referenceNumber,
      })),
    [pmiLookup]
  );

  const matchedCeId = useMemo(
    () => matchCompensationEventReference(quotationReference, eventLookup),
    [quotationReference, eventLookup]
  );

  const matchedPmiId = useMemo(() => {
    if (!quotationReference || !pmiLookup?.length) return undefined;
    const ref = quotationReference.trim().toLowerCase();
    return pmiLookup.find((p) => p.referenceNumber.trim().toLowerCase() === ref)?.pmiId;
  }, [quotationReference, pmiLookup]);

  // Every action names the event/PMI it acts on by reference, so the picked
  // option — not the extractor's free-text claim — is what the endpoints are sent.
  const linkedReference = useMemo(
    () => [...ceOptions, ...pmiOptions].find((option) => option.value === linkedEventId)?.reference,
    [ceOptions, pmiOptions, linkedEventId]
  );

  // The lookup resolves after mount, so a match seeds the picker when it lands — the
  // caller keeps the seeding effect; it is only a text match though, so the PM still
  // has to hit Confirm to actually link the quotation to it.
  return {
    ceOptions,
    pmiOptions,
    matchedCeId,
    matchedPmiId,
    linkedReference,
    isLoading:
      loadCe && loadPmi
        ? eventLookupLoading || pmiLookupLoading
        : loadCe
          ? eventLookupLoading
          : pmiLookupLoading,
  };
};
