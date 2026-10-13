import type { AxiosRequestConfig } from 'axios';
import type { HttpMethod } from '@/types/api.types';
import { apiClient } from './api-client';

export interface RequestParams<TBody = unknown> {
  url: string;
  method: HttpMethod;
  body?: TBody;
  isMultipart?: boolean;
  isPublic?: boolean;
  skipLoader?: boolean;
  mock?: boolean;
  responseType?: AxiosRequestConfig['responseType'];
  onUploadProgress?: (progressEvent: any) => void;
}

export const FrontendHandler = async <TResponse, TBody = unknown>(
  request: RequestParams<TBody>
): Promise<TResponse> => {
  const {
    url,
    method,
    body,
    isMultipart = false,
    skipLoader = false,
    responseType,
    onUploadProgress,
  } = request;

  const response = await apiClient.request<TResponse, TBody>({
    url,
    method,
    body,
    isMultipart,
    skipLoader,
    ...(responseType && { responseType }),
    ...(onUploadProgress && { onUploadProgress }),
  } as any);

  return response;
};

export const AUSPIRA = async <TResponse, TBody = unknown>(
  request: RequestParams<TBody>
): Promise<TResponse> =>
  FrontendHandler<TResponse, TBody>({
    ...request,
    isMultipart: request.isMultipart ?? false,
  });
