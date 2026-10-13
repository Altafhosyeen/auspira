'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CompensationEventQuotationPage } from '@/modules/compensation-event';

const Quotation = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  return (
    <CompensationEventQuotationPage
      id={id}
      projectAlertId={searchParams.get('alertId') ?? undefined}
    />
  );
};

const Page = () => (
  <Suspense fallback={null}>
    <Quotation />
  </Suspense>
);

export default Page;
