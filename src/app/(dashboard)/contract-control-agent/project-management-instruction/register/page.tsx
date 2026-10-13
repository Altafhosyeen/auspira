'use client';

import { Suspense } from 'react';
import { PmiCreatePage } from '@/modules/pmi';

// The form reads its cross-reference origin from the query string, so it needs a
// Suspense boundary around `useSearchParams`.
const Page = () => (
  <Suspense fallback={null}>
    <PmiCreatePage />
  </Suspense>
);

export default Page;
