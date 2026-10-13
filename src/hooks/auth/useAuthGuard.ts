'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
interface UseAuthGuardOptions {
  redirectTo?: string;
}

export const useAuthGuard = ({ redirectTo = '/login' }: UseAuthGuardOptions = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session?.user) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, redirectTo, router, session, status]);

  return {
    session,
    status,
    isAuthenticated: Boolean(session?.user),
  };
};
