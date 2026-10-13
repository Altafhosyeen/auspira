import type { AppJwtToken, IRefreshResponse } from '@/types/auth/auth.types';
import { API_CONFIG, API_ENDPOINTS } from '@/constants';

const getAccessExpiry = (expiresInSeconds: number): number => Date.now() + expiresInSeconds * 1000;

const getAccessExpiryFromUtc = (expiresAtUtc?: string): number | undefined => {
  if (!expiresAtUtc) {
    return undefined;
  }

  const parsed = Date.parse(expiresAtUtc);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseAccessExpiresInSeconds = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
};

const getAccessExpiryFromJwt = (accessToken: string): number | undefined => {
  try {
    const base64Payload = accessToken.split('.')[1];
    if (!base64Payload) {
      return undefined;
    }

    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as { exp?: number };

    if (!payload.exp) {
      return undefined;
    }

    return payload.exp * 1000;
  } catch {
    return undefined;
  }
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

let inFlightRefresh:
  | {
      refreshToken: string;
      promise: Promise<AppJwtToken>;
    }
  | undefined;

let recentRefreshBySourceToken:
  | {
      sourcerefreshToken: string;
      refreshedToken: AppJwtToken;
      createdAt: number;
    }
  | undefined;

const RECENT_REFRESH_CACHE_MS = 15_000;

export const refreshAccessToken = async (token: AppJwtToken): Promise<AppJwtToken> => {
  if (!token.refreshToken) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  const refreshTokenForRequest = token.refreshToken;

  if (
    recentRefreshBySourceToken &&
    recentRefreshBySourceToken.sourcerefreshToken === refreshTokenForRequest &&
    Date.now() - recentRefreshBySourceToken.createdAt < RECENT_REFRESH_CACHE_MS
  ) {
    return recentRefreshBySourceToken.refreshedToken;
  }

  if (inFlightRefresh && inFlightRefresh.refreshToken === refreshTokenForRequest) {
    return inFlightRefresh.promise;
  }

  const refreshPromise = (async (): Promise<AppJwtToken> => {
    try {
      const backendUrl = API_CONFIG.BASE_URL;
      if (!backendUrl) {
        throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');
      }

      const refreshUrl = `${backendUrl}${API_ENDPOINTS.AUTH.REFRESH}`;

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: requestHeaders,
        body: JSON.stringify({ refresh: refreshTokenForRequest }),
      });

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw new Error(
          `Refresh request failed with status ${response.status}: ${JSON.stringify(responseBody)}`
        );
      }

      const payload = responseBody as IRefreshResponse;
      if (!payload?.access) {
        throw new Error('Refresh response is missing access token.');
      }

      const rotatedrefreshToken = payload.refresh ?? payload.refresh_token;
      const accessExpiresInSeconds = parseAccessExpiresInSeconds(payload.access_expires_in);

      const refreshedToken: AppJwtToken = {
        ...token,
        accessToken: payload.access,
        refreshToken: rotatedrefreshToken ?? token.refreshToken,
        accessTokenExpires:
          getAccessExpiryFromUtc(payload.accessTokenExpiresAtUtc) ??
          (accessExpiresInSeconds ? getAccessExpiry(accessExpiresInSeconds) : undefined) ??
          getAccessExpiryFromJwt(payload.access) ??
          Date.now() + 60 * 1000,
        error: undefined,
      };

      recentRefreshBySourceToken = {
        sourcerefreshToken: refreshTokenForRequest,
        refreshedToken,
        createdAt: Date.now(),
      };

      return refreshedToken;
    } catch (error) {
      console.error('[auth/refresh] exception', error);
      return {
        ...token,
        user: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        signKey: undefined,
        csrfToken: undefined,
        accessTokenExpires: undefined,
        error: 'RefreshAccessTokenError',
      };
    } finally {
      if (inFlightRefresh?.refreshToken === token.refreshToken) {
        inFlightRefresh = undefined;
      }
    }
  })();

  inFlightRefresh = {
    refreshToken: refreshTokenForRequest,
    promise: refreshPromise,
  };

  return refreshPromise;
};
