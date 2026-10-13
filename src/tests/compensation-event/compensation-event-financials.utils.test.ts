import { describe, expect, it } from 'vitest';
import type { CompensationEventFinancialResponseDto } from '@/modules/compensation-event/types/compensation-event-api.types';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import { toCompensationEventFinancials } from '@/modules/compensation-event/utils/compensation-event-api.utils';

describe('toCompensationEventFinancials', () => {
  const buildFinancialDto = (
    overrides: Partial<CompensationEventFinancialResponseDto> = {}
  ): CompensationEventFinancialResponseDto => ({
    quotationId: 'quote-1',
    quotedTotalCost: '18200',
    quotedClaimDays: '5',
    assessedTotalCost: '17450',
    assessedClaimDays: '4',
    differenceInCost: '-750',
    differenceInDays: '-1',
    ...overrides,
  });

  it('maps the final quotation summary onto the financials shape', () => {
    const financials = toCompensationEventFinancials(buildFinancialDto());

    expect(financials.originalQuote).toBe(18_200);
    expect(financials.approvedCost).toBe(17_450);
    expect(financials.costDifference).toBe(-750);
    expect(financials.costDifferencePercent).toBeCloseTo(-4.1209, 4);
    expect(financials.originalTimeImpactDays).toBe(5);
    expect(financials.approvedTimeImpactDays).toBe(4);
    expect(financials.isFinal).toBe(true);
  });

  it('derives the cost difference when the API omits it', () => {
    const financials = toCompensationEventFinancials(buildFinancialDto({ differenceInCost: null }));

    expect(financials.costDifference).toBe(-750);
  });

  it('is not final and has no approved figures before a quotation is assessed', () => {
    const financials = toCompensationEventFinancials(
      buildFinancialDto({
        assessedTotalCost: null,
        assessedClaimDays: null,
        differenceInCost: null,
        differenceInDays: null,
      })
    );

    expect(financials.approvedCost).toBeNull();
    expect(financials.costDifference).toBeNull();
    expect(financials.costDifferencePercent).toBeNull();
    expect(financials.isFinal).toBe(false);
  });

  it('carries the fees and risk allowance through, keeping a reported zero', () => {
    const financials = toCompensationEventFinancials(
      buildFinancialDto({ fees: '0', riskAllowance: 0 })
    );

    expect(financials.fees).toBe(0);
    expect(financials.riskAllowance).toBe(0);
  });

  it('leaves the fees and risk allowance null when the API omits them', () => {
    const financials = toCompensationEventFinancials(buildFinancialDto());

    expect(financials.fees).toBeNull();
    expect(financials.riskAllowance).toBeNull();
  });
});
