import type { AxiosRequestConfig } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export interface IApiRequestConfig<TBody = unknown> extends Omit<
  AxiosRequestConfig,
  'url' | 'method' | 'data' | 'headers'
> {
  url: string;
  method?: HttpMethod;
  body?: TBody;
  isMultipart?: boolean;
  isPublic?: boolean;
  skipLoader?: boolean;
  headers?: Record<string, string>;
}

export interface IApiErrorShape {
  message: string;
  status?: number;
  data?: unknown;
  fieldErrors?: Record<string, string[]>;
}

export interface IPaginatedApiResponse<TItem> {
  count: number;
  next: string | null;
  previous: string | null;
  items: TItem[];
}

export interface IMetaPaginatedResponse<TItem> {
  meta: {
    totalCount: number;
  };
  items: TItem[];
}

export interface IBaseType {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
