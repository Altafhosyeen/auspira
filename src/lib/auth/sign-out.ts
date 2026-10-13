'use client';

import { getSession, signOut } from 'next-auth/react';
import { apiClient } from '../api/api-client';
import { markSigningOut } from '../api/axios';
import { API_ENDPOINTS } from '@/constants';
import { notification } from 'antd';
import { useProjectStore } from '@/store/project.store';

export const signOutWithBackend = async (callbackUrl = '/login'): Promise<void> => {
  // Flag first: once the backend invalidates tokens, any request still in flight
  // would otherwise 401 and trigger its own "session expired" signOut + error toast.
  markSigningOut();

  const session = await getSession();

  if (session?.refreshToken) {
    try {
      await apiClient.post<void, { refresh: string }>(API_ENDPOINTS.AUTH.LOGOUT, {
        refresh: session.refreshToken,
      });
    } catch (error) {
      console.error('[auth/signout] backend logout failed', error);
    }
  }

  notification.success({
    message: 'Logged out successfully',
    description: 'You have been logged out successfully.',
  });

  // Clear the persisted project selection so it doesn't leak into the next session.
  useProjectStore.getState().reset();

  await signOut({ callbackUrl });
};
