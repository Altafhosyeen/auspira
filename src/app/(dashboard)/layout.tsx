import type { ReactNode } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <BaseLayout>{children}</BaseLayout>;
}
