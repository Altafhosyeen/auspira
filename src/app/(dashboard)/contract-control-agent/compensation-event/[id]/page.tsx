'use client';

import { useParams } from 'next/navigation';
import { CompensationEventDetailPage } from '@/modules/compensation-event';

const Page = () => {
  const { id } = useParams<{ id: string }>();

  return <CompensationEventDetailPage id={id} />;
};

export default Page;
