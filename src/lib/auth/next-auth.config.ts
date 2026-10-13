import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { AppJwtToken, ILoginMetadata, ILoginResponse } from '@/types/auth/auth.types';
import { API_CONFIG, API_ENDPOINTS } from '@/constants';
import { refreshAccessToken } from './refresh-token';

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000;
const MOCK_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const getAccessExpiry = (expiresInSeconds: number): number => Date.now() + expiresInSeconds * 1000;

type JwtPayloadClaims = {
  exp?: number;
  sub?: string;
  id: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  roleId: string;
  jobTitle: string | null;
  status: number;
  acceptTerms: boolean;
  acceptDataProcessing: boolean;
  isDefault: boolean;
  organizationId: string;
  updatedOn: string;
  emailInboxConnected: boolean;
};

const getAccessExpiryFromUtc = (expiresAtUtc?: string): number | undefined => {
  if (!expiresAtUtc) {
    return undefined;
  }

  const expiresAt = Date.parse(expiresAtUtc);
  return Number.isNaN(expiresAt) ? undefined : expiresAt;
};

const decodeJwtPayload = (accessToken: string): JwtPayloadClaims | undefined => {
  try {
    const base64Payload = accessToken.split('.')[1];
    if (!base64Payload) {
      return undefined;
    }

    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson =
      typeof window === 'undefined'
        ? Buffer.from(base64, 'base64').toString('utf-8')
        : atob(base64);

    return JSON.parse(payloadJson) as JwtPayloadClaims;
  } catch {
    return undefined;
  }
};

const getAccessExpiryFromJwt = (accessToken: string): number | undefined => {
  const payload = decodeJwtPayload(accessToken);
  if (!payload?.exp) {
    return undefined;
  }

  return payload.exp * 1000;
};

const buildUserFromClaims = (
  claims: JwtPayloadClaims | undefined,
  fallbackEmail: string
): ILoginResponse['user'] => {
  const now = new Date().toISOString();
  const normalizedEmail = (claims?.email ?? fallbackEmail).trim();
  const fallbackName = normalizedEmail.split('@')[0] || 'User';
  const combinedName =
    [claims?.fullName, fallbackName].filter(Boolean).join(' ').trim() || fallbackName;
  const displayName =
    combinedName
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase()) || 'User';

  return {
    id: claims?.id ?? claims?.sub ?? '',
    email: normalizedEmail,
    phoneNumber: claims?.phoneNumber ?? null,
    fullName: displayName,
    roleId: claims?.roleId ?? '',
    jobTitle: claims?.jobTitle ?? null,
    status: claims?.status ?? 1,
    acceptTerms: claims?.acceptTerms ?? false,
    acceptDataProcessing: claims?.acceptDataProcessing ?? false,
    isDefault: claims?.isDefault ?? false,
    organizationId: claims?.organizationId ?? '',
    updatedOn: claims?.updatedOn ?? now,
    emailInboxConnected: claims?.emailInboxConnected ?? false,
  };
};

const extractCsrfToken = (setCookieHeader: string | null): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }

  const cookieMatch = setCookieHeader.match(/(?:^|[,\s])csrftoken=([^;]+)/i);
  return cookieMatch?.[1];
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

const getErrorMessageFromBody = (body: unknown): string | undefined => {
  if (typeof body === 'string') {
    return body;
  }

  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const payload = body as { detail?: unknown; message?: unknown; non_field_errors?: unknown };

  const unwrap = (val: unknown): string | undefined => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
    return undefined;
  };

  let msg = unwrap(payload.detail);
  if (msg) return msg;

  msg = unwrap(payload.message);
  if (msg) return msg;

  if (Array.isArray(payload.non_field_errors) && typeof payload.non_field_errors[0] === 'string') {
    return payload.non_field_errors[0];
  }

  return undefined;
};

