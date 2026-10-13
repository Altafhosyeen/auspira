'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CompensationEventNoticePage } from '@/modules/compensation-event';

const NewCompensationEvent = () => {
  const searchParams = useSearchParams();

  return (
    <CompensationEventNoticePage
      projectAlertId={searchParams.get('alertId') ?? undefined}
      // Set by the Close Early Warning modal's "CE trigger identified" path — the EW to seed
      // the notice from, plus the clause the PM chose there.
      earlyWarningId={searchParams.get('earlyWarningId') ?? undefined}
      ceClause={searchParams.get('ceClause') ?? undefined}
    />
  );
};

const Page = () => (
  <Suspense fallback={null}>
    <NewCompensationEvent />
  </Suspense>
);

export default Page;
