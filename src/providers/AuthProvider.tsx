'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { getUserProfile } from '@/hooks/modules/users';
import { useAuthStore } from '../store/auth.store';

function AuthSync({ children }: PropsWithChildren) {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const lastSyncedAccessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // While NextAuth is still resolving the session on mount, `session` is
    // momentarily undefined even for a logged-in user — clearing the store
    // here would wipe the persisted user (and collapse the sidebar to its
    // logged-out route set) before the real session comes back. Only clear
    // once NextAuth has confirmed there's no session.
    if (status === 'loading') {
      return;
    }

    if (!session?.user) {
      setUser(null);
      return;
    }

    // session.user carries login-time JWT claims, so fields like
    // emailInboxConnected go stale after the backend changes them. Once the
    // store has a user, the profile fetch below and explicit setUser calls in
    // mutations own the data — only seed from the session on login or
    // account switch, never overwrite on session re-emissions.
    const storeUser = useAuthStore.getState().user;
    if (!storeUser || storeUser.id !== session.user.id) {
      setUser(session.user);
    }
  }, [session, status, setUser]);

  // Sync profile once per access token to avoid repeated fetches on route changes.
  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken) {
      lastSyncedAccessTokenRef.current = null;
      return;
    }

    if (lastSyncedAccessTokenRef.current === accessToken) {
      return;
    }

    lastSyncedAccessTokenRef.current = accessToken;
    let active = true;

    getUserProfile({ skipLoader: true })
      .then((profile) => {
        if (active && profile) setUser(profile);
      })
      .catch(() => {
        // silently fall back to session user data already in the store
      });

    return () => {
      active = false;
    };
  }, [session?.accessToken, setUser]);

  useEffect(() => {
    if (session?.error !== 'RefreshAccessTokenError') {
      return;
    }

    setUser(null);
    signOut({ redirect: false });

    if (pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router, session, setUser]);

  return <>{children}</>;
}

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <AuthSync>{children}</AuthSync>
    </SessionProvider>
  );
}
