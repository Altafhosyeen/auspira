'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
type Props = {
  children: React.ReactNode;
  redirectTo?: string;
};

const AuthLayout = ({ children, redirectTo = '/' }: Props) => {
  const { status } = useSession();
  const router = useRouter();
  const redirecting = status === 'authenticated';

  useEffect(() => {
    if (redirecting) {
      const t = setTimeout(() => {
        router.replace(redirectTo);
      }, 200);

      return () => clearTimeout(t);
    }
  }, [redirecting, router, redirectTo]);

  // 🔄 LOADING STATE (checking session)
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="border-t-theme-primary h-12 w-12 animate-spin rounded-full border-4 border-gray-300" />
          <p className="text-sm text-gray-500">Checking session...</p>
        </div>
      </div>
    );
  }

  // 🚀 AUTHENTICATED (REDIRECTING)
  if (redirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="border-t-theme-primary h-10 w-10 animate-spin rounded-full border-4 border-gray-300" />
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
};

export default AuthLayout;
