import type { ReactNode } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';

export default function AuthGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AuthLayout>{children}</AuthLayout>;
}
