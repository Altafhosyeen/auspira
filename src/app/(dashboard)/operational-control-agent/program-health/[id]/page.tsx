'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProgrammeDetailPage } from '@/modules/programme';

// The `source` flag says which API the route id belongs to — an alert (the Awareness "Open"
// action) or a programme health record (a Program Health register row). See
// `PROGRAMME_SOURCE_AWARENESS` in routes.constants.
const ProgrammeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  return <ProgrammeDetailPage id={id} source={searchParams.get('source') ?? undefined} />;
};

const Page = () => (
  <Suspense fallback={null}>
    <ProgrammeDetail />
  </Suspense>
);

export default Page;
