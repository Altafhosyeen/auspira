import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { API_CONFIG, API_ENDPOINTS } from '@/constants';
import { useLoadingStore } from '@/store/loading.store';
import { useProjectStore } from '@/store/project.store';
import { getCleanUrl } from '../utils/urls';
import { handleApiError } from './error-handler';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retryAfterRefresh?: boolean;
  _skipLoaderApplied?: boolean;
  skipLoader?: boolean;
};

const PROACTIVE_REFRESH_BUFFER_MS = 30_000;

type RuntimeAuthState = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
};

type RefreshAttemptResult = 'ok' | 'unauthorized' | 'failed';

let runtimeAuthState: RuntimeAuthState = {};

const clearRuntimeAuthState = () => {
  runtimeAuthState = {};
  // Session is ending (expired/refresh failed) — drop the persisted project
  // selection so it doesn't leak into whoever signs in next on this device.
  useProjectStore.getState().reset();
};

// Set right before a deliberate logout kicks off. Once the backend invalidates the
// tokens, any request still in flight (background lookups, polling, etc.) will 401
// too — without this flag those would each trigger their own "session expired"
// signOut + error toast alongside the intentional "logged out" success toast.
let isSigningOut = false;

export const markSigningOut = () => {
  isSigningOut = true;
};

const ensureHeaders = (headers?: InternalAxiosRequestConfig['headers']) => {
  if (headers instanceof AxiosHeaders) {
    return headers;
  }
  return AxiosHeaders.from(headers ?? {});
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.clone().json();
  } catch {
    try {
      return await response.clone().text();
    } catch {
      return null;
    }
  }
};

const hasBlacklistedTokenError = (payload: unknown): boolean => {
  if (!payload || typeof payload !== 'object') return false;

  const detail = (payload as { detail?: unknown }).detail;
  return typeof detail === 'string' && detail.toLowerCase().includes('blacklisted');
};

const isAccessTokenExpiredOrExpiring = (): boolean => {
  const { accessTokenExpires } = runtimeAuthState;
  if (!accessTokenExpires) return false;
  return Date.now() >= accessTokenExpires - PROACTIVE_REFRESH_BUFFER_MS;
};

// Single-flight getSession: on reload, many requests start in parallel before the
// runtime auth state is hydrated — share one /api/auth/session fetch between them.
let sessionPromise: ReturnType<typeof getSession> | null = null;

const getSessionOnce = (): ReturnType<typeof getSession> => {
  if (!sessionPromise) {
    sessionPromise = getSession().finally(() => {
      sessionPromise = null;
    });
  }
  return sessionPromise;
};

const readAuthState = async (): Promise<RuntimeAuthState> => {
  if (runtimeAuthState.accessToken && !isAccessTokenExpiredOrExpiring()) return runtimeAuthState;

  const session = await getSessionOnce();

  if (session?.accessToken) {
    runtimeAuthState = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpires: session.accessTokenExpires,
    };
  }

  return runtimeAuthState;
};

// Single-flight refresh: parallel 401s/proactive refreshes must share one refresh
// call — with refresh-token rotation, concurrent refreshes invalidate each other
// and randomly sign the user out.
let refreshPromise: Promise<RefreshAttemptResult> | null = null;

const attemptRefreshOn401 = (): Promise<RefreshAttemptResult> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const performRefresh = async (): Promise<RefreshAttemptResult> => {
  const session = await getSessionOnce();
  const refreshToken = session?.refreshToken ?? runtimeAuthState.refreshToken;

  if (!refreshToken) {
    clearRuntimeAuthState();
    return 'unauthorized';
  }

  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
    // Without this, a hung backend blocks every request inside the interceptor forever
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT_MS),
  });

  const responseBody = await parseResponseBody(refreshResponse);

  if (!refreshResponse.ok) {
    if (refreshResponse.status === 401) {
      return hasBlacklistedTokenError(responseBody) ? 'failed' : 'unauthorized';
    }
    return 'failed';
  }

  const payload = responseBody as {
    access?: string;
    refresh?: string;
    refresh_token?: string;
  };

  const newAccessToken = payload.access;

  // Decode expiry from the new JWT so proactive refresh tracks it correctly
  const getExpiryFromJwt = (token: string): number | undefined => {
    try {
      const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      if (!base64) return undefined;
      const { exp } = JSON.parse(atob(base64)) as { exp?: number };
      return exp ? exp * 1000 : undefined;
    } catch {
      return undefined;
    }
  };

  runtimeAuthState = {
    accessToken: newAccessToken,
    refreshToken: payload.refresh ?? payload.refresh_token ?? refreshToken,
    accessTokenExpires: newAccessToken ? getExpiryFromJwt(newAccessToken) : undefined,
  };

  return 'ok';
};

