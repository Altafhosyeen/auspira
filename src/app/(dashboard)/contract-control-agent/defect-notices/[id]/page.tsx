'use client';

import { useParams } from 'next/navigation';
import { DefectNoticeDetailPage } from '@/modules/defect-notice';

const Page = () => {
  const { id } = useParams<{ id: string }>();

  return <DefectNoticeDetailPage id={id} />;
};

export default Page;
