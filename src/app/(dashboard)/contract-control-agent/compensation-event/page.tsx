'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CompensationEventListPage } from '@/modules/compensation-event';

const CompensationEventRegister = () => {
  const searchParams = useSearchParams();

  return (
    <CompensationEventListPage parentEarlyWarningReference={searchParams.get('ew') ?? undefined} />
  );
};

const CompensationEventPage = () => (
  <Suspense fallback={null}>
    <CompensationEventRegister />
  </Suspense>
);

export default CompensationEventPage;
