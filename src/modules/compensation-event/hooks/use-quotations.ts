import { useQuery } from '@tanstack/react-query';
import { quotationService } from '../services/quotation.service';
import type { QuotationResponseDto } from '../types/compensation-event-quotation-api.types';

export const QUOTATION_QUERY_KEY = ['quotation'] as const;

/** All quotation revisions for a compensation event — the Quotation screen shows the latest. */
export const useGetQuotationsByCompensationEvent = ({
  compensationEventId,
  enabled,
}: {
  compensationEventId?: string;
  enabled?: boolean;
}) =>
  useQuery<QuotationResponseDto[]>({
    queryKey: [...QUOTATION_QUERY_KEY, compensationEventId ?? ''],
    queryFn: () => quotationService.getByCompensationEvent(compensationEventId!),
    enabled: (enabled ?? true) && !!compensationEventId,
  });

/** One quotation by its own id — the register links straight to it from a CE row. */
export const useGetQuotationById = ({ id, enabled }: { id?: string; enabled?: boolean }) =>
  useQuery<QuotationResponseDto>({
    queryKey: [...QUOTATION_QUERY_KEY, 'detail', id ?? ''],
    queryFn: () => quotationService.getById(id!),
    enabled: (enabled ?? true) && !!id,
  });
