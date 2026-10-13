'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { PMI_SOURCE_CROSS_REFERENCE } from '@/constants/routes.constants';
import type { PmiCrossReferenceOrigin } from '../types/pmi.types';

// What to call an instruction raised from cross-reference: the data point's name,
// falling back to the agreed value when the link carried no name.
export const crossReferenceOriginLabel = (origin: PmiCrossReferenceOrigin): string =>
  origin.dataPoint.trim() || origin.value.trim();

// Reads the cross-reference data point the register was opened from — the drawer
// hands it over through the query string. Returns null for a PMI raised directly
// from the register, so callers can treat the link as optional. The id is what makes
// the link meaningful, so a missing one discards the origin even when the source flag
// is present; `value` and `dataPoint` are both allowed to be empty.
export const usePmiCrossReferenceOrigin = (): PmiCrossReferenceOrigin | null => {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const projectCrossReferenceId = searchParams.get('projectCrossReferenceId');
  const value = searchParams.get('value');
  const dataPoint = searchParams.get('dataPoint');
  const contractRoute = searchParams.get('contractRoute');

  return useMemo(() => {
    if (source !== PMI_SOURCE_CROSS_REFERENCE || !projectCrossReferenceId) return null;
    return {
      projectCrossReferenceId,
      value: value ?? '',
      dataPoint: dataPoint ?? '',
      isContractRoute: contractRoute === 'true',
    };
  }, [source, projectCrossReferenceId, value, dataPoint, contractRoute]);
};
