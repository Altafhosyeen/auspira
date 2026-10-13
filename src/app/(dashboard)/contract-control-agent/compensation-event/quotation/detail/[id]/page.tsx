'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { CompensationEventQuotationDetailPage } from '@/modules/compensation-event';

// Read-only view of one quotation, opened by its own id from the register's CE rows.
const QuotationDetail = () => {
  const { id } = useParams<{ id: string }>();

  return <CompensationEventQuotationDetailPage id={id} />;
};

// The screen reads `from=watchtower` off the query string, so it needs a Suspense boundary.
const Page = () => (
  <Suspense fallback={null}>
    <QuotationDetail />
  </Suspense>
);

export default Page;
