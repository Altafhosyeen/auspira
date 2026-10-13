import type { DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { IUser } from '../system/users.types';

export type AuthErrorCode = 'RefreshAccessTokenError';

export interface ILoginResponse {
  access: string;
  accessToken?: string;
  accessTokenExpiresAtUtc?: string;
  refresh: string;
  refreshToken?: string;
  refreshTokenExpiresAtUtc?: string;
  sign_key?: string;
  expires: number;
  user: IUser;
}

export interface ILoginMetadata {
  csrfToken?: string;
  isMockSession?: boolean;
}

export interface IRefreshResponse {
  access: string;
  accessToken?: string;
  refresh?: string;
  refresh_token?: string;
  refreshToken?: string;
  sign_key?: string;
  access_expires_in: number;
  accessTokenExpiresAtUtc?: string;
}

export interface IAppTokenFields {
  user?: IUser;
  accessToken?: string;
  refreshToken?: string;
  signKey?: string;
  csrfToken?: string;
  accessTokenExpires?: number;
  isMockSession?: boolean;
  error?: AuthErrorCode;
}

export type AppJwtToken = JWT & IAppTokenFields;

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & IUser;
    accessToken?: string;
    refreshToken?: string;
    signKey?: string;
    csrfToken?: string;
    accessTokenExpires?: number;
    isMockSession?: boolean;
    error?: AuthErrorCode;
  }

  interface User extends IUser {
    accessToken: string;
    refreshToken: string;
    signKey?: string;
    csrfToken?: string;
    accessTokenExpires: number;
    isMockSession?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends IAppTokenFields {}
}
