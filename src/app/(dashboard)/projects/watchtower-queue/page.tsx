'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import WatchtowerActionQueue from '@/components/contract-control-agent/WatchtowerActionQueue';

const WatchtowerQueue = () => {
  const searchParams = useSearchParams();
  // Set by a dashboard Watchtower row's "open" click — the matching matter arms itself
  // (highlighted) here instead of acting immediately, so the confirming click happens on this
  // page rather than the dashboard.
  return <WatchtowerActionQueue targetRowId={searchParams.get('rowId') ?? undefined} />;
};

export default function WatchtowerQueuePage() {
  return (
    <Suspense fallback={null}>
      <WatchtowerQueue />
    </Suspense>
  );
}
