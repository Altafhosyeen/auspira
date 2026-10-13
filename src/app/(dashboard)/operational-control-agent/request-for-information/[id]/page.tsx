'use client';

import { useParams } from 'next/navigation';
import { RequestForInformationDetailPage } from '@/modules/request-for-information';

const Page = () => {
  const { id } = useParams<{ id: string }>();

  return <RequestForInformationDetailPage id={id} />;
};

export default Page;
