'use client';

import { useSearchParams } from 'next/navigation';
import { EarlyWarningRegisterPage } from '@/modules/early-warning';

const Page = () => {
  const searchParams = useSearchParams();
  return <EarlyWarningRegisterPage projectAlertId={searchParams.get('alertId') ?? undefined} />;
};

export default Page;
