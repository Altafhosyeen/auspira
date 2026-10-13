import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateAlertQueries } from '@/hooks/modules/project-alerts';
import { quotationService } from '../services/quotation.service';
import type { ProceedWithAssessmentInput } from '../types/compensation-event-assessment.types';
import type {
  AcceptQuotationInput,
  ConfirmQuotationInput,
  RequestQuotationRevisionInput,
} from '../types/compensation-event-quotation.types';
import { COMPENSATION_EVENT_QUERY_KEY } from './use-compensation-events';

export const useConfirmQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmQuotationInput) => quotationService.confirm(input),
    onSuccess: () => {
      // Linking the quotation to an event settles both caches, same as accepting it.
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

export const useAcceptQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AcceptQuotationInput) => quotationService.accept(input),
    onSuccess: () => {
      // Accepting settles the alert as well as the event, so both caches go stale.
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

export const useRequestQuotationRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RequestQuotationRevisionInput) => quotationService.requestRevision(input),
    onSuccess: () => {
      // The request moves the alert back to the contractor and re-opens the event.
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};

export const useProceedWithAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProceedWithAssessmentInput) =>
      quotationService.proceedWithAssessment(input),
    onSuccess: () => {
      // Implementing the assessment settles the alert as well as the event it priced.
      queryClient.invalidateQueries({ queryKey: COMPENSATION_EVENT_QUERY_KEY });
      invalidateAlertQueries(queryClient);
    },
  });
};