export const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  withCredentials: false,
});

axiosInstance.interceptors.request.use(async (config) => {
  const requestConfig = config as RetryableRequestConfig;
  requestConfig._skipLoaderApplied = false;

  if (!requestConfig.skipLoader) {
    const store = useLoadingStore.getState();
    store.incrementRequest();
    requestConfig._skipLoaderApplied = true;
  }

  let authState = await readAuthState();

  // Proactively refresh if the access token is expired or expiring within the buffer.
  // A refresh failure here must not block the request — send it with the current
  // token and let the 401 response path handle it.
  if (authState.accessToken && isAccessTokenExpiredOrExpiring()) {
    const refreshResult = await attemptRefreshOn401().catch(() => 'failed' as const);
    if (refreshResult === 'ok') {
      authState = runtimeAuthState;
    }
  }

  const headers = ensureHeaders(config.headers);

  if (authState.accessToken) {
    headers.set('Authorization', `Bearer ${authState.accessToken}`);
  }

  // FormData and URLSearchParams carry their own encoding — axios sets the right
  // Content-Type (with the multipart boundary) once the header is out of the way.
  const isFormEncoded = config.data instanceof FormData || config.data instanceof URLSearchParams;

  if (isFormEncoded) {
    headers.delete('Content-Type');
  } else if (config.data !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  config.headers = headers;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const requestConfig = response.config as RetryableRequestConfig;
    if (requestConfig._skipLoaderApplied) {
      const store = useLoadingStore.getState();
      store.decrementRequest();
    }
    return response;
  },

  async (error) => {
    const requestConfig = error?.config as RetryableRequestConfig | undefined;
    if (requestConfig?._skipLoaderApplied) {
      const store = useLoadingStore.getState();
      store.decrementRequest();
    }

    // A deliberate logout is already in progress — its own success toast and
    // signOut() call are enough; swallow the fallout from in-flight requests.
    if (isSigningOut) {
      throw error;
    }

    const status = error?.response?.status;
    const requestPath = getCleanUrl(error?.config?.url ?? '');
    const refreshPath = getCleanUrl(API_ENDPOINTS.AUTH.REFRESH);

    // 🔥 REFRESH TOKEN FAILED
    if (status === 401 && requestPath === refreshPath) {
      clearRuntimeAuthState();
      await signOut({ callbackUrl: '/login' });

      handleApiError(error); // ✅ ONLY SHOW ONCE
      throw error; // ✅ IMPORTANT
    }

    // 🔥 NORMAL 401 HANDLING
    if (status === 401 && requestPath !== refreshPath) {
      const alreadyRetried = Boolean(requestConfig?._retryAfterRefresh);

      if (!alreadyRetried && requestConfig) {
        requestConfig._retryAfterRefresh = true;

        const refreshResult = await attemptRefreshOn401();

        if (refreshResult === 'unauthorized' || refreshResult === 'failed') {
          clearRuntimeAuthState();
          await signOut({ callbackUrl: '/login' });

          handleApiError(error); // ✅ ONLY ONCE
          throw error;
        }

        if (refreshResult !== 'ok') {
          handleApiError(error);
          throw error;
        }

        return axiosInstance.request(requestConfig);
      }
    }

    // 🔥 FINAL ERROR HANDLER (ONLY ONCE HERE)
    handleApiError(error);
    throw error;
  }
);
