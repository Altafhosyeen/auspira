import type { AxiosRequestConfig } from 'axios';
import type { HttpMethod, IApiRequestConfig } from '@/types/api.types';
import { axiosInstance } from './axios';

const normalizeData = <TBody>(body: TBody | undefined, isMultipart: boolean): unknown => {
  if (body === undefined) {
    return undefined;
  }

  if (
    isMultipart ||
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
  ) {
    return body;
  }

  return JSON.stringify(body);
};

const request = async <TResponse, TBody = unknown>(
  config: IApiRequestConfig<TBody>
): Promise<TResponse> => {
  const {
    url,
    method = 'GET',
    body,
    isMultipart = false,
    headers,
    signal,
    skipLoader = false,
    ...rest
  } = config;

  type AxiosRequestConfigWithLoader = AxiosRequestConfig & { skipLoader?: boolean };

  const axiosConfig: AxiosRequestConfigWithLoader = {
    url,
    method,
    headers,
    signal,
    skipLoader,
    withCredentials: false,
    ...rest,
  };

  // Don't attach data to GET requests
  if (method !== 'GET' && body !== undefined) {
    axiosConfig.data = normalizeData(body, isMultipart);
  }

  const response = await axiosInstance.request<TResponse>(axiosConfig);

  return response.data;
};

const withMethod =
  (method: HttpMethod) =>
  <TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<IApiRequestConfig<TBody>, 'url' | 'method' | 'body'>
  ) =>
    request<TResponse, TBody>({
      ...(config ?? {}),
      url,
      method,
      body,
    });

export const apiClient = {
  request,
  get: withMethod('GET'),
  post: withMethod('POST'),
  put: withMethod('PUT'),
  patch: withMethod('PATCH'),
  delete: withMethod('DELETE'),
};
