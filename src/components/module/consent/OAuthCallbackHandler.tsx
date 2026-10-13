'use client';

import { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';

import { useRouter } from 'nextjs-toploader/app';
import { useQueryClient } from '@tanstack/react-query';
import { getUserProfile } from '@/hooks/modules/users';
import { useAuthStore } from '@/store/auth.store';
import { CONSENT_CONNECT_QUERY_KEY } from '@/hooks/modules/consent';

// Maps backend error codes to user-friendly titles for the failure modal.
const ERROR_TITLES: Record<string, string> = {
  invalid_request: 'Invalid Request',
  oauth_error: 'OAuth Provider Error',
  missing_state: 'Missing State',
  invalid_state: 'Invalid or Expired Session',
  connection_failed: 'Connection Failed',
  config_error: 'Configuration Error',
  callback_error: 'Callback Error',
};

const OAuthCallbackHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const handledRef = useRef(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (!success && !error) {
      return;
    }

    // Guard against double-invocation (e.g. React strict mode / fast refresh).
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const message = searchParams.get('message');
    const provider = searchParams.get('provider');
    const email = searchParams.get('email');

    if (success === 'true') {
      Modal.success({
        title: 'Email Connected',
        icon: <CheckCircleFilled />,
        content:
          message ||
          (provider && email
            ? `Successfully connected ${email} via ${provider}.`
            : 'Your email account has been connected successfully.'),
        okText: 'Done',
      });

      // Refresh the profile so `emailInboxConnected` reflects the new state.
      getUserProfile({ skipLoader: true })
        .then((profile) => {
          if (profile) setUser(profile);
        })
        .catch(() => {});

      queryClient.invalidateQueries({ queryKey: CONSENT_CONNECT_QUERY_KEY });
    } else if (error) {
      Modal.error({
        title: ERROR_TITLES[error] || 'Connection Error',
        icon: <CloseCircleFilled />,
        content: message || 'Something went wrong while connecting your email account.',
        okText: 'Close',
      });
    }

    // Strip OAuth callback params from the URL so the modal doesn't reopen on refresh.
    const params = new URLSearchParams(searchParams.toString());
    ['success', 'error', 'message', 'provider', 'email'].forEach((key) => params.delete(key));

    const remaining = params.toString();
    router.replace(remaining ? `?${remaining}` : '/', { scroll: false });
  }, [searchParams, router, queryClient, setUser]);

  return null;
};

export default OAuthCallbackHandler;
