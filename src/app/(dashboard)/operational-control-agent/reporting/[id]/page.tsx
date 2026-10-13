'use client';

import { useParams } from 'next/navigation';
import { ProjectDailyReportDetailPage } from '@/modules/project-daily-report';

const Page = () => {
  const { id } = useParams<{ id: string }>();

  return <ProjectDailyReportDetailPage id={id} />;
};

export default Page;