const fetchUserProfile = async (
  accessToken: string
): Promise<Partial<ILoginResponse['user']> | undefined> => {
  const backendUrl = API_CONFIG.BASE_URL;
  if (!backendUrl) {
    console.warn('[auth/profile] Missing NEXT_PUBLIC_BACKEND_URL');
    return undefined;
  }

  try {
    const profileEndpoint = API_ENDPOINTS.USERS.USER_PROFILE;
    const response = await fetch(`${backendUrl}${profileEndpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('[auth/profile] fetch failed with status', response.status);
      return undefined;
    }

    const profileData = (await response.json()) as {
      id: string;
      email: string;
      phoneNumber?: string;
      fullName?: string;
      roleId?: string;
      jobTitle?: string;
      status?: number;
      acceptTerms?: boolean;
      acceptDataProcessing?: boolean;
      isDefault?: boolean;
      organizationId?: string;
      updatedOn?: string;
    };

    return profileData;
  } catch (error) {
    console.warn('[auth/profile] exception:', error);
    return undefined;
  }
};

const loginWithBackend = async (email: string, password: string) => {
  const backendUrl = API_CONFIG.BASE_URL;
  if (!backendUrl) {
    throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');
  }

  const loginEndpoint = API_ENDPOINTS.AUTH.LOGIN;
  const requestBody = { email, password };
  const fullUrl = `${backendUrl}${loginEndpoint}`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await parseResponseBody(response);
    const errorMessage = getErrorMessageFromBody(errorBody) ?? 'Invalid email or password.';
    console.error('[auth/login] backend returned error', {
      status: response.status,
      statusText: response.statusText,
      errorBody,
      errorMessage,
    });
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as Partial<ILoginResponse> & {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAtUtc?: string;
    refreshTokenExpiresAtUtc?: string;
  };
  const accessToken = payload.accessToken ?? payload.access;
  const refreshToken = payload.refreshToken ?? payload.refresh;
  const claims = accessToken ? decodeJwtPayload(accessToken) : undefined;
  const expiresAt =
    getAccessExpiryFromUtc(payload.accessTokenExpiresAtUtc) ??
    (typeof payload.expires === 'number' ? getAccessExpiry(payload.expires) : undefined) ??
    getAccessExpiryFromJwt(accessToken ?? '') ??
    Date.now() + 60 * 1000;

  if (!accessToken || !refreshToken) {
    console.error('[auth/login] missing required fields', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
    });
    throw new Error('Login response is missing required fields.');
  }

  const normalizedPayload: ILoginResponse = {
    access: accessToken,
    accessToken,
    accessTokenExpiresAtUtc: payload.accessTokenExpiresAtUtc,
    refresh: refreshToken,
    refreshToken,
    refreshTokenExpiresAtUtc: payload.refreshTokenExpiresAtUtc,
    expires:
      typeof payload.expires === 'number'
        ? payload.expires
        : Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000)),
    user: payload.user ?? buildUserFromClaims(claims, email),
  };

  const metadata: ILoginMetadata = {
    csrfToken: extractCsrfToken(response.headers.get('set-cookie')),
  };
  return { payload: normalizedPayload, metadata };
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        // we don't render an input for this – it's always true – but the
        // provider needs to be aware of the field so it shows up on the
        // `credentials` object passed to `authorize`.
        is_admin: { label: 'Admin', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim() ?? '';
        const password = credentials?.password ?? '';

        if (!email || !password) {
          throw new Error('Email and password are required.');
        }

        let loginResponse;
        try {
          loginResponse = await loginWithBackend(email, password);
        } catch (error) {
          const message =
            error instanceof Error && error.message
              ? error.message
              : 'Unable to sign in. Please try again.';
          console.error('[auth/authorize] backend login failed:', message, error);
          throw new Error(message, { cause: error });
        }

        const { payload, metadata } = loginResponse;
        console.log(payload);

        // Fetch user profile with the new access token
        const profileData = await fetchUserProfile(payload.access);

        // Merge profile data with user object
        const enrichedUser = {
          ...payload.user,
          ...(profileData?.phoneNumber !== undefined && { phoneNumber: profileData.phoneNumber }),
          ...(profileData?.fullName && {
            fullName: profileData.fullName,
            name: profileData.fullName,
          }),
          ...(profileData?.roleId && { roleId: profileData.roleId }),
          ...(profileData?.jobTitle !== undefined && { jobTitle: profileData.jobTitle }),
          ...(profileData?.status !== undefined && { status: profileData.status }),
          ...(profileData?.acceptTerms !== undefined && { acceptTerms: profileData.acceptTerms }),
          ...(profileData?.acceptDataProcessing !== undefined && {
            acceptDataProcessing: profileData.acceptDataProcessing,
          }),
          ...(profileData?.isDefault !== undefined && { isDefault: profileData.isDefault }),
          ...(profileData?.organizationId && { organizationId: profileData.organizationId }),
          ...(profileData?.updatedOn && { updatedOn: profileData.updatedOn }),
        };

        console.info('[auth/authorize] login succeeded', {
          userId: enrichedUser.id,
          email: enrichedUser.email,
        });

        return {
          ...enrichedUser,
          accessToken: payload.access,
          refreshToken: payload.refresh,
          csrfToken: metadata.csrfToken,
          isMockSession: metadata.isMockSession,
          accessTokenExpires: metadata.isMockSession
            ? Date.now() + MOCK_SESSION_TTL_MS
            : ((typeof payload.expires === 'number'
                ? getAccessExpiry(payload.expires)
                : undefined) ??
              getAccessExpiryFromJwt(payload.access) ??
              Date.now() + 60 * 1000),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session update triggered by updateSession()
      if (trigger === 'update' && session?.user) {
        const jwtToken = token as AppJwtToken;
        return {
          ...jwtToken,
          user: {
            ...jwtToken.user,
            ...session.user,
          },
        } as AppJwtToken;
      }

      if (user) {
        // Compute a display name if the raw object
        // only has first/last.

        return {
          ...token,
          user: {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            roleId: user.roleId,
            jobTitle: user.jobTitle,
            status: user.status,
            acceptTerms: user.acceptTerms,
            acceptDataProcessing: user.acceptDataProcessing,
            isDefault: user.isDefault,
            organizationId: user.organizationId,
            updatedOn: user.updatedOn,
          },
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          csrfToken: user.csrfToken,
          accessTokenExpires: user.accessTokenExpires,
          error: undefined,
        } as AppJwtToken;
      }

      const jwtToken = token as AppJwtToken;

      if (jwtToken.error === 'RefreshAccessTokenError') {
        return jwtToken;
      }

      if (jwtToken.isMockSession) {
        return {
          ...jwtToken,
          accessTokenExpires: Date.now() + MOCK_SESSION_TTL_MS,
          error: undefined,
        };
      }

      if (
        jwtToken.accessToken &&
        jwtToken.accessTokenExpires &&
        Date.now() < jwtToken.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        return jwtToken;
      }

      return refreshAccessToken(jwtToken);
    },
    async session({ session, token }) {
      const jwtToken = token as AppJwtToken;
      if (jwtToken.user) {
        session.user = jwtToken.user;
      }
      session.accessToken = jwtToken.accessToken;
      session.refreshToken = jwtToken.refreshToken;
      session.csrfToken = jwtToken.csrfToken;
      session.accessTokenExpires = jwtToken.accessTokenExpires;
      session.error = jwtToken.error;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
